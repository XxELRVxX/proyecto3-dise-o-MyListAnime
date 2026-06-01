import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  searchAnime, searchManga, getTopAnime, getTopManga,
  getAnimeGenres, getMangaGenres, normalizeEntry
} from '../services/jikan'
import { useAuth } from '../context/AuthContext'
import AddToListModal from '../components/modals/AddToListModal'

const ANIME_TYPES   = ['TV', 'Movie', 'OVA', 'ONA', 'Special']
const MANGA_TYPES   = ['Manga', 'Novel', 'LightNovel', 'Manhwa', 'Manhua']
const ANIME_STATUS  = ['airing', 'complete', 'upcoming']
const MANGA_STATUS  = ['publishing', 'complete', 'hiatus', 'upcoming']
const ORDER_ANIME   = ['popularity', 'score', 'rank', 'title', 'episodes']
const ORDER_MANGA   = ['popularity', 'score', 'rank', 'title', 'chapters']
const RATINGS       = ['g', 'pg', 'pg13', 'r17', 'r', 'rx']
const RATING_LABELS = { g: 'G', pg: 'PG', pg13: 'PG-13', r17: 'R-17', r: 'R+', rx: 'Rx' }

function PosterCard({ entry, onAdd, user }) {
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={e => { const btn = e.currentTarget.querySelector('.hover-btn'); if (btn) btn.style.opacity = '1' }}
      onMouseLeave={e => { const btn = e.currentTarget.querySelector('.hover-btn'); if (btn) btn.style.opacity = '0' }}
    >
      <Link to={`/${entry.type}/${entry.id}`} style={{ display: 'block' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all .25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
        >
          <div style={{ position: 'relative' }}>
            <img src={entry.image} alt={entry.title}
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.src = 'https://placehold.co/160x213/1a1d2e/c084fc?text=?' }}
              loading="lazy"
            />
            {entry.score && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(251,191,36,0.4)', borderRadius: 6,
                padding: '3px 8px', fontFamily: 'var(--font-cond)',
                fontSize: 13, fontWeight: 700, color: '#fbbf24',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>star</span>
                {entry.score}
              </div>
            )}
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{
              fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, color: 'var(--text)',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 3
            }}>{entry.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {entry.genres?.slice(0, 2).join(', ')}
            </div>
          </div>
        </div>
      </Link>
      {user && (
        <button className="hover-btn" onClick={() => onAdd(entry)} style={{
          position: 'absolute', top: 8, left: 8, opacity: 0, transition: 'opacity .2s',
          background: 'var(--neon)', color: '#fff', border: 'none',
          borderRadius: 6, width: 28, height: 28, display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 0 12px rgba(192,132,252,0.5)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
        </button>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 99,
      fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 600,
      border: active ? '1px solid var(--neon)' : '1px solid var(--border-2)',
      background: active ? 'rgba(192,132,252,0.15)' : 'var(--surface-2)',
      color: active ? 'var(--neon)' : 'var(--text-2)',
      cursor: 'pointer', transition: 'all .15s', textTransform: 'capitalize'
    }}>
      {label}
    </button>
  )
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [mediaType, setMediaType] = useState(searchParams.get('media') || 'anime')
  const [inputVal, setInputVal]   = useState(searchParams.get('q') || '')
  const [query, setQuery]         = useState(searchParams.get('q') || '')
  const [filters, setFilters]     = useState({ type: '', status: '', genre: '', rating: '', order_by: 'popularity' })
  const [genres, setGenres]       = useState([])
  const [results, setResults]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(true)
  const [filtersOpen, setFilters2]= useState(false)
  const [modalEntry, setModal]    = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = mediaType === 'anime' ? await getAnimeGenres() : await getMangaGenres()
        setGenres(data.data || [])
      } catch { setGenres([]) }
    }
    load()
  }, [mediaType])

  const doSearch = useCallback(async (reset = false) => {
    setLoading(true)
    const p = reset ? 1 : page
    if (reset) setPage(1)
    try {
      let data
      if (query.trim()) {
        data = mediaType === 'anime' ? await searchAnime(query, p, filters) : await searchManga(query, p, filters)
      } else {
        data = mediaType === 'anime' ? await getTopAnime(p, filters.order_by || 'bypopularity') : await getTopManga(p, filters.order_by || 'bypopularity')
      }
      const norm = (data.data || []).map(e => normalizeEntry(e, mediaType))
      setResults(reset ? norm : prev => [...prev, ...norm])
      setHasMore(data.pagination?.has_next_page || false)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [query, mediaType, filters, page])

  useEffect(() => { doSearch(true) }, [query, mediaType, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(inputVal)
    setSearchParams(p => {
      const n = new URLSearchParams(p)
      inputVal.trim() ? n.set('q', inputVal) : n.delete('q')
      return n
    })
  }
  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))
  const types   = mediaType === 'anime' ? ANIME_TYPES : MANGA_TYPES
  const statuses= mediaType === 'anime' ? ANIME_STATUS : MANGA_STATUS
  const orders  = mediaType === 'anime' ? ORDER_ANIME : ORDER_MANGA
  const activeCount = Object.values(filters).filter(v => v && v !== 'popularity').length

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, color: 'var(--text)', marginBottom: 4 }}>
          CATÁLOGO
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Explora miles de anime y manga con datos reales de MyAnimeList</p>
      </div>

      {/* Media type */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['anime', 'manga'].map(t => (
          <button key={t} onClick={() => { setMediaType(t); setResults([]); setPage(1) }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 22px', borderRadius: 99, cursor: 'pointer',
            fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700,
            letterSpacing: 0.5, textTransform: 'capitalize', transition: 'all .2s',
            border: mediaType === t ? 'none' : '1px solid var(--border-2)',
            background: mediaType === t ? 'var(--neon)' : 'var(--surface)',
            color: mediaType === t ? '#fff' : 'var(--text-2)',
            boxShadow: mediaType === t ? '0 0 20px rgba(192,132,252,0.4)' : 'none'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
              {t === 'anime' ? 'movie' : 'auto_stories'}
            </span>
            {t}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)', padding: '0 16px', height: 44
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-3)' }}>search</span>
          <input
            value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder={`Buscar ${mediaType}...`}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14 }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: 44 }}>Buscar</button>
        <button type="button" onClick={() => setFilters2(o => !o)} style={{
          height: 44, padding: '0 18px', borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 14,
          border: filtersOpen || activeCount > 0 ? '1px solid var(--neon)' : '1px solid var(--border-2)',
          background: filtersOpen || activeCount > 0 ? 'rgba(192,132,252,0.1)' : 'var(--surface)',
          color: filtersOpen || activeCount > 0 ? 'var(--neon)' : 'var(--text-2)',
          transition: 'all .2s'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
          Filtros
          {activeCount > 0 && (
            <span style={{
              background: 'var(--neon)', color: '#fff', borderRadius: 99,
              fontSize: 11, fontWeight: 700, width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{activeCount}</span>
          )}
        </button>
      </form>

      {/* Filter panel */}
      {filtersOpen && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {/* Type */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Tipo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {types.map(t => <FilterChip key={t} label={t} active={filters.type === t} onClick={() => setFilter('type', t)} />)}
              </div>
            </div>
            {/* Status */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Estado</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {statuses.map(s => <FilterChip key={s} label={s} active={filters.status === s} onClick={() => setFilter('status', s)} />)}
              </div>
            </div>
            {/* Genre */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Género</div>
              <select value={filters.genre} onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
                className="av-input" style={{ padding: '8px 12px', height: 36, fontSize: 13 }}>
                <option value="">Todos</option>
                {genres.map(g => <option key={g.mal_id} value={g.mal_id}>{g.name}</option>)}
              </select>
            </div>
            {/* Order */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Ordenar por</div>
              <select value={filters.order_by} onChange={e => setFilters(f => ({ ...f, order_by: e.target.value }))}
                className="av-input" style={{ padding: '8px 12px', height: 36, fontSize: 13, textTransform: 'capitalize' }}>
                {orders.map(o => <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o}</option>)}
              </select>
            </div>
          </div>
          {/* Rating (anime only) */}
          {mediaType === 'anime' && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Clasificación</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {RATINGS.map(r => <FilterChip key={r} label={RATING_LABELS[r]} active={filters.rating === r} onClick={() => setFilter('rating', r)} />)}
              </div>
            </div>
          )}
          <button onClick={() => setFilters({ type: '', status: '', genre: '', rating: '', order_by: 'popularity' })}
            style={{ marginTop: 14, fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = 'var(--neon-3)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
          >
            ✕ Limpiar filtros
          </button>
        </div>
      )}

      {/* Results count */}
      {!loading && results.length > 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
          {results.length} resultados {query ? `para "${query}"` : ''}
        </p>
      )}

      {/* Grid */}
      {loading && results.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBlock: 80, textAlign: 'center', gap: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--text-3)' }}>search_off</span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-2)', letterSpacing: 1 }}>SIN RESULTADOS</p>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Intenta con otros términos o ajusta los filtros</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
            {results.map(entry => (
              <PosterCard key={`${entry.type}_${entry.id}`} entry={entry} user={user} onAdd={setModal} />
            ))}
          </div>
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
              <button onClick={() => { setPage(p => p + 1); doSearch(false) }}
                disabled={loading} className="btn btn-ghost">
                {loading
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--neon)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                  : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                }
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      {modalEntry && <AddToListModal entry={modalEntry} onClose={() => setModal(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}