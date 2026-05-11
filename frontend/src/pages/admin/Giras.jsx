import { useEffect, useState } from 'react'
import { Calendar, Pencil, Trash2, AlertCircle, Users, Music, ListChecks, Clock, ChevronDown, ChevronUp, Eye } from 'lucide-react'
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
  divider:      { margin:'20px 0', borderTop:'1px solid #e5e0d8' },
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b', marginBottom:14 },
}

const STATUS_META = {
  AGUARDANDO:   { label: 'Aguardando',   color: '#6b7280', bg: 'rgba(107,114,128,0.09)', border: '#e5e0d8' },
  EM_ANDAMENTO: { label: 'Em andamento', color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.25)' },
  CONCLUIDA:    { label: 'Concluída',    color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.25)' },
}

const emptyForm = { titulo:'', data:'', descricao:'', instrucoes:'' }

/* ── MultiSelect ──────────────────────────────── */
function MultiSelect({ label, Icon, allItems, selectedIds, onChange, nameKey='titulo' }) {
  const [open, setOpen] = useState(false)
  const toggle = id => onChange(selectedIds.includes(id) ? selectedIds.filter(x=>x!==id) : [...selectedIds,id])
  const names  = allItems.filter(i=>selectedIds.includes(i.id)).map(i=>i[nameKey]||i.nome)

  return (
    <div style={{ marginBottom:16 }}>
      <label style={S.label}><span style={{ display:'flex', alignItems:'center', gap:4 }}><Icon size={12}/>{label}</span></label>
      <button type="button" onClick={()=>setOpen(o=>!o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:14, fontFamily:"'Poppins',sans-serif", color:names.length?'#2c2c3e':'#9ca3af', backgroundColor:'#fff', cursor:'pointer', textAlign:'left', transition:'border-color 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
        onMouseLeave={e=>{ if(!open) e.currentTarget.style.borderColor='#e5e0d8' }}>
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {names.length ? names.slice(0,3).join(', ')+(names.length>3?` +${names.length-3}`:'') : `Selecionar ${label.toLowerCase()}...`}
        </span>
        {open?<ChevronUp size={14} color="#9ca3af" style={{ flexShrink:0 }}/>:<ChevronDown size={14} color="#9ca3af" style={{ flexShrink:0 }}/>}
      </button>
      {open && (
        <div style={{ marginTop:4, borderRadius:6, border:'1px solid #e5e0d8', backgroundColor:'#fff', maxHeight:160, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          {allItems.length===0
            ? <div style={{ padding:'12px', textAlign:'center', fontSize:13, color:'#9ca3af' }}>Nenhum item disponível</div>
            : allItems.map(item=>{
                const sel = selectedIds.includes(item.id)
                return (
                  <button key={item.id} type="button" onClick={()=>toggle(item.id)}
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

/* ── GiraForm ─────────────────────────────────── */
function GiraForm({ form, setForm, error, assoc, setAssoc, allEntidades, allMusicas, allRotinas }) {
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
        <textarea style={{...S.input,resize:'vertical',minHeight:72}} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Descrição da gira..." onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={S.label}>Instruções</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:72}} value={form.instrucoes} onChange={e=>setForm(f=>({...f,instrucoes:e.target.value}))} placeholder="O que os participantes devem trazer / fazer..." onFocus={focus} onBlur={blur}/>
      </div>
      <div style={S.divider}/>
      <div style={S.sectionTitle}>Vínculos</div>
      <MultiSelect label="Orixás / Entidades" Icon={Users} allItems={allEntidades} selectedIds={assoc.entidades} onChange={v=>setAssoc(a=>({...a,entidades:v}))} nameKey="nome"/>
      <MultiSelect label="Músicas / Pontos"   Icon={Music} allItems={allMusicas}   selectedIds={assoc.musicas}   onChange={v=>setAssoc(a=>({...a,musicas:v}))}   nameKey="titulo"/>
      <MultiSelect label="Rotinas"            Icon={ListChecks} allItems={allRotinas} selectedIds={assoc.rotinas} onChange={v=>setAssoc(a=>({...a,rotinas:v}))} nameKey="titulo"/>
    </div>
  )
}

/* ── GiraCard ─────────────────────────────────── */
function GiraCard({ gira, onEdit, onDelete, onStatusChange }) {
  const meta    = STATUS_META[gira.status] || STATUS_META.AGUARDANDO
  const concluida = gira.status === 'CONCLUIDA'
  const dateStr = new Date(gira.data).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})

  return (
    <div style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'18px 20px', marginBottom:10, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', opacity: concluida ? 0.8 : 1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#2c2c3e', marginBottom:6 }}>{gira.titulo}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#9ca3af' }}>
              <Clock size={11}/>{dateStr}
            </span>
            {/* Badge de status */}
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, backgroundColor:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
          {concluida ? (
            <button onClick={()=>onEdit(gira, true)}
              style={{ display:'flex', padding:7, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
              title="Visualizar"
              onMouseEnter={e=>e.currentTarget.style.color='#2563eb'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
              <Eye size={16}/>
            </button>
          ) : (
            <>
              <button onClick={()=>onEdit(gira, false)}
                style={{ display:'flex', padding:7, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                title="Editar"
                onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                <Pencil size={16}/>
              </button>
              <button onClick={()=>onDelete(gira)}
                style={{ display:'flex', padding:7, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                title="Excluir"
                onMouseEnter={e=>e.currentTarget.style.color='#dc2626'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                <Trash2 size={16}/>
              </button>
            </>
          )}
        </div>
      </div>

      {gira.descricao && <p style={{ margin:'0 0 12px', fontSize:13, color:'#6b7280', lineHeight:1.5 }}>{gira.descricao}</p>}

      {/* Rodapé: vínculos + seletor de status */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {gira.entidades?.length>0 && <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}><Users size={10}/>{gira.entidades.length} entidade{gira.entidades.length!==1?'s':''}</span>}
          {gira.musicas?.length>0   && <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}><Music size={10}/>{gira.musicas.length} música{gira.musicas.length!==1?'s':''}</span>}
          {gira.rotinas?.length>0   && <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', color:'#6b7280' }}><ListChecks size={10}/>{gira.rotinas.length} rotina{gira.rotinas.length!==1?'s':''}</span>}
        </div>

        {/* Seletor de status — apenas para não concluídas */}
        {!concluida && (
          <select
            value={gira.status}
            onChange={e => onStatusChange(gira.id, e.target.value)}
            style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:12, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', backgroundColor:'#fff', cursor:'pointer', outline:'none' }}
            onFocus={e=>e.currentTarget.style.borderColor='#c8972b'}
            onBlur={e=>e.currentTarget.style.borderColor='#e5e0d8'}
          >
            <option value="AGUARDANDO">Aguardando</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDA">Concluída</option>
          </select>
        )}
      </div>
    </div>
  )
}

/* ── Página principal ─────────────────────────── */
export default function AdminGiras() {
  const [giras,        setGiras]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filtro,       setFiltro]       = useState('TODOS')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [viewOnly,     setViewOnly]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [form,         setForm]         = useState(emptyForm)
  const [assoc,        setAssoc]        = useState({ entidades:[], musicas:[], rotinas:[] })
  const [saving,       setSaving]       = useState(false)
  const [formError,    setFormError]    = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [allEntidades, setAllEntidades] = useState([])
  const [allMusicas,   setAllMusicas]   = useState([])
  const [allRotinas,   setAllRotinas]   = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/giras/all')
      const list = Array.isArray(r.data) ? r.data : r.data.giras || []
      // Ordenação: mais recentes primeiro (data desc)
      setGiras([...list].sort((a,b) => new Date(b.data) - new Date(a.data)))
    } catch { setGiras([]) } finally { setLoading(false) }
  }

  const loadRelated = async () => {
    const [e,m,r] = await Promise.allSettled([api.get('/entidades'),api.get('/musicas'),api.get('/rotinas')])
    setAllEntidades(e.status==='fulfilled'?(Array.isArray(e.value.data)?e.value.data:[]):[])
    setAllMusicas(m.status==='fulfilled'?(Array.isArray(m.value.data)?m.value.data:[]):[])
    setAllRotinas(r.status==='fulfilled'?(Array.isArray(r.value.data)?r.value.data:[]):[])
  }

  useEffect(() => { load(); loadRelated() }, [])

  const openAdd = () => {
    setEditTarget(null); setViewOnly(false)
    setForm(emptyForm)
    setAssoc({ entidades:[], musicas:[], rotinas: allRotinas.map(r=>r.id) })
    setFormError(''); setModalOpen(true)
  }

  const openEdit = async (g, readOnly=false) => {
    setEditTarget(g); setViewOnly(readOnly)
    setForm({ titulo:g.titulo||'', data:g.data?new Date(g.data).toISOString().split('T')[0]:'', descricao:g.descricao||'', instrucoes:g.instrucoes||'' })
    setAssoc({ entidades:[], musicas:[], rotinas:[] })
    setFormError(''); setModalOpen(true)
    try {
      const r = await api.get(`/giras/${g.id}`)
      setAssoc({
        entidades: r.data.entidades?.map(e=>e.entidadeId)||[],
        musicas:   r.data.musicas?.map(m=>m.musicaId)||[],
        rotinas:   r.data.rotinas?.map(r=>r.rotinaId)||[],
      })
    } catch {}
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    if (!form.data)          { setFormError('Data é obrigatória.');   return }
    setSaving(true); setFormError('')
    try {
      const payload = { ...form, ...assoc }
      editTarget ? await api.put(`/giras/${editTarget.id}`, payload) : await api.post('/giras', payload)
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.error || 'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/giras/${deleteTarget.id}`); load() } catch {}
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/giras/${id}/status`, { status })
      setGiras(prev => prev.map(g => g.id === id ? { ...g, status } : g))
    } catch {}
  }

  const emAndamento = giras.filter(g => g.status === 'EM_ANDAMENTO')
  const aguardando  = giras.filter(g => g.status === 'AGUARDANDO')
  const concluidas  = giras.filter(g => g.status === 'CONCLUIDA')

  const FILTROS = [
    { id:'TODOS',        label:'Todas',        count: giras.length },
    { id:'EM_ANDAMENTO', label:'Em andamento', count: emAndamento.length },
    { id:'AGUARDANDO',   label:'Aguardando',   count: aguardando.length },
    { id:'CONCLUIDA',    label:'Concluídas',   count: concluidas.length },
  ]

  const girasVisiveis = filtro === 'TODOS' ? giras : giras.filter(g => g.status === filtro)

  const sectionLabel = (txt, cor='#c8972b') => (
    <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:cor, marginBottom:14 }}>{txt}</div>
  )

  return (
    <div style={S.page}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Giras</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>
            {emAndamento.length} em andamento · {aguardando.length} aguardando · {concluidas.length} concluída(s)
          </p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
        {FILTROS.map(f => (
          <button key={f.id} onClick={()=>setFiltro(f.id)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:6, fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", cursor:'pointer', transition:'all 0.15s', border: filtro===f.id ? '1px solid #c8972b' : '1px solid #e5e0d8', backgroundColor: filtro===f.id ? 'rgba(200,151,43,0.08)' : '#fff', color: filtro===f.id ? '#c8972b' : '#6b7280' }}>
            {f.label}
            <span style={{ fontSize:11, fontWeight:700, padding:'1px 6px', borderRadius:10, backgroundColor: filtro===f.id ? '#c8972b' : '#f0ece5', color: filtro===f.id ? '#fff' : '#9ca3af' }}>{f.count}</span>
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner/> : girasVisiveis.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Calendar size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>{giras.length===0 ? 'Nenhuma gira cadastrada.' : 'Nenhuma gira neste filtro.'}</p>
        </div>
      ) : filtro !== 'TODOS' ? (
        <div>{girasVisiveis.map(g=><GiraCard key={g.id} gira={g} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={handleStatusChange}/>)}</div>
      ) : (
        <>
          {emAndamento.length>0 && (
            <section style={{ marginBottom:28 }}>
              {sectionLabel('Em andamento', '#2563eb')}
              {emAndamento.map(g=><GiraCard key={g.id} gira={g} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={handleStatusChange}/>)}
            </section>
          )}
          {aguardando.length>0 && (
            <section style={{ marginBottom:28 }}>
              {sectionLabel('Aguardando', '#c8972b')}
              {aguardando.map(g=><GiraCard key={g.id} gira={g} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={handleStatusChange}/>)}
            </section>
          )}
          {concluidas.length>0 && (
            <section>
              {sectionLabel('Concluídas', '#9ca3af')}
              {concluidas.map(g=><GiraCard key={g.id} gira={g} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={handleStatusChange}/>)}
            </section>
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen} onClose={()=>setModalOpen(false)}
        title={viewOnly ? `Visualizar: ${editTarget?.titulo}` : editTarget ? 'Editar Gira' : 'Nova Gira'}
        footer={viewOnly ? (
          <button style={S.btnSecondary} onClick={()=>setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>Fechar</button>
        ) : (<>
          <button style={S.btnSecondary} onClick={()=>setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>Cancelar</button>
          <button style={{...S.btnPrimary,opacity:saving?0.7:1}} onClick={handleSave} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving?'Salvando...':'Salvar'}
          </button>
        </>)}
      >
        <GiraForm
          form={form} setForm={viewOnly ? ()=>{} : setForm}
          error={formError}
          assoc={assoc} setAssoc={viewOnly ? ()=>{} : setAssoc}
          allEntidades={allEntidades} allMusicas={allMusicas} allRotinas={allRotinas}
        />
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Gira" message={`Excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
