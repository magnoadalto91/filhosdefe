import { useEffect, useState, useRef } from 'react'
import { Users, Plus, Search, Pencil, Trash2, AlertCircle, ImageIcon, Music, Leaf } from 'lucide-react'
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

const DIAS_SEMANA = ['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo']

const emptyForm = { nome:'', historia:'', saudacao:'', coresVelas:'', diaSemana:'', trono:'', par:'', elementoTrabalho:'', oferendas:'' }

function EntityForm({ form, setForm, error, preview, setPreview, fileRef }) {
  const inputRef = useRef()
  const focus    = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur     = e => e.currentTarget.style.borderColor = '#e5e0d8'

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return
    fileRef.current = file
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <div style={{ width:'100%', height:140, borderRadius:8, border:'2px dashed #e5e0d8', overflow:'hidden', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#f8f5f0', position:'relative', transition:'border-color 0.2s' }}
          onClick={()=>inputRef.current?.click()}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
          {preview?<img src={preview} alt="preview" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }}/>
            :<><ImageIcon size={28} color="#e5e0d8"/><span style={{ fontSize:12,color:'#9ca3af',marginTop:6 }}>Clique para selecionar foto</span></>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
      </div>
      {[{f:'nome',l:'Nome *',p:'Nome da entidade'},{f:'saudacao',l:'Saudação',p:'Ex: Salve Ogum!'},{f:'coresVelas',l:'Cores das Velas',p:'Ex: Vermelho e branco'}].map(({f,l,p})=>(
        <div key={f} style={{ marginBottom:16 }}>
          <label style={S.label}>{l}</label>
          <input style={S.input} value={form[f]} onChange={e=>setForm(prev=>({...prev,[f]:e.target.value}))} placeholder={p} onFocus={focus} onBlur={blur}/>
        </div>
      ))}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Dia da Semana</label>
        <select style={{...S.input, cursor:'pointer'}} value={form.diaSemana} onChange={e=>setForm(f=>({...f,diaSemana:e.target.value}))} onFocus={focus} onBlur={blur}>
          <option value="">— Selecionar —</option>
          {DIAS_SEMANA.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Trono</label>
        <input style={S.input} value={form.trono} onChange={e=>setForm(f=>({...f,trono:e.target.value}))} placeholder="Ex: Conhecimento" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Quem é o par</label>
        <input style={S.input} value={form.par} onChange={e=>setForm(f=>({...f,par:e.target.value}))} placeholder="Ex: Iemanjá" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Tipo de elemento de trabalho</label>
        <input style={S.input} value={form.elementoTrabalho} onChange={e=>setForm(f=>({...f,elementoTrabalho:e.target.value}))} placeholder="Ex.: Mineral" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Oferendas</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:100}} value={form.oferendas} onChange={e=>setForm(f=>({...f,oferendas:e.target.value}))} placeholder="Dicas e ensinamentos sobre as oferendas..." onFocus={focus} onBlur={blur}/>
      </div>
      <div>
        <label style={S.label}>História</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:100}} value={form.historia} onChange={e=>setForm(f=>({...f,historia:e.target.value}))} placeholder="História da entidade..." onFocus={focus} onBlur={blur}/>
      </div>
    </div>
  )
}

