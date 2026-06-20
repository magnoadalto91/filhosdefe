import { useEffect, useState } from 'react'
import { Shield, User, Trash2, RefreshCw, Plus, Eye, EyeOff, AlertCircle, Pencil } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const S = {
  page:         { fontFamily:"'Poppins',sans-serif" },
  label:        { display:'block', fontSize:12, fontWeight:600, color:'#2c2c3e', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  input:        { width:'100%', padding:'11px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:14, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s', backgroundColor:'#fff' },
  btnPrimary:   { padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'#c8972b', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'background 0.15s' },
  btnSecondary: { padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'transparent', color:'#6b7280', border:'1px solid #e5e0d8', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' },
  error:        { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:6, backgroundColor:'#fef2f2', border:'1px solid #fecaca', fontSize:13, color:'#dc2626', marginBottom:16 },
  th:           { padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'#6b7280' },
  td:           { padding:'13px 16px', fontSize:13, color:'#2c2c3e', borderBottom:'1px solid #f0ece5' },
}

const onFocus = e => e.currentTarget.style.borderColor = '#c8972b'
const onBlur  = e => e.currentTarget.style.borderColor = '#e5e0d8'

const emptyCreate = { nome:'', email:'', password:'', role:'USER' }
const emptyEdit   = { nome:'', email:'', password:'', role:'USER' }

function PasswordField({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      <input type={show?'text':'password'} style={{...S.input, paddingRight:44}}
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={onFocus} onBlur={onBlur}/>
      <button type="button" onClick={()=>setShow(v=>!v)}
        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:2 }}>
        {show?<EyeOff size={17}/>:<Eye size={17}/>}
      </button>
    </div>
  )
}

