// Barra de navegacion superior: fija, fondo transparente, siempre visible
// Contiene: logotipo, enlaces de navegacion de escritorio, barra de busqueda, selector de tema y avatar de usuario
// En dispositivos moviles: solo logotipo, icono de búsqueda y avatar (la navegacion completa se encuentra en BottomNav).

import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

// enlaces de navegacion de escritorio: se mantienen sincronizados con las rutas de App.jsx
const NAV_LINKS = [
  { to: '/',         label: 'Home'    },
  { to: '/catalog',  label: 'Catalog'  },
  { to: '/rankings', label: 'Rankings'  },
  { to: '/my-list',  label: 'My List'  },
]

export default function Header() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // estado de busqueda: entrada controlada
  const [query, setQuery]           = useState('')
  const [searchOpen, setSearchOpen] = useState(false) // mobile search overlay
  const inputRef = useRef(null)

  // enfocar la entrada cuando se abre la superposicion de busqueda movil
  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus()
  }, [searchOpen])

  // Enviar busqueda: navegar al catalogo con el parametro de consulta
  function handleSearch(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/catalog?q=${encodeURIComponent(trimmed)}`)
    setQuery('')
    setSearchOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-4">

        {/* - Logo - */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 select-none"
          aria-label="MyListAnime — inicio"
        >
          <span className="material-symbols-outlined text-primary text-[28px]">
            animated_images
          </span>
          <span className="font-bold text-headline-sm text-on-surface hidden sm:block">
            MyList<span className="text-primary">Anime</span>
          </span>
        </Link>

        {/* - enlaces de navegacion de escritorio - */}
        <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Navegación principal">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-body-sm font-medium transition-colors ${
                  isActive
                    ? 'text-secondary bg-secondary/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* - Espaciador - */}
        <div className="flex-1" />

        {/* - Barra de busqueda escritorio - */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center relative"
          role="search"
        >
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, manga..."
            aria-label="Search"
            className="input-field pl-9 pr-4 py-2 text-body-sm w-56 lg:w-72 rounded-full"
          />
        </form>

        {/* - busqueda movil - */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        {/* - selector de tema - */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 shrink-0"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* - avatar de usuario / enlace de inicio de sesion - */}
        <Link
          to="/profile"
          className="shrink-0 w-9 h-9 rounded-full border-2 border-primary/30 bg-surface-container-high
                     flex items-center justify-center overflow-hidden
                     hover:border-primary/60 transition-colors"
          aria-label="Go to profile"
        >
          <span className="material-symbols-outlined text-outline text-[20px]">person</span>
        </Link>
      </div>

      {/* - overlay de busqueda movil - */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex flex-col items-center pt-24 px-4"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            className="w-full max-w-lg glass-card rounded-xl p-4 flex items-center gap-3"
            role="search"
          >
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime, manga..."
              className="flex-1 bg-transparent outline-none text-body-md text-on-surface placeholder:text-outline"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="btn-ghost p-1"
              aria-label="Close search"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </form>
        </div>
      )}
    </header>
  )
}