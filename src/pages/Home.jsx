// Home page — parallax fan art background + hero banner con imagen Jikan visible
// Secciones "En Tendencia" y "Temporada Actual" con 2 filas cada una.

import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getTopAnime, getAnimeById, normalizeEntry } from '../services/jikan'
import AddToListModal from '../components/modals/AddToListModal'
import { useAuth } from '../context/AuthContext'
import { useHomeData } from '../context/HomeDataContext'

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
    <div className="section-header flex items-center justify-between mb-5">
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

// ── Amaterasu — llamas negras reales que suben por los bordes ────────────────
function AmaterasuCanvas({ active }) {
  const canvasRef = React.useRef(null)
  const animRef   = React.useRef(null)
  const tRef      = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width  = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    // Cada llama nace en un borde (izq=0, der=1, abajo=2)
    // y sube/se mueve hacia afuera con forma elongada
    const spawnFlame = (side) => {
      const pos = Math.random()
      const speed = 1.4 + Math.random() * 2.2
      return {
        side,
        // posición inicial pegada al borde
        x: side === 0 ? 0 : side === 1 ? W : W * pos,
        y: side === 0 ? H * pos : side === 1 ? H * pos : H,
        // velocidad: llamas izq/der suben y se alejan del borde; abajo suben recto
        vx: side === 0 ?  (0.3 + Math.random() * 0.5) :
            side === 1 ? -(0.3 + Math.random() * 0.5) :
            (Math.random() - 0.5) * 1.2,
        vy: -(speed),
        // tamaño base y elongación (llamas son más altas que anchas)
        w: 3 + Math.random() * 5,
        h: 12 + Math.random() * 22,
        // fase de parpadeo individual
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        // ángulo inicial (llamas ligeramente inclinadas)
        angle: (Math.random() - 0.5) * 0.4,
      }
    }

    // Crear pool de llamas distribuidas en los 3 bordes
    const flames = [
      ...Array.from({ length: 14 }, () => spawnFlame(0)),  // borde izquierdo
      ...Array.from({ length: 14 }, () => spawnFlame(1)),  // borde derecho
      ...Array.from({ length: 10 }, () => spawnFlame(2)),  // borde inferior
    ].map(f => ({ ...f, life: Math.random() * f.maxLife })) // scatter inicial

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      tRef.current += 0.04

      flames.forEach(f => {
        f.life++
        if (f.life >= f.maxLife) Object.assign(f, { ...spawnFlame(f.side), life: 0 })

        const prog  = f.life / f.maxLife           // 0→1
        const flicker = 1 + Math.sin(tRef.current * 8 + f.phase) * 0.15

        // mover — aceleran levemente al subir (llamas reales)
        f.x += f.vx
        f.y += f.vy * (1 + prog * 0.4)
        // ondulación horizontal natural
        f.x += Math.sin(tRef.current * 5 + f.phase) * 0.4

        // opacidad: aparece rápido, desaparece lento en la punta
        const alpha = prog < 0.15
          ? prog / 0.15
          : 1 - ((prog - 0.15) / 0.85) ** 1.4

        // la llama se estrecha en la punta (prog → más delgada)
        const curW = f.w * (1 - prog * 0.7) * flicker
        const curH = f.h * (1 - prog * 0.3) * flicker

        // dibujar llama como elipse elongada rotada
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.angle + Math.sin(tRef.current * 4 + f.phase) * 0.12)

        // capa exterior: negro puro con glow púrpura sutil
        const outer = ctx.createRadialGradient(0, curH * 0.3, 0, 0, 0, Math.max(curW, curH))
        outer.addColorStop(0,   `rgba(0, 0, 0, ${alpha * 0.95})`)
        outer.addColorStop(0.5, `rgba(10, 0, 20, ${alpha * 0.7})`)
        outer.addColorStop(0.8, `rgba(40, 0, 60, ${alpha * 0.3})`)
        outer.addColorStop(1,   `rgba(0, 0, 0, 0)`)

        ctx.scale(curW / Math.max(curW, curH), curH / Math.max(curW, curH))
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(curW, curH), 0, Math.PI * 2)
        ctx.fillStyle = outer
        ctx.shadowColor = '#5500aa'
        ctx.shadowBlur  = 8
        ctx.fill()
        ctx.restore()
      })

      // borde de fuego negro — línea que pulsa
      ctx.save()
      const pulseAlpha = 0.55 + Math.sin(tRef.current * 2.5) * 0.25
      ctx.strokeStyle = `rgba(0, 0, 0, ${pulseAlpha})`
      ctx.lineWidth   = 3
      ctx.shadowColor = '#7700cc'
      ctx.shadowBlur  = 16
      ctx.beginPath()
      ctx.roundRect(1, 1, W - 2, H - 2, 12)
      ctx.stroke()
      // segunda pasada más fina y brillante
      ctx.strokeStyle = `rgba(80, 0, 160, ${pulseAlpha * 0.6})`
      ctx.lineWidth   = 1
      ctx.shadowBlur  = 24
      ctx.stroke()
      ctx.restore()

      animRef.current = requestAnimationFrame(draw)
    }

    if (active) {
      animRef.current = requestAnimationFrame(draw)
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      ctx.clearRect(0, 0, W, H)
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 10,
        borderRadius: 12,
        opacity: active ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
      aria-hidden="true"
    />
  )
}

