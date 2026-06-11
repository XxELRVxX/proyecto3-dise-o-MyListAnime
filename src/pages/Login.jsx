// Login page — redesigned with two-panel layout.
// Left panel: full-height fan art with floating particles and animated title.
// Right panel: login form with glass card and neon accents.
// On successful login, plays a full-screen transition before navigating home.

import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Floating particle — single animated dot/symbol ────────────────────────────
function Particle({ style, symbol }) {
  return (
    <span
      aria-hidden="true"
      className="absolute pointer-events-none select-none animate-float-particle"
      style={style}
    >
      {symbol}
    </span>
  )
}

// Seed the particles once so they don't regenerate on every render
const PARTICLE_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  symbol: ['✦', '✧', '⋆', '✦', '🌸', '⭐', '✨', '⋆', '✦', '✧',
           '⋆', '🌸', '✦', '⭐', '✧', '⋆', '✨', '✦'][i],
  style: {
    left:             `${(i * 37 + 11) % 100}%`,
    top:              `${(i * 53 + 7)  % 100}%`,
    fontSize:         `${10 + (i % 5) * 5}px`,
    opacity:          0.15 + (i % 4) * 0.1,
    animationDelay:   `${(i * 0.4) % 3}s`,
    animationDuration:`${3 + (i % 3)}s`,
    color:            i % 3 === 0 ? '#ddb7ff' : i % 3 === 1 ? '#5de6ff' : '#ffb2b7',
  }
}))

