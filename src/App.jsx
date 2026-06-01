import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'

// Pages — la Persona 3 las creará; estos son placeholders funcionales
// para que el proyecto arranque sin errores mientras se desarrolla
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Rankings from './pages/Rankings'
import MyList from './pages/MyList'
import Profile from './pages/Profile'
import Login from './pages/Login'

// AnimeDetail lo crea la Persona 3; placeholder hasta que esté listo
const AnimeDetail = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <p className="text-on-surface-variant">Detalle — en desarrollo</p>
  </div>
)

export default function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-inter">
      {/* Barra superior — siempre visible */}
      <Header />

      {/* Contenido principal — padding-top para que no quede debajo del header */}
      <main className="pt-16 pb-20 md:pb-0">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/catalog"     element={<Catalog />} />
          <Route path="/rankings"    element={<Rankings />} />
          <Route path="/my-list"     element={<MyList />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/anime/:id"   element={<AnimeDetail />} />
          <Route path="/manga/:id"   element={<AnimeDetail />} />
          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <span className="material-symbols-outlined text-[64px] text-outline">search_off</span>
              <p className="text-headline-sm text-on-surface-variant">Página no encontrada</p>
            </div>
          } />
        </Routes>
      </main>

      {/* Navegación inferior — solo en móvil */}
      <BottomNav />
    </div>
  )
}
