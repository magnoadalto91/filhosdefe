import { useEffect, useState } from 'react'
import { Shield, User, Trash2, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const S = {
  page: { fontFamily:"'Poppins',sans-serif" },
}

export default function AdminUsuarios() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [successMsg, setSuccess]    = useState('')
  const [delTarget,  setDelTarget]  = useState(null)
  const [updating,   setUpdating]   = useState(null)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/usuarios'); setUsers(r.data) }
    catch { setError('Erro ao carregar usuários.') }
    finally { setLoading(false) }
  }
  useEffect(()=>{load()},[])

  const flash = (msg, isError=false) => {
    if (isError) { setError(msg); setTimeout(()=>setError(''),4000) }
    else { setSuccess(msg); setTimeout(()=>setSuccess(''),4000) }
  }

  const handleRoleChange = async (user, newRole) => {
    setUpdating(user.id)
    try {
      const r = await api.patch(`/usuarios/${user.id}/role`,{role:newRole})
      setUsers(prev=>prev.map(u=>u.id===user.id?{...u,role:r.data.role}:u))
      flash(`Role de ${user.email} alterada para ${newRole}.`)
    } catch(err) { flash(err.response?.data?.error||'Erro ao alterar role.',true) }
    finally { setUpdating(null) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await api.delete(`/usuarios/${delTarget.id}`)
      setUsers(prev=>prev.filter(u=>u.id!==delTarget.id))
      flash(`Usuário ${delTarget.email} removido.`)
    } catch(err) { flash(err.response?.data?.error||'Erro ao remover.',true) }
    finally { setDelTarget(null) }
  }

  const fmt = iso => new Date(iso).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})

  const badge = role => ({
    display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px',
    borderRadius:20, fontSize:12, fontWeight:700,
    backgroundColor: role==='ADMIN'?'rgba(200,151,43,0.1)':'rgba(107,114,128,0.08)',
    color:           role==='ADMIN'?'#c8972b':'#6b7280',
    border:`1px solid ${role==='ADMIN'?'rgba(200,151,43,0.3)':'#e5e0d8'}`,
  })

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Usuários</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <button onClick={load}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:13, fontWeight:600, color:'#6b7280', background:'#fff', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
          <RefreshCw size={15}/> Atualizar
        </button>
      </div>

      {error      && <div style={{ padding:'10px 14px', borderRadius:6, backgroundColor:'#fef2f2', border:'1px solid #fecaca', fontSize:13, color:'#dc2626', marginBottom:16 }}>{error}</div>}
      {successMsg && <div style={{ padding:'10px 14px', borderRadius:6, backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', marginBottom:16 }}>{successMsg}</div>}

      {loading ? <LoadingSpinner/> : users.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <User size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="users-table" style={{ display:'none', borderRadius:10, border:'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <style>{`@media(min-width:640px){.users-table{display:block!important;}}`}</style>
            <table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:'#fff' }}>
              <thead>
                <tr style={{ backgroundColor:'#f8f5f0', borderBottom:'1px solid #e5e0d8' }}>
                  {['Usuário','Role','Desde','Alterar role',''].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={u.id} style={{ borderBottom:'1px solid #f0ece5', backgroundColor:i%2===0?'#fff':'#fafaf9' }}>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', backgroundColor:'#f8f5f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {u.role==='ADMIN'?<Shield size={15} color="#c8972b"/>:<User size={15} color="#9ca3af"/>}
                        </div>
                        <span style={{ fontSize:14, fontWeight:500, color:'#2c2c3e' }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px 16px' }}><span style={badge(u.role)}>{u.role==='ADMIN'?<Shield size={10}/>:<User size={10}/>}{u.role}</span></td>
                    <td style={{ padding:'14px 16px', fontSize:13, color:'#9ca3af' }}>{fmt(u.createdAt)}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <select value={u.role} disabled={updating===u.id} onChange={e=>handleRoleChange(u,e.target.value)}
                        style={{ padding:'6px 10px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:13, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', backgroundColor:'#fff', cursor:'pointer', outline:'none', opacity:updating===u.id?.6:1 }}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <button onClick={()=>setDelTarget(u)}
                        style={{ display:'flex', padding:7, borderRadius:6, border:'1px solid #e5e0d8', background:'#fff', color:'#9ca3af', cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#dc2626';e.currentTarget.style.color='#dc2626'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#9ca3af'}}>
                        <Trash2 size={15}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="users-cards" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <style>{`@media(min-width:640px){.users-cards{display:none!important;}}`}</style>
            {users.map(u=>(
              <div key={u.id} style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#2c2c3e', wordBreak:'break-all' }}>{u.email}</div>
                    <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>Desde {fmt(u.createdAt)}</div>
                  </div>
                  <span style={{...badge(u.role), marginLeft:8, flexShrink:0}}>{u.role}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <select value={u.role} disabled={updating===u.id} onChange={e=>handleRoleChange(u,e.target.value)}
                    style={{ flex:1, padding:'8px 10px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:13, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', backgroundColor:'#fff', cursor:'pointer', outline:'none' }}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button onClick={()=>setDelTarget(u)}
                    style={{ display:'flex', padding:10, borderRadius:6, border:'1px solid #e5e0d8', background:'#fff', color:'#9ca3af', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#dc2626';e.currentTarget.style.color='#dc2626'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#9ca3af'}}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal isOpen={!!delTarget} onClose={()=>setDelTarget(null)} onConfirm={handleDelete}
        title="Remover usuário" message={`Remover "${delTarget?.email}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
