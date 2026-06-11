import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AddToListModal from '../modals/AddToListModal'

export default function AnimeCard({ entry, showRank = false, index = 0 }) {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [imgError,  setImgError]  = useState(false)
  const [hovered,   setHovered]   = useState(false)

  if (!entry) return null

  const { id, type = 'anime', title, image, score, genres = [], status, episodes, chapters, rank } = entry

  // placehold.co en lugar del deprecado via.placeholder.com
  const fallbackImage = `https://placehold.co/225x318/0b1326/ddb7ff?text=${encodeURIComponent(title?.slice(0, 10) || 'N/A')}`

  // Cascada CSS por index (igual que PosterCard en Catalog)
  const cascadeDelay = `${(index % 12) * 0.07}s`

  return (
    <>
      <div
        style={{
          animation: `card-cascade-in 0.5s cubic-bezier(0.22,1,0.36,1) ${cascadeDelay} both`,
          position: 'relative',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Glow de fondo — fuera del overflow:hidden para que no se corte */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: 14, zIndex: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          background: 'radial-gradient(ellipse at 50% 80%, rgba(221,183,255,0.3) 0%, rgba(180,100,255,0.12) 50%, transparent 70%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }} />

        <div
          className="glass-card rounded-lg overflow-hidden group relative flex flex-col"
          style={{
            position: 'relative', zIndex: 1,
            border: hovered ? '1px solid rgba(221,183,255,0.6)' : '1px solid rgba(77,67,84,0.3)',
            transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
            boxShadow: hovered
              ? '0 18px 48px rgba(0,0,0,0.65), 0 0 28px rgba(221,183,255,0.15)'
              : '0 4px 14px rgba(0,0,0,0.4)',
            transition: 'border-color .3s ease, transform .35s cubic-bezier(0.34,1.56,0.64,1), box-shadow .3s ease',
          }}
        >
          {/* Rank badge */}
          {showRank && rank && (
            <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-surface-container/90 border border-primary/30 flex items-center justify-center">
              <span className="text-primary font-black text-xs">#{rank}</span>
            </div>
          )}

          {/* Quick add button */}
          {user && (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 10,
                width: 30, height: 30, borderRadius: 7,
                background: 'linear-gradient(135deg, #ddb7ff, #b76dff)',
                color: '#490080', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'scale(1)' : 'scale(0.7)',
                transition: 'opacity .25s ease, transform .25s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 0 14px rgba(221,183,255,0.6)',
              }}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          )}

          {/* Cover image */}
          <Link to={`/${type}/${id}`} className="block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <img
              src={imgError ? fallbackImage : (image || fallbackImage)}
              alt={title}
              className="w-full h-full object-cover"
              style={{
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                filter: hovered ? 'brightness(0.88)' : 'brightness(1)',
                transition: 'transform .4s ease, filter .3s ease',
              }}
              onError={() => setImgError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-70" />

            {/* Score badge */}
            {score && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-surface-container/80 backdrop-blur px-2 py-0.5 rounded border border-secondary/20">
                <span className="material-symbols-outlined text-[12px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-secondary text-xs font-bold">{Number(score).toFixed(1)}</span>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute bottom-2 right-2 bg-surface-container/80 backdrop-blur px-2 py-0.5 rounded border border-outline-variant/30">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                {type === 'anime' ? (episodes ? `${episodes} ep` : 'Anime') : (chapters ? `${chapters} ch` : 'Manga')}
              </span>
            </div>
          </Link>

          {/* Info */}
          <div className="p-3 flex flex-col gap-1.5 flex-1">
            <Link to={`/${type}/${id}`}>
              <h3 className="text-sm font-semibold text-on-surface leading-tight line-clamp-2 hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {genres.slice(0, 2).map(g => (
                  <span key={g} className="genre-chip text-[10px] px-2 py-0.5">{g}</span>
                ))}
              </div>
            )}

            {status && (
              <span className={`text-[10px] font-bold uppercase tracking-wide
                ${status === 'Currently Airing' || status === 'Publishing' ? 'text-secondary' :
                  status === 'Finished Airing' || status === 'Finished' ? 'text-on-surface-variant' :
                  'text-tertiary'}`}>
                {status === 'Currently Airing' ? '● En emisión' :
                 status === 'Publishing' ? '● Publicando' :
                 status === 'Finished Airing' || status === 'Finished' ? 'Finalizado' :
                 status}
              </span>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <AddToListModal entry={entry} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