function UserForm({ form, setForm, error, isEdit }) {
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Nome</label>
        <input type="text" style={S.input} value={form.nome}
          onChange={e=>setForm(f=>({...f,nome:e.target.value}))}
          placeholder="Nome completo" onFocus={onFocus} onBlur={onBlur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>E-mail *</label>
        <input type="email" style={S.input} value={form.email}
          onChange={e=>setForm(f=>({...f,email:e.target.value}))}
          placeholder="email@exemplo.com" onFocus={onFocus} onBlur={onBlur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>{isEdit ? 'Nova senha' : 'Senha *'}</label>
        <PasswordField value={form.password}
          onChange={e=>setForm(f=>({...f,password:e.target.value}))}
          placeholder={isEdit ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}/>
        {isEdit && <p style={{ margin:'5px 0 0', fontSize:12, color:'#9ca3af' }}>Preencha somente se quiser alterar a senha.</p>}
      </div>
      <div>
        <label style={S.label}>Perfil</label>
        <select style={{...S.input, cursor:'pointer'}} value={form.role}
          onChange={e=>setForm(f=>({...f,role:e.target.value}))}
          onFocus={onFocus} onBlur={onBlur}>
          <option value="USER">Usuário (USER)</option>
          <option value="ADMIN">Administrador (ADMIN)</option>
        </select>
      </div>
    </div>
  )
}

function badge(role) {
  return {
    display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px',
    borderRadius:20, fontSize:12, fontWeight:700,
    backgroundColor: role==='ADMIN'?'rgba(200,151,43,0.1)':'rgba(107,114,128,0.08)',
    color:           role==='ADMIN'?'#c8972b':'#6b7280',
    border:`1px solid ${role==='ADMIN'?'rgba(200,151,43,0.3)':'#e5e0d8'}`,
  }
}

export default function AdminUsuarios() {
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [flashMsg,    setFlashMsg]    = useState({ text:'', ok:true })
  const [delTarget,   setDelTarget]   = useState(null)
  const [createOpen,  setCreateOpen]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyCreate)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [showBulkConfirm,setShowBulkConfirm]= useState(false)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/usuarios'); setUsers(r.data) }
    catch { flash('Erro ao carregar usuários.', false) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const flash = (text, ok=true) => {
    setFlashMsg({ text, ok })
    setTimeout(() => setFlashMsg({ text:'', ok:true }), 4000)
  }

  const openCreate = () => { setForm(emptyCreate); setFormError(''); setCreateOpen(true) }
  const openEdit   = u   => { setEditTarget(u); setForm({ nome: u.nome||'', email: u.email, password:'', role: u.role }); setFormError('') }

  const handleCreate = async () => {
    if (!form.email.trim())        { setFormError('E-mail é obrigatório.'); return }
    if (form.password.length < 6)  { setFormError('Senha deve ter ao menos 6 caracteres.'); return }
    setSaving(true); setFormError('')
    try {
      const r = await api.post('/usuarios', form)
      setUsers(prev => [...prev, r.data])
      setCreateOpen(false)
      flash(`Usuário ${r.data.email} criado.`)
    } catch (err) { setFormError(err.response?.data?.error || 'Erro ao criar usuário.') }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!form.email.trim())                          { setFormError('E-mail é obrigatório.'); return }
    if (form.password && form.password.length < 6)  { setFormError('Senha deve ter ao menos 6 caracteres.'); return }
    setSaving(true); setFormError('')
    try {
      const payload = { nome: form.nome, email: form.email, role: form.role }
      if (form.password) payload.password = form.password
      const r = await api.put(`/usuarios/${editTarget.id}`, payload)
      setUsers(prev => prev.map(u => u.id === editTarget.id ? r.data : u))
      setEditTarget(null)
      flash(`Usuário ${r.data.email} atualizado.`)
    } catch (err) { setFormError(err.response?.data?.error || 'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await api.delete(`/usuarios/${delTarget.id}`)
      setUsers(prev => prev.filter(u => u.id !== delTarget.id))
      flash(`Usuário ${delTarget.email} removido.`)
    } catch (err) { flash(err.response?.data?.error || 'Erro ao remover.', false) }
    finally { setDelTarget(null) }
  }

  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === users.length ? new Set() : new Set(users.map(u=>u.id)))
  const handleBulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map(id => api.delete(`/usuarios/${id}`)))
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)))
      setSelectedIds(new Set())
      flash(`${selectedIds.size} usuário(s) removido(s).`)
    } catch (err) { flash('Erro ao remover usuários.', false) }
  }

  const fmt = iso => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })

  const iconBtn = (onClick, Icon, danger) => (
    <button onClick={onClick}
      style={{ display:'flex', padding:7, borderRadius:6, border:'1px solid #e5e0d8', background:'#fff', color:'#9ca3af', cursor:'pointer', transition:'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger?'#dc2626':'#c8972b'; e.currentTarget.style.color = danger?'#dc2626':'#c8972b' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#9ca3af' }}>
      <Icon size={15}/>
    </button>
  )

  const modalFooter = (onSave, label) => (
    <>
      <button style={S.btnSecondary}
        onClick={() => { setCreateOpen(false); setEditTarget(null) }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
        Cancelar
      </button>
      <button style={{...S.btnPrimary, opacity:saving?0.7:1}} onClick={onSave} disabled={saving}
        onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
        onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
        {saving ? 'Salvando...' : label}
      </button>
    </>
  )

  return (
    <div style={S.page}>

      {/* Header */}
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

      {/* Flash */}
      {flashMsg.text && (
        <div style={{ padding:'10px 14px', borderRadius:6, fontSize:13, marginBottom:16,
          backgroundColor: flashMsg.ok ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${flashMsg.ok ? '#bbf7d0' : '#fecaca'}`,
          color: flashMsg.ok ? '#16a34a' : '#dc2626' }}>
          {flashMsg.text}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:'#fef3cd', borderRadius:8, marginBottom:16, border:'1px solid #f9d971' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', flex:1 }}>{selectedIds.size} selecionado(s)</span>
          <button onClick={toggleAll} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size===users.length?'Desmarcar todos':'Selecionar todos'}</button>
          <button onClick={()=>setShowBulkConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, backgroundColor:'#dc2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>Excluir {selectedIds.size}</button>
        </div>
      )}

      {loading ? <LoadingSpinner/> : users.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <User size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <>
          {/* Tabela desktop */}
          <div className="users-table" style={{ display:'none', borderRadius:10, border:'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <style>{`@media(min-width:640px){.users-table{display:block!important;}}`}</style>
            <table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:'#fff' }}>
              <thead>
                <tr style={{ backgroundColor:'#f8f5f0', borderBottom:'1px solid #e5e0d8' }}>
                  <th style={S.th}><input type="checkbox" checked={selectedIds.size===users.length&&users.length>0} onChange={toggleAll} style={{ cursor:'pointer', accentColor:'#c8972b' }}/></th>
                  {['Nome','E-mail','Role','Desde',''].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ backgroundColor: selectedIds.has(u.id)?'#fef9f0': i%2===0?'#fff':'#fafaf9' }}>
                    <td style={S.td}><input type="checkbox" checked={selectedIds.has(u.id)} onChange={()=>toggleSelect(u.id)} style={{ cursor:'pointer', accentColor:'#c8972b' }}/></td>
                    <td style={S.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', backgroundColor:'#f8f5f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {u.role==='ADMIN' ? <Shield size={14} color="#c8972b"/> : <User size={14} color="#9ca3af"/>}
                        </div>
                        <span style={{ fontWeight:600, color:'#2c2c3e' }}>{u.nome || <span style={{ color:'#9ca3af', fontStyle:'italic' }}>—</span>}</span>
                      </div>
                    </td>
                    <td style={{...S.td, color:'#6b7280'}}>{u.email}</td>
                    <td style={S.td}><span style={badge(u.role)}>{u.role==='ADMIN'?<Shield size={10}/>:<User size={10}/>}{u.role}</span></td>
                    <td style={{...S.td, color:'#9ca3af', whiteSpace:'nowrap'}}>{fmt(u.createdAt)}</td>
                    <td style={{...S.td}}>
                      <div style={{ display:'flex', gap:6 }}>
                        {iconBtn(() => openEdit(u), Pencil, false)}
                        {iconBtn(() => setDelTarget(u), Trash2, true)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="users-cards" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <style>{`@media(min-width:640px){.users-cards{display:none!important;}}`}</style>
            {users.map(u => (
              <div key={u.id} style={{ backgroundColor: selectedIds.has(u.id)?'#fef9f0':'#fff', borderRadius:10, border: selectedIds.has(u.id)?'1px solid #c8972b':'1px solid #e5e0d8', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <input type="checkbox" checked={selectedIds.has(u.id)} onChange={()=>toggleSelect(u.id)} style={{ cursor:'pointer', accentColor:'#c8972b', marginRight:8, marginTop:2 }}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#2c2c3e' }}>{u.nome || <span style={{ color:'#9ca3af', fontStyle:'italic' }}>Sem nome</span>}</div>
                    <div style={{ fontSize:13, color:'#6b7280', wordBreak:'break-all' }}>{u.email}</div>
                    <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>Desde {fmt(u.createdAt)}</div>
                  </div>
                  <span style={{...badge(u.role), marginLeft:8, flexShrink:0}}>{u.role}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => openEdit(u)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:6, border:'1px solid #e5e0d8', background:'#fff', color:'#6b7280', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
                    <Pencil size={14}/> Editar
                  </button>
                  <button onClick={() => setDelTarget(u)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 14px', borderRadius:6, border:'1px solid #e5e0d8', background:'#fff', color:'#9ca3af', cursor:'pointer', transition:'all 0.15s' }}
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

      {/* Modal Criar */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Novo Usuário"
        footer={modalFooter(handleCreate, 'Criar Usuário')}>
        <UserForm form={form} setForm={setForm} error={formError} isEdit={false}/>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Editar Usuário"
        footer={modalFooter(handleEdit, 'Salvar')}>
        <UserForm form={form} setForm={setForm} error={formError} isEdit={true}/>
      </Modal>

      <ConfirmModal isOpen={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete}
        title="Remover usuário" message={`Remover "${delTarget?.email}"? Esta ação não pode ser desfeita.`}/>
      <ConfirmModal isOpen={showBulkConfirm} onClose={()=>setShowBulkConfirm(false)} onConfirm={handleBulkDelete}
        title="Remover Usuários" message={`Remover ${selectedIds.size} usuário(s) selecionado(s)? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
