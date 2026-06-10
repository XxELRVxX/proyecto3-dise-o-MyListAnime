// Jikan API v4 — datos reales de MyAnimeList (sin API key)
const BASE_URL = 'https://api.jikan.moe/v4'

// Cola global — máximo 1 request cada 450ms para no superar el rate limit de Jikan (3 req/s)
let lastRequestTime = 0
const MIN_INTERVAL  = 700

const waitForSlot = () => {
  const now  = Date.now()
  const wait = Math.max(0, lastRequestTime + MIN_INTERVAL - now)
  lastRequestTime = Date.now() + wait
  return wait > 0 ? new Promise(r => setTimeout(r, wait)) : Promise.resolve()
}

const fetchJikan = async (endpoint, retries = 3, delay = 2000) => {
  await waitForSlot()
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`)
    if (res.status === 429) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, delay))
        lastRequestTime = 0
        return fetchJikan(endpoint, retries - 1, delay * 2)
      }
      throw new Error('Rate limit alcanzado')
    }
    if (!res.ok) throw new Error(`Jikan error ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Jikan fetch error:', err)
    throw err
  }
}

// ── Anime ────────────────────────────────────────────────────
export const getTopAnime = (page = 1, filter = 'bypopularity') => {
  // Normalizar filtros — Jikan solo acepta: airing, upcoming, bypopularity, favorite
  const validFilters = ['airing', 'upcoming', 'bypopularity', 'favorite']
  const f = validFilters.includes(filter) ? filter : 'bypopularity'
  return fetchJikan(`/top/anime?page=${page}&filter=${f}&limit=24`)
}

export const getSeasonNow = () =>
  fetchJikan('/seasons/now?limit=24')

export const getSeasonUpcoming = () =>
  fetchJikan('/seasons/upcoming?limit=12')

export const searchAnime = (query, page = 1, filters = {}) => {
  const params = new URLSearchParams({ page, limit: 24 })
  if (query)             params.set('q',          query)
  if (filters.type)      params.set('type',        filters.type)
  if (filters.status)    params.set('status',      filters.status)
  if (filters.rating)    params.set('rating',      filters.rating)
  if (filters.genre)     params.set('genres',      filters.genre)
  if (filters.min_score) params.set('min_score',   filters.min_score)
  if (filters.order_by) {
    const orderMap = { popularity: 'bypopularity', score: 'score', rank: 'rank', title: 'title', episodes: 'episodes' }
    params.set('order_by', orderMap[filters.order_by] || filters.order_by)
  }
  return fetchJikan(`/anime?${params}`)
}

// Navegar catálogo sin query — aplica todos los filtros
export const browseAnime = (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page, limit: 24 })
  if (filters.type)   params.set('type',     filters.type)
  if (filters.status) params.set('status',   filters.status)
  if (filters.rating) params.set('rating',   filters.rating)
  if (filters.genre)  params.set('genres',   filters.genre)
  // Jikan /anime acepta: mal_id, title, start_date, score, scored_by, rank, popularity, members, favorites, episodes
  const orderMap = { popularity: 'popularity', score: 'score', rank: 'rank', title: 'title', episodes: 'episodes' }
  const ob = orderMap[filters.order_by]
  if (ob) { params.set('order_by', ob); params.set('sort', 'desc') }
  return fetchJikan(`/anime?${params}`)
}

export const browseManga = (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page, limit: 24 })
  if (filters.type)   params.set('type',     filters.type)
  if (filters.status) params.set('status',   filters.status)
  if (filters.genre)  params.set('genres',   filters.genre)
  const orderMap = { popularity: 'popularity', score: 'score', rank: 'rank', title: 'title', chapters: 'chapters' }
  const ob = orderMap[filters.order_by]
  if (ob) { params.set('order_by', ob); params.set('sort', 'desc') }
  return fetchJikan(`/manga?${params}`)
}

export const getAnimeById         = (id) => fetchJikan(`/anime/${id}/full`)
export const getAnimeCharacters   = (id) => fetchJikan(`/anime/${id}/characters`)
export const getAnimeRecommendations = (id) => fetchJikan(`/anime/${id}/recommendations`)
export const getAnimeReviews      = (id) => fetchJikan(`/anime/${id}/reviews`)

// ── Manga ─────────────────────────────────────────────────────
export const getTopManga = (page = 1, filter = 'bypopularity') => {
  const validFilters = ['manga', 'novel', 'oneshot', 'doujin', 'manhwa', 'manhua', 'bypopularity', 'favorite']
  const f = validFilters.includes(filter) ? filter : 'bypopularity'
  return fetchJikan(`/top/manga?page=${page}&filter=${f}&limit=24`)
}

export const searchManga = (query, page = 1, filters = {}) => {
  const params = new URLSearchParams({ q: query, page, limit: 20 })
  if (filters.type)     params.set('type',     filters.type)
  if (filters.status)   params.set('status',   filters.status)
  if (filters.genre)    params.set('genres',   filters.genre)
  if (filters.order_by) params.set('order_by', filters.order_by)
  return fetchJikan(`/manga?${params}`)
}

export const getMangaById    = (id) => fetchJikan(`/manga/${id}/full`)
export const getMangaReviews = (id) => fetchJikan(`/manga/${id}/reviews`)

// ── Géneros ────────────────────────────────────────────────────
export const getAnimeGenres = () => fetchJikan('/genres/anime')
export const getMangaGenres = () => fetchJikan('/genres/manga')

// ── Rankings helper ────────────────────────────────────────────
export const getRankings = (type = 'anime', category = 'bypopularity', page = 1) =>
  type === 'anime' ? getTopAnime(page, category) : getTopManga(page, category)

// ── Normalize entry ────────────────────────────────────────────
export const normalizeEntry = (entry, type = 'anime') => ({
  id:         entry.mal_id,
  type,
  title:      entry.title || entry.title_english,
  titleJa:    entry.title,
  image:      entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url,
  score:      entry.score,
  scoredBy:   entry.scored_by,
  rank:       entry.rank,
  popularity: entry.popularity,
  status:     entry.status,
  episodes:   entry.episodes,
  chapters:   entry.chapters,
  volumes:    entry.volumes,
  synopsis:   entry.synopsis,
  genres:     entry.genres?.map(g => g.name)   || [],
  studios:    entry.studios?.map(s => s.name)  || [],
  authors:    entry.authors?.map(a => a.name)  || [],
  year:       entry.year || entry.published?.prop?.from?.year,
  season:     entry.season,
  rating:     entry.rating,
  source:     entry.source,
  duration:   entry.duration,
  trailer:    entry.trailer?.url,
  url:        entry.url,
})
