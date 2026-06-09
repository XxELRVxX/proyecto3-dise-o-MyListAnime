// Home page — parallax fan art background + hero banner con imagen Jikan visible
// Secciones "En Tendencia" y "Temporada Actual" con 2 filas cada una.

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getTopAnime, normalizeEntry } from '../services/jikan'
import AddToListModal from '../components/modals/AddToListModal'
import { useAuth } from '../context/AuthContext'

// ── Fan art path — cambiá el nombre si tu archivo es diferente ────────────────
const HOME_BG = '/fanart/home-bg.png'

// ── Parallax background ───────────────────────────────────────────────────────
function ParallaxBackground() {
  const [offsetY, setOffsetY] = useState(0)
  const rafRef    = useRef(null)
  const targetRef = useRef(0)

  useEffect(() => {
    const onScroll = () => { targetRef.current = window.scrollY }
    const tick = () => {
      setOffsetY(prev => {
        const target = targetRef.current * 0.3
        return prev + (target - prev) * 0.07
      })
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
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}
    >
      <img
        src={HOME_BG}
        alt=""
        style={{
          position:       'absolute',
          inset:          '-10% 0',
          width:          '100%',
          height:         '120%',
          objectFit:      'cover',
          objectPosition: 'center top',
          filter:         'blur(2px)',
          transform:      `translateY(${offsetY}px)`,
          willChange:     'transform',
        }}
      />
      {/* Overlay oscuro — ajustá los valores si querés más claro/oscuro */}
      <div
        style={{
          position: 'absolute',
          inset:    0,
          background: `linear-gradient(to bottom,
            rgba(11,19,38,0.75) 0%,
            rgba(11,19,38,0.65) 30%,
            rgba(11,19,38,0.72) 60%,
            rgba(11,19,38,0.88) 100%
          )`,
        }}
      />
    </div>
  )
}

// ── SectionHeader — componente reutilizable para los títulos de sección ────────
// Mantiene el mismo formato en todas las secciones del home
function SectionHeader({ icon, title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-secondary text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <div>
          <h2 className="text-headline-sm font-semibold text-on-surface">{title}</h2>
          <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-xs font-semibold text-secondary hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

// ── PosterCard — card vertical para animes (usado en En Tendencia) ─────────────
function PosterCard({ entry, user, onAdd }) {
  return (
    <div
      className="glass-card card-hover rounded-xl overflow-hidden flex-shrink-0 relative group"
      style={{ width: 148 }}
    >
      <Link to={`/${entry.type}/${entry.id}`}>
        <div className="relative" style={{ aspectRatio: '3/4' }}>
          <img
            src={entry.image}
            alt={entry.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://placehold.co/148x197/0b1326/ddb7ff?text=?' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
          {entry.score && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-yellow-400/30">
              <span
                className="material-symbols-outlined text-[11px] text-yellow-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >star</span>
              <span className="text-yellow-400 text-xs font-bold">
                {Number(entry.score).toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-xs font-semibold text-on-surface line-clamp-2 leading-tight mb-1">
            {entry.title}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {entry.genres?.slice(0, 2).join(', ')}
          </p>
        </div>
      </Link>
      {user && (
        <button
          onClick={() => onAdd(entry)}
          className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-primary text-on-primary
                     flex items-center justify-center opacity-0 group-hover:opacity-100
                     transition-opacity shadow-lg"
          aria-label={`Agregar ${entry.title} a la lista`}
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
        </button>
      )}
    </div>
  )
}

// ── EpisodeCard — card horizontal para temporada (usado en Temporada Actual) ───
function EpisodeCard({ item }) {
  return (
    <Link
      to={`/${item.type}/${item.id}`}
      className="glass-card card-hover rounded-xl overflow-hidden flex flex-shrink-0"
      style={{ width: 280 }}
    >
      <img
        src={item.image}
        alt={item.title}
        className="object-cover flex-shrink-0"
        style={{ width: 85, aspectRatio: '2/3', objectFit: 'cover' }}
        onError={e => { e.target.src = 'https://placehold.co/85x128/0b1326/ddb7ff?text=?' }}
      />
      <div className="p-3 flex flex-col gap-1 min-w-0">
        <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
          {item.episodes ? `${item.episodes} eps` : 'Nuevo'}
        </span>
        <span className="font-bold text-sm text-on-surface line-clamp-1">{item.title}</span>
        <span className="text-[11px] text-on-surface-variant line-clamp-3 leading-snug">
          {item.synopsis?.slice(0, 100)}…
        </span>
        <div className="flex gap-1 mt-auto pt-1 flex-wrap">
          {item.genres?.slice(0, 2).map(g => (
            <span key={g} className="genre-chip text-[9px] px-2 py-0.5">{g}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────
function PosterSkeletonRow({ count }) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton flex-shrink-0 rounded-xl" style={{ width: 148, aspectRatio: '3/4' }} />
      ))}
    </div>
  )
}

function EpisodeSkeletonRow({ count }) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton flex-shrink-0 rounded-xl" style={{ width: 280, height: 100 }} />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth()
  const [hero,      setHero]      = useState(null)
  const [trending,  setTrending]  = useState([])
  const [seasonal,  setSeasonal]  = useState([])
  const [modal,     setModal]     = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [top, pop] = await Promise.all([
          getTopAnime(1, 'airing'),
          getTopAnime(1, 'bypopularity'),
        ])
        const norm  = (top.data  || []).map(e => normalizeEntry(e, 'anime'))
        const normB = (pop.data  || []).map(e => normalizeEntry(e, 'anime'))

        setHero(norm[0] || null)
        // 16 cards para En Tendencia (2 filas de 8 aprox)
        setTrending(norm.slice(1, 17))
        // 10 cards para Temporada Actual (2 filas de 5 aprox)
        setSeasonal(normB.slice(0, 10))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page-enter relative" style={{ minHeight: '100vh' }}>

      {/* Fan art con parallax — fondo de toda la página */}
      <ParallaxBackground />

      {/* Contenido principal — encima del fondo */}
      <div className="relative max-w-screen-xl mx-auto px-gutter py-6" style={{ zIndex: 1 }}>

        {/* ══════════════════════════════════════════
            HERO BANNER — imagen del anime destacado
        ══════════════════════════════════════════ */}
        {loading ? (
          <div className="skeleton rounded-2xl mb-10" style={{ height: 360 }} />
        ) : hero ? (
          <div
            className="relative rounded-2xl overflow-hidden mb-10"
            style={{ minHeight: 360 }}
          >
            {/* Imagen Jikan visible — sin blur, buena opacidad */}
            <div className="absolute inset-0">
              <img
                src={hero.image}
                alt=""
                aria-hidden
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
              {/* Gradiente: oscurece desde la izquierda y desde abajo para legibilidad */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(to right,  rgba(11,19,38,0.95) 0%, rgba(11,19,38,0.7) 40%, rgba(11,19,38,0.2) 100%),
                    linear-gradient(to top,    rgba(11,19,38,0.8)  0%, transparent 50%)
                  `
                }}
              />
            </div>

            {/* Contenido del hero */}
            <div className="relative z-10 p-8 sm:p-12 max-w-lg flex flex-col gap-4">
              <div className="flex gap-2 flex-wrap">
                <span className="genre-chip text-primary border-primary/40 bg-primary/10">
                  EN TENDENCIA #1
                </span>
                {hero.genres?.[0] && <span className="genre-chip">{hero.genres[0]}</span>}
                {hero.genres?.[1] && <span className="genre-chip">{hero.genres[1]}</span>}
              </div>

              <h1
                className="font-black text-on-surface leading-none"
                style={{
                  fontFamily:    'Bangers, cursive',
                  fontSize:      'clamp(2.2rem, 5vw, 3.8rem)',
                  letterSpacing: '0.04em',
                  textShadow:    '2px 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                {hero.title}
              </h1>

              {/* Score */}
              {hero.score && (
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-yellow-400 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >star</span>
                  <span className="text-yellow-400 font-black text-lg"
                        style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>
                    {Number(hero.score).toFixed(1)}
                  </span>
                  <span className="text-outline text-xs">/10</span>
                  {hero.episodes && (
                    <span className="text-on-surface-variant text-xs ml-2">
                      · {hero.episodes} episodios
                    </span>
                  )}
                </div>
              )}

              <p
                className="text-on-surface-variant leading-relaxed line-clamp-3"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}
              >
                {hero.synopsis?.slice(0, 200)}…
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link to={`/anime/${hero.id}`} className="btn-primary flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >play_arrow</span>
                  Ver detalles
                </Link>
                {user ? (
                  <button onClick={() => setModal(hero)} className="btn-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                    Agregar a lista
                  </button>
                ) : (
                  <Link to="/login" className="btn-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ══════════════════════════════════════════
            EN TENDENCIA — 2 filas de poster cards
        ══════════════════════════════════════════ */}
        <section className="mb-10">
          <SectionHeader
            icon="local_fire_department"
            title="En Tendencia"
            subtitle="Lo que la comunidad está viendo esta semana"
            linkTo="/catalog"
            linkLabel="Ver todo"
          />
          {loading ? (
            <>
              <PosterSkeletonRow count={8} />
              <div className="mt-4" />
              <PosterSkeletonRow count={8} />
            </>
          ) : (
            <>
              {/* Fila 1 — primeros 8 */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {trending.slice(0, 8).map(e => (
                  <PosterCard key={e.id} entry={e} user={user} onAdd={setModal} />
                ))}
              </div>
              {/* Fila 2 — siguientes 8 */}
              {trending.length > 8 && (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mt-4">
                  {trending.slice(8, 16).map(e => (
                    <PosterCard key={e.id} entry={e} user={user} onAdd={setModal} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* ══════════════════════════════════════════
            TEMPORADA ACTUAL — 2 filas de episode cards
        ══════════════════════════════════════════ */}
        <section className="mb-10">
          <SectionHeader
            icon="ac_unit"
            title="Temporada Actual"
            subtitle="Anime en emisión ahora mismo"
            linkTo="/rankings?type=anime"
            linkLabel="Ver rankings"
          />
          {loading ? (
            <>
              <EpisodeSkeletonRow count={4} />
              <div className="mt-4" />
              <EpisodeSkeletonRow count={4} />
            </>
          ) : (
            <>
              {/* Fila 1 — primeros 5 */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {seasonal.slice(0, 5).map(e => <EpisodeCard key={e.id} item={e} />)}
              </div>
              {/* Fila 2 — siguientes 5 */}
              {seasonal.length > 5 && (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mt-4">
                  {seasonal.slice(5, 10).map(e => <EpisodeCard key={e.id} item={e} />)}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

        {/* ══════════════════════════════════════════
            CTA — solo visible para usuarios no logueados
        ══════════════════════════════════════════ */}
        {!user && (
          <div className="glass-card rounded-2xl border border-primary/20 p-8
                          flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">
                Únete a <span className="text-primary">MyListAnime</span>
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Guardá tu lista, calificá y seguí tu progreso
              </p>
            </div>
            <Link to="/login" className="btn-primary whitespace-nowrap">
              Empezar gratis
            </Link>
          </div>
        )}

      </div>

      {modal && <AddToListModal entry={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
