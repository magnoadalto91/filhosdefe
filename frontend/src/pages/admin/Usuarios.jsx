import { useEffect, useState } from 'react'
import { Users, Shield, User, Trash2, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminUsuarios() {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [successMsg, setSuccess]  = useState('')
  const [delTarget, setDelTarget] = useState(null)
  const [updating, setUpdating]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/usuarios')
      setUsers(res.data)
    } catch {
      setError('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }
  }

  const handleRoleChange = async (user, newRole) => {
    setUpdating(user.id)
    try {
      const res = await api.patch(`/usuarios/${user.id}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: res.data.role } : u))
      flash(`Role de ${user.email} alterada para ${newRole}.`)
    } catch (err) {
      flash(err.response?.data?.error || 'Erro ao alterar role.', true)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await api.delete(`/usuarios/${delTarget.id}`)
      setUsers(prev => prev.filter(u => u.id !== delTarget.id))
      flash(`Usuário ${delTarget.email} removido.`)
    } catch (err) {
      flash(err.response?.data?.error || 'Erro ao remover usuário.', true)
    } finally {
      setDelTarget(null)
    }
  }

  const fmt = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F8F5FF' }}>Usuários</h1>
          <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid #2D1B69', color: '#A78BFA' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#F8F5FF' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2D1B69'; e.currentTarget.style.color = '#A78BFA' }}
        >
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Users size={40} style={{ color: '#2D1B69' }} />
          <p className="text-sm" style={{ color: '#A78BFA' }}>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl"
            style={{ border: '1px solid #2D1B69' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1A1030', borderBottom: '1px solid #2D1B69' }}>
                  {['Usuário', 'Role', 'Desde', 'Alterar role', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: '#7C5AAA' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#0F0820' : '#120C28',
                      borderBottom: '1px solid #1E1240',
                    }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: u.role === 'ADMIN' ? 'rgba(200,151,43,0.15)' : 'rgba(124,58,237,0.15)' }}>
                          {u.role === 'ADMIN'
                            ? <Shield size={15} style={{ color: '#c8972b' }} />
                            : <User size={15} style={{ color: '#A78BFA' }} />}
                        </div>
                        <span className="font-medium" style={{ color: '#F8F5FF' }}>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: u.role === 'ADMIN' ? 'rgba(200,151,43,0.15)' : 'rgba(124,58,237,0.15)',
                          color: u.role === 'ADMIN' ? '#c8972b' : '#A78BFA',
                          border: `1px solid ${u.role === 'ADMIN' ? 'rgba(200,151,43,0.3)' : '#2D1B69'}`,
                        }}>
                        {u.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />}{u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#7C5AAA' }}>{fmt(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={updating === u.id}
                        onChange={e => handleRoleChange(u, e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs outline-none"
                        style={{
                          backgroundColor: '#0D0818',
                          border: '1px solid #2D1B69',
                          color: '#F8F5FF',
                          cursor: updating === u.id ? 'not-allowed' : 'pointer',
                          opacity: updating === u.id ? 0.6 : 1,
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDelTarget(u)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#A78BFA' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#A78BFA' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {users.map(u => (
              <div key={u.id} className="rounded-xl p-4"
                style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: u.role === 'ADMIN' ? 'rgba(200,151,43,0.15)' : 'rgba(124,58,237,0.15)' }}>
                      {u.role === 'ADMIN'
                        ? <Shield size={14} style={{ color: '#c8972b' }} />
                        : <User size={14} style={{ color: '#A78BFA' }} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: '#F8F5FF' }}>{u.email}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#7C5AAA' }}>Desde {fmt(u.createdAt)}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-2"
                    style={{
                      backgroundColor: u.role === 'ADMIN' ? 'rgba(200,151,43,0.15)' : 'rgba(124,58,237,0.15)',
                      color: u.role === 'ADMIN' ? '#c8972b' : '#A78BFA',
                      border: `1px solid ${u.role === 'ADMIN' ? 'rgba(200,151,43,0.3)' : '#2D1B69'}`,
                    }}>
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    disabled={updating === u.id}
                    onChange={e => handleRoleChange(u, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{
                      backgroundColor: '#0D0818',
                      border: '1px solid #2D1B69',
                      color: '#F8F5FF',
                    }}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button
                    onClick={() => setDelTarget(u)}
                    className="p-2 rounded-lg transition-colors flex-shrink-0"
                    style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2D1B69'; e.currentTarget.style.color = '#A78BFA' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        title="Remover usuário"
        message={`Tem certeza que deseja remover "${delTarget?.email}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
