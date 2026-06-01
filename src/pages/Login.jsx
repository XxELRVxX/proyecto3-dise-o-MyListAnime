import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loginWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/') }, [user])

  const handleGoogleLogin = async () => {
    try { await loginWithGoogle(); navigate('/') }
    catch (err) { console.error(err) }
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-[80px] bg-primary" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full opacity-15 blur-[60px] bg-secondary" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-xl font-black text-on-primary neon-glow-purple">
              MLA
            </div>
            <h1 className="text-2xl font-black text-primary tracking-tight italic">MyListAnime</h1>
          </Link>
          <p className="text-on-surface-variant text-sm mt-2">Tu colección. Tu universo.</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl border border-primary/15 p-8">
          <h2 className="text-headline-sm font-bold text-on-surface text-center mb-2">Bienvenido</h2>
          <p className="text-body-sm text-on-surface-variant text-center mb-8 leading-relaxed">
            Inicia sesión para guardar tu lista, calificar y reseñar anime y manga
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg border border-outline-variant/40 bg-surface-container-high/50 hover:bg-surface-container-highest/70 hover:border-primary/30 text-on-surface font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs text-outline tracking-wider">próximamente</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <div className="space-y-3 opacity-40 pointer-events-none">
            <input type="email" placeholder="correo@ejemplo.com" className="input-field border border-outline-variant rounded" disabled />
            <input type="password" placeholder="Contraseña" className="input-field border border-outline-variant rounded" disabled />
            <button className="btn-primary w-full opacity-50" disabled>Iniciar sesión</button>
          </div>
          <p className="text-center text-xs text-outline mt-4">Login con email próximamente</p>
        </div>

        <p className="text-center text-xs text-outline mt-6 leading-relaxed">
          Al continuar, tus datos se guardan de forma segura en Firebase
        </p>
      </div>
    </div>
  )
}