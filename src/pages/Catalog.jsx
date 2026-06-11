import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  searchAnime, searchManga, browseAnime, browseManga, getTopAnime, getTopManga,
  getAnimeGenres, getMangaGenres, normalizeEntry
} from '../services/jikan'
import { useAuth } from '../context/AuthContext'
import { useContentFilter } from '../context/ContentFilterContext'
import { useHomeData } from '../context/HomeDataContext'
import AddToListModal from '../components/modals/AddToListModal'
import { SkeletonList } from '../components/ui/Skeleton'

const ANIME_TYPES   = ['TV', 'Movie', 'OVA', 'ONA', 'Special']
const MANGA_TYPES   = ['Manga', 'Novel', 'LightNovel', 'Manhwa', 'Manhua']
const ANIME_STATUS  = ['airing', 'complete', 'upcoming']
const MANGA_STATUS  = ['publishing', 'complete', 'hiatus', 'upcoming']
const ORDER_ANIME   = ['popularity', 'score', 'rank', 'title', 'episodes']
const ORDER_MANGA   = ['popularity', 'score', 'rank', 'title', 'chapters']
const RATINGS       = ['g', 'pg', 'pg13', 'r17', 'r']
const RATING_LABELS = { g: 'G', pg: 'PG', pg13: 'PG-13', r17: 'R-17', r: 'R+', rx: 'Rx' }
const CATALOG_BG    = '/fanart/2.png'

function ParallaxBackground() {
  const [offsetY, setOffsetY] = useState(0)
  const rafRef = useRef(null), targetRef = useRef(0)
  useEffect(() => {
    const onScroll = () => { targetRef.current = window.scrollY }
    const tick = () => {
      setOffsetY(prev => prev + (targetRef.current * 0.3 - prev) * 0.07)
      rafRef.current = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    rafRef.current = requestAnimationFrame(tick)
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafRef.current) }
  }, [])
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <img className="parallax-img" src={CATALOG_BG} alt="" style={{
        position: 'absolute', inset: '-10% 0', width: '100%', height: '120%',
        objectFit: 'cover', objectPosition: 'center top', filter: 'blur(2px)',
        transform: `translateY(${offsetY}px)`, willChange: 'transform',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,19,38,0.78) 0%, rgba(11,19,38,0.68) 30%, rgba(11,19,38,0.75) 60%, rgba(11,19,38,0.90) 100%)' }} />
    </div>
  )
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: `${(i * 37 + 11) % 100}%`, y: `${(i * 53 + 7) % 100}%`,
  size: 3 + (i % 4) * 2, delay: `${(i * 0.4) % 4}s`, duration: `${4 + (i % 3) * 2}s`,
  color: i % 3 === 0 ? 'rgba(221,183,255,0.25)' : i % 3 === 1 ? 'rgba(93,230,255,0.2)' : 'rgba(255,178,183,0.15)',
}))

function KunaiSVG() {
  return (
    <svg viewBox="0 0 10 32" width="8" height="24" aria-hidden="true">
      <polygon points="5,0 8,13 5,11 2,13" fill="#d0d0d0" />
      <rect x="3.5" y="12" width="3" height="9" rx="1" fill="#1a0f00" />
      <line x1="3.5" y1="14" x2="6.5" y2="14" stroke="#6b3a1f" strokeWidth="1" />
      <line x1="3.5" y1="16" x2="6.5" y2="16" stroke="#6b3a1f" strokeWidth="1" />
      <line x1="3.5" y1="18" x2="6.5" y2="18" stroke="#6b3a1f" strokeWidth="1" />
      <circle cx="5" cy="23" r="2" fill="none" stroke="#999" strokeWidth="1" />
      <line x1="5" y1="3" x2="6" y2="7" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
  )
}

