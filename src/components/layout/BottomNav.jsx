// Barra de navegacion inferior: solo para moviles (oculta en pantallas md+)
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/',         icon: 'home',                  label: 'Home' },
  { to: '/catalog',  icon: 'grid_view',             label: 'Catalog' },
  { to: '/rankings', icon: 'monitoring',            label: 'Rankings' },
  { to: '/my-list',  icon: 'format_list_bulleted',  label: 'My List' },
  { to: '/profile',  icon: 'person',                label: 'Profile' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 h-16 border-t border-outline-variant/30 md:hidden">
      {NAV_ITEMS.map(item => {
        if (item.to === '/profile' && !user) return (
          <Link key={item.to} to="/login"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">login</span>
            <span className="text-[10px] font-semibold">Login</span>
          </Link>
        )
        return (
          <Link key={item.to} to={item.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors
              ${isActive(item.to) ? 'nav-active' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive(item.to) ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}