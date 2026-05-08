import { useEffect, useState } from 'react'
import { Shield, User, Trash2, RefreshCw, Plus, Eye, EyeOff, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const S = {
  page:        { fontFamily:"'Poppins',sans-serif" },
  label:       { display:'block', fontSize:12, fontWeight:600, color:'#2c2c3e', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  input:       { width:'100%', padding:'11px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:14, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s', backgroundColor:'#fff' },
  btnPrimary:  { padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'#c8972b', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'background 0.15s' },
  btnSecondary:{ padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'transparent', color:'#6b7280', border:'1px solid #e5e0d8', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' },
  error:       { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:6, backgroundColor:'#fef2f2', border:'1px solid #fecaca', fontSize:13, color:'#dc2626', marginBottom:16 },
}

const focus = e => e.currentTarget.style.borderColor = '#c8972b'
const blur  = e => e.currentTarget.style.borderColor = '#e5e0d8'

const emptyForm = { email:'', password:'', role:'USER' }

function CreateForm({ form, setForm, error }) {
  const [showPass, setShowPass] = useState(false)
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>E-mail *</label>
        <input type="email" style={S.input} value={form.email}
          onChange={e=>setForm(f=>({...f,email:e.target.value}))}
          placeholder="email@exemplo.com" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Senha *</label>
        <div style={{ position:'relative' }}>
          <input type={showPass?'text':'password'} style={{...S.input,paddingRight:44}}
            value={form.password}
            onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            placeholder="Mínimo 6 caracteres" onFocus={focus} onBlur={blur}/>
          <button type="button" onClick={()=>setShowPass(v=>!v)}
            style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:2 }}>
            {showPass?<EyeOff size={17}/>:<Eye size={17}/>}
          </button>
        </div>
      </div>
      <div>
        <label style={S.label}>Perfil</label>
        <select style={{...S.input,cursor:'pointer'}} value={form.role}
          onChange={e=>setForm(f=>({...f,role:e.target.value}))}
          onFocus={focus} onBlur={blur}>
          <option value="USER">Usuário (USER)</option>
          <option value="ADMIN">Administrador (ADMIN)</option>
        </select>
      </div>
    </div>
  )
}

export default function AdminUsuarios() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [successMsg, setSuccess]    = useState('')
  const [delTarget,  setDelTarget]  = useState(null)
  const [updating,   setUpdating]   = useState(null)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')

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

  const openCreate = () => { setForm(emptyForm); setFormError(''); setModalOpen(true) }

  const handleCreate = async () => {
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return }
    if (form.password.length < 6) { setFormError('Senha deve ter ao menos 6 caracteres.'); return }
    setSaving(true); setFormError('')
    try {
      const r = await api.post('/usuarios', form)
      setUsers(prev => [...prev, r.data])
      setModalOpen(false)
      flash(`Usuário ${r.data.email} criado com sucesso.`)
    } catch(err) { setFormError(err.response?.data?.error||'Erro ao criar usuário.') }
    finally { setSaving(false) }
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

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Usuários</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:13, fontWeight:600, color:'#6b7280', background:'#fff', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
            <RefreshCw size={15}/>
          </button>
          <button onClick={openCreate} style={S.btnPrimary}
            onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}><Plus size={15}/> Novo Usuário</span>
          </button>
        </div>
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

      {/* Modal criar usuário */}
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Novo Usuário"
        footer={<>
          <button style={S.btnSecondary} onClick={()=>setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>Cancelar</button>
          <button style={{...S.btnPrimary,opacity:saving?.7:1}} onClick={handleCreate} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving?'Criando...':'Criar Usuário'}
          </button>
        </>}
      >
        <CreateForm form={form} setForm={setForm} error={formError}/>
      </Modal>

      <ConfirmModal isOpen={!!delTarget} onClose={()=>setDelTarget(null)} onConfirm={handleDelete}
        title="Remover usuário" message={`Remover "${delTarget?.email}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
