import { NavLink } from 'react-router'
import { Home, BookOpen, Calendar } from 'lucide-react'

const items = [
  { to: '/', label: 'Início', Icon: Home, exact: true },
  { to: '/aprenda', label: 'Aprenda', Icon: BookOpen },
  { to: '/calendario', label: 'Calendário', Icon: Calendar },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'flex', backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e0d8',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      fontFamily: "'Poppins', sans-serif",
    }}>
      {items.map(({ to, label, Icon, exact }) => (
        <NavLink key={to} to={to} end={exact} style={{ flex: 1, textDecoration: 'none' }}>
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 0', gap: 3,
              color: isActive ? '#c8972b' : '#6b7280',
              borderTop: isActive ? '2px solid #c8972b' : '2px solid transparent',
              transition: 'color 0.2s',
            }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
