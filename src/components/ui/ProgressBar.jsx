// Barra de progreso para el seguimiento del progreso de visualizacion/lectura
// Se usa en las entradas de la lista para mostrar los episodios vistos o los capitulos leidos
// Admite los modos con etiquetas y compacto, y se anima al montarse

/**
 * Props:
 *  - current   (number)  — current progress value, e.g. 12
 *  - total     (number)  — total value, e.g. 24. If 0 or null, shows indeterminate bar.
 *  - label     (bool)    — show "12 / 24 ep" text below the bar (default: true)
 *  - unit      (string)  — unit label: 'ep' | 'ch' | '' (default: 'ep')
 *  - size      (string)  — 'xs' | 'sm' | 'md' (bar height, default: 'sm')
 *  - className (string)  — extra classes for the wrapper
 */

const HEIGHT = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
}

export default function ProgressBar({
  current = 0,
  total = 0,
  label = true,
  unit = 'ep',
  size = 'sm',
  className = '',
}) {
  // Calcula el porcentaje se ajusta entre 0 y 100
  const hasTotal = total && total > 0
  const pct = hasTotal ? Math.min(100, Math.round((current / total) * 100)) : null

  const barHeight = HEIGHT[size] ?? HEIGHT.sm

  // Color shifts based on completion percentage
  const fillColor =
    !hasTotal        ? 'bg-outline/50'           // indeterminado / total desconocido
    : pct >= 100     ? 'bg-secondary'             // completado — cyan
    : pct >= 50      ? 'bg-primary'               // a la mitad+ — purple
    :                  'bg-primary/60'            // temprano — purple desvanecido

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Track */}
      <div
        className={`w-full ${barHeight} rounded-full bg-surface-container-high overflow-hidden`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total || undefined}
        aria-label={`Progreso: ${current}${hasTotal ? ` de ${total}` : ''}`}
      >
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ${fillColor}`}
          style={{ width: hasTotal ? `${pct}%` : '40%' }}
        />
      </div>

      {/* Texto opcional */}
      {label && (
        <span className="text-[10px] text-on-surface-variant font-medium tabular-nums">
          {hasTotal
            ? `${current} / ${total} ${unit}`
            : `${current} ${unit}`}
        </span>
      )}
    </div>
  )
}
