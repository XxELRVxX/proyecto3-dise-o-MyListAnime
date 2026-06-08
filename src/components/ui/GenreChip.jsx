// Componente etiqueta de genero, forma de pildora
// Muestra una sola etiqueta de genero con interaccion
// Ya tiene estilo aplicado mediante la clase genre-chip en index.css (color cristal + color primario)

/**
 * Props:
 *  - label     (string)   — text to display, e.g. "Action"
 *  - onClick   (func)     — optional click handler, e.g. for genre filtering
 *  - active    (bool)     — highlights the chip as selected (default: false)
 *  - size      (string)   — 'sm' | 'md' (default: 'md')
 *  - className (string)   — extra Tailwind classes
 */

const SIZE = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
}

export default function GenreChip({
  label,
  onClick,
  active = false,
  size = 'md',
  className = '',
}) {
  const isClickable = typeof onClick === 'function'

  // En estado activo utiliza colores secundarios cian en lugar del color primario predeterminado morado
  const activeClass = active
    ? 'bg-secondary/20 text-secondary border-secondary/40'
    : ''

  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => e.key === 'Enter' && onClick()
          : undefined
      }
      className={`
        genre-chip
        ${SIZE[size] ?? SIZE.md}
        ${activeClass}
        ${isClickable ? 'cursor-pointer hover:bg-primary/20 transition-colors' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {label}
    </span>
  )
}
