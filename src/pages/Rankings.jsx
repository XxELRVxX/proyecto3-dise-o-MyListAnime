import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTopAnime, getTopManga, normalizeEntry } from '../services/jikan'
import { SkeletonCard } from '../components/ui/Skeleton'
import AddToListModal from '../components/modals/AddToListModal'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = {
  anime: [
    { value: 'bypopularity', label: 'Más Populares' },
    { value: 'airing', label: 'En Emisión' },
    { value: 'upcoming', label: 'Próximos' },
    { value: 'favorite', label: 'Favoritos' },
  ],
  manga: [
    { value: 'bypopularity', label: 'Más Populares' },
    { value: 'publishing', label: 'Publicando' },
    { value: 'upcoming', label: 'Próximos' },
    { value: 'favorite', label: 'Favoritos' },
  ],
}

export default function Rankings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [type, setType] = useState(searchParams.get('type') || 'anime')
  const [category, setCategory] = useState('bypopularity')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [modalEntry, setModalEntry] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    setItems([])
    setPage(1)
    loadRankings(1, true)
  }, [type, category])

  const loadRankings = async (p = page, reset = false) => {
    setLoading(true)
    try {
      const data = type === 'anime'
        ? await getTopAnime(p, category)
        : await getTopManga(p, category)
      const normalized = (data.data || []).map(e => normalizeEntry(e, type))
      setItems(prev => reset ? normalized : [...prev, ...normalized])
      setHasMore(data.pagination?.has_next_page || false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadRankings(next)
  }

  const switchType = (t) => {
    setType(t)
    setSearchParams({ type: t })
    setCategory(CATEGORIES[t][0].value)
  }

  const medalColor = (rank) => {
    if (rank === 1) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]'
    if (rank === 2) return 'text-slate-300'
    if (rank === 3) return 'text-amber-600'
    return 'text-on-surface-variant'
  }

  return (
    <div className="page-enter max-w-screen-xl mx-auto px-gutter py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-headline-md font-headline-md text-on-surface mb-1">Rankings</h1>
        <p className="text-body-sm text-on-surface-variant">Los mejores anime y manga según MyAnimeList</p>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-6">
        {['anime', 'manga'].map(t => (
          <button
            key={t}
            onClick={() => switchType(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm capitalize transition-all duration-200
              ${type === t
                ? 'bg-secondary text-on-secondary shadow-[0_0_15px_rgba(93,230,255,0.4)]'
                : 'glass-card text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {t === 'anime' ? 'movie' : 'auto_stories'}
            </span>
            {t}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES[type].map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${category === cat.value
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-on-surface-variant hover:text-on-surface'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rankings list */}
      <div className="flex flex-col gap-3">
        {loading && items.length === 0
          ? Array.from({ length: 12 }, (_, i) => <RankingSkeleton key={i} />)
          : items.map((entry, idx) => (
            <RankingRow
              key={`${entry.id}_${idx}`}
              entry={entry}
              rank={idx + 1}
              medalColor={medalColor}
              user={user}
              onAddToList={() => setModalEntry(entry)}
            />
          ))
        }
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button onClick={loadMore} className="btn-secondary flex items-center gap-2">
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

      {modalEntry && (
        <AddToListModal entry={modalEntry} onClose={() => setModalEntry(null)} />
      )}
    </div>
  )
}

function RankingRow({ entry, rank, medalColor, user, onAddToList }) {
  return (
    <Link
      to={`/${entry.type}/${entry.id}`}
      className="glass-card rounded-xl border border-outline-variant/20 flex items-center gap-4 p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(221,183,255,0.15)] group"
    >
      {/* Rank */}
      <div className="w-10 flex-shrink-0 text-center">
        {rank <= 3 ? (
          <span className={`material-symbols-outlined text-[28px] ${medalColor(rank)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {rank === 1 ? 'emoji_events' : 'workspace_premium'}
          </span>
        ) : (
          <span className="font-black text-lg text-on-surface-variant">#{rank}</span>
        )}
      </div>

      {/* Cover */}
      <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
        <img
          src={entry.image}
          alt={entry.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-on-surface text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {entry.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          {entry.score && (
            <span className="flex items-center gap-1 text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {entry.score}
            </span>
          )}
          {entry.scoredBy && (
            <span className="text-on-surface-variant text-xs">{entry.scoredBy?.toLocaleString()} votos</span>
          )}
          {entry.episodes && (
            <span className="text-on-surface-variant text-xs">{entry.episodes} eps</span>
          )}
          {entry.chapters && (
            <span className="text-on-surface-variant text-xs">{entry.chapters} ch</span>
          )}
          {entry.status && (
            <span className={`text-xs font-medium ${entry.status.includes('Airing') || entry.status === 'Publishing' ? 'text-secondary' : 'text-on-surface-variant'}`}>
              {entry.status}
            </span>
          )}
        </div>
        {entry.genres.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {entry.genres.slice(0, 3).map(g => (
              <span key={g} className="genre-chip text-[9px] px-1.5 py-0.5">{g}</span>
            ))}
          </div>
        )}
      </div>

      {/* Popularity */}
      {entry.popularity && (
        <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-20">
          <span className="text-xs text-on-surface-variant mb-1">Popularidad</span>
          <span className="text-sm font-bold text-on-surface">#{entry.popularity}</span>
        </div>
      )}

      {/* Add to list btn */}
      {user && (
        <button
          onClick={e => { e.preventDefault(); onAddToList() }}
          className="flex-shrink-0 w-9 h-9 rounded-full glass-card border border-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary hover:text-on-primary"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      )}
    </Link>
  )
}

function RankingSkeleton() {
  return (
    <div className="glass-card rounded-xl border border-outline-variant/20 flex items-center gap-4 p-3">
      <div className="skeleton w-10 h-8 rounded" />
      <div className="skeleton w-12 h-16 rounded" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="flex gap-1">
          <div className="skeleton h-4 rounded-full w-12" />
          <div className="skeleton h-4 rounded-full w-12" />
        </div>
      </div>
    </div>
  )
}
