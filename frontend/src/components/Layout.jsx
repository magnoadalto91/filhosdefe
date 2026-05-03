import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X, LogIn, User, Youtube, Instagram, Facebook, Phone, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from './BottomNav'
import Footer from './Footer'

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/aprenda', label: 'Aprenda' },
  { to: '/calendario', label: 'Calendário' },
]

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#0D0818' }}>

      {/* ── Top info bar (md+) ────────────────────────────────── */}
      <div
        className="hidden md:flex items-center justify-between px-6 py-2 text-xs"
        style={{ backgroundColor: '#12092B', borderBottom: '1px solid #2D1B69' }}
      >
        <div className="flex items-center gap-5" style={{ color: '#A78BFA' }}>
          <span className="flex items-center gap-1.5">
            <Phone size={12} style={{ color: '#D4AF37' }} />
            Terreiro Filhos de Fé
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} style={{ color: '#D4AF37' }} />
            Giras: Domingos 19h
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: '#A78BFA' }}>Que a paz de Oxalá esteja com você</span>
          <div className="flex items-center gap-2 ml-2">
            <a href="#" aria-label="YouTube" className="transition-colors" style={{ color: '#A78BFA' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#A78BFA'}>
              <Youtube size={15} />
            </a>
            <a href="#" aria-label="Instagram" className="transition-colors" style={{ color: '#A78BFA' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#A78BFA'}>
              <Instagram size={15} />
            </a>
            <a href="#" aria-label="Facebook" className="transition-colors" style={{ color: '#A78BFA' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#A78BFA'}>
              <Facebook size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{ backgroundColor: '#1A1030', borderBottom: '1px solid #2D1B69', boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: '#D4AF37' }}>
              Filhos de Fé
            </span>
            <span className="text-xs hidden md:block" style={{ color: '#A78BFA' }}>
              Umbanda com amor e devoção
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: active ? '#D4AF37' : '#F8F5FF',
                    backgroundColor: active ? 'rgba(212,175,55,0.12)' : 'transparent',
                    borderBottom: active ? '2px solid #D4AF37' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#D4AF37' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#F8F5FF' }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop auth button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ color: '#A78BFA', border: '1px solid #2D1B69' }}
                >
                  <User size={16} />
                  Perfil
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: '#7C3AED', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5B21B6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7C3AED'}
              >
                <LogIn size={16} />
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#F8F5FF' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 space-y-1"
            style={{ backgroundColor: '#1A1030', borderTop: '1px solid #2D1B69' }}
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium"
                style={{
                  color: location.pathname === to ? '#D4AF37' : '#F8F5FF',
                  backgroundColor: location.pathname === to ? 'rgba(212,175,55,0.1)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2">
              {isAuthenticated ? (
                <Link
                  to={isAdmin ? '/admin' : '/'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium w-full"
                  style={{ color: '#A78BFA', border: '1px solid #2D1B69' }}
                >
                  <User size={16} />
                  {isAdmin ? 'Painel Admin' : 'Perfil'}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold w-full justify-center"
                  style={{ backgroundColor: '#7C3AED', color: '#fff' }}
                >
                  <LogIn size={16} />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ─────────────────────────────────────── */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      <Footer />

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
