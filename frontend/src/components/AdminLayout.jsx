import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Music,
  Leaf,
  Users,
  Calendar,
  ListChecks,
  LogOut,
  Menu,
  X,
  Star,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/admin',            label: 'Dashboard',  Icon: LayoutDashboard, exact: true },
  { to: '/admin/musicas',    label: 'Músicas',     Icon: Music },
  { to: '/admin/ervas',      label: 'Ervas',       Icon: Leaf },
  { to: '/admin/entidades',  label: 'Entidades',   Icon: Users },
  { to: '/admin/giras',      label: 'Giras',       Icon: Calendar },
  { to: '/admin/rotinas',    label: 'Rotinas',     Icon: ListChecks },
  { to: '/admin/usuarios',   label: 'Usuários',    Icon: Users },
]

function SidebarContent({ onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div
        className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid #2D1B69' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #c8972b, #e8b84b)',
              boxShadow: '0 0 14px rgba(200,151,43,0.4)',
            }}
          >
            <Star size={15} color="#0D0818" fill="#0D0818" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: '#c8972b' }}>
              Filhos de Fé
            </div>
            <div className="text-[10px] font-medium" style={{ color: '#7C5AAA' }}>
              Administração
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: '#A78BFA' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, Icon, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: isActive ? '#E0D4FF' : '#7C5AAA',
                  borderLeft: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                  paddingLeft: '10px',
                })}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #2D1B69' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: '#7C5AAA' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.12)'
            e.currentTarget.style.color = '#FCA5A5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#7C5AAA'
          }}
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh" style={{ backgroundColor: '#0D0818' }}>

      {/* Sidebar Desktop */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-0 h-dvh"
        style={{
          backgroundColor: '#100820',
          borderRight: '1px solid #2D1B69',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ backgroundColor: 'rgba(13,8,24,0.85)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{
              backgroundColor: '#100820',
              borderRight: '1px solid #2D1B69',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header Mobile */}
        <header
          className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
          style={{
            backgroundColor: '#100820',
            borderBottom: '1px solid #2D1B69',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#A78BFA' }}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Star size={14} style={{ color: '#c8972b' }} fill="#c8972b" />
            <span className="font-bold text-sm" style={{ color: '#c8972b' }}>Filhos de Fé</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