function DetailModal({ entity, onClose }) {
  const [musicas, setMusicas] = useState([])
  const [ervas,   setErvas]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!entity) return
    setLoading(true)
    api.get(`/entidades/${entity.id}`)
      .then(r => {
        setMusicas(r.data.musicas?.map(m => m.musica) || [])
        setErvas(r.data.ervas?.map(e => e.erva) || [])
      })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[entity])

  if (!entity) return null
  return (
    <Modal isOpen={!!entity} onClose={onClose} title={entity.nome}>
      {entity.fotoUrl && <img src={entity.fotoUrl} alt={entity.nome} style={{ width:'100%', borderRadius:8, marginBottom:16, objectFit:'cover', maxHeight:200, display:'block' }}/>}
      {entity.saudacao        && <p style={{ margin:'0 0 12px', padding:'10px 14px', borderRadius:6, backgroundColor:'rgba(200,151,43,0.08)', border:'1px solid rgba(200,151,43,0.2)', fontSize:14, fontStyle:'italic', color:'#c8972b' }}>"{entity.saudacao}"</p>}
      {(entity.coresVelas || entity.diaSemana || entity.trono || entity.par || entity.elementoTrabalho) && (
        <div style={{ border:'1px solid #e5e0d8', borderRadius:8, padding:'12px 14px', marginBottom:12, display:'flex', flexDirection:'column', gap:8 }}>
          {entity.coresVelas       && <p style={{ margin:0, fontSize:14, color:'#2c2c3e' }}><span style={{ color:'#6b7280' }}>Velas: </span>{entity.coresVelas}</p>}
          {entity.diaSemana        && <p style={{ margin:0, fontSize:14, color:'#2c2c3e' }}><span style={{ color:'#6b7280' }}>Dia da semana: </span>{entity.diaSemana}</p>}
          {entity.trono            && <p style={{ margin:0, fontSize:14, color:'#2c2c3e' }}><span style={{ color:'#6b7280' }}>Trono: </span>{entity.trono}</p>}
          {entity.par              && <p style={{ margin:0, fontSize:14, color:'#2c2c3e' }}><span style={{ color:'#6b7280' }}>Par: </span>{entity.par}</p>}
          {entity.elementoTrabalho && <p style={{ margin:0, fontSize:14, color:'#2c2c3e' }}><span style={{ color:'#6b7280' }}>Elemento de trabalho: </span>{entity.elementoTrabalho}</p>}
        </div>
      )}
      {entity.oferendas       && <div style={{ padding:'12px 14px', borderRadius:8, border:'1px solid rgba(200,151,43,0.45)', backgroundColor:'rgba(200,151,43,0.04)', marginBottom:12 }}>
        <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'#6b7280' }}>Oferendas</p>
        <p style={{ margin:0, fontSize:14, color:'#2c2c3e', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{entity.oferendas}</p>
      </div>}
      {entity.historia        && <div style={{ padding:'12px 14px', borderRadius:8, border:'1px solid rgba(200,151,43,0.45)', backgroundColor:'rgba(200,151,43,0.04)', marginBottom:16 }}>
        <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'#6b7280' }}>História</p>
        <p style={{ margin:0, fontSize:14, color:'#2c2c3e', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{entity.historia}</p>
      </div>}
      {loading ? <LoadingSpinner/> : <>
        {musicas.length>0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}><Music size={13} color="#6b7280"/><span style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', color:'#6b7280' }}>Músicas</span></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {musicas.map(m=><span key={m.id} style={{ padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}>{m.titulo}</span>)}
            </div>
          </div>
        )}
        {ervas.length>0 && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}><Leaf size={13} color="#6b7280"/><span style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', color:'#6b7280' }}>Ervas</span></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ervas.map(e=><span key={e.id} style={{ padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'rgba(5,150,105,0.06)', border:'1px solid rgba(5,150,105,0.2)', color:'#059669' }}>{e.nome}</span>)}
            </div>
          </div>
        )}
      </>}
    </Modal>
  )
}

