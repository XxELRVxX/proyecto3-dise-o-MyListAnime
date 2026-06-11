import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserList, updateListEntry, removeFromList } from '../services/firestore'
import StarRating from '../components/ui/StarRating'

const STATUSES = {
  anime: [
    { value: 'all',       label: 'All',       icon: 'list' },
    { value: 'watching',  label: 'Watching',      icon: 'play_arrow',   color: 'var(--neon-2)' },
    { value: 'completed', label: 'Completed',  icon: 'check_circle', color: 'var(--neon-green)' },
    { value: 'planned',   label: 'Planned',    icon: 'schedule',     color: 'var(--text-2)' },
    { value: 'on_hold',   label: 'On Hold',    icon: 'pause',        color: 'var(--neon)' },
    { value: 'dropped',   label: 'Dropped',  icon: 'cancel',       color: 'var(--neon-3)' },
  ],
  manga: [
    { value: 'all',       label: 'All',       icon: 'list' },
    { value: 'reading',   label: 'Reading',     icon: 'menu_book',    color: 'var(--neon-2)' },
    { value: 'completed', label: 'Completed',  icon: 'check_circle', color: 'var(--neon-green)' },
    { value: 'planned',   label: 'Planned',    icon: 'schedule',     color: 'var(--text-2)' },
    { value: 'on_hold',   label: 'On Hold',    icon: 'pause',        color: 'var(--neon)' },
    { value: 'dropped',   label: 'Dropped',  icon: 'cancel',       color: 'var(--neon-3)' },
  ]
}

const STATUS_BORDER = {
  watching: 'var(--neon-2)', reading: 'var(--neon-2)',
  completed: '#4ade80', planned: 'var(--border-2)',
  on_hold: 'var(--neon)', dropped: 'var(--neon-3)'
}

