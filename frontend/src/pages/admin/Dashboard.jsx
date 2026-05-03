import { useEffect, useState } from 'react'
import { Music, Leaf, Users, Calendar, ListChecks, Plus } from 'lucide-react'
import { Link } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const statCards = [
  { key: 'musicas', label: 'Músicas', Icon: Music, color: '#7C3AED', to: '/admin/musicas' },
  { key: 'ervas', label: 'Ervas', Icon: Leaf, color: '#10B981', to: '/admin/ervas' },
  { key: 'entidades', label: 'Entidades', Icon: Users, color: '#F59E0B', to: '/admin/entidades' },
  { key: 'giras', label: 'Giras', Icon: Calendar, color: '#EF4444', to: '/admin/giras' },
  { key: 'rotinas', label: 'Rotinas', Icon: ListChecks, color: '#6366F1', to: '/admin/rotinas' },
]

const quickActions = [
  { label: 'Nova Música', to: '/admin/musicas', Icon: Music },
  { label: 'Nova Erva', to: '/admin/ervas', Icon: Leaf },
  { label: 'Nova Entidade', to: '/admin/entidades', Icon: Users },
  { label: 'Nova Gira', to: '/admin/giras', Icon: Calendar },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/musicas'),
      api.get('/ervas'),
      api.get('/entidades'),
      api.get('/giras'),
      api.get('/rotinas'),
    ]).then(([musicas, ervas, entidades, giras, rotinas]) => {
      const count = (res) => {
        if (res.status === 'rejected') return 0
        const d = res.value.data
        return Array.isArray(d) ? d.length : (d.total || d.count || 0)
      }
      setStats({
        musicas: count(musicas),
        ervas: count(ervas),
        entidades: count(entidades),
        giras: count(giras),
        rotinas: count(rotinas),
      })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F8F5FF' }}>
          Olá, {user?.nome || 'Administrador'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#A78BFA' }}>
          Bem-vindo ao painel de administração de Filhos de Fé.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map(({ key, label, Icon, color, to }) => (
            <Link
              key={key}
              to={to}
              className="rounded-xl p-4 flex flex-col gap-2 transition-all"
              style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#F8F5FF' }}>
                  {stats[key] ?? '—'}
                </div>
                <div className="text-xs" style={{ color: '#A78BFA' }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#A78BFA' }}>
          Ações rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, to, Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid #2D1B69', color: '#A78BFA' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.color = '#F8F5FF' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#A78BFA' }}
            >
              <Plus size={14} />
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
