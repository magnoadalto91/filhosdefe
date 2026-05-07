import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Menu, X, LogIn, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from './BottomNav'

const NAV = [
  { to: '/', label: 'Início' },
  { to: '/aprenda', label: 'Aprenda' },
  { to: '/calendario', label: 'Calendário' },
]

function UserMenu() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login'); setOpen(false) }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid #e5e0d8', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2c2c3e', fontFamily: "'Poppins', sans-serif", transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#c8972b'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = '#e5e0d8' }}
      >
        <User size={15} style={{ color: '#c8972b' }} />
        <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email?.split('@')[0]}
        </span>
        <ChevronDown size={13} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #e5e0d8', zIndex: 100, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ece5' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>Conectado como</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2c2c3e', wordBreak: 'break-all' }}>{user?.email}</div>
          </div>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#c8972b', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f5f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LayoutDashboard size={15} /> Painel Admin
            </Link>
          )}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      )}
    </div>
  )
}

function MobileLogoutBtn({ onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <button
      onClick={() => { logout(); navigate('/login'); onClose() }}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", width: '100%' }}
    >
      <LogOut size={16} /> Sair
    </button>
  )
}

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Main header ──────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#c8972b', letterSpacing: '-0.5px' }}>Filhos de Fé</span>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }} className="logo-sub">Umbanda com amor e devoção</span>
          </Link>
          <style>{`.logo-sub { display: none; } @media (min-width: 768px) { .logo-sub { display: block; } }`}</style>

          {/* Desktop nav */}
          <nav style={{ display: 'none' }} className="desktop-nav">
            <style>{`@media (min-width: 768px) { .desktop-nav { display: flex !important; align-items: center; gap: 4px; } }`}</style>
            {NAV.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  style={{
                    padding: '8px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: active ? '#c8972b' : '#2c2c3e',
                    borderBottom: active ? '2px solid #c8972b' : '2px solid transparent',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#c8972b' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#2c2c3e' }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div style={{ display: 'none', alignItems: 'center', gap: 10 }} className="desktop-cta">
            <style>{`@media (min-width: 768px) { .desktop-cta { display: flex !important; } }`}</style>
            {isAuthenticated ? <UserMenu /> : (
              <Link to="/login"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 4, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
              >
                <LogIn size={15} /> Entrar
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="mobile-menu-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 4, border: '1px solid #e5e0d8', background: '#fff', color: '#2c2c3e', cursor: 'pointer' }}
          >
            <style>{`@media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }`}</style>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e0d8', padding: '12px 24px 16px' }}>
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 0', fontSize: 14, fontWeight: 600, color: location.pathname === to ? '#c8972b' : '#2c2c3e', textDecoration: 'none', borderBottom: '1px solid #f8f5f0' }}
              >{label}</Link>
            ))}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#c8972b', textDecoration: 'none' }}
                    >
                      <LayoutDashboard size={16} /> Painel Admin
                    </Link>
                  )}
                  <MobileLogoutBtn onClose={() => setMenuOpen(false)} />
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 4, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', textDecoration: 'none', marginTop: 4 }}
                >
                  <LogIn size={15} /> Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <main style={{ flex: 1, paddingBottom: 0 }} className="main-content">
        <style>{`@media (max-width: 767px) { .main-content { padding-bottom: 64px; } }`}</style>
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <div className="mobile-nav">
        <style>{`@media (min-width: 768px) { .mobile-nav { display: none; } }`}</style>
        <BottomNav />
      </div>
    </div>
  )
}
