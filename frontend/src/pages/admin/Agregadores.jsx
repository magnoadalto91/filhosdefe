import { useEffect, useState } from 'react'
import { Layers, AlertCircle, Pencil, Trash2 } from 'lucide-react'
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
  card:         { display:'flex', alignItems:'center', gap:14, padding:'16px 18px', backgroundColor:'#fff', borderRadius:8, border:'1px solid #e5e0d8', marginBottom:8 },
  error:        { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:6, backgroundColor:'#fef2f2', border:'1px solid #fecaca', fontSize:13, color:'#dc2626', marginBottom:16 },
}

const emptyForm = { nome: '', ordem: '' }

export default function AdminAgregadores() {
  const [list,        setList]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [showBulkConfirm,setShowBulkConfirm]= useState(false)

  const focus = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur  = e => e.currentTarget.style.borderColor = '#e5e0d8'

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/agregadores'); setList(Array.isArray(r.data) ? r.data : []) }
    catch { setList([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditTarget(null); setForm(emptyForm); setFormError(''); setModalOpen(true) }
  const openEdit = a => { setEditTarget(a); setForm({ nome: a.nome, ordem: String(a.ordem ?? '') }); setFormError(''); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const payload = { nome: form.nome.trim(), ordem: form.ordem !== '' ? Number(form.ordem) : 0 }
      editTarget
        ? await api.put(`/agregadores/${editTarget.id}`, payload)
        : await api.post('/agregadores', payload)
      setModalOpen(false); load()
    } catch (err) { setFormError(err.response?.data?.error || 'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/agregadores/${deleteTarget.id}`); load() } catch {}
  }

  const filtered = list
  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(a=>a.id)))
  const handleBulkDelete = async () => {
    try { await Promise.all([...selectedIds].map(id => api.delete(`/agregadores/${id}`))); setSelectedIds(new Set()); load() } catch{}
  }

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Agregadores</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Categorias para agrupar os pontos cantados</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:'#fef3cd', borderRadius:8, marginBottom:16, border:'1px solid #f9d971' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', flex:1 }}>{selectedIds.size} selecionado(s)</span>
          <button onClick={toggleAll} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size===filtered.length?'Desmarcar todos':'Selecionar todos'}</button>
          <button onClick={()=>setShowBulkConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, backgroundColor:'#dc2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>Excluir {selectedIds.size}</button>
        </div>
      )}

      {/* List */}
      {loading ? <LoadingSpinner /> : list.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Layers size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhum agregador cadastrado.</p>
        </div>
      ) : (
        <div>
          {list.map(a => (
            <div key={a.id} style={{ ...S.card, border: selectedIds.has(a.id)?'1px solid #c8972b':'1px solid #e5e0d8', backgroundColor: selectedIds.has(a.id)?'#fef9f0':'#fff' }}>
              <input type="checkbox" checked={selectedIds.has(a.id)} onChange={()=>toggleSelect(a.id)} style={{ width:16, height:16, cursor:'pointer', accentColor:'#c8972b', flexShrink:0 }}/>
              <div style={{ width:42, height:42, borderRadius:8, backgroundColor:'rgba(200,151,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Layers size={18} color="#c8972b"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'#2c2c3e' }}>{a.nome}</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>
                  {a._count?.musicas ?? 0} música(s) · ordem {a.ordem}
                </div>
              </div>
              <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                <button onClick={() => openEdit(a)}
                  style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'}
                  onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                  <Pencil size={16}/>
                </button>
                <button onClick={() => setDeleteTarget(a)}
                  style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#dc2626'}
                  onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Agregador' : 'Novo Agregador'}
        footer={<>
          <button style={S.btnSecondary} onClick={() => setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
            Cancelar
          </button>
          <button style={{...S.btnPrimary, opacity: saving ? 0.7 : 1}} onClick={handleSave} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>}
      >
        {formError && <div style={S.error}><AlertCircle size={15}/>{formError}</div>}
        <div style={{ marginBottom:16 }}>
          <label style={S.label}>Nome *</label>
          <input style={S.input} value={form.nome}
            onChange={e => setForm(f => ({...f, nome: e.target.value}))}
            placeholder="Ex: Abertura, Ogum, Encerramento..."
            onFocus={focus} onBlur={blur}/>
        </div>
        <div>
          <label style={S.label}>Ordem de exibição</label>
          <input style={S.input} type="number" min="0" value={form.ordem}
            onChange={e => setForm(f => ({...f, ordem: e.target.value}))}
            placeholder="0"
            onFocus={focus} onBlur={blur}/>
          <p style={{ margin:'6px 0 0', fontSize:12, color:'#9ca3af' }}>
            Número menor aparece primeiro. Agregadores com a mesma ordem são ordenados por nome.
          </p>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Agregador"
        message={`Excluir "${deleteTarget?.nome}"? As músicas vinculadas perderão o agregador, mas não serão apagadas.`}/>
      <ConfirmModal isOpen={showBulkConfirm} onClose={()=>setShowBulkConfirm(false)} onConfirm={handleBulkDelete}
        title="Excluir Agregadores" message={`Excluir ${selectedIds.size} agregador(es) selecionado(s)? As músicas vinculadas perderão o agregador.`}/>
    </div>
  )
}
