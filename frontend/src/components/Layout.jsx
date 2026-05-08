import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogIn, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function UserMenu() {
  const { user, logout } = useAuth()
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
          {user?.nome || user?.email?.split('@')[0]}
        </span>
        <ChevronDown size={13} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #e5e0d8', zIndex: 100, overflow: 'hidden' }}>

          {/* Email */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ece5' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>Conectado como</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2c2c3e', wordBreak: 'break-all' }}>{user?.email}</div>
          </div>

          {/* Área Administrativa — visível para todos, acesso restrito pelo backend */}
          <Link to="/admin" onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#c8972b', textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8f5f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LayoutDashboard size={15} /> Área Administrativa
          </Link>

          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'background 0.15s', borderTop: '1px solid #f0ece5' }}
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

export default function Layout({ children }) {
  const { isAuthenticated } = useAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#c8972b', letterSpacing: '1px', textTransform: 'uppercase' }}>Filhos de Fé</span>
          </Link>

          {isAuthenticated ? <UserMenu /> : (
            <Link to="/login"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 4, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
            >
              <LogIn size={15} /> Entrar
            </Link>
          )}
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {children}
      </main>

    </div>
  )
}
