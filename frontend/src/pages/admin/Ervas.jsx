import { useEffect, useState, useRef } from 'react'
import { Leaf, Plus, Search, Pencil, Trash2, AlertCircle, ImageIcon } from 'lucide-react'
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

const emptyForm = { nome:'', descricao:'', usos:'', noQuintal:false, foto:'' }

function HerbForm({ form, setForm, error, preview, setPreview }) {
  const fileRef = useRef()
  const focus   = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur    = e => e.currentTarget.style.borderColor = '#e5e0d8'

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPreview(ev.target.result); setForm(f=>({...f,foto:ev.target.result})) }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}

      {/* Photo */}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Foto</label>
        <div
          style={{ width:'100%', height:140, borderRadius:8, border:'2px dashed #e5e0d8', overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#f8f5f0', position:'relative', transition:'border-color 0.2s' }}
          onClick={()=>fileRef.current?.click()}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}
        >
          {preview ? <img src={preview} alt="preview" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
            : <><ImageIcon size={28} color="#e5e0d8"/><span style={{ fontSize:12, color:'#9ca3af', marginTop:6 }}>Clique para selecionar</span></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Nome *</label>
        <input style={S.input} value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Nome da erva" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Descrição</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80}} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Descrição..." onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Usos</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80}} value={form.usos} onChange={e=>setForm(f=>({...f,usos:e.target.value}))} placeholder="Usos e propriedades..." onFocus={focus} onBlur={blur}/>
      </div>

      {/* Toggle */}
      <label style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
        <div
          style={{ position:'relative', width:44, height:24, borderRadius:12, backgroundColor:form.noQuintal?'#c8972b':'#e5e0d8', transition:'background 0.2s', flexShrink:0 }}
          onClick={()=>setForm(f=>({...f,noQuintal:!f.noQuintal}))}
        >
          <div style={{ position:'absolute', top:3, left:form.noQuintal?'calc(100% - 21px)':3, width:18, height:18, borderRadius:'50%', backgroundColor:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
        </div>
        <span style={{ fontSize:14, color:'#2c2c3e' }}>Temos no quintal</span>
      </label>
    </div>
  )
}

export default function AdminErvas() {
  const [ervas,       setErvas]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [preview,     setPreview]     = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/ervas'); setErvas(Array.isArray(r.data)?r.data:r.data.ervas||[]) }
    catch { setErvas([]) } finally { setLoading(false) }
  }
  useEffect(()=>{load()},[])

  const openAdd  = () => { setEditTarget(null); setForm(emptyForm); setPreview(''); setFormError(''); setModalOpen(true) }
  const openEdit = e  => { setEditTarget(e); setForm({nome:e.nome||'',descricao:e.descricao||'',usos:e.usos||'',noQuintal:e.noQuintal||false,foto:e.foto||''}); setPreview(e.foto||''); setFormError(''); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      editTarget ? await api.put(`/ervas/${editTarget._id}`,form) : await api.post('/ervas',form)
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.message||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/ervas/${deleteTarget._id}`); load() } catch{}
  }

  const filtered = ervas.filter(e => e.nome?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={S.page}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Ervas</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{ervas.length} erva(s) cadastrada(s)</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      <div style={{ position:'relative', marginBottom:20 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar erva..."
          style={{...S.input,paddingLeft:42}}
          onFocus={e=>e.currentTarget.style.borderColor='#c8972b'}
          onBlur={e=>e.currentTarget.style.borderColor='#e5e0d8'}/>
      </div>

      {loading ? <LoadingSpinner/> : filtered.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Leaf size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma erva encontrada.</p>
        </div>
      ) : (
        <div className="ervas-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
          <style>{`@media(min-width:640px){.ervas-grid{grid-template-columns:repeat(3,1fr)!important;}}@media(min-width:1024px){.ervas-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
          {filtered.map(e => (
            <div key={e._id} style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ aspectRatio:'4/3', backgroundColor:'#f8f5f0', position:'relative', overflow:'hidden' }}>
                {e.foto
                  ? <img src={e.foto} alt={e.nome} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Leaf size={32} color="#e5e0d8"/></div>}
                {e.noQuintal && (
                  <span style={{ position:'absolute', top:8, right:8, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, backgroundColor:'#c8972b', color:'#fff' }}>Quintal</span>
                )}
              </div>
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#2c2c3e', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.nome}</div>
                {e.descricao && <div style={{ fontSize:12, color:'#6b7280', marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.descricao}</div>}
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(e)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'7px 0', borderRadius:6, border:'1px solid #e5e0d8', fontSize:12, fontWeight:600, color:'#6b7280', background:'none', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={ev=>{ev.currentTarget.style.borderColor='#c8972b';ev.currentTarget.style.color='#c8972b'}}
                    onMouseLeave={ev=>{ev.currentTarget.style.borderColor='#e5e0d8';ev.currentTarget.style.color='#6b7280'}}>
                    <Pencil size={12}/> Editar
                  </button>
                  <button onClick={()=>setDeleteTarget(e)} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'7px 10px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:12, color:'#6b7280', background:'none', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={ev=>{ev.currentTarget.style.borderColor='#dc2626';ev.currentTarget.style.color='#dc2626'}}
                    onMouseLeave={ev=>{ev.currentTarget.style.borderColor='#e5e0d8';ev.currentTarget.style.color='#6b7280'}}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Erva':'Nova Erva'}
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
        <HerbForm form={form} setForm={setForm} error={formError} preview={preview} setPreview={setPreview}/>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Erva" message={`Excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
