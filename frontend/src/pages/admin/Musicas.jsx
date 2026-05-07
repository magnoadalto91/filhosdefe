import { useEffect, useState } from 'react'
import { Music, Plus, Search, Pencil, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

/* ─── shared styles ─────────────────────────── */
const S = {
  page:    { fontFamily:"'Poppins',sans-serif" },
  label:   { display:'block', fontSize:12, fontWeight:600, color:'#2c2c3e', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  input:   { width:'100%', padding:'11px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:14, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s', backgroundColor:'#fff' },
  btnPrimary: { padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'#c8972b', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'background 0.15s' },
  btnSecondary: { padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'transparent', color:'#6b7280', border:'1px solid #e5e0d8', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' },
  card:    { display:'flex', alignItems:'center', gap:14, padding:'16px 18px', backgroundColor:'#fff', borderRadius:8, border:'1px solid #e5e0d8', marginBottom:8 },
  error:   { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:6, backgroundColor:'#fef2f2', border:'1px solid #fecaca', fontSize:13, color:'#dc2626', marginBottom:16 },
}

const emptyForm = { titulo:'', letra:'', youtubeUrl:'' }

function MusicForm({ form, setForm, error }) {
  const focus = (e) => e.currentTarget.style.borderColor = '#c8972b'
  const blur  = (e) => e.currentTarget.style.borderColor = '#e5e0d8'
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Título *</label>
        <input style={S.input} value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Nome da música" onFocus={focus} onBlur={blur}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Letra</label>
        <textarea style={{...S.input, resize:'vertical', minHeight:140}} value={form.letra} onChange={e=>setForm(f=>({...f,letra:e.target.value}))} placeholder="Letra da música..." onFocus={focus} onBlur={blur}/>
      </div>
      <div>
        <label style={S.label}>URL do YouTube</label>
        <input style={S.input} value={form.youtubeUrl} onChange={e=>setForm(f=>({...f,youtubeUrl:e.target.value}))} placeholder="https://youtube.com/..." onFocus={focus} onBlur={blur}/>
      </div>
    </div>
  )
}

export default function AdminMusicas() {
  const [musicas,     setMusicas]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,setDeleteTarget]= useState(null)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/musicas'); setMusicas(Array.isArray(r.data) ? r.data : r.data.musicas||[]) }
    catch { setMusicas([]) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  const openAdd  = () => { setEditTarget(null); setForm(emptyForm); setFormError(''); setModalOpen(true) }
  const openEdit = m  => { setEditTarget(m); setForm({titulo:m.titulo||'',letra:m.letra||'',youtubeUrl:m.youtubeUrl||''}); setFormError(''); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      editTarget ? await api.put(`/musicas/${editTarget.id}`,form) : await api.post('/musicas',form)
      setModalOpen(false); load()
    } catch(err) { setFormError(err.response?.data?.message||'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/musicas/${deleteTarget.id}`); load() } catch{}
  }

  const filtered = musicas.filter(m => m.titulo?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={S.page}>

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
      <div style={{ position:'relative', marginBottom:20 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }}/>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Buscar música..."
          style={{...S.input, paddingLeft:42}}
          onFocus={e=>e.currentTarget.style.borderColor='#c8972b'}
          onBlur={e=>e.currentTarget.style.borderColor='#e5e0d8'}
        />
      </div>

      {/* List */}
      {loading ? <LoadingSpinner/> : filtered.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 0', gap:12 }}>
          <Music size={44} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma música encontrada.</p>
        </div>
      ) : (
        <div>
          {filtered.map(m => (
            <div key={m.id} style={S.card}>
              <div style={{ width:42, height:42, borderRadius:8, backgroundColor:'rgba(124,58,237,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Music size={18} color="#7C3AED"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.titulo}</div>
                {m.letra && <div style={{ fontSize:12, color:'#9ca3af', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.letra.slice(0,70)}...</div>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                {m.youtubeUrl && (
                  <a href={m.youtubeUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', padding:8, borderRadius:6, color:'#9ca3af', transition:'color 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#dc2626'}
                    onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                    <ExternalLink size={16}/>
                  </a>
                )}
                <button onClick={()=>openEdit(m)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                  <Pencil size={16}/>
                </button>
                <button onClick={()=>setDeleteTarget(m)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#dc2626'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
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
          <button style={{...S.btnPrimary,opacity:saving?.7:1}} onClick={handleSave} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving?'Salvando...':'Salvar'}
          </button>
        </>}
      >
        <MusicForm form={form} setForm={setForm} error={formError}/>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Música" message={`Excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}/>
    </div>
  )
}
