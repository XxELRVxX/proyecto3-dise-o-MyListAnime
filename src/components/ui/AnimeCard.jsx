import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AddToListModal from '../modals/AddToListModal'

export default function AnimeCard({ entry, showRank = false }) {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  if (!entry) return null

  const { id, type = 'anime', title, image, score, genres = [], status, episodes, chapters, rank } = entry

  const fallbackImage = `https://via.placeholder.com/225x318/0b1326/ddb7ff?text=${encodeURIComponent(title?.slice(0, 10) || 'N/A')}`

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden card-hover group relative flex flex-col">
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
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-surface-container/80 backdrop-blur border border-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary hover:text-on-primary"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        )}

        {/* Cover image */}
        <Link to={`/${type}/${id}`} className="block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <img
            src={imgError ? fallbackImage : (image || fallbackImage)}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-70" />

          {/* Score badge */}
          {score && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-surface-container/80 backdrop-blur px-2 py-0.5 rounded border border-secondary/20">
              <span className="material-symbols-outlined text-[12px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-secondary text-xs font-bold">{score}</span>
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

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {genres.slice(0, 2).map(g => (
                <span key={g} className="genre-chip text-[10px] px-2 py-0.5">{g}</span>
              ))}
            </div>
          )}

          {/* Status */}
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

      {modalOpen && (
        <AddToListModal
          entry={entry}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
