import { Routes, Route } from 'react-router-dom'
import Header     from './components/layout/Header'
import BottomNav  from './components/layout/BottomNav'
import Footer     from './components/layout/Footer'
import MusicPlayer from './components/ui/MusicPlayer'
import CustomCursor from './components/ui/CustomCursor'

import Home     from './pages/Home'
import Catalog  from './pages/Catalog'
import Rankings from './pages/Rankings'
import MyList   from './pages/MyList'
import Profile  from './pages/Profile'
import Login    from './pages/Login'

const AnimeDetail = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <p className="text-on-surface-variant" style={{ fontFamily: 'Orbitron, sans-serif' }}>
      Detalle — en desarrollo
    </p>
  </div>
)

export default function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface" style={{ fontFamily: 'Orbitron, sans-serif' }}>

      {/* Cursor personalizado — sobre todo */}
      <CustomCursor />

      {/* Reproductor de música flotante */}
      <MusicPlayer />

      {/* Barra superior */}
      <Header />

      {/* Contenido principal */}
      <main className="pt-16 pb-20 md:pb-0">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/catalog"   element={<Catalog />} />
          <Route path="/rankings"  element={<Rankings />} />
          <Route path="/my-list"   element={<MyList />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/manga/:id" element={<AnimeDetail />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <span className="material-symbols-outlined text-[64px] text-outline">search_off</span>
              <p
                className="text-on-surface-variant"
                style={{ fontFamily: 'Bangers, cursive', fontSize: '1.5rem', letterSpacing: '0.05em' }}
              >
                Página no encontrada
              </p>
            </div>
          } />
        </Routes>
      </main>

      {/* Footer global */}
      <Footer />

      {/* Navegación inferior móvil */}
      <BottomNav />
    </div>
  )
}
