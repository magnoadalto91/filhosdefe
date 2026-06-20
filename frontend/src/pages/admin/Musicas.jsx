import { useEffect, useState } from 'react'
import { Music, Search, Pencil, Trash2, AlertCircle, Youtube, Save } from 'lucide-react'
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

const emptyForm = { titulo:'', letra:'', agregadorId:'' }

function MusicForm({ form, setForm, error, agregadores }) {
  const focus = e => e.currentTarget.style.borderColor = '#c8972b'
  const blur  = e => e.currentTarget.style.borderColor = '#e5e0d8'
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}

      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Título *</label>
        <input style={S.input} value={form.titulo}
          onChange={e=>setForm(f=>({...f,titulo:e.target.value}))}
          placeholder="Nome da música" onFocus={focus} onBlur={blur}/>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Agregador</label>
        <select style={{...S.input, cursor:'pointer'}} value={form.agregadorId}
          onChange={e=>setForm(f=>({...f,agregadorId:e.target.value}))}
          onFocus={focus} onBlur={blur}>
          <option value="">— Sem agregador —</option>
          {agregadores.map(a => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Letra</label>
        <textarea style={{...S.input, resize:'vertical', minHeight:140}} value={form.letra}
          onChange={e=>setForm(f=>({...f,letra:e.target.value}))}
          placeholder="Letra da música..." onFocus={focus} onBlur={blur}/>
      </div>

    </div>
  )
}

export default function AdminMusicas() {
  const [musicas,      setMusicas]      = useState([])
  const [agregadores,  setAgregadores]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [playlistUrl,  setPlaylistUrl]  = useState('')
  const [savingUrl,    setSavingUrl]    = useState(false)
  const [urlSaved,     setUrlSaved]     = useState(false)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [showBulkConfirm,setShowBulkConfirm]= useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [mr, ar, pr] = await Promise.all([api.get('/musicas'), api.get('/agregadores'), api.get('/notificacoes/playlist')])
      setMusicas(Array.isArray(mr.data) ? mr.data : [])
      setAgregadores(Array.isArray(ar.data) ? ar.data : [])
      setPlaylistUrl(pr.data?.playlistUrl || '')
    } catch { setMusicas([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const savePlaylist = async () => {
    setSavingUrl(true); setUrlSaved(false)
    try {
      await api.put('/notificacoes/config', { playlistUrl: playlistUrl.trim() || null })
      setUrlSaved(true)
      setTimeout(() => setUrlSaved(false), 3000)
    } catch {}
    finally { setSavingUrl(false) }
  }

  const openAdd  = () => { setEditTarget(null); setForm(emptyForm); setFormError(''); setModalOpen(true) }
  const openEdit = m  => {
    setEditTarget(m)
    setForm({ titulo: m.titulo||'', letra: m.letra||'', agregadorId: m.agregadorId ? String(m.agregadorId) : '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const payload = { titulo: form.titulo, letra: form.letra, agregadorId: form.agregadorId || null }
      editTarget ? await api.put(`/musicas/${editTarget.id}`, payload) : await api.post('/musicas', payload)
      setModalOpen(false); load()
    } catch (err) { setFormError(err.response?.data?.error || 'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/musicas/${deleteTarget.id}`); load() } catch {}
  }

  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(m=>m.id)))
  const handleBulkDelete = async () => {
    try { await Promise.all([...selectedIds].map(id => api.delete(`/musicas/${id}`))); setSelectedIds(new Set()); load() } catch{}
  }

  const filtered = musicas.filter(m => m.titulo?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={S.page}>

      {/* Playlist do terreiro */}
      <div style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'18px 20px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <Youtube size={16} color="#dc2626"/>
          <span style={{ fontSize:13, fontWeight:700, color:'#2c2c3e' }}>Playlist do Terreiro</span>
          <span style={{ fontSize:12, color:'#9ca3af' }}>— link exibido no topo das músicas para os usuários</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input
            value={playlistUrl}
            onChange={e => setPlaylistUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            style={{...S.input, flex:1}}
            onFocus={e=>e.currentTarget.style.borderColor='#c8972b'}
            onBlur={e=>e.currentTarget.style.borderColor='#e5e0d8'}
          />
          <button onClick={savePlaylist} disabled={savingUrl}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:6, fontSize:13, fontWeight:600, backgroundColor: savingUrl ? '#e5e0d8' : '#c8972b', color:'#fff', border:'none', cursor: savingUrl ? 'not-allowed' : 'pointer', fontFamily:"'Poppins',sans-serif", flexShrink:0, transition:'background 0.15s' }}
            onMouseEnter={e=>{ if(!savingUrl) e.currentTarget.style.backgroundColor='#a67a20' }}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor= savingUrl ? '#e5e0d8' : '#c8972b'}>
            <Save size={14}/>{savingUrl ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        {urlSaved && <p style={{ margin:'6px 0 0', fontSize:12, color:'#16a34a', fontWeight:600 }}>Link salvo com sucesso!</p>}
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Músicas</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{musicas.length} ponto(s) cantado(s)</p>
        </div>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Adicionar
        </button>
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar música..."
          style={{...S.input, paddingLeft:42}}
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

      {/* List */}
      {loading ? <LoadingSpinner/> : filtered.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Music size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma música encontrada.</p>
        </div>
      ) : (
        <div>
          {filtered.map(m => (
            <div key={m.id} style={{ ...S.card, border: selectedIds.has(m.id)?'1px solid #c8972b':'1px solid #e5e0d8', backgroundColor: selectedIds.has(m.id)?'#fef9f0':'#fff' }}>
              <input type="checkbox" checked={selectedIds.has(m.id)} onChange={()=>toggleSelect(m.id)} style={{ width:16, height:16, cursor:'pointer', accentColor:'#c8972b', flexShrink:0 }}/>
              <div style={{ width:42, height:42, borderRadius:8, backgroundColor:'rgba(200,151,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Music size={18} color="#c8972b"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.titulo}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                  {m.agregador && (
                    <span style={{ fontSize:11, fontWeight:600, color:'#c8972b', backgroundColor:'rgba(200,151,43,0.1)', padding:'1px 8px', borderRadius:20 }}>
                      {m.agregador.nome}
                    </span>
                  )}
                  {m.letra && <span style={{ fontSize:12, color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.letra.slice(0,60)}...</span>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                <button onClick={() => openEdit(m)}
                  style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'}
                  onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                  <Pencil size={16}/>
                </button>
                <button onClick={() => setDeleteTarget(m)}
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

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Música':'Nova Música'}
        footer={<>
          <button style={S.btnSecondary} onClick={()=>setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
            Cancelar
          </button>
          <button style={{...S.btnPrimary, opacity:saving?0.7:1}} onClick={handleSave} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving?'Salvando...':'Salvar'}
          </button>
        </>}
      >
        <MusicForm form={form} setForm={setForm} error={formError} agregadores={agregadores}/>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Música" message={`Excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}/>
      <ConfirmModal isOpen={showBulkConfirm} onClose={()=>setShowBulkConfirm(false)} onConfirm={handleBulkDelete}
        title="Excluir Músicas" message={`Excluir ${selectedIds.size} música(s) selecionada(s)? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
