import { useEffect, useState, useRef } from 'react'
import { GlassWater, Search, Pencil, Trash2, AlertCircle, ImageIcon } from 'lucide-react'
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

const emptyForm = { nome:'', descricao:'', ingredientes:'', preparo:'' }

function BebidaFormWrapper({ form, setForm, error, preview, setPreview, fileRef }) {
  const inputRef = useRef()
  const focus    = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur     = e => e.currentTarget.style.borderColor = '#e5e0d8'

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    fileRef.current = file
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Foto</label>
        <div style={{ width:'100%', height:140, borderRadius:8, border:'2px dashed #e5e0d8', overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#f8f5f0', position:'relative', transition:'border-color 0.2s' }}
          onClick={()=>inputRef.current?.click()}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
          {preview
            ? <img src={preview} alt="preview" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }}/>
            : <><ImageIcon size={28} color="#e5e0d8"/><span style={{ fontSize:12,color:'#9ca3af',marginTop:6 }}>Clique para selecionar</span></>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Nome *</label>
        <input style={S.input} value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Nome da bebida" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Descrição</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80}} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Para qual entidade, ocasião, significado..." onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Ingredientes</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:100}} value={form.ingredientes} onChange={e=>setForm(f=>({...f,ingredientes:e.target.value}))} placeholder="Liste os ingredientes..." onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Modo de preparo</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:100}} value={form.preparo} onChange={e=>setForm(f=>({...f,preparo:e.target.value}))} placeholder="Como preparar (opcional)..." onFocus={focus} onBlur={blur}/>
      </div>
    </div>
  )
}

export default function AdminBebidas() {
  const [bebidas,     setBebidas]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [preview,     setPreview]     = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/bebidas'); setBebidas(Array.isArray(r.data)?r.data:r.data.bebidas||[]) }
    catch { setBebidas([]) } finally { setLoading(false) }
  }
  useEffect(()=>{load()},[])

  const openAdd = () => {
    setEditTarget(null); setForm(emptyForm); setPreview(''); fileRef.current=null; setFormError(''); setModalOpen(true)
  }
  const openEdit = b => {
    setEditTarget(b)
    setForm({ nome:b.nome||'', descricao:b.descricao||'', ingredientes:b.ingredientes||'', preparo:b.preparo||'' })
    setPreview(b.fotoUrl||''); fileRef.current=null; setFormError(''); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('nome', form.nome.trim())
      fd.append('descricao', form.descricao.trim())
      fd.append('ingredientes', form.ingredientes.trim())
      fd.append('preparo', form.preparo.trim())
      if (fileRef.current) fd.append('foto', fileRef.current)

      if (editTarget) {
        await api.put(`/bebidas/${editTarget.id}`, fd)
      } else {
        await api.post('/bebidas', fd)
      }
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.message||err.response?.data?.error||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/bebidas/${deleteTarget.id}`); load() } catch{}
  }

  const filtered = bebidas.filter(b => b.nome?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={S.page}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Bebidas</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{bebidas.length} bebida(s) cadastrada(s)</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      <div style={{ position:'relative', marginBottom:20 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar bebida..."
          style={{...S.input,paddingLeft:42}}
          onFocus={e=>e.currentTarget.style.borderColor='#c8972b'}
          onBlur={e=>e.currentTarget.style.borderColor='#e5e0d8'}/>
      </div>

      {loading ? <LoadingSpinner/> : filtered.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <GlassWater size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma bebida encontrada.</p>
        </div>
      ) : (
        <div className="bebidas-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
          <style>{`@media(min-width:640px){.bebidas-grid{grid-template-columns:repeat(3,1fr)!important;}}@media(min-width:1024px){.bebidas-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
          {filtered.map(b => (
            <div key={b.id} style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ aspectRatio:'4/3', backgroundColor:'#f8f5f0', position:'relative', overflow:'hidden' }}>
                {b.fotoUrl
                  ? <img src={b.fotoUrl} alt={b.nome} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><GlassWater size={32} color="#e5e0d8"/></div>}
              </div>
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#2c2c3e', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.nome}</div>
                {b.descricao && <div style={{ fontSize:12, color:'#6b7280', marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{b.descricao}</div>}
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(b)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'7px 0', borderRadius:6, border:'1px solid #e5e0d8', fontSize:12, fontWeight:600, color:'#6b7280', background:'none', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={ev=>{ev.currentTarget.style.borderColor='#c8972b';ev.currentTarget.style.color='#c8972b'}}
                    onMouseLeave={ev=>{ev.currentTarget.style.borderColor='#e5e0d8';ev.currentTarget.style.color='#6b7280'}}>
                    <Pencil size={12}/> Editar
                  </button>
                  <button onClick={()=>setDeleteTarget(b)} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'7px 10px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:12, color:'#6b7280', background:'none', cursor:'pointer', transition:'all 0.15s' }}
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

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Bebida':'Nova Bebida'}
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
        <BebidaFormWrapper
          form={form} setForm={setForm} error={formError}
          preview={preview} setPreview={setPreview} fileRef={fileRef}
        />
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Bebida" message={`Excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
