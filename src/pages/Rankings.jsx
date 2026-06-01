import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTopAnime, getTopManga, normalizeEntry } from '../services/jikan'
import AddToListModal from '../components/modals/AddToListModal'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = {
  anime: [
    { value: 'bypopularity', label: 'Más Populares' },
    { value: 'airing',       label: 'En Emisión' },
    { value: 'upcoming',     label: 'Próximos' },
    { value: 'favorite',     label: 'Favoritos' },
  ],
  manga: [
    { value: 'bypopularity', label: 'Más Populares' },
    { value: 'publishing',   label: 'Publicando' },
    { value: 'upcoming',     label: 'Próximos' },
    { value: 'favorite',     label: 'Favoritos' },
  ],
}

function RankingRow({ entry, rank, user, onAdd }) {
  const medal =
    rank === 1 ? { icon: 'emoji_events',     cls: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]' } :
    rank === 2 ? { icon: 'workspace_premium', cls: 'text-slate-300' } :
    rank === 3 ? { icon: 'workspace_premium', cls: 'text-amber-600' } : null

  return (
    <Link
      to={`/${entry.type}/${entry.id}`}
      className="glass-card rounded-xl border border-outline-variant/20 flex items-center gap-4 p-3 transition-all duration-200 hover:border-primary/30 hover:translate-x-1 group"
    >
      <div className="w-10 flex-shrink-0 flex items-center justify-center">
        {medal ? (
          <span className={`material-symbols-outlined text-[26px] ${medal.cls}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {medal.icon}
          </span>
        ) : (
          <span className="font-black text-lg text-outline">#{rank}</span>
        )}
      </div>

      <div className="w-11 h-14 rounded overflow-hidden flex-shrink-0">
        <img src={entry.image} alt={entry.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/44x56/0b1326/ddb7ff?text=?' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {entry.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {entry.score && (
            <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {entry.score}
            </span>
          )}
          {entry.scoredBy && <span className="text-xs text-on-surface-variant">{entry.scoredBy?.toLocaleString()} votos</span>}
          {entry.episodes && <span className="text-xs text-on-surface-variant">{entry.episodes} eps</span>}
          {entry.chapters  && <span className="text-xs text-on-surface-variant">{entry.chapters} ch</span>}
          {entry.status && (
            <span className={`text-xs font-semibold ${entry.status.includes('Airing') || entry.status === 'Publishing' ? 'text-secondary' : 'text-on-surface-variant'}`}>
              {entry.status}
            </span>
          )}
        </div>
        {entry.genres?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {entry.genres.slice(0, 3).map(g => <span key={g} className="genre-chip text-[9px] px-1.5 py-0.5">{g}</span>)}
          </div>
        )}
      </div>

      {entry.popularity && (
        <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-20 text-center">
          <span className="text-[10px] text-outline mb-0.5">Popularidad</span>
          <span className="text-sm font-bold text-on-surface">#{entry.popularity}</span>
        </div>
      )}

      {user && (
        <button
          onClick={e => { e.preventDefault(); onAdd(entry) }}
          className="flex-shrink-0 w-8 h-8 rounded-full glass-card border border-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-on-primary"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
        </button>
      )}
    </Link>
  )
}

function RowSkeleton() {
  return (
    <div className="glass-card rounded-xl border border-outline-variant/20 flex items-center gap-4 p-3">
      <div className="skeleton w-10 h-7 rounded" />
      <div className="skeleton w-11 h-14 rounded" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function Rankings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [type, setType]         = useState(searchParams.get('type') || 'anime')
  const [category, setCategory] = useState('bypopularity')
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(true)
  const [modal, setModal]       = useState(null)

  useEffect(() => {
    setItems([]); setPage(1); load(1, true)
  }, [type, category])

  const load = async (p = page, reset = false) => {
    setLoading(true)
    try {
      const data = type === 'anime' ? await getTopAnime(p, category) : await getTopManga(p, category)
      const norm = (data.data || []).map(e => normalizeEntry(e, type))
      setItems(prev => reset ? norm : [...prev, ...norm])
      setHasMore(data.pagination?.has_next_page || false)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const switchType = (t) => {
    setType(t); setSearchParams({ type: t }); setCategory(CATEGORIES[t][0].value)
  }

  return (
    <div className="page-enter max-w-screen-xl mx-auto px-gutter py-6">
      <div className="mb-8">
        <h1 className="text-headline-md font-bold text-on-surface mb-1">Rankings</h1>
        <p className="text-body-sm text-on-surface-variant">Los mejores anime y manga según MyAnimeList</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['anime', 'manga'].map(t => (
          <button key={t} onClick={() => switchType(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm capitalize transition-all duration-200
              ${type === t
                ? 'bg-secondary text-on-secondary shadow-[0_0_15px_rgba(93,230,255,0.4)]'
                : 'glass-card text-on-surface-variant border border-outline-variant/30 hover:text-on-surface'
              }`}>
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {t === 'anime' ? 'movie' : 'auto_stories'}
            </span>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-8 border-b border-outline-variant/30 overflow-x-auto scrollbar-hide">
        {CATEGORIES[type].map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px
              ${category === cat.value
                ? 'border-secondary text-secondary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {loading && items.length === 0
          ? Array.from({ length: 12 }, (_, i) => <RowSkeleton key={i} />)
          : items.map((entry, idx) => (
            <RankingRow key={`${entry.id}_${idx}`} entry={entry} rank={idx + 1} user={user} onAdd={setModal} />
          ))
        }
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button onClick={() => { const n = page + 1; setPage(n); load(n) }} className="btn-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
            Cargar más
          </button>
        </div>
      )}

      {loading && items.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {modal && <AddToListModal entry={modal} onClose={() => setModal(null)} />}
    </div>
  )
}