function ListEntry({ entry, onRemove, onScoreChange, onProgressChange }) {
  const [editProgress, setEditProgress] = useState(false)
  const [tempProgress, setTempProgress] = useState(entry.progress || 0)
  const max = entry.type === 'anime' ? (entry.episodes || 0) : (entry.chapters || 0)
  const pct = max > 0 ? Math.min(100, ((entry.progress || 0) / max) * 100) : 0

  const save = () => { onProgressChange(entry, tempProgress); setEditProgress(false) }

  return (
    <div style={{
      display: 'flex', gap: 12, padding: 14,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${STATUS_BORDER[entry.status] || 'var(--border-2)'}`,
      borderRadius: 'var(--radius-lg)', transition: 'border-color .2s, background .2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.25)'; e.currentTarget.style.background = 'var(--surface-2)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
    >
      {/* Cover */}
      <Link to={`/${entry.type}/${entry.id}`} style={{ flexShrink: 0 }}>
        <img src={entry.image} alt={entry.title}
          style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 6 }}
          onError={e => { e.target.src = 'https://placehold.co/48x64/1a1d2e/c084fc?text=?' }}
        />
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/${entry.type}/${entry.id}`}>
          <div style={{
            fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, color: 'var(--text)',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            marginBottom: 6, transition: 'color .15s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--neon)'}
          onMouseLeave={e => e.target.style.color = 'var(--text)'}
          >{entry.title}</div>
        </Link>

        {/* Progress */}
        <div style={{ marginBottom: 4 }}>
          {editProgress ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" min={0} max={max || 9999} value={tempProgress}
                onChange={e => setTempProgress(Math.max(0, parseInt(e.target.value) || 0))}
                className="av-input" style={{ width: 60, padding: '3px 8px', fontSize: 12, textAlign: 'center', height: 28 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>/ {max || '?'}</span>
              <button onClick={save} style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon-2)', background: 'none', border: 'none', cursor: 'pointer' }}>OK</button>
              <button onClick={() => setEditProgress(false)} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setEditProgress(true)} style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              transition: 'color .15s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
              {entry.progress || 0} / {max || '?'} {entry.type === 'anime' ? 'eps' : 'ch'}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {max > 0 && (
          <div className="progress-bar" style={{ marginBottom: 6 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}

        {/* Star rating */}
        <StarRating value={entry.score || 0} onChange={score => onScoreChange(entry, score)} size="sm" />
      </div>

      {/* Delete */}
      <button onClick={() => onRemove(entry)} style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: 8, alignSelf: 'center',
        background: 'none', border: '1px solid var(--border)', color: 'var(--text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-3)'; e.currentTarget.style.color = 'var(--neon-3)'; e.currentTarget.style.background = 'rgba(244,114,182,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
      </button>
    </div>
  )
}

function GridEntry({ entry, onRemove }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', transition: 'all .2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
    >
      <Link to={`/${entry.type}/${entry.id}`}>
        <div style={{ position: 'relative' }}>
          <img src={entry.image} alt={entry.title}
            style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.src = 'https://placehold.co/160x213/1a1d2e/c084fc?text=?' }}
          />
          {entry.score > 0 && (
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
              borderRadius: 6, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3,
              border: '1px solid rgba(251,191,36,0.3)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1", color: '#fbbf24' }}>star</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-cond)' }}>{entry.score}</span>
            </div>
          )}
        </div>
        <div style={{ padding: '8px 10px' }}>
          <div style={{
            fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: 'var(--text)',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>{entry.title}</div>
        </div>
      </Link>
    </div>
  )
}

export default function MyList() {
  const { user } = useAuth()
  const [mediaType, setMediaType] = useState('anime')
  const [status, setStatus]       = useState('all')
  const [list, setList]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchQ, setSearchQ]     = useState('')
  const [view, setView]           = useState('list')

  useEffect(() => { loadList() }, [user, mediaType])

  const loadList = async () => {
    if (!user) return
    setLoading(true)
    try { setList(await getUserList(user.uid, mediaType)) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleRemove = async (entry) => {
    if (!confirm(`¿Eliminar "${entry.title}" de tu lista?`)) return
    await removeFromList(user.uid, entry.type, entry.id)
    setList(prev => prev.filter(e => !(e.id === entry.id && e.type === entry.type)))
  }
  const handleScoreUpdate    = async (entry, score)    => { await updateListEntry(user.uid, entry.type, entry.id, { score });    setList(prev => prev.map(e => e.id === entry.id && e.type === entry.type ? { ...e, score } : e)) }
  const handleProgressUpdate = async (entry, progress) => { await updateListEntry(user.uid, entry.type, entry.id, { progress }); setList(prev => prev.map(e => e.id === entry.id && e.type === entry.type ? { ...e, progress } : e)) }

  const filtered = list.filter(e => {
    if (status !== 'all' && e.status !== status) return false
    if (searchQ && !e.title?.toLowerCase().includes(searchQ.toLowerCase())) return false
    return true
  })
  const statuses = STATUSES[mediaType]
  const counts   = {}
  list.forEach(e => { counts[e.status] = (counts[e.status] || 0) + 1 })

  if (!user) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: 16, padding: 24 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--text-3)' }}>lock</span>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 1, color: 'var(--text)' }}>LOG IN</div>
      <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 320 }}>Save anime and manga, rate them, and track your progress</p>
      <Link to="/login" className="btn btn-primary">Log In</Link>
    </div>
  )

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, color: 'var(--text)', marginBottom: 2 }}>MI LISTA</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{list.length} entradas en total</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['list', 'grid'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              width: 36, height: 36, borderRadius: 'var(--radius)',
              background: view === v ? 'rgba(192,132,252,0.15)' : 'var(--surface)',
              border: view === v ? '1px solid var(--neon)' : '1px solid var(--border)',
              color: view === v ? 'var(--neon)' : 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {v === 'list' ? 'view_list' : 'grid_view'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Media type */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['anime', 'manga'].map(t => (
          <button key={t} onClick={() => { setMediaType(t); setStatus('all') }} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 20px', borderRadius: 99, cursor: 'pointer',
            fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700,
            letterSpacing: 0.5, textTransform: 'capitalize', transition: 'all .2s',
            border: mediaType === t ? 'none' : '1px solid var(--border-2)',
            background: mediaType === t ? 'var(--neon)' : 'var(--surface)',
            color: mediaType === t ? '#fff' : 'var(--text-2)',
            boxShadow: mediaType === t ? '0 0 16px rgba(192,132,252,0.35)' : 'none'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>
              {t === 'anime' ? 'movie' : 'auto_stories'}
            </span>
            {t}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {statuses.map(s => (
          <button key={s.value} onClick={() => setStatus(s.value)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 14px', background: 'none', border: 'none',
            borderBottom: status === s.value ? `2px solid ${s.color || 'var(--neon)'}` : '2px solid transparent',
            cursor: 'pointer', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
            color: status === s.value ? (s.color || 'var(--neon)') : 'var(--text-2)',
            transition: 'all .15s', whiteSpace: 'nowrap', marginBottom: -1
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1", color: s.color || 'inherit' }}>{s.icon}</span>
            {s.label}
            {s.value !== 'all' && counts[s.value] !== undefined && (
              <span style={{
                background: 'var(--surface-2)', color: 'var(--text-2)',
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99
              }}>{counts[s.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <span className="material-symbols-outlined" style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-3)', fontSize: 18, pointerEvents: 'none'
        }}>search</span>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Buscar en tu lista..." className="av-input"
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: 60 }}>
          <div style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--neon)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBlock: 80, gap: 12, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--text-3)' }}>inbox</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, color: 'var(--text-2)' }}>
            {searchQ ? 'SIN RESULTADOS' : 'LISTA VACÍA'}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            {searchQ ? 'No coincide con tu búsqueda' : 'Agrega anime y manga desde el catálogo'}
          </p>
          {!searchQ && <Link to="/catalog" className="btn btn-primary" style={{ marginTop: 8 }}>Explorar catálogo</Link>}
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
          {filtered.map(entry => <GridEntry key={`${entry.type}_${entry.id}`} entry={entry} onRemove={handleRemove} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(entry => (
            <ListEntry key={`${entry.type}_${entry.id}`} entry={entry}
              onRemove={handleRemove} onScoreChange={handleScoreUpdate} onProgressChange={handleProgressUpdate} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}