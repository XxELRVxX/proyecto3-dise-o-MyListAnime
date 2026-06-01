import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserList, updateListEntry, removeFromList } from '../services/firestore'
import StarRating from '../components/ui/StarRating'

const STATUSES = {
  anime: [
    { value: 'all', label: 'Todos', icon: 'list' },
    { value: 'watching', label: 'Viendo', icon: 'play_arrow', color: 'text-secondary' },
    { value: 'completed', label: 'Completado', icon: 'check_circle', color: 'text-green-400' },
    { value: 'planned', label: 'Planeado', icon: 'schedule', color: 'text-on-surface-variant' },
    { value: 'on_hold', label: 'En pausa', icon: 'pause', color: 'text-primary' },
    { value: 'dropped', label: 'Abandonado', icon: 'cancel', color: 'text-tertiary' },
  ],
  manga: [
    { value: 'all', label: 'Todos', icon: 'list' },
    { value: 'reading', label: 'Leyendo', icon: 'menu_book', color: 'text-secondary' },
    { value: 'completed', label: 'Completado', icon: 'check_circle', color: 'text-green-400' },
    { value: 'planned', label: 'Planeado', icon: 'schedule', color: 'text-on-surface-variant' },
    { value: 'on_hold', label: 'En pausa', icon: 'pause', color: 'text-primary' },
    { value: 'dropped', label: 'Abandonado', icon: 'cancel', color: 'text-tertiary' },
  ],
}

