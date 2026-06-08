// Datos simulados para desarrollo local y pruebas de componentes
// ── Entradas de Anime ─────────────────────────────────────────────────────────────

export const mockAnimeList = [
  {
    id: 1,
    type: 'anime',
    title: 'Fullmetal Alchemist: Brotherhood',
    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    score: 9.1,
    rank: 1,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    status: 'Finished Airing',
    episodes: 64,
  },
  {
    id: 5114,
    type: 'anime',
    title: 'Steins;Gate',
    image: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg',
    score: 9.0,
    rank: 2,
    genres: ['Drama', 'Sci-Fi', 'Thriller'],
    status: 'Finished Airing',
    episodes: 24,
  },
  {
    id: 9253,
    type: 'anime',
    title: 'Shingeki no Kyojin',
    image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    score: 8.5,
    rank: 3,
    genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
    status: 'Finished Airing',
    episodes: 25,
  },
  {
    id: 38000,
    type: 'anime',
    title: 'Demon Slayer',
    image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    score: 8.7,
    rank: 4,
    genres: ['Action', 'Fantasy', 'Supernatural'],
    status: 'Currently Airing',
    episodes: null,
  },
  {
    id: 41467,
    type: 'anime',
    title: 'Jujutsu Kaisen',
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    score: 8.6,
    rank: 5,
    genres: ['Action', 'Fantasy', 'School'],
    status: 'Currently Airing',
    episodes: null,
  },
  {
    id: 21,
    type: 'anime',
    title: 'One Piece',
    image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    score: 8.9,
    rank: 6,
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    status: 'Currently Airing',
    episodes: null,
  },
]

// ── Entradas de Manga ─────────────────────────────────────────────────────────────

export const mockMangaList = [
  {
    id: 2,
    type: 'manga',
    title: 'Berserk',
    image: 'https://cdn.myanimelist.net/images/manga/1/157931.jpg',
    score: 9.4,
    rank: 1,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Horror'],
    status: 'Publishing',
    chapters: null,
  },
  {
    id: 1706,
    type: 'manga',
    title: 'Vagabond',
    image: 'https://cdn.myanimelist.net/images/manga/1/259070.jpg',
    score: 9.1,
    rank: 2,
    genres: ['Action', 'Adventure', 'Drama', 'Historical'],
    status: 'Finished',
    chapters: 327,
  },
]

// ── Entradas de lista de usuarios ─────────────────────────

export const mockUserList = [
  {
    id: 1,
    type: 'anime',
    title: 'Fullmetal Alchemist: Brotherhood',
    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    status: 'completed',
    score: 10,
    progress: 64,
    episodes: 64,
  },
  {
    id: 5114,
    type: 'anime',
    title: 'Steins;Gate',
    image: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg',
    status: 'watching',
    score: 0,
    progress: 12,
    episodes: 24,
  },
  {
    id: 2,
    type: 'manga',
    title: 'Berserk',
    image: 'https://cdn.myanimelist.net/images/manga/1/157931.jpg',
    status: 'reading',
    score: 9,
    progress: 200,
    chapters: null,
  },
]

// ── Lista de géneros ───────────────────

export const mockGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Supernatural', 'Thriller', 'Sports', 'Historical', 'School',
]

// ── Perfil de usuario simulado ─────────

export const mockUser = {
  uid: 'mock-uid-001',
  displayName: 'Jeanpooll',
  email: 'test@example.com',
  photoURL: null,
}
