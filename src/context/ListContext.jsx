import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getUserList, addToList, removeFromList, updateListEntry } from '../services/firestore'

const ListContext = createContext(null)

export const ListProvider = ({ children }) => {
  const { user } = useAuth()
  // listMap: { "anime_123": { ...entry }, "manga_456": { ...entry } }
  const [listMap, setListMap] = useState({})
  const [loading, setLoading] = useState(false)

  // Carga la lista completa del usuario cuando inicia sesión
  useEffect(() => {
    if (!user) {
      setListMap({})
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        const data = await getUserList(user.uid)
        const map = {}
        data.forEach(entry => {
          map[`${entry.type}_${entry.id}`] = entry
        })
        setListMap(map)
      } catch (err) {
        console.error('Error loading list:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  // Verifica si una entrada ya está en la lista
  const isInList = useCallback((type, id) => {
    return !!listMap[`${type}_${id}`]
  }, [listMap])

  // Obtiene la entrada de la lista (status, score, progress)
  const getEntry = useCallback((type, id) => {
    return listMap[`${type}_${id}`] || null
  }, [listMap])

  // Agrega o actualiza una entrada
  const upsertEntry = useCallback(async (entry) => {
    if (!user) return
    const key = `${entry.type}_${entry.id}`
    // Optimistic update
    setListMap(prev => ({ ...prev, [key]: entry }))
    try {
      await addToList(user.uid, entry)
    } catch (err) {
      console.error('Error saving to list:', err)
      // Revertir si falla
      setListMap(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }, [user])

  // Elimina una entrada
  const deleteEntry = useCallback(async (type, id) => {
    if (!user) return
    const key = `${type}_${id}`
    const backup = listMap[key]
    // Optimistic update
    setListMap(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    try {
      await removeFromList(user.uid, type, id)
    } catch (err) {
      console.error('Error removing from list:', err)
      // Revertir si falla
      if (backup) setListMap(prev => ({ ...prev, [key]: backup }))
    }
  }, [user, listMap])

  // Actualiza campos específicos (score, progress, status)
  const updateEntry = useCallback(async (type, id, updates) => {
    if (!user) return
    const key = `${type}_${id}`
    setListMap(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }))
    try {
      await updateListEntry(user.uid, type, id, updates)
    } catch (err) {
      console.error('Error updating entry:', err)
    }
  }, [user])

  // Lista completa como array, con filtros opcionales
  const getList = useCallback((filterType = null, filterStatus = null) => {
    return Object.values(listMap).filter(entry => {
      if (filterType && entry.type !== filterType) return false
      if (filterStatus && entry.status !== filterStatus) return false
      return true
    })
  }, [listMap])

  // Estadísticas rápidas sin llamar a Firestore
  const getStats = useCallback(() => {
    const list = Object.values(listMap)
    const stats = {
      anime: { watching: 0, completed: 0, planned: 0, dropped: 0, on_hold: 0, total: 0 },
      manga: { reading: 0, completed: 0, planned: 0, dropped: 0, on_hold: 0, total: 0 },
      totalEntries: list.length,
    }
    list.forEach(entry => {
      const t = entry.type
      if (stats[t]) {
        stats[t][entry.status] = (stats[t][entry.status] || 0) + 1
        stats[t].total++
      }
    })
    return stats
  }, [listMap])

  return (
    <ListContext.Provider value={{
      listMap,
      loading,
      isInList,
      getEntry,
      getList,
      getStats,
      upsertEntry,
      deleteEntry,
      updateEntry,
    }}>
      {children}
    </ListContext.Provider>
  )
}

export const useList = () => {
  const ctx = useContext(ListContext)
  if (!ctx) throw new Error('useList must be used within ListProvider')
  return ctx
}