export default function MyList() {
  const { user } = useAuth()
  const [mediaType, setMediaType] = useState('anime')
  const [status, setStatus] = useState('all')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [view, setView] = useState('list') // 'list' | 'grid'

  useEffect(() => {
    loadList()
  }, [user, mediaType])

  const loadList = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUserList(user.uid, mediaType)
      setList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (entry) => {
    if (!confirm(`¿Eliminar "${entry.title}" de tu lista?`)) return
    await removeFromList(user.uid, entry.type, entry.id)
    setList(prev => prev.filter(e => e.id !== entry.id || e.type !== entry.type))
  }

  const handleScoreUpdate = async (entry, score) => {
    await updateListEntry(user.uid, entry.type, entry.id, { score })
    setList(prev => prev.map(e =>
      e.id === entry.id && e.type === entry.type ? { ...e, score } : e
    ))
  }

  const handleProgressUpdate = async (entry, progress) => {
    await updateListEntry(user.uid, entry.type, entry.id, { progress })
    setList(prev => prev.map(e =>
      e.id === entry.id && e.type === entry.type ? { ...e, progress } : e
    ))
  }

  const filtered = list.filter(e => {
    if (status !== 'all' && e.status !== status) return false
    if (searchQ && !e.title?.toLowerCase().includes(searchQ.toLowerCase())) return false
    return true
  })

  const statuses = STATUSES[mediaType]

  // Count per status
  const counts = {}
  list.forEach(e => { counts[e.status] = (counts[e.status] || 0) + 1 })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="material-symbols-outlined text-[64px] text-outline mb-4">lock</span>
        <h2 className="text-headline-sm text-on-surface mb-2">Inicia sesión para ver tu lista</h2>
        <p className="text-body-sm text-on-surface-variant mb-6">Guarda anime y manga, califica y lleva tu progreso</p>
        <Link to="/login" className="btn-primary">Iniciar sesión</Link>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-screen-xl mx-auto px-gutter py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Mi Lista</h1>
          <p className="text-body-sm text-on-surface-variant">{list.length} entradas en total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">view_list</span>
          </button>
          <button onClick={() => setView('grid')}
            className={`p-2 rounded ${view === 'grid' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>

      {/* Media type */}
      <div className="flex gap-2 mb-4">
        {['anime', 'manga'].map(t => (
          <button key={t} onClick={() => { setMediaType(t); setStatus('all') }}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm capitalize transition-all duration-200 flex items-center gap-2
              ${mediaType === t
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(221,183,255,0.4)]'
                : 'glass-card text-on-surface-variant border border-outline-variant/30 hover:text-on-surface'
              }`}>
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {t === 'anime' ? 'movie' : 'auto_stories'}
            </span>
            {t}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all whitespace-nowrap
              ${status === s.value ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className={`material-symbols-outlined text-[16px] ${s.color || ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            {s.label}
            {s.value !== 'all' && counts[s.value] !== undefined && (
              <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {counts[s.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
        <input
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="Buscar en tu lista..."
          className="input-field pl-9 border border-outline-variant rounded"
        />
      </div>

      {/* List content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline mb-4">inbox</span>
          <p className="text-headline-sm text-on-surface-variant">No hay entradas aquí</p>
          <p className="text-body-sm text-outline mt-2 mb-6">
            {searchQ ? 'No coincide con tu búsqueda' : 'Agrega anime y manga desde el catálogo'}
          </p>
          {!searchQ && <Link to="/catalog" className="btn-primary">Explorar catálogo</Link>}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(entry => (
            <GridEntry key={`${entry.type}_${entry.id}`} entry={entry} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(entry => (
            <ListEntry
              key={`${entry.type}_${entry.id}`}
              entry={entry}
              onRemove={handleRemove}
              onScoreChange={handleScoreUpdate}
              onProgressChange={handleProgressUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GridEntry({ entry, onRemove }) {
  return (
    <div className="glass-card rounded-lg overflow-hidden group relative">
      <Link to={`/${entry.type}/${entry.id}`} style={{ aspectRatio: '3/4' }} className="block relative overflow-hidden">
        <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
        {entry.score > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-surface-container/80 backdrop-blur px-2 py-0.5 rounded">
            <span className="material-symbols-outlined text-[11px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-secondary text-xs font-bold">{entry.score}</span>
          </div>
        )}
      </Link>
      <div className="p-2">
        <p className="text-xs font-semibold text-on-surface line-clamp-2">{entry.title}</p>
      </div>
    </div>
  )
}

function ListEntry({ entry, onRemove, onScoreChange, onProgressChange }) {
  const [editProgress, setEditProgress] = useState(false)
  const [tempProgress, setTempProgress] = useState(entry.progress || 0)
  const maxProgress = entry.type === 'anime' ? (entry.episodes || 0) : (entry.chapters || 0)

  const saveProgress = () => {
    onProgressChange(entry, tempProgress)
    setEditProgress(false)
  }

  const statusColor = {
    watching: 'border-l-secondary', reading: 'border-l-secondary',
    completed: 'border-l-green-400',
    planned: 'border-l-outline',
    on_hold: 'border-l-primary',
    dropped: 'border-l-tertiary',
  }

  return (
    <div className={`glass-card rounded-xl border-l-4 ${statusColor[entry.status] || 'border-l-outline'} flex gap-3 p-3 transition-all hover:border-primary/30`}>
      {/* Cover */}
      <Link to={`/${entry.type}/${entry.id}`} className="flex-shrink-0">
        <img src={entry.image} alt={entry.title} className="w-12 h-16 object-cover rounded" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/${entry.type}/${entry.id}`}>
          <h3 className="font-semibold text-on-surface text-sm line-clamp-1 hover:text-primary transition-colors">{entry.title}</h3>
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-1">
          {editProgress ? (
            <div className="flex items-center gap-2">
              <input
                type="number" min={0} max={maxProgress || 9999}
                value={tempProgress}
                onChange={e => setTempProgress(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-field !py-0.5 !px-2 w-16 text-center text-xs border border-outline-variant rounded"
              />
              <span className="text-xs text-on-surface-variant">/ {maxProgress || '?'}</span>
              <button onClick={saveProgress} className="text-secondary text-xs font-medium">OK</button>
              <button onClick={() => setEditProgress(false)} className="text-on-surface-variant text-xs">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setEditProgress(true)}
              className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              {entry.progress || 0} / {maxProgress || '?'} {entry.type === 'anime' ? 'eps' : 'ch'}
            </button>
          )}
        </div>

        {maxProgress > 0 && (
          <div className="w-full h-1 bg-outline-variant rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-secondary-container shadow-[0_0_6px_#00cbe6] transition-all"
              style={{ width: `${Math.min(100, ((entry.progress || 0) / maxProgress) * 100)}%` }}
            />
          </div>
        )}

        {/* Score */}
        <div className="mt-1.5">
          <StarRating
            value={entry.score || 0}
            onChange={score => onScoreChange(entry, score)}
            size="sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onRemove(entry)}
          className="p-1.5 rounded text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  )
}
