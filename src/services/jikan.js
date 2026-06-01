
// Jikan API v4 — datos reales de MyAnimeList (sin API key)
const BASE_URL = 'https://api.jikan.moe/v4'

// Helper con retry para manejar el rate limit de Jikan (3 req/s)
const fetchJikan = async (endpoint, retries = 2) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`)
    if (res.status === 429) {
      // Rate limit: esperar y reintentar
      await new Promise(r => setTimeout(r, 1000))
      if (retries > 0) return fetchJikan(endpoint, retries - 1)
    }
    if (!res.ok) throw new Error(`Jikan error ${res.status}`)
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Jikan fetch error:', err)
    throw err
  }
}

// ── Anime ──────────────────────────────────────────────
export const getTopAnime = (page = 1, filter = 'bypopularity') =>
  fetchJikan(`/top/anime?page=${page}&filter=${filter}&limit=24`)

export const getSeasonNow = () =>
  fetchJikan('/seasons/now?limit=24')

export const getSeasonUpcoming = () =>
  fetchJikan('/seasons/upcoming?limit=12')

export const searchAnime = (query, page = 1, filters = {}) => {
  const params = new URLSearchParams({ q: query, page, limit: 20 })
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.rating) params.set('rating', filters.rating)
  if (filters.genre) params.set('genres', filters.genre)
  if (filters.min_score) params.set('min_score', filters.min_score)
  if (filters.order_by) params.set('order_by', filters.order_by)
  return fetchJikan(`/anime?${params}`)
}

export const getAnimeById = (id) =>
  fetchJikan(`/anime/${id}/full`)

export const getAnimeCharacters = (id) =>
  fetchJikan(`/anime/${id}/characters`)

export const getAnimeRecommendations = (id) =>
  fetchJikan(`/anime/${id}/recommendations`)

export const getAnimeReviews = (id) =>
  fetchJikan(`/anime/${id}/reviews`)

// ── Manga ──────────────────────────────────────────────
export const getTopManga = (page = 1, filter = 'bypopularity') =>
  fetchJikan(`/top/manga?page=${page}&filter=${filter}&limit=24`)

export const searchManga = (query, page = 1, filters = {}) => {
  const params = new URLSearchParams({ q: query, page, limit: 20 })
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.genre) params.set('genres', filters.genre)
  if (filters.order_by) params.set('order_by', filters.order_by)
  return fetchJikan(`/manga?${params}`)
}

export const getMangaById = (id) =>
  fetchJikan(`/manga/${id}/full`)

export const getMangaReviews = (id) =>
  fetchJikan(`/manga/${id}/reviews`)

// ── Genres ─────────────────────────────────────────────
export const getAnimeGenres = () =>
  fetchJikan('/genres/anime')

export const getMangaGenres = () =>
  fetchJikan('/genres/manga')

// ── Rankings helper ─────────────────────────────────────
export const getRankings = (type = 'anime', category = 'bypopularity', page = 1) => {
  if (type === 'anime') return getTopAnime(page, category)
  return getTopManga(page, category)
}

// ── Normalize entry (anime o manga) ────────────────────
export const normalizeEntry = (entry, type = 'anime') => ({
  id: entry.mal_id,
  type,
  title: entry.title_english || entry.title,
  titleJa: entry.title,
  image: entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url,
  score: entry.score,
  scoredBy: entry.scored_by,
  rank: entry.rank,
  popularity: entry.popularity,
  status: entry.status,
  episodes: entry.episodes,
  chapters: entry.chapters,
  volumes: entry.volumes,
  synopsis: entry.synopsis,
  genres: entry.genres?.map(g => g.name) || [],
  studios: entry.studios?.map(s => s.name) || [],
  authors: entry.authors?.map(a => a.name) || [],
  year: entry.year || entry.published?.prop?.from?.year,
  season: entry.season,
  rating: entry.rating,
  source: entry.source,
  duration: entry.duration,
  trailer: entry.trailer?.url,
  url: entry.url,
})
