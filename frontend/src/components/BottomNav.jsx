import { NavLink } from 'react-router'
import { Home, BookOpen, Calendar } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Início', Icon: Home, exact: true },
  { to: '/aprenda', label: 'Aprenda', Icon: BookOpen },
  { to: '/calendario', label: 'Calendário', Icon: Calendar },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        backgroundColor: '#1A1030',
        borderTop: '1px solid #2D1B69',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map(({ to, label, Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? '#7C3AED' : '#A78BFA',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
