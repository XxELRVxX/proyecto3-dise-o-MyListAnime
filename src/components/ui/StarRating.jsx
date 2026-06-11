import { useState } from 'react'

// Shuriken SVG inline — reemplaza la estrella de Material Symbols
function Shuriken({ size = 20, filled = false, glowing = false }) {
  const color   = filled ? '#ddb7ff' : '#4d4354'
  const glow    = glowing && filled
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      style={{
        filter: glow ? 'drop-shadow(0 0 5px rgba(221,183,255,0.85))' : 'none',
        transition: 'filter 0.15s, transform 0.15s',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* Shuriken de 4 puntas */}
      <path
        d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
      {/* Cruz interior */}
      {filled && (
        <path
          d="M12 6 L12 18 M6 12 L18 12"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1"
        />
      )}
    </svg>
  )
}

export default function StarRating({
  value    = 0,
  onChange,
  readonly = false,
  size     = 'md',      // 'sm' | 'md' | 'lg'
  variant  = 'shuriken' // 'shuriken' | 'star'
}) {
  const [hover, setHover] = useState(0)

  const iconSize = { sm: 15, md: 20, lg: 26 }[size] ?? 20
  const gap      = { sm: 1,  md: 2,  lg: 3  }[size] ?? 2

  const active = hover || value

  return (
    <div
      className="flex items-center"
      style={{ gap }}
      onMouseLeave={() => !readonly && setHover(0)}
    >
      {Array.from({ length: 10 }, (_, i) => {
        const v      = i + 1
        const filled = active >= v
        const glow   = hover ? hover >= v : value >= v

        if (variant === 'star') {
          // Modo estrella clásica (Material Symbols)
          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange?.(v)}
              onMouseEnter={() => !readonly && setHover(v)}
              className={[
                'material-symbols-outlined transition-all duration-100',
                readonly ? 'cursor-default' : 'cursor-pointer',
                filled
                  ? 'text-primary drop-shadow-[0_0_4px_rgba(221,183,255,0.7)]'
                  : 'text-outline opacity-40',
              ].join(' ')}
              style={{
                fontSize: iconSize,
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
              }}
              aria-label={`${v} estrellas`}
            >
              star
            </button>
          )
        }

        // Modo shuriken (por defecto)
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(v)}
            onMouseEnter={() => !readonly && setHover(v)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: readonly ? 'default' : 'none',
              transform: filled && !readonly ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.12s ease',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={`${v} puntos`}
          >
            <Shuriken size={iconSize} filled={filled} glowing={glow} />
          </button>
        )
      })}

      {value > 0 && (
        <span
          className="text-primary font-bold ml-1"
          style={{ fontSize: iconSize * 0.7, fontFamily: 'Orbitron, sans-serif' }}
        >
          {value.toFixed(1)}/10
        </span>
      )}
    </div>
  )
}
