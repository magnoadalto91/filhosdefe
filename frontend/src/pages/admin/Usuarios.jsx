import { useEffect, useState } from 'react'
import { Users, Shield, User, Trash2, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import ConfirmModal from '../../components/ConfirmModal'

const S = {
  page: { fontFamily: "'Poppins', sans-serif" },
  header: { marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 800, color: '#1c1c2e', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6b7280' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280', backgroundColor: '#f8f5f0', borderBottom: '1px solid #e5e0d8' },
  td: { padding: '14px 16px', fontSize: 14, color: '#2c2c3e', borderBottom: '1px solid #f0ece5' },
  badge: (role) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 700,
    backgroundColor: role === 'ADMIN' ? 'rgba(200,151,43,0.12)' : 'rgba(107,114,128,0.10)',
    color: role === 'ADMIN' ? '#c8972b' : '#6b7280',
    border: `1px solid ${role === 'ADMIN' ? 'rgba(200,151,43,0.3)' : '#e5e0d8'}`,
  }),
  select: { padding: '6px 10px', borderRadius: 4, border: '1px solid #e5e0d8', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: '#2c2c3e', backgroundColor: '#fff', cursor: 'pointer', outline: 'none' },
  btnDel: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 4, border: '1px solid #fecaca', backgroundColor: '#fff', color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s' },
  error: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 },
  success: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#16a34a', marginBottom: 16 },
}

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
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Usuários</h1>
        <p style={S.sub}>Gerencie os membros e suas permissões de acesso.</p>
      </div>

      {error   && <div style={S.error}>{error}</div>}
      {successMsg && <div style={S.success}>{successMsg}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          <RefreshCw size={28} style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          Carregando...
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div style={{ overflowX: 'auto', display: 'none' }} className="dt">
            <style>{`@media (min-width: 640px) { .dt { display: block !important; } }`}</style>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Usuário</th>
                  <th style={S.th}>Role</th>
                  <th style={S.th}>Desde</th>
                  <th style={S.th}>Alterar role</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {u.role === 'ADMIN'
                            ? <Shield size={15} style={{ color: '#c8972b' }} />
                            : <User size={15} style={{ color: '#9ca3af' }} />}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={S.td}><span style={S.badge(u.role)}>{u.role === 'ADMIN' ? <Shield size={11} /> : <User size={11} />}{u.role}</span></td>
                    <td style={{ ...S.td, color: '#9ca3af' }}>{fmt(u.createdAt)}</td>
                    <td style={S.td}>
                      <select
                        value={u.role}
                        disabled={updating === u.id}
                        onChange={e => handleRoleChange(u, e.target.value)}
                        style={S.select}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={S.td}>
                      <button style={S.btnDel} title="Remover"
                        onClick={() => setDelTarget(u)}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff' }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="mob">
            <style>{`@media (min-width: 640px) { .mob { display: none !important; } }`}</style>
            {users.map(u => (
              <div key={u.id} style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e0d8', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#2c2c3e', wordBreak: 'break-all' }}>{u.email}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Desde {fmt(u.createdAt)}</div>
                  </div>
                  <span style={S.badge(u.role)}>{u.role}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={u.role} disabled={updating === u.id}
                    onChange={e => handleRoleChange(u, e.target.value)}
                    style={{ ...S.select, flex: 1 }}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button style={S.btnDel} onClick={() => setDelTarget(u)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 16 }}>
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
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
