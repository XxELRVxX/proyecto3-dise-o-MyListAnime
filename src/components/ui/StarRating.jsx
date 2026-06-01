import { useState } from 'react'

export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0)

  const sizes = {
    sm: 'text-[16px]',
    md: 'text-[22px]',
    lg: 'text-[28px]',
  }

  // 10 stars
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => {
        const starValue = i + 1
        const filled = (hover || value) >= starValue
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHover(starValue)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`star-btn material-symbols-outlined ${sizes[size]} transition-all duration-100
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              ${filled
                ? 'text-primary drop-shadow-[0_0_4px_rgba(221,183,255,0.7)]'
                : 'text-outline opacity-40'
              }`}
            style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
            aria-label={`${starValue} estrellas`}
          >
            star
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-2 text-primary font-bold text-sm">{value}/10</span>
      )}
    </div>
  )
}