// ── Login transition overlay (plays after successful auth) ────────────────────
function LoginTransition({ onDone }) {
  useEffect(() => {
    // Total animation: 2.2s, then call onDone to navigate
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden login-transition-bg">
      {/* Radial burst */}
      <div className="absolute inset-0 animate-burst-radial" aria-hidden="true" />

      {/* Shockwave ring */}
      <div className="absolute w-32 h-32 rounded-full border-4 border-primary/60 animate-shockwave" aria-hidden="true" />
      <div className="absolute w-32 h-32 rounded-full border-2 border-secondary/40 animate-shockwave" style={{ animationDelay: '0.2s' }} aria-hidden="true" />

      {/* Central content */}
      <div className="relative z-10 text-center animate-login-pop">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary-container to-secondary
                        flex items-center justify-center mb-6 neon-glow-purple">
          <span
            className="text-on-primary font-black"
            style={{ fontFamily: 'Bangers, cursive', fontSize: '2.5rem', letterSpacing: '0.1em' }}
          >
            MLA
          </span>
        </div>
        <p
          className="text-4xl font-black text-primary tracking-wider"
          style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.12em',
                   textShadow: '0 0 24px rgba(221,183,255,0.9), 0 0 48px rgba(221,183,255,0.5)' }}
        >
          ¡Bienvenido!
        </p>
        <p className="text-secondary text-sm mt-2 font-semibold tracking-widest uppercase">
          Entrando a tu universo…
        </p>
      </div>

      {/* Falling petals */}
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute text-xl animate-petal-fall pointer-events-none select-none"
          style={{
            left:              `${(i * 31 + 5) % 100}%`,
            top:               '-2rem',
            animationDelay:    `${i * 0.12}s`,
            animationDuration: `${1.4 + (i % 3) * 0.3}s`,
            opacity:           0.7 + (i % 3) * 0.1,
          }}
        >
          {['🌸', '✨', '⭐', '🌸', '✦', '🌸', '✨'][i % 7]}
        </span>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Login() {
  const { user, loginWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  const [transitioning, setTransitioning] = useState(false)
  const [glitching,     setGlitching]     = useState(false)

  // If already logged in, go home directly
  useEffect(() => { if (user && !transitioning) navigate('/') }, [user])

  // Trigger glitch effect on logo every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 600)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  async function handleGoogleLogin() {
    try {
      await loginWithGoogle()
      // Show transition animation before navigating
      setTransitioning(true)
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  function handleTransitionDone() {
    navigate('/')
  }

  // ── Fan art image — replace src with your chosen image ──────────────────────
  // Recommended: a landscape/portrait anime wallpaper (1080×1920 or similar).
  // Fallback: gradient if no image is provided.
  const FAN_ART_SRC = '/fanart/login-bg.png'

  return (
    <>
      {/* Full-screen login transition overlay */}
      {transitioning && <LoginTransition onDone={handleTransitionDone} />}

      <div className="min-h-screen flex overflow-hidden">

        {/* ══════════════════════════════════════════
            LEFT PANEL — fan art + particles (desktop only)
        ══════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[58%] relative overflow-hidden flex-col items-center justify-center">

          {/* Background image or gradient fallback */}
          {FAN_ART_SRC ? (
            <img
              src={FAN_ART_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            // Gradient fallback while no fan art is set
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 30% 40%, rgba(183,109,255,0.35) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 80% at 70% 70%, rgba(93,230,255,0.25) 0%, transparent 55%),
                  radial-gradient(ellipse 50% 50% at 50% 20%, rgba(255,178,183,0.2) 0%, transparent 50%),
                  #0b1326
                `
              }}
            />
          )}

          {/* Dark overlay so text is readable over the image */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(11,19,38,0.75) 0%, rgba(11,19,38,0.45) 100%)' }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {PARTICLE_DATA.map(p => (
              <Particle key={p.id} symbol={p.symbol} style={p.style} />
            ))}
          </div>

          {/* Grid overlay — subtle cyberpunk texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(221,183,255,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(221,183,255,1) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px'
            }}
          />

          {/* Left panel text content */}
          <div className="relative z-10 text-center px-12 max-w-md">
            {/* Big title */}
            <h1
              className="text-7xl xl:text-8xl font-black leading-none mb-4 text-primary"
              style={{
                fontFamily: 'Bangers, cursive',
                letterSpacing: '0.06em',
                textShadow: '0 0 32px rgba(221,183,255,0.8), 0 0 64px rgba(221,183,255,0.4), 4px 4px 0px rgba(0,0,0,0.5)',
              }}
            >
              My<br />
              <span style={{ color: '#5de6ff', textShadow: '0 0 32px rgba(93,230,255,0.8)' }}>
                List
              </span>
              <br />Anime
            </h1>

            {/* Animated tagline — cycles through phrases */}
            <AnimatedTagline />

            {/* Decorative separator */}
            <div className="flex items-center gap-3 my-6 justify-center">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
              <span className="text-primary/60 text-xl">✦</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-8">
              {[
                { value: '18K+', label: 'Animes' },
                { value: '∞',    label: 'Aventuras' },
                { value: '1',    label: 'Tu lista' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p
                    className="text-2xl font-black text-secondary"
                    style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.08em',
                             textShadow: '0 0 16px rgba(93,230,255,0.7)' }}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — login form
        ══════════════════════════════════════════ */}
        <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(160deg, #0b1326 0%, #0f1a30 60%, #12103a 100%)' }}>

          {/* Mobile background particles */}
          <div className="absolute inset-0 lg:hidden overflow-hidden" aria-hidden="true">
            {PARTICLE_DATA.slice(0, 10).map(p => (
              <Particle key={p.id} symbol={p.symbol} style={p.style} />
            ))}
          </div>

          {/* Ambient glow blobs */}
          <div aria-hidden="true" className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-[100px] bg-primary pointer-events-none" />
          <div aria-hidden="true" className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full opacity-10 blur-[80px] bg-secondary pointer-events-none" />

          <div className="w-full max-w-sm relative z-10 page-enter">

            {/* Logo with glitch effect */}
            <div className="text-center mb-10">
              <Link to="/" className="inline-flex flex-col items-center gap-3">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-container to-secondary
                                 flex items-center justify-center neon-glow-purple
                                 transition-all duration-75 ${glitching ? 'login-glitch' : ''}`}>
                  <span
                    className="font-black text-on-primary"
                    style={{ fontFamily: 'Bangers, cursive', fontSize: '2rem', letterSpacing: '0.1em' }}
                  >
                    MLA
                  </span>
                </div>

                <span
                  className={`text-3xl font-black tracking-tight text-primary ${glitching ? 'login-glitch-text' : ''}`}
                  style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.08em',
                           textShadow: '0 0 16px rgba(221,183,255,0.6)' }}
                >
                  MyListAnime
                </span>
              </Link>
              <p className="text-on-surface-variant text-sm mt-2 font-regular"
                 style={{ fontFamily: 'Inter, sans-serif' }}>
                Tu colección. Tu universo.
              </p>
            </div>

            {/* Form card */}
            <div className="glass-card rounded-2xl border border-primary/20 p-8 shadow-2xl">
              <h2
                className="text-2xl font-black text-on-surface text-center mb-1"
                style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em' }}
              >
                Bienvenido
              </h2>
              <p className="text-body-sm text-on-surface-variant text-center mb-8 leading-relaxed"
                 style={{ fontFamily: 'Inter, sans-serif' }}>
                Inicia sesión para guardar tu lista, calificar y reseñar anime y manga
              </p>

              {/* Google button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading || transitioning}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl
                           border border-outline-variant/40 bg-surface-container-high/50
                           hover:bg-surface-container-highest/70 hover:border-primary/40
                           text-on-surface font-semibold text-sm transition-all duration-300
                           active:scale-95 disabled:opacity-60 group"
              >
                {loading || transitioning ? (
                  <div className="w-5 h-5 border-2 border-on-surface/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>Continuar con Google</span>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors ml-auto">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-outline-variant/30" />
                <span className="text-xs text-outline tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                  próximamente
                </span>
                <div className="flex-1 h-px bg-outline-variant/30" />
              </div>

              {/* Email/password — disabled placeholder */}
              <div className="space-y-3 opacity-35 pointer-events-none select-none">
                <input type="email"    placeholder="correo@ejemplo.com" className="input-field" disabled />
                <input type="password" placeholder="Contraseña"          className="input-field" disabled />
                <button className="btn-primary w-full opacity-50" disabled>Iniciar sesión</button>
              </div>

              <p className="text-center text-xs text-outline mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Login con email próximamente
              </p>
            </div>

            <p className="text-center text-xs text-outline mt-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Al continuar, tus datos se guardan de forma segura en Firebase
            </p>
          </div>
        </div>
      </div>
    </>  
  )
}

// ── Animated tagline — cycles through anime-themed phrases ────────────────────
const TAGLINES = [
  'Tu colección. Tu universo.',
  'Más de 18,000 animes esperan.',
  'Organiza. Califica. Descubre.',
  'El tracking definitivo para otakus.',
  'Shonen, Shojo, Isekai… todo aquí.',
]

function AnimatedTagline() {
  const [index,   setIndex]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % TAGLINES.length)
        setVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <p
      className="text-on-surface-variant text-lg font-semibold transition-opacity duration-400"
      style={{
        fontFamily: 'Inter, sans-serif',
        opacity: visible ? 1 : 0,
        minHeight: '1.75rem',
      }}
    >
      {TAGLINES[index]}
    </p>
  )
}