// barra lateral plegable para diseños de escritorio (catalogo, paginas de detalles, etc
// este componente NO se incluye automaticamente en App.jsx (paginas que lo necesitan)
// importarlo directamente y controlar su visibilidad mediante la propiedad isOpen

import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'

// secciones de la barra lateral: extender segun sea necesario al crear otras paginas.
const SECTIONS = [
  {
    title: 'Explorar',
    items: [
      { to: '/',         icon: 'home',          label: 'Inicio'    },
      { to: '/catalog',  icon: 'menu_book',      label: 'Catálogo'  },
      { to: '/rankings', icon: 'emoji_events',   label: 'Rankings'  },
    ],
  },
  {
    title: 'Mi cuenta',
    items: [
      { to: '/my-list',  icon: 'format_list_bulleted', label: 'Mi Lista' },
      { to: '/profile',  icon: 'person',               label: 'Perfil'   },
    ],
  },
]

/**
 * Props:
 *  - isOpen    (bool)   -  controla la visibilidad el componente padre gestiona este estado
 *  - onClose   (func)   - se llama cuando el usuario hace clic en el fondo o en el boton de cerrar.
 *  - className (string) - clases adicionales para el panel de la barra lateral
 */
export default function Sidebar({ isOpen = false, onClose, className = '' }) {
  // cerrar con la tecla de escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // evita el desplazamiento del fondo cuando la barra lateral movil esta abierta
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* ── fondo (solo para movil) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 modal-backdrop md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-16 left-0 z-40 h-[calc(100dvh-4rem)] w-64
          glass-nav border-r border-outline-variant/30
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-auto
          ${className}
        `}
        aria-label="Barra lateral"
      >
        {/* boton cerrar - solo para movil */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-outline-variant/20">
          <span className="text-label-md text-outline uppercase tracking-widest">Menú</span>
          <button
            onClick={onClose}
            className="btn-ghost p-1"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── Secciones de navegación ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-label-md text-outline uppercase tracking-widest px-2 mb-2">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map(({ to, icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium
                         transition-colors
                         ${isActive
                           ? 'bg-secondary/10 text-secondary'
                           : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
                         }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            {icon}
                          </span>
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── boton info ── */}
        <div className="p-3 mt-auto">
          <GlassCard padding="sm" className="text-center">
            <p className="text-[11px] text-outline leading-relaxed">
              MyListAnime · v0.1<br />
              <span className="text-primary/60">Proyecto universitario</span>
            </p>
          </GlassCard>
        </div>
      </aside>
    </>
  )
}