function PosterCard({ entry, onAdd, user, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const count = entry.score ? Math.min(10, Math.max(1, Math.round(Number(entry.score)))) : 3
  const orbit = 22

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -3, borderRadius: 17, zIndex: 0,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(221,183,255,0.28) 0%, rgba(180,100,255,0.1) 50%, transparent 70%)',
        filter: 'blur(8px)', pointerEvents: 'none',
      }} />

      <Link to={`/${entry.type}/${entry.id}`} style={{ display: 'block', position: 'relative', zIndex: 1 }}>
        {/* imagen wrapper — overflow visible para que los kunais salgan */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: hovered ? '1px solid rgba(221,183,255,0.6)' : '1px solid rgba(77,67,84,0.5)',
          borderRadius: 14, overflow: 'hidden',
          transform: hovered ? 'translateY(-6px) scale(1.025)' : 'translateY(0) scale(1)',
          boxShadow: hovered ? '0 18px 45px rgba(0,0,0,0.65), 0 0 25px rgba(221,183,255,0.15)' : '0 4px 16px rgba(0,0,0,0.5)',
          transition: 'border-color .25s, transform .3s cubic-bezier(0.34,1.56,0.64,1), box-shadow .25s',
        }}>
          <div style={{ position: 'relative', overflow: 'visible' }}>
            <img
              src={entry.image} alt={entry.title}
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.src = 'https://placehold.co/160x213/171f33/ddb7ff?text=?' }}
              loading="lazy"
            />

            {/* Score badge + kunais — todo dentro del mismo contenedor */}
            {entry.score && (
              <div style={{
                position: 'absolute', top: 7, right: 7,
                overflow: 'visible', zIndex: 10,
              }}>
                {/* Kunais orbitando desde afuera hacia el centro del badge */}
                {Array.from({ length: count }, (_, i) => {
                  const angle = (360 / count) * i
                  const rad   = (angle * Math.PI) / 180
                  const fromX = Math.cos(rad) * orbit
                  const fromY = Math.sin(rad) * orbit
                  const delay = i * 0.05
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      // centro del badge (~15px ancho, ~20px alto → centro ~8x10)
                      left: '8px', top: '10px',
                      width: 0, height: 0,
                      pointerEvents: 'none', zIndex: 20,
                      overflow: 'visible',
                    }}>
                      <div style={{
                        position: 'absolute',
                        marginLeft: -4, marginTop: -12,
                        transform: hovered
                          ? `translate(${fromX}px, ${fromY}px) rotate(${angle + 270}deg)`
                          : `translate(0px, 0px) rotate(${angle + 270}deg)`,
                        opacity: hovered ? 1 : 0,
                        transition: hovered
                          ? `opacity 0.12s ease ${delay}s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`
                          : `opacity 0.2s ease ${0.4 + delay}s, transform 0.15s ease`,
                        filter: 'drop-shadow(0 0 3px rgba(220,230,255,1))',
                      }}>
                        <KunaiSVG />
                      </div>
                    </div>
                  )
                })}
                {/* Badge del score */}
                <div className="score-badge" style={{
                  background: 'var(--c-score-bg)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(251,191,36,0.5)', borderRadius: 6,
                  padding: '3px 7px', fontSize: 11, fontWeight: 700,
                  color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3,
                  fontFamily: 'Orbitron, sans-serif', position: 'relative', zIndex: 5,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>star</span>
                  {Number(entry.score).toFixed(1)}
                </div>
              </div>
            )}

            <div className="type-badge" style={{
              position: 'absolute', bottom: 7, left: 7,
              background: 'var(--c-type-bg)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(221,183,255,0.2)', borderRadius: 4,
              padding: '2px 6px', fontSize: 9, fontWeight: 700,
              color: '#ddb7ff', fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {entry.type === 'anime' ? (entry.episodes ? `${entry.episodes} eps` : 'Anime') : (entry.chapters ? `${entry.chapters} ch` : 'Manga')}
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--c-img-grad)', pointerEvents: 'none' }} />
          </div>

          <div style={{ padding: '9px 11px 11px' }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--color-on-surface, #dae2fd)',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              lineHeight: 1.4, fontFamily: 'Orbitron, sans-serif', marginBottom: 4,
            }}>{entry.title}</div>
            {entry.genres?.length > 0 && (
              <div style={{ fontSize: 10, color: 'rgba(221,183,255,0.6)', fontFamily: 'Inter, sans-serif' }}>
                {entry.genres.slice(0, 2).join(' · ')}
              </div>
            )}
          </div>
        </div>
      </Link>

      {user && (
        <button onClick={() => onAdd(entry)} style={{
          position: 'absolute', top: 7, left: 7, zIndex: 2,
          opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.7)',
          transition: 'opacity .25s ease, transform .25s cubic-bezier(0.34,1.56,0.64,1)',
          background: 'linear-gradient(135deg, #ddb7ff, #b76dff)', color: '#490080',
          border: 'none', borderRadius: 7, width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(221,183,255,0.7)',
        }} aria-label={`Agregar ${entry.title} a la lista`}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add</span>
        </button>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick, color }) {
  const c = color || '#ddb7ff'
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      fontFamily: 'Orbitron, sans-serif',
      border: active ? `1px solid ${c}` : '1px solid rgba(77,67,84,0.5)',
      background: active ? `${c}20` : 'transparent',
      color: active ? c : 'var(--color-on-surface-variant, #cfc2d6)',
      transition: 'all .15s', whiteSpace: 'nowrap',
      boxShadow: active ? `0 0 10px ${c}33` : 'none',
    }}>{label}</button>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center', gap: 12 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 52, color: '#ffb2b7' }}>wifi_off</span>
      <p style={{ fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: '0.06em', color: 'var(--color-on-surface)' }}>Error al cargar</p>
      <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>Jikan está con rate limit. Esperá unos segundos.</p>
      <button onClick={onRetry} style={{
        marginTop: 8, padding: '9px 24px', borderRadius: 99,
        background: 'rgba(221,183,255,0.15)', border: '1px solid rgba(221,183,255,0.4)',
        color: '#ddb7ff', fontWeight: 700, fontSize: 13, fontFamily: 'Orbitron, sans-serif',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
        Reintentar
      </button>
    </div>
  )
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { filterEnabled, toggleFilter, filterList } = useContentFilter()
  const { homeAnime } = useHomeData()

  const [mediaType, setMediaType] = useState(searchParams.get('media') || 'anime')
  const [inputVal,  setInputVal]  = useState(searchParams.get('q') || '')
  const [query,     setQuery]     = useState(searchParams.get('q') || '')
  const [filters,   setFilters]   = useState({ type: '', status: '', genre: '', rating: '', order_by: 'popularity' })
  const [genres,    setGenres]    = useState([])
  const [results,   setResults]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(false)
  const [page,      setPage]      = useState(1)
  const [hasMore,   setHasMore]   = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [modal,     setModal]     = useState(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const data = mediaType === 'anime' ? await getAnimeGenres() : await getMangaGenres()
        setGenres(data.data || [])
      } catch { setGenres([]) }
    }, 1200)
    return () => clearTimeout(t)
  }, [mediaType])

  const doSearch = useCallback(async (reset = false, overridePage) => {
    setLoading(true); setError(false)
    const p = overridePage ?? (reset ? 1 : page)
    if (reset) setPage(1)
    try {
      let data
      const hasActiveFilters = filters.type || filters.status || filters.genre || filters.rating
      if (query.trim()) {
        // búsqueda con texto — pasar todos los filtros
        data = mediaType === 'anime'
          ? await searchAnime(query, p, filters)
          : await searchManga(query, p, filters)
      } else if (hasActiveFilters || (filters.order_by && filters.order_by !== 'popularity')) {
        // sin texto pero con filtros — usar browse que soporta todos los params
        data = mediaType === 'anime'
          ? await browseAnime(p, filters)
          : await browseManga(p, filters)
      } else {
        // sin filtros — top por popularidad
        data = mediaType === 'anime'
          ? await getTopAnime(p, 'bypopularity')
          : await getTopManga(p, 'bypopularity')
      }
      const normalized = filterList((data.data || []).map(e => normalizeEntry(e, mediaType)))
      setResults(reset ? normalized : prev => [...prev, ...normalized])
      setHasMore(data.pagination?.has_next_page || false)
    } catch (err) { console.error(err); setError(true) }
    finally { setLoading(false) }
  }, [query, mediaType, filters, page, filterEnabled, filterList])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (homeAnime.length > 0 && mediaType === 'anime' && !query.trim()) {
        setResults(filterList(homeAnime)); setHasMore(true); setLoading(false); return
      }
      const t = setTimeout(() => doSearch(true), 1500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => doSearch(true), 800)
    return () => clearTimeout(t)
  }, [query, mediaType, filters, filterEnabled])

  const handleSearch = (e) => {
    e.preventDefault(); setQuery(inputVal)
    setSearchParams(p => { const n = new URLSearchParams(p); inputVal.trim() ? n.set('q', inputVal) : n.delete('q'); return n })
  }
  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))
  const loadMore = async () => { const n = page + 1; setPage(n); await doSearch(false, n) }
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'popularity').length
  const ratings = filterEnabled ? RATINGS : [...RATINGS, 'rx']

  return (
    <div className="page-enter" style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <ParallaxBackground />
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: p.x, top: p.y,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.color, animation: `float ${p.duration} ease-in-out ${p.delay} infinite`, filter: 'blur(1px)',
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="catalog-title-wrap">
          <h1 className="catalog-glitch-title" style={{
            fontFamily: 'Bangers, cursive', fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', letterSpacing: '0.06em',
            background: 'linear-gradient(90deg, #ddb7ff 0%, #5de6ff 60%, #ffb2b7 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4,
          }}>Catálogo</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
            Explora miles de anime y manga con datos reales de MyAnimeList
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['anime', 'manga'].map(t => (
              <button key={t} onClick={() => { setMediaType(t); setResults([]); setPage(1) }} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 99,
                fontWeight: 700, fontSize: 13, textTransform: 'capitalize', fontFamily: 'Orbitron, sans-serif', transition: 'all .2s',
                border: mediaType === t ? '1px solid #ddb7ff' : '1px solid rgba(77,67,84,0.5)',
                background: mediaType === t ? 'rgba(221,183,255,0.15)' : 'transparent',
                color: mediaType === t ? '#ddb7ff' : 'var(--color-on-surface-variant)',
                boxShadow: mediaType === t ? '0 0 18px rgba(221,183,255,0.25)' : 'none',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>{t === 'anime' ? 'movie' : 'auto_stories'}</span>
                {t}
              </button>
            ))}
          </div>
          <button onClick={toggleFilter} className={`filter-toggle ${filterEnabled ? 'active' : 'inactive'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>{filterEnabled ? 'shield' : 'no_adult_content'}</span>
            {filterEnabled ? 'Filtro activo' : 'Todo el contenido'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--color-on-surface-variant)', pointerEvents: 'none' }}>search</span>
              <input value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder={`Buscar ${mediaType}...`}
                style={{ width: '100%', padding: '11px 12px 11px 40px', background: 'var(--color-input-bg)', border: '1px solid rgba(77,67,84,0.6)', borderRadius: 12, fontSize: 14, color: 'var(--color-on-surface)', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color .2s, box-shadow .2s' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(221,183,255,0.5)'; e.target.style.boxShadow = '0 0 16px rgba(221,183,255,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-card-border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <button type="submit" style={{ padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #ddb7ff, #b76dff)', color: '#490080', border: 'none', fontWeight: 700, fontSize: 13, fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 18px rgba(221,183,255,0.35)' }}>Buscar</button>
          </form>
          <button onClick={() => setFiltersOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: 'Orbitron, sans-serif', transition: 'all .2s',
            border: filtersOpen || activeFiltersCount > 0 ? '1px solid #ddb7ff' : '1px solid rgba(77,67,84,0.5)',
            background: filtersOpen || activeFiltersCount > 0 ? 'rgba(221,183,255,0.1)' : 'var(--color-input-bg)',
            color: filtersOpen || activeFiltersCount > 0 ? '#ddb7ff' : 'var(--color-on-surface-variant)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>tune</span>
            Filtros
            {activeFiltersCount > 0 && <span style={{ background: '#ddb7ff', color: '#490080', fontSize: 10, fontWeight: 900, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFiltersCount}</span>}
          </button>
        </div>

        {filtersOpen && (
          <div className="animate-slide-up" style={{ background: 'var(--c-filter-bg)', backdropFilter: 'blur(12px)', border: '1px solid rgba(221,183,255,0.15)', borderRadius: 16, padding: '18px 20px', marginBottom: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[{ label: 'Tipo', options: mediaType === 'anime' ? ANIME_TYPES : MANGA_TYPES, key: 'type' }, { label: 'Estado', options: mediaType === 'anime' ? ANIME_STATUS : MANGA_STATUS, key: 'status' }].map(({ label, options, key }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(221,183,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>{label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{options.map(o => <FilterChip key={o} label={o} active={filters[key] === o} onClick={() => setFilter(key, o)} />)}</div>
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(221,183,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>Género</div>
                <select value={filters.genre} onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))} style={{ width: '100%', padding: '7px 10px', background: 'var(--color-card-bg)', border: '1px solid rgba(77,67,84,0.6)', borderRadius: 8, fontSize: 13, color: 'var(--color-on-surface)', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
                  <option value="">Todos</option>
                  {[...new Map(genres.map(g => [g.mal_id, g])).values()].map(g => <option key={g.mal_id} value={g.mal_id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(221,183,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>Ordenar</div>
                <select value={filters.order_by} onChange={e => setFilters(f => ({ ...f, order_by: e.target.value }))} style={{ width: '100%', padding: '7px 10px', background: 'var(--color-card-bg)', border: '1px solid rgba(77,67,84,0.6)', borderRadius: 8, fontSize: 13, color: 'var(--color-on-surface)', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
                  {(mediaType === 'anime' ? ORDER_ANIME : ORDER_MANGA).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {mediaType === 'anime' && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(77,67,84,0.3)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(221,183,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>Clasificación {filterEnabled && <span style={{ color: '#5de6ff' }}> · Rx oculto</span>}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{ratings.map(r => <FilterChip key={r} label={RATING_LABELS[r]} active={filters.rating === r} onClick={() => setFilter('rating', r)} color={r === 'rx' ? '#ffb2b7' : undefined} />)}</div>
              </div>
            )}
            <button onClick={() => setFilters({ type: '', status: '', genre: '', rating: '', order_by: 'popularity' })} style={{ marginTop: 12, fontSize: 11, color: 'rgba(221,183,255,0.5)', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}>Limpiar filtros</button>
          </div>
        )}

        {!loading && results.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
            <span style={{ color: '#ddb7ff', fontWeight: 700 }}>{results.length}</span> resultados
            {query ? <span> para "<span style={{ color: '#5de6ff' }}>{query}</span>"</span> : ''}
            {filterEnabled && <span style={{ color: '#5de6ff', marginLeft: 8 }}>· Filtro activo</span>}
          </p>
        )}

        {loading && results.length === 0 ? <SkeletonList count={24} />
        : error ? <ErrorState onRetry={() => doSearch(true)} />
        : results.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-outline)' }}>search_off</span>
            <p style={{ fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>No se encontraron resultados</p>
            <p style={{ fontSize: 13, color: 'var(--color-outline)', fontFamily: 'Inter, sans-serif' }}>Intenta con otros términos o ajusta los filtros</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 14 }}>
              {results.map((entry, i) => <PosterCard key={`${entry.type}_${entry.id}`} entry={entry} user={user} onAdd={setModal} index={i} />)}
            </div>
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                <button onClick={loadMore} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 30px', borderRadius: 99, border: '1px solid rgba(93,230,255,0.4)', background: 'rgba(93,230,255,0.08)', color: '#5de6ff', fontWeight: 700, fontSize: 13, fontFamily: 'Orbitron, sans-serif', opacity: loading ? 0.5 : 1, boxShadow: '0 0 16px rgba(93,230,255,0.1)' }}>
                  {loading ? <div style={{ width: 16, height: 16, border: '2px solid rgba(93,230,255,0.3)', borderTopColor: '#5de6ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>}
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {modal && <AddToListModal entry={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
