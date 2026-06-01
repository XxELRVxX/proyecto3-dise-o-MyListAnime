import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { addToList, updateListEntry, getListEntry, removeFromList } from '../../services/firestore'
import StarRating from '../ui/StarRating'

const STATUS_OPTIONS = {
  anime: [
    { value: 'watching', label: 'Viendo', icon: 'play_arrow', color: 'text-secondary' },
    { value: 'completed', label: 'Completado', icon: 'check_circle', color: 'text-green-400' },
    { value: 'planned', label: 'Planeado', icon: 'schedule', color: 'text-on-surface-variant' },
    { value: 'on_hold', label: 'En pausa', icon: 'pause', color: 'text-primary' },
    { value: 'dropped', label: 'Abandonado', icon: 'cancel', color: 'text-tertiary' },
  ],
  manga: [
    { value: 'reading', label: 'Leyendo', icon: 'menu_book', color: 'text-secondary' },
    { value: 'completed', label: 'Completado', icon: 'check_circle', color: 'text-green-400' },
    { value: 'planned', label: 'Planeado', icon: 'schedule', color: 'text-on-surface-variant' },
    { value: 'on_hold', label: 'En pausa', icon: 'pause', color: 'text-primary' },
    { value: 'dropped', label: 'Abandonado', icon: 'cancel', color: 'text-tertiary' },
  ],
}

export default function AddToListModal({ entry, onClose }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(entry.type === 'manga' ? 'reading' : 'watching')
  const [score, setScore] = useState(0)
  const [progress, setProgress] = useState(0)
  const [existing, setExisting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const maxProgress = entry.type === 'anime' ? (entry.episodes || 0) : (entry.chapters || 0)
  const statusOptions = STATUS_OPTIONS[entry.type] || STATUS_OPTIONS.anime

  useEffect(() => {
    const load = async () => {
      if (user) {
        const e = await getListEntry(user.uid, entry.type, entry.id)
        if (e) {
          setExisting(e)
          setStatus(e.status)
          setScore(e.score || 0)
          setProgress(e.progress || 0)
        }
      }
      setLoaded(true)
    }
    load()
    // Lock scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const data = {
        id: entry.id,
        type: entry.type,
        title: entry.title,
        image: entry.image,
        status,
        score,
        progress,
        episodes: entry.episodes,
        chapters: entry.chapters,
        genres: entry.genres,
      }
      if (existing) {
        await updateListEntry(user.uid, entry.type, entry.id, data)
      } else {
        await addToList(user.uid, data)
      }
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!user || !existing) return
    setSaving(true)
    try {
      await removeFromList(user.uid, entry.type, entry.id)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md glass-card rounded-t-2xl sm:rounded-2xl border border-primary/20 shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            {entry.image && (
              <img src={entry.image} alt={entry.title} className="w-10 h-14 object-cover rounded" />
            )}
            <div>
              <h3 className="font-semibold text-on-surface text-sm line-clamp-2">{entry.title}</h3>
              <span className="text-xs text-on-surface-variant capitalize">{entry.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!loaded ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-5">
            {/* Status */}
            <div>
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3 block">
                Estado
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded border text-sm font-medium transition-all duration-200
                      ${status === opt.value
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-outline hover:text-on-surface'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${status === opt.value ? 'text-primary' : opt.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {opt.icon}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {(entry.episodes || entry.chapters) ? (
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 block">
                  Progreso ({entry.type === 'anime' ? 'Episodios' : 'Capítulos'})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={maxProgress || 9999}
                    value={progress}
                    onChange={e => setProgress(Math.max(0, Math.min(maxProgress || 9999, parseInt(e.target.value) || 0)))}
                    className="input-field w-24 text-center !px-2"
                  />
                  <span className="text-on-surface-variant text-sm">/ {maxProgress || '?'}</span>
                  {maxProgress > 0 && (
                    <div className="flex-1 h-1.5 bg-outline-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary-container shadow-[0_0_8px_#00cbe6] transition-all duration-300"
                        style={{ width: `${Math.min(100, (progress / maxProgress) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Score */}
            <div>
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3 block">
                Tu Calificación
              </label>
              <StarRating value={score} onChange={setScore} size="md" />
              {score > 0 && (
                <button onClick={() => setScore(0)} className="text-xs text-on-surface-variant hover:text-tertiary mt-2 transition-colors">
                  Quitar calificación
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              {existing && (
                <button
                  onClick={handleRemove}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded border border-tertiary/30 text-tertiary text-sm font-medium hover:bg-tertiary/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Eliminar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                {existing ? 'Actualizar' : 'Agregar a lista'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
