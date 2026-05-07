import { useEffect, useState } from 'react'
import { ListChecks, Plus, Pencil, Trash2, AlertCircle, GripVertical } from 'lucide-react'
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

const emptyForm = { titulo:'', descricao:'', ordem:1 }

function RotinaForm({ form, setForm, error }) {
  const focus = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur  = e => e.currentTarget.style.borderColor = '#e5e0d8'
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Título *</label>
        <input style={S.input} value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Título da rotina" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Descrição</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:100}} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Descrição da rotina..." onFocus={focus} onBlur={blur}/>
      </div>
      <div>
        <label style={S.label}>Ordem</label>
        <input type="number" min="1" style={{...S.input,width:100}} value={form.ordem} onChange={e=>setForm(f=>({...f,ordem:parseInt(e.target.value)||1}))} onFocus={focus} onBlur={blur}/>
      </div>
    </div>
  )
}

export default function AdminRotinas() {
  const [rotinas,     setRotinas]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/rotinas')
      const list = Array.isArray(r.data) ? r.data : r.data.rotinas||[]
      setRotinas([...list].sort((a,b)=>(a.ordem||0)-(b.ordem||0)))
    } catch { setRotinas([]) } finally { setLoading(false) }
  }
  useEffect(()=>{load()},[])

  const openAdd  = () => { setEditTarget(null); const next = rotinas.length ? Math.max(...rotinas.map(r=>r.ordem||0))+1 : 1; setForm({...emptyForm,ordem:next}); setFormError(''); setModalOpen(true) }
  const openEdit = r  => { setEditTarget(r); setForm({titulo:r.titulo||'',descricao:r.descricao||'',ordem:r.ordem||1}); setFormError(''); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      editTarget ? await api.put(`/rotinas/${editTarget.id}`,form) : await api.post('/rotinas',form)
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.message||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/rotinas/${deleteTarget.id}`); load() } catch{}
  }

  return (
    <div style={S.page}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Rotinas</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{rotinas.length} rotina(s) cadastrada(s)</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      {loading ? <LoadingSpinner/> : rotinas.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <ListChecks size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma rotina cadastrada.</p>
        </div>
      ) : (
        <div>
          {rotinas.map(r => (
            <div key={r.id} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'16px 18px', backgroundColor:'#fff', borderRadius:8, border:'1px solid #e5e0d8', marginBottom:8, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginTop:2 }}>
                <GripVertical size={18} color="#e5e0d8"/>
                <div style={{ width:32, height:32, borderRadius:8, backgroundColor:'rgba(200,151,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#c8972b' }}>
                  {r.ordem}
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'#2c2c3e' }}>{r.titulo}</div>
                {r.descricao && <div style={{ fontSize:13, color:'#6b7280', marginTop:4, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{r.descricao}</div>}
              </div>
              <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                <button onClick={()=>openEdit(r)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                  <Pencil size={16}/>
                </button>
                <button onClick={()=>setDeleteTarget(r)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#dc2626'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Rotina':'Nova Rotina'}
        footer={<>
          <button style={S.btnSecondary} onClick={()=>setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>Cancelar</button>
          <button style={{...S.btnPrimary,opacity:saving?.7:1}} onClick={handleSave} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving?'Salvando...':'Salvar'}
          </button>
        </>}
      >
        <RotinaForm form={form} setForm={setForm} error={formError}/>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Rotina" message={`Excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
