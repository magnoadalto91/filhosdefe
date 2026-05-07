import { useEffect, useState } from 'react'
import { Music, Leaf, Users, Calendar, ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const statCards = [
  { key: 'musicas',   label: 'Músicas',    Icon: Music,       color: '#7C3AED', bg: 'rgba(124,58,237,0.15)',  to: '/admin/musicas' },
  { key: 'ervas',     label: 'Ervas',      Icon: Leaf,        color: '#10B981', bg: 'rgba(16,185,129,0.15)',  to: '/admin/ervas' },
  { key: 'entidades', label: 'Entidades',  Icon: Users,       color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  to: '/admin/entidades' },
  { key: 'giras',     label: 'Giras',      Icon: Calendar,    color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   to: '/admin/giras' },
  { key: 'rotinas',   label: 'Rotinas',    Icon: ListChecks,  color: '#6366F1', bg: 'rgba(99,102,241,0.15)', to: '/admin/rotinas' },
]

const quickActions = [
  { label: 'Nova Música',    to: '/admin/musicas',    Icon: Music,      color: '#7C3AED' },
  { label: 'Nova Erva',      to: '/admin/ervas',      Icon: Leaf,       color: '#10B981' },
  { label: 'Nova Entidade',  to: '/admin/entidades',  Icon: Users,      color: '#F59E0B' },
  { label: 'Nova Gira',      to: '/admin/giras',      Icon: Calendar,   color: '#EF4444' },
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

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="space-y-8">

      {/* Banner de boas-vindas */}
      <div
        className="relative rounded-2xl p-6 lg:p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E1240 0%, #2D1B69 55%, #1A1030 100%)',
          border: '1px solid #3D2B89',
          boxShadow: '0 0 50px rgba(124,58,237,0.12)',
        }}
      >
        {/* Brilho dourado decorativo */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(200,151,43,0.18) 0%, transparent 70%)',
            transform: 'translate(25%, -25%)',
          }}
        />
        {/* Brilho roxo decorativo */}
        <div
          className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
            transform: 'translateY(40%)',
          }}
        />

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#c8972b' }}>
            Painel Administrativo · Filhos de Fé
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#F8F5FF' }}>
            Olá, {user?.nome?.split(' ')[0] || 'Administrador'}
          </h1>
          <p className="text-sm capitalize" style={{ color: '#A78BFA' }}>{hoje}</p>
        </div>
      </div>

      {/* Estatísticas */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#c8972b' }}>
          Visão Geral
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {statCards.map(({ key, label, Icon, color, bg, to }) => (
              <Link
                key={key}
                to={to}
                className="rounded-xl p-4 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#1A1030',
                  border: '1px solid #2D1B69',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color
                  e.currentTarget.style.boxShadow = `0 6px 24px ${color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2D1B69'
                  e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.35)'
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: bg, border: `1px solid ${color}35` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <div className="text-3xl font-bold leading-none" style={{ color: '#F8F5FF' }}>
                    {stats[key] ?? '—'}
                  </div>
                  <div className="text-xs font-medium mt-1.5" style={{ color: '#A78BFA' }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Ações Rápidas */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#c8972b' }}>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, to, Icon, color }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: '#1A1030',
                border: '1px solid #2D1B69',
                color: '#A78BFA',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${color}12`
                e.currentTarget.style.borderColor = `${color}55`
                e.currentTarget.style.color = '#F8F5FF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1030'
                e.currentTarget.style.borderColor = '#2D1B69'
                e.currentTarget.style.color = '#A78BFA'
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <span>+ {label}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
