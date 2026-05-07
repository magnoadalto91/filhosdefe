import { useEffect, useState } from 'react'
import { Calendar, Plus, Pencil, Trash2, AlertCircle, Users, Music, ListChecks, Clock, ChevronDown, ChevronUp } from 'lucide-react'
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

const emptyForm = { titulo:'', data:'', descricao:'', instrucoes:'' }

function GiraForm({ form, setForm, error }) {
  const focus = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur  = e => e.currentTarget.style.borderColor = '#e5e0d8'
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Título *</label>
        <input style={S.input} value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Título da gira" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Data *</label>
        <input type="date" style={{...S.input,colorScheme:'light'}} value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))} onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Descrição</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80}} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Descrição da gira..." onFocus={focus} onBlur={blur}/>
      </div>
      <div>
        <label style={S.label}>Instruções</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80}} value={form.instrucoes} onChange={e=>setForm(f=>({...f,instrucoes:e.target.value}))} placeholder="Instruções para os participantes..." onFocus={focus} onBlur={blur}/>
      </div>
    </div>
  )
}

function MultiSelect({ label, Icon, allItems, selectedIds, onChange, nameKey='titulo' }) {
  const [open, setOpen] = useState(false)
  const toggle = id => onChange(selectedIds.includes(id) ? selectedIds.filter(x=>x!==id) : [...selectedIds,id])
  const names  = allItems.filter(i=>selectedIds.includes(i._id)).map(i=>i[nameKey]||i.nome)

  return (
    <div style={{ marginBottom:16 }}>
      <label style={S.label}><span style={{ display:'flex', alignItems:'center', gap:4 }}><Icon size={12}/>{label}</span></label>
      <button type="button" onClick={()=>setOpen(o=>!o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:14, fontFamily:"'Poppins',sans-serif", color: names.length?'#2c2c3e':'#9ca3af', backgroundColor:'#fff', cursor:'pointer', textAlign:'left', transition:'border-color 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
        onMouseLeave={e=>{ if(!open) e.currentTarget.style.borderColor='#e5e0d8' }}>
        <span>{names.length ? names.slice(0,2).join(', ')+(names.length>2?` +${names.length-2}`:''): `Selecionar ${label.toLowerCase()}...`}</span>
        {open?<ChevronUp size={14} color="#9ca3af"/>:<ChevronDown size={14} color="#9ca3af"/>}
      </button>
      {open && (
        <div style={{ marginTop:4, borderRadius:6, border:'1px solid #e5e0d8', backgroundColor:'#fff', maxHeight:160, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          {allItems.length===0
            ? <div style={{ padding:'12px', textAlign:'center', fontSize:13, color:'#9ca3af' }}>Nenhum item disponível</div>
            : allItems.map(item=>{
                const sel = selectedIds.includes(item._id)
                return (
                  <button key={item._id} type="button" onClick={()=>toggle(item._id)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', fontSize:14, fontFamily:"'Poppins',sans-serif", color:sel?'#c8972b':'#2c2c3e', backgroundColor:sel?'rgba(200,151,43,0.06)':'transparent', border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.1s' }}
                    onMouseEnter={e=>{ if(!sel) e.currentTarget.style.backgroundColor='#f8f5f0' }}
                    onMouseLeave={e=>{ if(!sel) e.currentTarget.style.backgroundColor='transparent' }}>
                    <div style={{ width:18, height:18, borderRadius:4, border:`1px solid ${sel?'#c8972b':'#e5e0d8'}`, backgroundColor:sel?'#c8972b':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                      {sel && <div style={{ width:8, height:8, borderRadius:1, backgroundColor:'#fff' }}/>}
                    </div>
                    {item[nameKey]||item.nome}
                  </button>
                )
              })
          }
        </div>
      )}
    </div>
  )
}

function AssocModal({ gira, allEntidades, allMusicas, allRotinas, onClose, onSaved }) {
  const [entidades, setEntidades] = useState(gira?.entidades?.map(e=>e._id||e)||[])
  const [musicas,   setMusicas]   = useState(gira?.musicas?.map(m=>m._id||m)||[])
  const [rotinas,   setRotinas]   = useState(gira?.rotinas?.map(r=>r._id||r)||[])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const handleSave = async () => {
    setSaving(true); setError('')
    try { await api.put(`/giras/${gira._id}`,{...gira,entidades,musicas,rotinas}); onSaved(); onClose() }
    catch(err) { setError(err.response?.data?.message||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  return (
    <Modal isOpen={!!gira} onClose={onClose} title={`Associações — ${gira?.titulo}`}
      footer={<>
        <button style={S.btnSecondary} onClick={onClose}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>Cancelar</button>
        <button style={{...S.btnPrimary,opacity:saving?.7:1}} onClick={handleSave} disabled={saving}
          onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          {saving?'Salvando...':'Salvar'}
        </button>
      </>}
    >
      <div>
        {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
        <MultiSelect label="Entidades" Icon={Users}      allItems={allEntidades} selectedIds={entidades} onChange={setEntidades} nameKey="nome"/>
        <MultiSelect label="Músicas"   Icon={Music}      allItems={allMusicas}   selectedIds={musicas}   onChange={setMusicas}   nameKey="titulo"/>
        <MultiSelect label="Rotinas"   Icon={ListChecks} allItems={allRotinas}   selectedIds={rotinas}   onChange={setRotinas}   nameKey="titulo"/>
      </div>
    </Modal>
  )
}

function GiraCard({ gira, isPast, onEdit, onDelete, onAssoc }) {
  const dateStr = new Date(gira.data).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})
  return (
    <div style={{ backgroundColor:'#fff', borderRadius:10, border:`1px solid ${isPast?'#e5e0d8':'rgba(200,151,43,0.4)'}`, padding:'18px 20px', marginBottom:10, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', opacity:isPast?.75:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#2c2c3e', marginBottom:4 }}>{gira.titulo}</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:isPast?'#9ca3af':'#c8972b' }}>
            <Clock size={12}/>{dateStr}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
          <button onClick={()=>onAssoc(gira)} title="Associações" style={{ display:'flex', padding:7, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#c8972b'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}><ListChecks size={16}/></button>
          <button onClick={()=>onEdit(gira)} style={{ display:'flex', padding:7, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}><Pencil size={16}/></button>
          <button onClick={()=>onDelete(gira)} style={{ display:'flex', padding:7, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#dc2626'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}><Trash2 size={16}/></button>
        </div>
      </div>
      {gira.descricao && <p style={{ margin:'0 0 10px', fontSize:13, color:'#6b7280', lineHeight:1.5 }}>{gira.descricao}</p>}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {gira.entidades?.length>0 && <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}><Users size={10}/>{gira.entidades.length} entidade{gira.entidades.length!==1?'s':''}</span>}
        {gira.musicas?.length>0   && <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}><Music size={10}/>{gira.musicas.length} música{gira.musicas.length!==1?'s':''}</span>}
        {gira.rotinas?.length>0   && <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}><ListChecks size={10}/>{gira.rotinas.length} rotina{gira.rotinas.length!==1?'s':''}</span>}
      </div>
    </div>
  )
}

export default function AdminGiras() {
  const [giras,       setGiras]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [assocTarget, setAssocTarget] = useState(null)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [allEntidades,setAllEntidades]= useState([])
  const [allMusicas,  setAllMusicas]  = useState([])
  const [allRotinas,  setAllRotinas]  = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/giras')
      const list = Array.isArray(r.data)?r.data:r.data.giras||[]
      setGiras([...list].sort((a,b)=>new Date(b.data)-new Date(a.data)))
    } catch { setGiras([]) } finally { setLoading(false) }
  }

  const loadRelated = async () => {
    const [e,m,r] = await Promise.allSettled([api.get('/entidades'),api.get('/musicas'),api.get('/rotinas')])
    setAllEntidades(e.status==='fulfilled'?(Array.isArray(e.value.data)?e.value.data:[]):[])
    setAllMusicas(m.status==='fulfilled'?(Array.isArray(m.value.data)?m.value.data:[]):[])
    setAllRotinas(r.status==='fulfilled'?(Array.isArray(r.value.data)?r.value.data:[]):[])
  }

  useEffect(()=>{ load(); loadRelated() },[])

  const openAdd  = () => { setEditTarget(null); setForm(emptyForm); setFormError(''); setModalOpen(true) }
  const openEdit = g  => { setEditTarget(g); setForm({titulo:g.titulo||'',data:g.data?new Date(g.data).toISOString().split('T')[0]:'',descricao:g.descricao||'',instrucoes:g.instrucoes||''}); setFormError(''); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    if (!form.data)          { setFormError('Data é obrigatória.');   return }
    setSaving(true); setFormError('')
    try {
      editTarget ? await api.put(`/giras/${editTarget._id}`,form) : await api.post('/giras',form)
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.message||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/giras/${deleteTarget._id}`); load() } catch{}
  }

  const now      = new Date()
  const upcoming = giras.filter(g=>new Date(g.data)>=now)
  const past     = giras.filter(g=>new Date(g.data)<now)

  return (
    <div style={S.page}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Giras</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{upcoming.length} próxima(s) · {past.length} passada(s)</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      {loading ? <LoadingSpinner/> : giras.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Calendar size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma gira cadastrada.</p>
        </div>
      ) : (
        <>
          {upcoming.length>0 && (
            <section style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#c8972b', marginBottom:14 }}>Próximas Giras</div>
              {[...upcoming].reverse().map(g=><GiraCard key={g._id} gira={g} isPast={false} onEdit={openEdit} onDelete={setDeleteTarget} onAssoc={setAssocTarget}/>)}
            </section>
          )}
          {past.length>0 && (
            <section>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#9ca3af', marginBottom:14 }}>Giras Passadas</div>
              {past.map(g=><GiraCard key={g._id} gira={g} isPast={true} onEdit={openEdit} onDelete={setDeleteTarget} onAssoc={setAssocTarget}/>)}
            </section>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Gira':'Nova Gira'}
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
        <GiraForm form={form} setForm={setForm} error={formError}/>
      </Modal>

      {assocTarget && <AssocModal gira={assocTarget} allEntidades={allEntidades} allMusicas={allMusicas} allRotinas={allRotinas} onClose={()=>setAssocTarget(null)} onSaved={load}/>}

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Gira" message={`Excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
