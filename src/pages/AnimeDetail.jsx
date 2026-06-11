// Página de detalle de anime/manga.
// Usa el id de la URL para hacer 3 llamadas a Jikan en paralelo:
//   1. getAnimeById — info principal, trailer, géneros, estudios
//   2. getAnimeCharacters — personajes con seiyuu
//   3. getAnimeReviews — reseñas de la comunidad
// La ruta /manga/:id también usa este componente (type se detecta del path).

import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import {
  getAnimeById, getAnimeCharacters, getAnimeReviews,
  getMangaById, getMangaReviews, normalizeEntry,
} from '../services/jikan'
import { useAuth } from '../context/AuthContext'
import AddToListModal from '../components/modals/AddToListModal'
import ReviewModal    from '../components/modals/ReviewModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatBadge({ label, value }) {
  if (!value) return null
  return (
    <div className="glass-card rounded-xl px-4 py-3 text-center min-w-[80px]">
      <p className="text-lg font-black text-primary"
         style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}>
        {value}
      </p>
      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
        {label}
      </p>
    </div>
  )
}

function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="material-symbols-outlined text-secondary text-2xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >{icon}</span>
      <h2
        className="text-2xl font-black text-on-surface"
        style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}
      >{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 to-transparent ml-2" />
    </div>
  )
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="page-enter max-w-screen-xl mx-auto px-gutter py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="skeleton rounded-xl flex-shrink-0" style={{ width: 220, height: 320 }} />
        <div className="flex-1 space-y-4">
          <div className="skeleton rounded-lg h-10 w-3/4" />
          <div className="skeleton rounded-lg h-5  w-1/3" />
          <div className="flex gap-2">
            {[1,2,3].map(i => <div key={i} className="skeleton rounded-full h-6 w-16" />)}
          </div>
          <div className="skeleton rounded-lg h-24 w-full" />
          <div className="flex gap-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton rounded-xl w-20 h-14" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AnimeDetail() {
  const { id }       = useParams()
  const location     = useLocation()
  const { user }     = useAuth()

  // Detecta si es anime o manga por el path
  const type = location.pathname.startsWith('/manga') ? 'manga' : 'anime'

  const [entry,      setEntry]      = useState(null)
  const [characters, setCharacters] = useState([])
  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showAdd,    setShowAdd]    = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [trailerOpen,setTrailerOpen]= useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (type === 'anime') {
          // Carga en paralelo — info + personajes + reseñas
          const [infoRes, charsRes, revRes] = await Promise.allSettled([
            getAnimeById(id),
            getAnimeCharacters(id),
            getAnimeReviews(id),
          ])
          if (infoRes.status === 'fulfilled')
            setEntry(normalizeEntry(infoRes.value.data, 'anime'))
          if (charsRes.status === 'fulfilled')
            setCharacters(charsRes.value.data?.slice(0, 16) || [])
          if (revRes.status === 'fulfilled')
            setReviews(revRes.value.data?.slice(0, 6) || [])
        } else {
          const [infoRes, revRes] = await Promise.allSettled([
            getMangaById(id),
            getMangaReviews(id),
          ])
          if (infoRes.status === 'fulfilled')
            setEntry(normalizeEntry(infoRes.value.data, 'manga'))
          if (revRes.status === 'fulfilled')
            setReviews(revRes.value.data?.slice(0, 6) || [])
        }
      } catch (err) {
        setError('No se pudo cargar la información. Intentá de nuevo.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, type])

  if (loading) return <DetailSkeleton />

  if (error || !entry) return (
    <div className="page-enter flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <span className="material-symbols-outlined text-[56px] text-outline">error</span>
      <p className="text-on-surface-variant text-sm">{error || 'No se encontró el contenido.'}</p>
      <Link to="/" className="btn-ghost">← Volver al inicio</Link>
    </div>
  )

  // Extrae embed de YouTube del trailer
  const trailerEmbed = entry.trailer
    ? entry.trailer.replace('watch?v=', 'embed/').split('&')[0]
    : null

  return (
    <div className="page-enter">

      {/* ══════════════════════════════════════════
          HERO — imagen de fondo + info principal
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ minHeight: 420 }}>

        {/* Imagen de fondo difuminada */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={entry.image}
            alt=""
            className="w-full h-full object-cover scale-110"
            style={{ filter: 'blur(20px)', opacity: 0.3, objectPosition: 'center 20%' }}
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to bottom, rgba(11,19,38,0.6) 0%, rgba(11,19,38,0.98) 100%)' }} />
        </div>

        {/* Contenido del hero */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-gutter pt-8 pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={entry.image}
                alt={entry.title}
                className="rounded-2xl shadow-2xl neon-glow-purple"
                style={{ width: 200, aspectRatio: '2/3', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://placehold.co/200x300/0b1326/ddb7ff?text=?' }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">

              {/* Tipo + estado */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="genre-chip text-secondary border-secondary/40 bg-secondary/10 uppercase">
                  {type}
                </span>
                {entry.status && (
                  <span className={`genre-chip ${
                    entry.status === 'Currently Airing' || entry.status === 'Publishing'
                      ? 'text-secondary border-secondary/40 bg-secondary/10'
                      : 'text-outline border-outline-variant/40'
                  }`}>
                    {entry.status === 'Currently Airing' ? '● On Air'
                      : entry.status === 'Publishing'    ? '● Publishing'
                      : entry.status === 'Finished Airing' ? 'Finished'
                      : entry.status}
                  </span>
                )}
                {entry.rating && (
                  <span className="genre-chip text-outline border-outline-variant/40">
                    {entry.rating}
                  </span>
                )}
              </div>

              {/* Título */}
              <div>
                <h1
                  className="font-black text-on-surface leading-tight"
                  style={{
                    fontFamily:    'Bangers, cursive',
                    fontSize:      'clamp(2rem, 5vw, 3.5rem)',
                    letterSpacing: '0.04em',
                    textShadow:    '2px 4px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  {entry.title}
                </h1>
                {entry.titleJa && entry.titleJa !== entry.title && (
                  <p className="text-on-surface-variant text-sm mt-1"
                     style={{ fontFamily: 'Inter, sans-serif' }}>
                    {entry.titleJa}
                  </p>
                )}
              </div>

              {/* Score grande */}
              {entry.score && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="material-symbols-outlined text-yellow-400"
                      style={{ fontSize: '1.6rem', fontVariationSettings: "'FILL' 1" }}
                    >star</span>
                    <span
                      className="font-black text-yellow-400"
                      style={{ fontFamily: 'Bangers, cursive', fontSize: '2rem', letterSpacing: '0.05em' }}
                    >
                      {Number(entry.score).toFixed(1)}
                    </span>
                    <span className="text-outline text-sm">/10</span>
                  </div>
                  {entry.scoredBy && (
                    <span className="text-on-surface-variant text-xs"
                          style={{ fontFamily: 'Inter, sans-serif' }}>
                      {entry.scoredBy.toLocaleString()} votos
                    </span>
                  )}
                </div>
              )}

              {/* Géneros */}
              <div className="flex gap-2 flex-wrap">
                {entry.genres?.map(g => <span key={g} className="genre-chip">{g}</span>)}
              </div>

              {/* Stats */}
              <div className="flex gap-3 flex-wrap">
                {entry.rank       && <StatBadge label="Ranking"    value={`#${entry.rank}`} />}
                {entry.popularity && <StatBadge label="Popularity" value={`#${entry.popularity}`} />}
                {entry.episodes   && <StatBadge label="Episodes"  value={entry.episodes} />}
                {entry.chapters   && <StatBadge label="Chapters"  value={entry.chapters} />}
                {entry.volumes    && <StatBadge label="Volumes"  value={entry.volumes} />}
                {entry.year       && <StatBadge label="Year"        value={entry.year} />}
                {entry.source     && <StatBadge label="Source"     value={entry.source} />}
              </div>

              {/* Estudio / autores */}
              {(entry.studios?.length > 0 || entry.authors?.length > 0) && (
                <p className="text-sm text-on-surface-variant" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {type === 'anime' ? 'Studio' : 'Author'}:{' '}
                  <span className="text-primary font-semibold">
                    {(entry.studios?.length ? entry.studios : entry.authors).join(', ')}
                  </span>
                </p>
              )}

              {/* CTAs */}
              <div className="flex gap-3 flex-wrap mt-2">
                {trailerEmbed && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                    View Trailer
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                    Add to List
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => setShowReview(true)}
                    className="btn-ghost border border-outline-variant/40 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    Review
                  </button>
                )}
                {entry.url && (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost border border-outline-variant/40 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    MyAnimeList
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ══════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-gutter py-10 space-y-14">

        {/* ── Sinopsis ── */}
        {entry.synopsis && (
          <section>
            <SectionTitle icon="menu_book">Synopsis</SectionTitle>
            <p
              className="text-on-surface-variant leading-relaxed max-w-3xl"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.8 }}
            >
              {entry.synopsis}
            </p>
          </section>
        )}

        {/* ── Tráiler ── */}
        {trailerEmbed && (
          <section>
            <SectionTitle icon="play_circle">Official Trailer</SectionTitle>
            <div
              className="rounded-2xl overflow-hidden shadow-2xl neon-glow-purple"
              style={{ maxWidth: 720, aspectRatio: '16/9' }}
            >
              <iframe
                src={trailerEmbed}
                title={`Official Trailer of ${entry.title}`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
                style={{ border: 'none' }}
              />
            </div>
          </section>
        )}

        {/* ── Personajes (solo anime) ── */}
        {type === 'anime' && characters.length > 0 && (
          <section>
            <SectionTitle icon="groups">Characters</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {characters.map((c) => {
                const char   = c.character
                const voice  = c.voice_actors?.find(v => v.language === 'Japanese')
                return (
                  <div key={char.mal_id} className="glass-card card-hover rounded-xl overflow-hidden text-center">
                    <img
                      src={char.images?.jpg?.image_url}
                      alt={char.name}
                      className="w-full object-cover"
                      style={{ aspectRatio: '2/3' }}
                      onError={e => { e.target.src = 'https://placehold.co/100x150/0b1326/ddb7ff?text=?' }}
                      loading="lazy"
                    />
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-on-surface line-clamp-2 leading-tight">
                        {char.name}
                      </p>
                      <p className="text-[10px] text-primary mt-0.5">{c.role}</p>
                      {voice && (
                        <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-1"
                           style={{ fontFamily: 'Inter, sans-serif' }}>
                          {voice.person.name}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Reseñas ── */}
        {reviews.length > 0 && (
          <section>
            <SectionTitle icon="rate_review">
              Community Reviews
            </SectionTitle>
            <div className="space-y-4 max-w-3xl">
              {reviews.map((rev, i) => (
                <div key={i} className="glass-card rounded-xl p-5 border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    <img
                      src={rev.user?.images?.jpg?.image_url}
                      alt={rev.user?.username}
                      className="w-9 h-9 rounded-full object-cover border border-primary/20"
                      onError={e => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div
                      className="w-9 h-9 rounded-full bg-surface-container-high border border-primary/20
                                 items-center justify-center hidden"
                    >
                      <span className="material-symbols-outlined text-outline text-[16px]">person</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {rev.user?.username || 'Usuario'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant"
                         style={{ fontFamily: 'Inter, sans-serif' }}>
                        {rev.date ? new Date(rev.date).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) : ''}
                      </p>
                    </div>

                    {/* Score de la reseña */}
                    {rev.score !== undefined && (
                      <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20
                                      px-2.5 py-1 rounded-lg flex-shrink-0">
                        <span
                          className="material-symbols-outlined text-yellow-400 text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >star</span>
                        <span className="text-yellow-400 font-bold text-sm">{rev.score}</span>
                      </div>
                    )}
                  </div>

                  {/* Texto de la reseña */}
                  <p
                    className="text-on-surface-variant text-sm leading-relaxed line-clamp-5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {rev.review}
                  </p>

                  {/* Tags si los hay */}
                  {rev.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {rev.tags.map(tag => (
                        <span key={tag} className="genre-chip text-[10px] px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mensaje si no hay reseñas */}
        {reviews.length === 0 && !loading && (
          <section>
            <SectionTitle icon="rate_review">Community Reviews</SectionTitle>
            <div className="glass-card rounded-xl p-8 text-center max-w-md">
              <span className="material-symbols-outlined text-[40px] text-outline mb-3 block">
                rate_review
              </span>
              <p className="text-on-surface-variant text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                No reviews yet for this title.
              </p>
              {user && (
                <button
                  onClick={() => setShowReview(true)}
                  className="btn-primary mt-4 text-sm"
                >
                  Be the first to review
                </button>
              )}
            </div>
          </section>
        )}

        {/* Botón de regreso */}
        <div className="flex justify-start pt-4">
          <Link to="/" className="btn-ghost border border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
        </div>

      </div>

      {/* ── Trailer modal (si no está embebido directo) ── */}
      {trailerOpen && trailerEmbed && (
        <div
          className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ aspectRatio: '16/9' }}
          >
            <iframe
              src={`${trailerEmbed}?autoplay=1`}
              title="Tráiler"
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* ── Modales ── */}
      {showAdd && (
        <AddToListModal entry={entry} onClose={() => setShowAdd(false)} />
      )}
      {showReview && (
        <ReviewModal
          entry={entry}
          onClose={() => setShowReview(false)}
          userId={user?.uid}
        />
      )}
    </div>
  )
}
