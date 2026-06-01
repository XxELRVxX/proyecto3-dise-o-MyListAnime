import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserStats, getUserReviews } from '../services/firestore'

function StatsSection({ title, icon, color, stats, labels }) {
  if (!stats) return null
  const entries = Object.entries(labels).filter(([k]) => stats[k] !== undefined)
  return (
    <div className="glass-card rounded-xl border border-outline-variant/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h3 className="text-headline-sm font-semibold text-on-surface">{title}</h3>
        <span className="text-on-surface-variant text-sm">({stats.total ?? 0} total)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {entries.map(([key, label]) => (
          <div key={key} className="flex flex-col items-center p-3 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 text-center">
            <span className={`text-2xl font-black ${color}`}>{stats[key] || 0}</span>
            <span className="text-label-md text-on-surface-variant mt-1 leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const load = async () => {
      try {
        const [s, r] = await Promise.all([getUserStats(user.uid), getUserReviews(user.uid)])
        setStats(s); setReviews(r)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [user])

  if (!user) return null

  return (
    <div className="page-enter max-w-screen-xl mx-auto px-gutter py-6">
      {/* Profile Hero */}
      <div className="glass-card rounded-2xl border border-primary/20 p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={user.photoURL || 'https://placehold.co/80x80/0b1326/ddb7ff?text=U'}
              alt={user.displayName}
              className="w-20 h-20 rounded-2xl border-2 border-primary/50 object-cover shadow-[0_0_20px_rgba(221,183,255,0.3)]"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-surface flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-headline-md font-bold text-on-surface">{user.displayName}</h1>
            <p className="text-body-sm text-on-surface-variant mb-3">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="genre-chip text-secondary border-secondary/30 bg-secondary/10 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Google Account
              </span>
              {stats && <span className="genre-chip">{stats.totalEntries} entradas</span>}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 px-4 py-2 rounded border border-tertiary/30 text-tertiary text-sm font-semibold hover:bg-tertiary/10 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
            Salir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <StatsSection title="Anime" icon="movie" color="text-primary" stats={stats?.anime} labels={{
              watching: 'Viendo', completed: 'Completado', planned: 'Planeado',
              on_hold: 'En pausa', dropped: 'Abandonado'
            }} />
            <StatsSection title="Manga" icon="auto_stories" color="text-secondary" stats={stats?.manga} labels={{
              reading: 'Leyendo', completed: 'Completado', planned: 'Planeado',
              on_hold: 'En pausa', dropped: 'Abandonado'
            }} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-xl border border-outline-variant/20 p-4">
              <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Acceso rápido</h3>
              <div className="flex flex-col gap-1">
                {[
                  { to: '/my-list',             icon: 'movie',        label: 'Mi lista anime' },
                  { to: '/my-list?media=manga',  icon: 'auto_stories', label: 'Mi lista manga' },
                  { to: '/catalog',              icon: 'grid_view',    label: 'Explorar catálogo' },
                  { to: '/rankings',             icon: 'monitoring',   label: 'Ver rankings' },
                ].map(({ to, icon, label }) => (
                  <Link key={to + label} to={to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-colors">
                    <span className="material-symbols-outlined text-[17px] text-primary">{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="glass-card rounded-xl border border-outline-variant/20 p-4">
                <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Mis reseñas</h3>
                <div className="flex flex-col gap-3">
                  {reviews.slice(0, 3).map(r => (
                    <Link key={r.id} to={`/${r.entryType}/${r.entryId}`}
                      className="flex flex-col gap-1 p-3 rounded glass-card border border-outline-variant/20 hover:border-primary/30 transition-colors">
                      <p className="text-sm font-semibold text-on-surface line-clamp-1">{r.entryTitle}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.min(r.score, 10) }, (_, i) => (
                          <span key={i} className="material-symbols-outlined text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                        <span className="text-xs text-primary font-bold ml-1">{r.score}/10</span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-snug">{r.reviewText}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}