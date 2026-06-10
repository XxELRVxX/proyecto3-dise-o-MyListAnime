import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTopAnime, getTopManga, normalizeEntry } from '../services/jikan'
import { useAuth } from '../context/AuthContext'
import { useContentFilter } from '../context/ContentFilterContext'
import { SkeletonRankRow } from '../components/ui/Skeleton'
import AddToListModal from '../components/modals/AddToListModal'

const CATEGORIES = {
  anime: [
    { value: 'bypopularity', label: 'Más Populares', icon: 'local_fire_department' },
    { value: 'airing',       label: 'En Emisión',    icon: 'live_tv' },
    { value: 'upcoming',     label: 'Próximos',      icon: 'upcoming' },
    { value: 'favorite',     label: 'Favoritos',     icon: 'favorite' },
  ],
  manga: [
    { value: 'bypopularity', label: 'Más Populares', icon: 'local_fire_department' },
    { value: 'publishing',   label: 'Publicando',    icon: 'menu_book' },
    { value: 'upcoming',     label: 'Próximos',      icon: 'upcoming' },
    { value: 'favorite',     label: 'Favoritos',     icon: 'favorite' },
  ],
}

const RANKINGS_BG = '/fanart/6.jpeg'

function ParallaxBackground() {
  const [offsetY, setOffsetY] = useState(0)
  const rafRef    = useRef(null)
  const targetRef = useRef(0)
  useEffect(() => {
    const onScroll = () => { targetRef.current = window.scrollY }
    const tick = () => {
      setOffsetY(prev => prev + (targetRef.current * 0.3 - prev) * 0.07)
      rafRef.current = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <img src={RANKINGS_BG} alt="" style={{
        position: 'absolute', inset: '-10% 0',
        width: '100%', height: '120%',
        objectFit: 'cover', objectPosition: 'center top',
        filter: 'blur(2px)',
        transform: `translateY(${offsetY}px)`,
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom,
          rgba(11,19,38,0.78) 0%, rgba(11,19,38,0.68) 30%,
          rgba(11,19,38,0.75) 60%, rgba(11,19,38,0.90) 100%)`,
      }} />
    </div>
  )
}

// ── Medal / rank display ─────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return (
    <span className="material-symbols-outlined"
      style={{ fontSize: 28, color: '#fbbf24', filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))', fontVariationSettings: "'FILL' 1" }}>
      emoji_events
    </span>
  )
  if (rank === 2) return (
    <span className="material-symbols-outlined"
      style={{ fontSize: 26, color: '#cbd5e1', fontVariationSettings: "'FILL' 1" }}>
      workspace_premium
    </span>
  )
  if (rank === 3) return (
    <span className="material-symbols-outlined"
      style={{ fontSize: 26, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
      workspace_premium
    </span>
  )
  return (
    <span style={{
      fontFamily: 'Orbitron, sans-serif', fontWeight: 900,
      fontSize: rank > 99 ? 12 : 15,
      color: rank <= 10 ? '#ddb7ff' : 'var(--color-outline)',
    }}>
      #{rank}
    </span>
  )
}

// ── RankingRow ───────────────────────────────────────────────
function RankingRow({ entry, rank, user, onAdd }) {
  const isTop3 = rank <= 3

  return (
    <Link
      to={`/${entry.type}/${entry.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 14,
        background: isTop3
          ? 'linear-gradient(90deg, rgba(221,183,255,0.07) 0%, rgba(11,19,38,0.4) 100%)'
          : 'var(--color-surface-container, #171f33)',
        border: isTop3
          ? `1px solid rgba(221,183,255,${rank === 1 ? '0.35' : '0.18'})`
          : '1px solid rgba(77,67,84,0.35)',
        transition: 'all .2s',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(221,183,255,0.4)'
        e.currentTarget.style.transform = 'translateX(4px)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'
        const btn = e.currentTarget.querySelector('.add-btn')
        if (btn) btn.style.opacity = '1'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isTop3 ? `rgba(221,183,255,${rank === 1 ? '0.35' : '0.18'})` : 'rgba(77,67,84,0.35)'
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
        const btn = e.currentTarget.querySelector('.add-btn')
        if (btn) btn.style.opacity = '0'
      }}
    >
      {/* Rank */}
      <div style={{ width: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RankBadge rank={rank} />
      </div>

      {/* Cover */}
      <div style={{ width: 44, height: 58, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={entry.image} alt={entry.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
          loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/44x58/171f33/ddb7ff?text=?' }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.12)' }}
          onMouseLeave={e => { e.target.style.transform = '' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
          fontSize: 13, color: 'var(--color-on-surface)',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          marginBottom: 4,
        }}>
          {entry.title}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px' }}>
          {entry.score && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>star</span>
              {Number(entry.score).toFixed(1)}
            </span>
          )}
          {entry.scoredBy && (
            <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
              {entry.scoredBy.toLocaleString()} votos
            </span>
          )}
          {entry.episodes && (
            <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{entry.episodes} eps</span>
          )}
          {entry.chapters && (
            <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{entry.chapters} ch</span>
          )}
          {entry.status && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: entry.status === 'Currently Airing' || entry.status === 'Publishing'
                ? '#5de6ff' : 'var(--color-on-surface-variant)',
            }}>
              {entry.status === 'Currently Airing' ? '● En emisión'
                : entry.status === 'Publishing' ? '● Publicando'
                : entry.status === 'Finished Airing' || entry.status === 'Finished' ? 'Finalizado'
                : entry.status}
            </span>
          )}
        </div>

        {entry.genres?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
            {entry.genres.slice(0, 3).map(g => (
              <span key={g} style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 99,
                border: '1px solid rgba(77,67,84,0.6)',
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'Orbitron, sans-serif',
              }}>{g}</span>
            ))}
          </div>
        )}
      </div>

      {/* Popularity */}
      {entry.popularity && (
        <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 72 }}
          className="sm:flex"
        >
          <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', fontFamily: 'Orbitron, sans-serif', marginBottom: 2 }}>
            Popularidad
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-on-surface)', fontFamily: 'Orbitron, sans-serif' }}>
            #{entry.popularity}
          </span>
        </div>
      )}

      {/* Add to list */}
      {user && (
        <button
          className="add-btn"
          onClick={e => { e.preventDefault(); onAdd(entry) }}
          style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(221,183,255,0.12)', border: '1px solid rgba(221,183,255,0.3)',
            color: '#ddb7ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'all .2s',
          }}
          aria-label="Agregar a lista"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        </button>
      )}
    </Link>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function Rankings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { filterList } = useContentFilter()

  const [type,     setType]     = useState(searchParams.get('type') || 'anime')
  const [category, setCategory] = useState('bypopularity')
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(true)
  const [modal,    setModal]    = useState(null)

  useEffect(() => {
    setItems([]); setPage(1); load(1, true)
  }, [type, category])

  const load = async (p = page, reset = false) => {
    setLoading(true)
    try {
      const data = type === 'anime'
        ? await getTopAnime(p, category)
        : await getTopManga(p, category)
      const norm = filterList((data.data || []).map(e => normalizeEntry(e, type)))
      setItems(prev => reset ? norm : [...prev, ...norm])
      setHasMore(data.pagination?.has_next_page || false)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const switchType = (t) => {
    setType(t)
    setSearchParams({ type: t })
    setCategory(CATEGORIES[t][0].value)
  }

  return (
    <div className="page-enter" style={{ position: 'relative', minHeight: '100vh' }}>
      <ParallaxBackground />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'Bangers, cursive', fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          letterSpacing: '0.06em', color: 'var(--color-on-surface)',
          textShadow: '0 0 20px rgba(221,183,255,0.25)', marginBottom: 4,
        }}>
          Rankings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
          Los mejores anime y manga según MyAnimeList
        </p>
      </div>

      {/* Type toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['anime', 'manga'].map(t => (
          <button key={t} onClick={() => switchType(t)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 20px', borderRadius: 99,
            fontWeight: 700, fontSize: 13, textTransform: 'capitalize',
            fontFamily: 'Orbitron, sans-serif', transition: 'all .2s',
            border: type === t ? '1px solid #5de6ff' : '1px solid rgba(77,67,84,0.5)',
            background: type === t ? 'rgba(93,230,255,0.12)' : 'transparent',
            color: type === t ? '#5de6ff' : 'var(--color-on-surface-variant)',
            boxShadow: type === t ? '0 0 16px rgba(93,230,255,0.18)' : 'none',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>
              {t === 'anime' ? 'movie' : 'auto_stories'}
            </span>
            {t}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 24,
        borderBottom: '1px solid rgba(77,67,84,0.35)',
        overflowX: 'auto',
      }}>
        {CATEGORIES[type].map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            flexShrink: 0, padding: '10px 16px 11px',
            fontSize: 13, fontWeight: 600,
            fontFamily: 'Orbitron, sans-serif',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${category === cat.value ? '#5de6ff' : 'transparent'}`,
            marginBottom: -1,
            color: category === cat.value ? '#5de6ff' : 'var(--color-on-surface-variant)',
            transition: 'all .18s', whiteSpace: 'nowrap',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>
              {cat.icon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && items.length === 0
          ? Array.from({ length: 12 }, (_, i) => <SkeletonRankRow key={i} />)
          : items.map((entry, idx) => (
            <RankingRow
              key={`${entry.id}_${idx}`}
              entry={entry}
              rank={idx + 1}
              user={user}
              onAdd={setModal}
            />
          ))
        }
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <button
            onClick={() => { const n = page + 1; setPage(n); load(n) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 28px', borderRadius: 99,
              border: '1px solid rgba(93,230,255,0.4)',
              background: 'rgba(93,230,255,0.08)',
              color: '#5de6ff', fontWeight: 700, fontSize: 13,
              fontFamily: 'Orbitron, sans-serif',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
            Cargar más
          </button>
        </div>
      )}

      {loading && items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <div style={{ width: 28, height: 28, border: '2px solid rgba(221,183,255,0.2)', borderTopColor: '#ddb7ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {modal && <AddToListModal entry={modal} onClose={() => setModal(null)} />}
      </div>
    </div>
  )
}
