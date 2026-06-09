// App.jsx — layout principal con transiciones de página via key de ruta.
// Al cambiar de ruta, el componente se re-monta y dispara .page-enter en cada página.

import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef }          from 'react'
import Header      from './components/layout/Header'
import BottomNav   from './components/layout/BottomNav'
import Footer      from './components/layout/Footer'
import MusicPlayer from './components/ui/MusicPlayer'
import CustomCursor from './components/ui/CustomCursor'

import Home        from './pages/Home'
import Catalog     from './pages/Catalog'
import Rankings    from './pages/Rankings'
import MyList      from './pages/MyList'
import Profile     from './pages/Profile'
import Login       from './pages/Login'
import AnimeDetail from './pages/AnimeDetail'

export default function App() {
  const location = useLocation()

  // Scroll al inicio en cada cambio de página
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  return (
    <div className="min-h-screen bg-background text-on-surface"
         style={{ fontFamily: 'Orbitron, sans-serif' }}>

      <CustomCursor />
      <MusicPlayer />
      <Header />

      <main className="pt-16 pb-20 md:pb-0">
        {/*
          key={location.pathname} — fuerza re-mount en cada cambio de ruta.
          Esto dispara la animación page-enter definida en index.css.
          location.key incluye también navegación hacia atrás/adelante.
        */}
        <Routes location={location} key={location.key}>
          <Route path="/"          element={<Home />} />
          <Route path="/catalog"   element={<Catalog />} />
          <Route path="/rankings"  element={<Rankings />} />
          <Route path="/my-list"   element={<MyList />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/manga/:id" element={<AnimeDetail />} />
          <Route path="*" element={
            <div className="page-enter flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <span className="material-symbols-outlined text-[64px] text-outline">search_off</span>
              <p className="text-on-surface-variant"
                 style={{ fontFamily: 'Bangers, cursive', fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                Página no encontrada
              </p>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}