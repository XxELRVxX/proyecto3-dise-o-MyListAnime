import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchAnime, searchManga, getTopAnime, getTopManga, getAnimeGenres, getMangaGenres, normalizeEntry } from '../services/jikan'
import AnimeCard from '../components/ui/AnimeCard'
import { SkeletonList } from '../components/ui/Skeleton'

const ANIME_TYPES = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music']
const ANIME_STATUS = ['airing', 'complete', 'upcoming']
const ANIME_RATINGS = ['g', 'pg', 'pg13', 'r17', 'r', 'rx']
const RATING_LABELS = { g: 'G', pg: 'PG', pg13: 'PG-13', r17: 'R-17', r: 'R+', rx: 'Rx' }
const MANGA_TYPES = ['Manga', 'Novel', 'LightNovel', 'Oneshot', 'Doujin', 'Manhwa', 'Manhua']
const MANGA_STATUS = ['publishing', 'complete', 'hiatus', 'discontinued', 'upcoming']
const ORDER_BY_ANIME = ['score', 'popularity', 'rank', 'title', 'start_date', 'episodes']
const ORDER_BY_MANGA = ['score', 'popularity', 'rank', 'title', 'start_date', 'chapters']

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mediaType, setMediaType] = useState(searchParams.get('media') || 'anime')
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    type: '', status: '', genre: '', rating: '', order_by: 'popularity'
  })
  const [genres, setGenres] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Load genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = mediaType === 'anime' ? await getAnimeGenres() : await getMangaGenres()
        setGenres(data.data || [])
      } catch { setGenres([]) }
    }
    loadGenres()
  }, [mediaType])

  // Search
  const doSearch = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 1 : page
    if (reset) setPage(1)
    try {
      let data
      if (query.trim()) {
        data = mediaType === 'anime'
          ? await searchAnime(query, currentPage, filters)
          : await searchManga(query, currentPage, filters)
      } else {
        data = mediaType === 'anime'
          ? await getTopAnime(currentPage, filters.order_by || 'bypopularity')
          : await getTopManga(currentPage, filters.order_by || 'bypopularity')
      }
      const normalized = (data.data || []).map(e => normalizeEntry(e, mediaType))
      setResults(reset ? normalized : prev => [...prev, ...normalized])
      setHasMore(data.pagination?.has_next_page || false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [query, mediaType, filters, page])

  useEffect(() => { doSearch(true) }, [query, mediaType, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(inputVal)
    setSearchParams(p => {
      const next = new URLSearchParams(p)
      if (inputVal.trim()) next.set('q', inputVal); else next.delete('q')
      return next
    })
  }

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    doSearch(false)
  }

  const types = mediaType === 'anime' ? ANIME_TYPES : MANGA_TYPES
  const statuses = mediaType === 'anime' ? ANIME_STATUS : MANGA_STATUS
  const orderBys = mediaType === 'anime' ? ORDER_BY_ANIME : ORDER_BY_MANGA

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'popularity').length

  return (
    <div className="page-enter max-w-screen-xl mx-auto px-gutter py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-headline-md font-headline-md text-on-surface mb-1">Catálogo</h1>
        <p className="text-body-sm text-on-surface-variant">Explora miles de anime y manga con datos reales</p>
      </div>

      {/* Media type toggle */}
      <div className="flex gap-2 mb-6">
        {['anime', 'manga'].map(t => (
          <button
            key={t}
            onClick={() => { setMediaType(t); setResults([]); setPage(1) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 capitalize
              ${mediaType === t
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(221,183,255,0.4)]'
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

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={`Buscar ${mediaType}...`}
              className="input-field pl-10 border border-outline-variant rounded-lg"
            />
          </div>
          <button type="submit" className="btn-primary px-5">Buscar</button>
        </form>

        <button
          onClick={() => setFiltersOpen(o => !o)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200
            ${filtersOpen || activeFiltersCount > 0
              ? 'border-primary bg-primary/15 text-primary'
              : 'glass-card border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-on-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="glass-card rounded-xl border border-outline-variant/30 p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Type */}
            <FilterGroup label="Tipo" options={types} value={filters.type}
              onChange={v => setFilter('type', v)} />

            {/* Status */}
            <FilterGroup label="Estado" options={statuses} value={filters.status}
              onChange={v => setFilter('status', v)}
              labelMap={{ airing: 'En emisión', complete: 'Completado', upcoming: 'Próximamente', publishing: 'Publicando', hiatus: 'En pausa', discontinued: 'Descontinuado' }} />

            {/* Genre */}
            <div>
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 block">Género</label>
              <select
                value={filters.genre}
                onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
                className="input-field border border-outline-variant rounded text-sm"
              >
                <option value="">Todos</option>
                {genres.map(g => (
                  <option key={g.mal_id} value={g.mal_id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 block">Ordenar por</label>
              <select
                value={filters.order_by}
                onChange={e => setFilters(f => ({ ...f, order_by: e.target.value }))}
                className="input-field border border-outline-variant rounded text-sm capitalize"
              >
                {orderBys.map(o => (
                  <option key={o} value={o} className="capitalize">{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating (anime only) */}
          {mediaType === 'anime' && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 block">Clasificación</label>
              <div className="flex flex-wrap gap-2">
                {ANIME_RATINGS.map(r => (
                  <button
                    key={r}
                    onClick={() => setFilter('rating', r)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all
                      ${filters.rating === r ? 'bg-primary/15 border-primary text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-outline'}`}
                  >
                    {RATING_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setFilters({ type: '', status: '', genre: '', rating: '', order_by: 'popularity' })}
            className="mt-4 text-xs text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Results count */}
      {!loading && results.length > 0 && (
        <p className="text-body-sm text-on-surface-variant mb-4">
          {results.length} resultados {query ? `para "${query}"` : ''}
        </p>
      )}

      {/* Grid */}
      {loading && results.length === 0 ? (
        <SkeletonList count={24} />
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline mb-4">search_off</span>
          <p className="text-headline-sm text-on-surface-variant">No se encontraron resultados</p>
          <p className="text-body-sm text-outline mt-2">Intenta con otros términos o ajusta los filtros</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map(entry => (
              <AnimeCard key={`${entry.type}_${entry.id}`} entry={entry} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                )}
                Cargar más
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterGroup({ label, options, value, onChange, labelMap = {} }) {
  return (
    <div>
      <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-all capitalize
              ${value === opt ? 'bg-primary/15 border-primary text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-outline'}`}
          >
            {labelMap[opt] || opt}
          </button>
        ))}
      </div>
    </div>
  )
}
