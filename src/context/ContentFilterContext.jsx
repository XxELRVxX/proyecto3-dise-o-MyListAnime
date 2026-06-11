import { createContext, useContext, useState, useEffect } from 'react'

const ContentFilterContext = createContext(null)

// Géneros/ratings que se filtran cuando el filtro está activo
const ADULT_RATINGS  = ['Rx - Hentai', 'R+ - Mild Nudity']
const ADULT_GENRE_IDS = [9, 49, 12]   // Ecchi=9, Erotica=49, Hentai=12 (mal_id)
const ADULT_GENRES   = ['Hentai', 'Erotica', 'Ecchi']

export const ContentFilterProvider = ({ children }) => {
  const [filterEnabled, setFilterEnabled] = useState(() => {
    const saved = localStorage.getItem('mla-content-filter')
    return saved === null ? true : saved === 'true'   // activo por defecto
  })

  useEffect(() => {
    localStorage.setItem('mla-content-filter', filterEnabled)
  }, [filterEnabled])

  const toggleFilter = () => setFilterEnabled(v => !v)

  // Devuelve true si la entrada debe mostrarse
  const isAllowed = (entry) => {
    if (!filterEnabled) return true
    if (entry?.rating && ADULT_RATINGS.some(r => entry.rating.includes(r.split(' ')[0]))) return false
    if (entry?.genres?.some(g => ADULT_GENRES.includes(g))) return false
    return true
  }

  // Filtra un array de entradas
  const filterList = (entries = []) =>
    filterEnabled ? entries.filter(isAllowed) : entries

  // Parámetro para pasar a Jikan cuando se puede (excluye explícitos)
  const jikanSafeParam = filterEnabled ? 'sfw=true' : ''

  return (
    <ContentFilterContext.Provider value={{
      filterEnabled, toggleFilter, isAllowed, filterList, jikanSafeParam
    }}>
      {children}
    </ContentFilterContext.Provider>
  )
}

export const useContentFilter = () => {
  const ctx = useContext(ContentFilterContext)
  if (!ctx) throw new Error('useContentFilter must be used within ContentFilterProvider')
  return ctx
}
