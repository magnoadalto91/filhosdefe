import { useState, useCallback } from 'react'
import { NavLink, useNavigate, Link } from 'react-router'
import {
  LayoutDashboard, Music, Leaf, Users, Calendar,
  ListChecks, LogOut, Menu, X, Star, Globe, Layers, Bell, BookOpen,
  Cloud, AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

const NAV = [
  { to: '/admin',           label: 'Dashboard',  Icon: LayoutDashboard, exact: true },
  { to: '/admin/musicas',     label: 'Músicas',    Icon: Music },
  { to: '/admin/agregadores', label: 'Agregadores', Icon: Layers },
  { to: '/admin/ervas',     label: 'Ervas',      Icon: Leaf },
  { to: '/admin/entidades', label: 'Orixás / Entidades', Icon: Users },
  { to: '/admin/giras',     label: 'Giras',      Icon: Calendar },
  { to: '/admin/rotinas',   label: 'Rotinas',    Icon: ListChecks },
  { to: '/admin/usuarios',      label: 'Usuários',      Icon: Users },
  { to: '/admin/estudos',      label: 'Estudos',        Icon: BookOpen },
  { to: '/admin/notificacoes', label: 'Notificações',  Icon: Bell },
]

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const gb = bytes / (1024 ** 3)
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  const mb = bytes / (1024 ** 2)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function UsageBar({ used, limit, label, sublabel }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const pctLabel = pct < 0.01 ? '< 0,01%' : `${pct.toFixed(2)}%`
  const barColor = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#c8972b'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{pctLabel}</span>
      </div>
      <div style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${Math.max(pct, 0.3)}%`, backgroundColor: barColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: '#9ca3af' }}>{sublabel}</span>
    </div>
  )
}

function CloudinaryModal({ onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/cloudinary/usage')
      setData(res.data)
    } catch {
      setError('Não foi possível carregar os dados do Cloudinary.')
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => { load() }, [])

  const storageUsed  = data?.storage?.usage ?? 0
  const storageLimit = data?.storage?.limit ?? 0
  const bwUsed       = data?.bandwidth?.usage ?? 0
  const bwLimit      = data?.bandwidth?.limit ?? 0
  const resources    = data?.resources ?? 0
  const plan         = (data?.plan ?? 'free').toUpperCase()

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(28,28,46,0.5)', backdropFilter: 'blur(3px)', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: "'Poppins', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1f2937' }}>Uso dos Serviços</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 4, borderRadius: 6 }}>
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#c8972b', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ fontSize: 14 }}>Carregando...</span>
          </div>
        )}

        {error && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', backgroundColor: '#fef2f2', borderRadius: 10, marginBottom: 16 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
          </div>
        )}

        {data && !loading && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', backgroundColor: '#f8f5f0', borderRadius: 10, marginBottom: 20 }}>
              <Cloud size={18} color="#c8972b" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', letterSpacing: '0.04em' }}>
                  SERVIÇO DE FOTOS · PLANO {plan}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Limites renovam automaticamente todo mês.</div>
              </div>
            </div>

            <UsageBar
              label="Espaço para fotos"
              used={storageUsed}
              limit={storageLimit}
              sublabel={`${formatBytes(storageUsed)} de ${formatBytes(storageLimit)}`}
            />

            <UsageBar
              label="Acessos às fotos este mês"
              used={bwUsed}
              limit={bwLimit}
              sublabel={`${formatBytes(bwUsed)} de ${formatBytes(bwLimit)}`}
            />

            <div style={{ paddingTop: 12, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {resources.toLocaleString('pt-BR')} arquivos armazenados
            </div>
          </>
        )}
      </div>
    </div>
  )
}

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

function TopBar({ onOpenCloud }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '10px 36px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8' }}>
      <Link
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 14, fontWeight: 600, textDecoration: 'none', color: '#6b7280', backgroundColor: '#fff', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
      >
        <Globe size={16} />
        Ver site público
      </Link>
      <button
        onClick={onOpenCloud}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e0d8', fontSize: 14, fontWeight: 600, color: '#6b7280', backgroundColor: '#fff', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
      >
        <Cloud size={16} />
        Armazenamento
      </button>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false)
  const [cloudOpen, setCloudOpen] = useState(false)

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
          <span style={{ fontSize: 18, fontWeight: 800, color: '#c8972b', flex: 1 }}>Filhos de Fé</span>
          <Link to="/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, border: '1px solid #e5e0d8', background: '#fff', color: '#6b7280' }} title="Ver site público">
            <Globe size={20} />
          </Link>
          <button
            onClick={() => setCloudOpen(true)}
            title="Armazenamento"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, border: '1px solid #e5e0d8', background: '#fff', color: '#6b7280', cursor: 'pointer' }}
          >
            <Cloud size={20} />
          </button>
        </header>

        {/* Desktop top bar */}
        <div className="admin-topbar" style={{ display: 'none' }}>
          <style>{`@media (min-width:1024px){.admin-topbar{display:block!important;}}`}</style>
          <TopBar onOpenCloud={() => setCloudOpen(true)} />
        </div>

        <main
          className="admin-main"
          style={{ flex: 1, padding: 20, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <style>{`@media (min-width:1024px){.admin-main{padding:36px!important;}}`}</style>
          {children}
        </main>
      </div>

      {cloudOpen && <CloudinaryModal onClose={() => setCloudOpen(false)} />}
    </div>
  )
}