// ── PosterCard — card vertical para animes (usado en En Tendencia) ─────────────
function PosterCard({ entry, user, onAdd }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      className="rounded-xl overflow-hidden flex-shrink-0 relative group"
      style={{
        width: 148,
        transform: hovered ? 'translateY(-7px) scale(1.04)' : 'translateY(0) scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        boxShadow: hovered
          ? '0 14px 44px rgba(80,0,180,0.65), 0 0 28px rgba(100,0,200,0.45)'
          : '0 4px 14px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AmaterasuCanvas active={hovered} />
      <Link to={`/${entry.type}/${entry.id}`}>
        <div className="relative" style={{ aspectRatio: '3/4' }}>
          <img
            src={entry.image}
            alt={entry.title}
            className="w-full h-full object-cover"
            style={{
              filter: hovered ? 'brightness(0.8) saturate(0.6) hue-rotate(20deg)' : 'none',
              transition: 'filter 0.3s ease',
            }}
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
        <div className="p-2.5" style={{
          background: hovered ? 'var(--c-hover-bg)' : '',
          transition: 'background 0.3s',
        }}>
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
          style={{ zIndex: 11 }}
          aria-label={`Agregar ${entry.title} a la lista`}
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
        </button>
      )}
    </div>
  )
}

// ── EpisodeCard — card horizontal con Amaterasu al hover ─────
function EpisodeCard({ item }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      style={{
        position: 'relative',
        transform: hovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        boxShadow: hovered ? '0 14px 40px rgba(80,0,180,0.55), 0 0 24px rgba(100,0,200,0.35)' : '0 4px 14px rgba(0,0,0,0.4)',
        borderRadius: 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AmaterasuCanvas active={hovered} />
      <Link
        to={`/${item.type}/${item.id}`}
        className="glass-card rounded-xl overflow-hidden flex"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <img
          src={item.image}
          alt={item.title}
          className="object-cover flex-shrink-0"
          style={{
            width: 85, aspectRatio: '2/3', objectFit: 'cover',
            filter: hovered ? 'brightness(0.8) saturate(0.6) hue-rotate(20deg)' : 'none',
            transition: 'filter 0.3s ease',
          }}
          onError={e => { e.target.src = 'https://placehold.co/85x128/0b1326/ddb7ff?text=?' }}
        />
        <div className="p-3 flex flex-col gap-1 min-w-0" style={{ background: hovered ? 'var(--c-hover-bg)' : '', transition: 'background 0.3s' }}>
          <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
            {item.episodes ? `${item.episodes} eps` : 'New'}
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
    </div>
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

// ── Genkidama Aura — sigue al cursor dentro del hero ─────────
function GenkidamaAura({ containerRef }) {
  const canvasRef = React.useRef(null)
  const animRef   = React.useRef(null)
  const tRef      = React.useRef(0)
  const cursorRef = React.useRef(null)   // posición actual interpolada
  const targetRef = React.useRef(null)   // posición objetivo (cursor)
  const activeRef = React.useRef(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef?.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const resize = () => {
      canvas.width  = container.offsetWidth  || 800
      canvas.height = container.offsetHeight || 360
      if (!cursorRef.current) {
        cursorRef.current = { x: canvas.width * 0.65, y: canvas.height * 0.5 }
        targetRef.current = { ...cursorRef.current }
      }
    }
    resize()

    const W = () => canvas.width
    const H = () => canvas.height

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      activeRef.current = true
    }
    const onLeave = () => { activeRef.current = false }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    const spawnParticle = () => {
      const w = W(), h = H()
      const edge = Math.floor(Math.random() * 4)
      let x, y
      if (edge === 0) { x = Math.random() * w; y = -20 }
      else if (edge === 1) { x = w + 20; y = Math.random() * h }
      else if (edge === 2) { x = Math.random() * w; y = h + 20 }
      else { x = -20; y = Math.random() * h }
      return {
        x, y, orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (0.008 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
        orbitR: 30 + Math.random() * 90,
        size: 2.5 + Math.random() * 4,
        hue: 180 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2,
        progress: Math.random() * 0.5,
        trail: [],
      }
    }

    const particles = Array.from({ length: 100 }, spawnParticle)

    const draw = () => {
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)
      tRef.current += 0.016

      // Suavizar posición
      if (targetRef.current && cursorRef.current) {
        cursorRef.current.x += (targetRef.current.x - cursorRef.current.x) * 0.06
        cursorRef.current.y += (targetRef.current.y - cursorRef.current.y) * 0.06
      }

      if (!activeRef.current) { animRef.current = requestAnimationFrame(draw); return }

      const CX = cursorRef.current?.x ?? w * 0.65
      const CY = cursorRef.current?.y ?? h * 0.5

      // Glow central
      const pulseR = 90 + Math.sin(tRef.current * 1.5) * 18
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, pulseR * 2.5)
      g.addColorStop(0,   `rgba(120,220,255,${0.22 + Math.sin(tRef.current) * 0.06})`)
      g.addColorStop(0.4, `rgba(80,180,255,0.14)`)
      g.addColorStop(0.8, `rgba(40,120,255,0.07)`)
      g.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(CX, CY, pulseR * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()

      // Anillos
      for (let r = 0; r < 3; r++) {
        const rr = pulseR * (0.5 + r * 0.3) + Math.sin(tRef.current * 2 + r) * 8
        ctx.beginPath(); ctx.arc(CX, CY, rr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(150,230,255,${0.15 - r * 0.04})`
        ctx.lineWidth = 1.5 - r * 0.4; ctx.stroke()
      }

      // Partículas
      particles.forEach((p, idx) => {
        p.progress = Math.min(1, p.progress + 0.003)
        p.orbitAngle += p.orbitSpeed
        const tx = CX + Math.cos(p.orbitAngle) * p.orbitR * (1 - p.progress * 0.7)
        const ty = CY + Math.sin(p.orbitAngle) * p.orbitR * (1 - p.progress * 0.7) * 0.5
        p.x += (tx - p.x) * 0.04
        p.y += (ty - p.y) * 0.04
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 8) p.trail.shift()
        if (p.trail.length > 1) {
          ctx.beginPath(); ctx.moveTo(p.trail[0].x, p.trail[0].y)
          p.trail.forEach(pt => ctx.lineTo(pt.x, pt.y))
          ctx.strokeStyle = `hsla(${p.hue},100%,80%,0.3)`
          ctx.lineWidth = p.size * 0.4; ctx.stroke()
        }
        const alpha = 0.7 + Math.sin(tRef.current * 3 + p.phase) * 0.3
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5)
        pg.addColorStop(0, `hsla(${p.hue},100%,98%,${alpha})`)
        pg.addColorStop(0.5, `hsla(${p.hue},100%,70%,${alpha * 0.5})`)
        pg.addColorStop(1, 'hsla(0,0%,0%,0)')
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = pg; ctx.fill()
        if (p.progress >= 1) { Object.assign(p, spawnParticle()); p.progress = 0; p.trail = [] }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas ref={canvasRef} aria-hidden="true" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 5,
    }} />
  )
}


// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth()
  const { setHomeAnime } = useHomeData()
  const [hero,        setHero]        = useState(null)
  const [trending,    setTrending]    = useState([])
  const [seasonal,    setSeasonal]    = useState([])
  const [modal,       setModal]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const heroRef = React.useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        // Cargar hero (Steel Ball Run hardcodeado) + trending en paralelo
        const [heroRes, top] = await Promise.allSettled([
          getAnimeById(59787),
          getTopAnime(1, 'bypopularity'),
        ])
        // Hero fijo: Steel Ball Run
        if (heroRes.status === 'fulfilled' && heroRes.value?.data) {
          setHero(normalizeEntry(heroRes.value.data, 'anime'))
        }
        // Trending: dedup
        if (top.status === 'fulfilled') {
          const norm = (top.value.data || []).map(e => normalizeEntry(e, 'anime'))
          const seen = new Set([59787]) // excluir Steel Ball Run del trending
          const uniq = norm.filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
          setTrending(uniq.slice(0, 16))
          setSeasonal(uniq.slice(16, 24))
          setHomeAnime(uniq)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page-enter relative" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>

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
            ref={heroRef}
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
                  background: 'var(--c-hero-grad)'
                }}
              />
              <GenkidamaAura containerRef={heroRef} />
            </div>

            {/* Contenido del hero */}
            <div className="relative z-10 p-8 sm:p-12 max-w-lg flex flex-col gap-4">
              <div className="flex gap-2 flex-wrap">
                <span className="genre-chip text-primary border-primary/40 bg-primary/10">
                  TRENDING #1
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
                  View details
                </Link>
                {user ? (
                  <button onClick={() => setModal(hero)} className="btn-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                     Add to list
                  </button>
                ) : (
                  <Link to="/login" className="btn-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ══════════════════════════════════════════
            EN TENDENCIA — 2 filas de poster cards
        ══════════════════════════════════════════ */}
        <section className="home-section mb-10">
          <SectionHeader
            icon="local_fire_department"
            title="Trending"
            subtitle="What the community is watching this week"
            linkTo="/catalog"
            linkLabel="View all"
          />
          {loading ? (
            <>
              <PosterSkeletonRow count={8} />
              <div className="mt-4" />
              <PosterSkeletonRow count={8} />
            </>
          ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 14 }}>
              {trending.slice(0, 8).map(e => (
                <PosterCard key={e.id} entry={e} user={user} onAdd={setModal} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 14, marginTop: 14 }}>
              {trending.slice(8, 16).map(e => (
                <PosterCard key={e.id} entry={e} user={user} onAdd={setModal} />
              ))}
            </div>
        </>  )}
        </section>

        {/* ── Divider ── */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* ══════════════════════════════════════════
            TEMPORADA ACTUAL — 2 filas de episode cards
        ══════════════════════════════════════════ */}
        <section className="home-section mb-10">
          <SectionHeader
            icon="ac_unit"
            title="Current Season"
            subtitle="Anime currently airing"
            linkTo="/rankings?type=anime"
            linkLabel="View rankings"
          />
          {loading ? (
            <>
              <EpisodeSkeletonRow count={4} />
              <div className="mt-4" />
              <EpisodeSkeletonRow count={4} />
            </>
          ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {seasonal.slice(0, 4).map(e => <EpisodeCard key={e.id} item={e} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
              {seasonal.slice(4, 8).map(e => <EpisodeCard key={e.id} item={e} />)}
            </div>
        </>  )}
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
                Join <span className="text-primary">MyListAnime</span>
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Save your list, rate and follow your progress
              </p>
            </div>
            <Link to="/login" className="btn-primary whitespace-nowrap">
              Start for free
            </Link>
          </div>
        )}

      </div>

      {modal && <AddToListModal entry={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
