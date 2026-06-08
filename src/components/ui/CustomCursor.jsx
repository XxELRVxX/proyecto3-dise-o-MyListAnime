// Cursor personalizado: imagen de Miku + estela de notas musicales
// Se renderiza sobre todo el contenido, pointer-events: none para no interferir
import { useEffect, useRef } from 'react'

const TRAIL_SYMBOLS = ['♪', '♫', '🎵', '🎶', '✨', '⭐']

export default function CustomCursor() {
  const cursorRef   = useRef(null)
  const trailsRef   = useRef([])
  const posRef      = useRef({ x: -100, y: -100 })
  const frameRef    = useRef(null)
  const lastTrail   = useRef(0)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Mover cursor con suavidad via requestAnimationFrame
    let targetX = -100, targetY = -100
    let currentX = -100, currentY = -100

    function onMouseMove(e) {
      targetX = e.clientX
      targetY = e.clientY
      posRef.current = { x: e.clientX, y: e.clientY }

      // Crear estela cada 80ms
      const now = Date.now()
      if (now - lastTrail.current > 80) {
        lastTrail.current = now
        createTrail(e.clientX, e.clientY)
      }
    }

    function animate() {
      // Lerp suave hacia la posición del mouse
      currentX += (targetX - currentX) * 0.18
      currentY += (targetY - currentY) * 0.18
      if (cursor) {
        cursor.style.left = currentX + 'px'
        cursor.style.top  = currentY + 'px'
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    function createTrail(x, y) {
      const el = document.createElement('div')
      el.className = 'cursor-trail'
      el.textContent = TRAIL_SYMBOLS[Math.floor(Math.random() * TRAIL_SYMBOLS.length)]
      el.style.left     = x + 'px'
      el.style.top      = y + 'px'
      el.style.fontSize = (12 + Math.random() * 10) + 'px'
      el.style.color    = Math.random() > 0.5
        ? 'rgba(93,230,255,0.9)'
        : 'rgba(221,183,255,0.9)'
      document.body.appendChild(el)

      // Limpiar después de la animación
      setTimeout(() => el.remove(), 820)
    }

    document.addEventListener('mousemove', onMouseMove)
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div
      id="custom-cursor"
      ref={cursorRef}
      style={{
        position:        'fixed',
        pointerEvents:   'none',
        zIndex:          99999,
        width:           '42px',
        height:          '42px',
        transform:       'translate(-50%, -50%)',
        backgroundImage: "url('/cursor/miku-cursor.png')",
        backgroundSize:  'contain',
        backgroundRepeat:'no-repeat',
        filter:          'drop-shadow(0 0 6px rgba(93,230,255,0.8))',
        // Fallback si no hay imagen: círculo cyan
      }}
    >
      {/* Fallback visual si no carga la imagen */}
      <style>{`
        #custom-cursor {
          background-image: url('/cursor/miku-cursor.png');
        }
        /* Si la imagen falla, mostrar círculo neon */
        #custom-cursor:not([style*="url"]) {
          background: radial-gradient(circle, rgba(93,230,255,0.9) 30%, transparent 70%);
          border-radius: 50%;
        }
      `}</style>
    </div>
  )
}
