import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router'
import {
  LayoutDashboard, Music, Leaf, Users, Calendar,
  ListChecks, LogOut, Menu, X, Star, Globe, Layers, Bell,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/admin',           label: 'Dashboard',  Icon: LayoutDashboard, exact: true },
  { to: '/admin/musicas',     label: 'Músicas',    Icon: Music },
  { to: '/admin/agregadores', label: 'Agregadores', Icon: Layers },
  { to: '/admin/ervas',     label: 'Ervas',      Icon: Leaf },
  { to: '/admin/entidades', label: 'Orixás / Entidades', Icon: Users },
  { to: '/admin/giras',     label: 'Giras',      Icon: Calendar },
  { to: '/admin/rotinas',   label: 'Rotinas',    Icon: ListChecks },
  { to: '/admin/usuarios',      label: 'Usuários',      Icon: Users },
  { to: '/admin/notificacoes', label: 'Notificações',  Icon: Bell },
]

function Sidebar({ onClose }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const doLogout   = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Poppins', sans-serif" }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px', borderBottom: '1px solid #e5e0d8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#c8972b,#e8b84b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(200,151,43,0.35)' }}>
            <Star size={20} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#c8972b', lineHeight: 1.2 }}>Filhos de Fé</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Administração</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex', borderRadius: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(({ to, label, Icon, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color:           isActive ? '#c8972b' : '#6b7280',
                  backgroundColor: isActive ? 'rgba(200,151,43,0.09)' : 'transparent',
                  borderLeft:      isActive ? '3px solid #c8972b' : '3px solid transparent',
                  transition: 'all 0.15s',
                })}
              >
                <Icon size={22} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Ver site público */}
      <div style={{ padding: '8px 12px 0' }}>
        <Link to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', color: '#6b7280', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(200,151,43,0.08)'; e.currentTarget.style.color = '#c8972b' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
        >
          <Globe size={22} /> Ver site público
        </Link>
      </div>

      {/* Logout */}
      <div style={{ padding: '8px 12px 16px', borderTop: '1px solid #e5e0d8', marginTop: 8 }}>
        <button
          onClick={doLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 18px', borderRadius: 8, border: '1px solid #fecaca', fontSize: 15, fontWeight: 600, color: '#dc2626', background: 'transparent', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <LogOut size={22} />
          Sair
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', backgroundColor: '#f8f5f0', fontFamily: "'Poppins', sans-serif" }}>

      {/* Sidebar desktop */}
      <aside
        className="admin-sidebar"
        style={{ display: 'none', width: 256, flexShrink: 0, backgroundColor: '#ffffff', borderRight: '1px solid #e5e0d8', position: 'sticky', top: 0, height: '100dvh', overflowY: 'auto' }}
      >
        <style>{`@media (min-width:1024px){.admin-sidebar{display:flex!important;flex-direction:column;}}`}</style>
        <Sidebar />
      </aside>

      {/* Overlay mobile */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(28,28,46,0.45)', backdropFilter: 'blur(2px)' }} onClick={() => setOpen(false)}>
          <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, backgroundColor: '#ffffff', borderRight: '1px solid #e5e0d8', boxShadow: '4px 0 32px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Mobile header */}
        <header
          className="admin-mobile-header"
          style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', height: 64, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <style>{`@media (min-width:1024px){.admin-mobile-header{display:none!important;}}`}</style>
          <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, border: '1px solid #e5e0d8', background: '#fff', color: '#2c2c3e', cursor: 'pointer' }}>
            <Menu size={22} />
          </button>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#c8972b' }}>Filhos de Fé</span>
        </header>

        <main
          className="admin-main"
          style={{ flex: 1, padding: 20, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <style>{`@media (min-width:1024px){.admin-main{padding:36px!important;}}`}</style>
          {children}
        </main>
      </div>
    </div>
  )
}