export default function AdminEntidades() {
  const [entidades,   setEntidades]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [detailTarget,setDetailTarget]= useState(null)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [preview,     setPreview]     = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/entidades'); setEntidades(Array.isArray(r.data)?r.data:r.data.entidades||[]) }
    catch { setEntidades([]) } finally { setLoading(false) }
  }
  useEffect(()=>{load()},[])

  const openAdd = () => {
    setEditTarget(null); setForm(emptyForm); setPreview(''); fileRef.current=null; setFormError(''); setModalOpen(true)
  }
  const openEdit = e => {
    setEditTarget(e); setForm({nome:e.nome||'',historia:e.historia||'',saudacao:e.saudacao||'',coresVelas:e.coresVelas||'',diaSemana:e.diaSemana||'',trono:e.trono||'',par:e.par||'',elementoTrabalho:e.elementoTrabalho||'',oferendas:e.oferendas||''})
    setPreview(e.fotoUrl||''); fileRef.current=null; setFormError(''); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('nome', form.nome.trim())
      fd.append('saudacao', form.saudacao.trim())
      fd.append('coresVelas', form.coresVelas.trim())
      fd.append('diaSemana', form.diaSemana || '')
      fd.append('trono', form.trono.trim())
      fd.append('par', form.par.trim())
      fd.append('elementoTrabalho', form.elementoTrabalho.trim())
      fd.append('oferendas', form.oferendas.trim())
      fd.append('historia', form.historia.trim())
      if (fileRef.current) fd.append('foto', fileRef.current)

      if (editTarget) {
        await api.put(`/entidades/${editTarget.id}`, fd)
      } else {
        await api.post('/entidades', fd)
      }
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.message||err.response?.data?.error||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/entidades/${deleteTarget.id}`); load() } catch{}
  }

  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [showBulkConfirm,setShowBulkConfirm]= useState(false)
  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(e=>e.id)))
  const handleBulkDelete = async () => {
    try { await Promise.all([...selectedIds].map(id => api.delete(`/entidades/${id}`))); setSelectedIds(new Set()); load() } catch{}
  }

  const filtered = entidades.filter(e=>e.nome?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={S.page}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Orixás / Entidades</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{entidades.length} entidade(s) cadastrada(s)</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      <div style={{ position:'relative', marginBottom:16 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar entidade..."
          style={{...S.input,paddingLeft:42}}
          onFocus={e=>e.currentTarget.style.borderColor='#c8972b'}
          onBlur={e=>e.currentTarget.style.borderColor='#e5e0d8'}/>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:'#fef3cd', borderRadius:8, marginBottom:16, border:'1px solid #f9d971' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', flex:1 }}>{selectedIds.size} selecionada(s)</span>
          <button onClick={toggleAll} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size===filtered.length?'Desmarcar todos':'Selecionar todos'}</button>
          <button onClick={()=>setShowBulkConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, backgroundColor:'#dc2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>Excluir {selectedIds.size}</button>
        </div>
      )}

      {loading ? <LoadingSpinner/> : filtered.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Users size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma entidade encontrada.</p>
        </div>
      ) : (
        <div className="ent-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
          <style>{`@media(min-width:640px){.ent-grid{grid-template-columns:repeat(3,1fr)!important;}}@media(min-width:1024px){.ent-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
          {filtered.map(e=>(
            <div key={e.id} style={{ backgroundColor:'#fff', borderRadius:10, border: selectedIds.has(e.id)?'2px solid #c8972b':'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', position:'relative' }}>
              <input type="checkbox" checked={selectedIds.has(e.id)} onChange={()=>toggleSelect(e.id)} style={{ position:'absolute', top:8, left:8, zIndex:10, width:18, height:18, cursor:'pointer', accentColor:'#c8972b' }}/>
              <button style={{ width:'100%', aspectRatio:'1/1', display:'block', position:'relative', backgroundColor:'#f8f5f0', border:'none', cursor:'pointer', padding:0 }} onClick={()=>setDetailTarget(e)}>
                {e.fotoUrl?<img src={e.fotoUrl} alt={e.nome} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  :<div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Users size={36} color="#e5e0d8"/></div>}
                {/* Nome como cabeçalho da imagem */}
                <div style={{ position:'absolute', top:0, left:0, right:0, padding:'14px 12px 32px', background:'linear-gradient(rgba(28,28,46,0.85) 0%, transparent 100%)' }}>
                  <span style={{ fontSize:15, fontWeight:700, color:'#fff', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>{e.nome}</span>
                </div>
              </button>
              {e.saudacao && <div style={{ padding:'8px 12px', borderBottom:'1px solid #f0ece5' }}><div style={{ fontSize:12, fontStyle:'italic', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>"{e.saudacao}"</div></div>}
              <div style={{ display:'flex', gap:6, padding:'10px 12px' }}>
                <button onClick={()=>openEdit(e)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'7px 0', borderRadius:6, border:'1px solid #e5e0d8', fontSize:12, fontWeight:600, color:'#6b7280', background:'none', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={ev=>{ev.currentTarget.style.borderColor='#c8972b';ev.currentTarget.style.color='#c8972b'}}
                  onMouseLeave={ev=>{ev.currentTarget.style.borderColor='#e5e0d8';ev.currentTarget.style.color='#6b7280'}}>
                  <Pencil size={12}/> Editar
                </button>
                <button onClick={()=>setDeleteTarget(e)} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'7px 10px', borderRadius:6, border:'1px solid #e5e0d8', background:'none', cursor:'pointer', color:'#9ca3af', transition:'all 0.15s' }}
                  onMouseEnter={ev=>{ev.currentTarget.style.borderColor='#dc2626';ev.currentTarget.style.color='#dc2626'}}
                  onMouseLeave={ev=>{ev.currentTarget.style.borderColor='#e5e0d8';ev.currentTarget.style.color='#9ca3af'}}>
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Entidade':'Nova Entidade'}
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
        <EntityForm form={form} setForm={setForm} error={formError} preview={preview} setPreview={setPreview} fileRef={fileRef}/>
      </Modal>

      <DetailModal entity={detailTarget} onClose={()=>setDetailTarget(null)}/>
      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Entidade" message={`Excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}/>
      <ConfirmModal isOpen={showBulkConfirm} onClose={()=>setShowBulkConfirm(false)} onConfirm={handleBulkDelete}
        title="Excluir Entidades" message={`Excluir ${selectedIds.size} entidade(s) selecionada(s)? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
