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
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { to: '/admin/musicas', label: 'Músicas', Icon: Music },
  { to: '/admin/ervas', label: 'Ervas', Icon: Leaf },
  { to: '/admin/entidades', label: 'Entidades', Icon: Users },
  { to: '/admin/giras', label: 'Giras', Icon: Calendar },
  { to: '/admin/rotinas', label: 'Rotinas', Icon: ListChecks },
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
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#2D1B69' }}>
        <div className="flex items-center gap-2">
          <Star size={20} style={{ color: '#D4AF37' }} />
          <div>
            <div className="font-bold text-base leading-tight" style={{ color: '#D4AF37' }}>Filhos de Fé</div>
            <div className="text-xs" style={{ color: '#A78BFA' }}>Administração</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded" style={{ color: '#A78BFA' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ to, label, Icon, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
                  color: isActive ? '#F8F5FF' : '#A78BFA',
                  border: isActive ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                })}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: '#2D1B69' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: '#A78BFA' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#FCA5A5' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A78BFA' }}
        >
          <LogOut size={18} />
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
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-0 h-dvh overflow-hidden"
        style={{ backgroundColor: '#1A1030', borderRight: '1px solid #2D1B69' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ backgroundColor: 'rgba(13,8,24,0.8)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{ backgroundColor: '#1A1030', borderRight: '1px solid #2D1B69' }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header
          className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: '#1A1030', borderBottom: '1px solid #2D1B69' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg"
            style={{ color: '#A78BFA' }}
          >
            <Menu size={22} />
          </button>
          <span className="font-bold" style={{ color: '#D4AF37' }}>Filhos de Fé</span>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
