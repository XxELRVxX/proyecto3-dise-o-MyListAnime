// Footer global: información del proyecto, enlaces, créditos API, redes
// Se muestra en todas las páginas debajo del contenido principal

import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  {
    title: 'Browse',
    links: [
      { to: '/',         label: 'Home'   },
      { to: '/catalog',  label: 'Catalog' },
      { to: '/rankings', label: 'Rankings' },
      { to: '/my-list',  label: 'My List' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login',   label: 'Login' },
      { to: '/profile', label: 'My Profile' },
    ],
  },
  {
    title: 'Info',
    links: [
      { href: 'https://jikan.moe', label: 'API: Jikan (MAL)', external: true },
      { href: 'https://myanimelist.net', label: 'MyAnimeList', external: true },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-outline-variant/20 glass-nav">
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center">
                <span className="text-sm font-black text-on-primary" style={{ fontFamily: 'Bangers, cursive' }}>MLA</span>
              </div>
              <span
                className="text-xl text-on-surface group-hover:text-primary transition-colors"
                style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
              >
                MyList<span className="text-neon-purple">Anime</span>
              </span>
            </Link>
            <p className="text-xs text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Your personal anime and manga database. Discover, organize and share your collection.
            </p>
            {/* Badge API */}
            <div className="flex items-center gap-2 mt-3">
              <span className="genre-chip text-secondary border-secondary/30 bg-secondary/10">
                🔗 Powered by Jikan API
              </span>
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title}>
              <h4
                className="text-sm font-bold text-on-surface mb-3 text-neon-purple"
                style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.08em', fontSize: '1rem' }}
              >
                {title}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map(({ to, href, label, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link hover:text-primary flex items-center gap-1"
                      >
                        {label}
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      </a>
                    ) : (
                      <Link to={to} className="footer-link hover:text-primary">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Línea inferior */}
        <div className="border-t border-outline-variant/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-on-surface-variant text-center sm:text-left" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            © {year} MyListAnime — University project. Data by{' '}
            <a href="https://jikan.moe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Jikan
            </a>{' '}
            &{' '}
            <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              MyAnimeList
            </a>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Made with ❤️ and anime
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
