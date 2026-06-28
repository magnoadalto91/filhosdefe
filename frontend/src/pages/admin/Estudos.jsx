import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  BookOpen, FileText, Trash2, AlertCircle, ImageIcon,
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  FileUp, Download, Pencil, X, Users,
} from 'lucide-react'
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
  card:         { backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', marginBottom:10 },
}

const focus = e => e.currentTarget.style.borderColor = '#c8972b'
const blur  = e => e.currentTarget.style.borderColor = '#e5e0d8'

/* ── Toolbar TipTap ────────────────────────────────────────── */
function Toolbar({ editor, onImageUpload }) {
  if (!editor) return null
  const btn = (active, action, title, Icon) => (
    <button type="button" title={title} onClick={action}
      style={{ display:'flex', padding:'6px 8px', borderRadius:4, border:'none', cursor:'pointer', backgroundColor: active ? 'rgba(200,151,43,0.15)' : 'transparent', color: active ? '#c8972b' : '#6b7280', transition:'all 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.backgroundColor='rgba(200,151,43,0.1)'}
      onMouseLeave={e=>e.currentTarget.style.backgroundColor=active?'rgba(200,151,43,0.15)':'transparent'}>
      <Icon size={15}/>
    </button>
  )
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:2, padding:'8px 10px', borderBottom:'1px solid #e5e0d8', backgroundColor:'#f8f5f0', borderRadius:'8px 8px 0 0', alignItems:'center' }}>
      {btn(editor.isActive('bold'),       ()=>editor.chain().focus().toggleBold().run(),          'Negrito',       Bold)}
      {btn(editor.isActive('italic'),     ()=>editor.chain().focus().toggleItalic().run(),        'Itálico',       Italic)}
      <div style={{ width:1, height:24, backgroundColor:'#e5e0d8', margin:'0 4px', alignSelf:'center' }}/>
      {btn(editor.isActive('heading',{level:2}), ()=>editor.chain().focus().toggleHeading({level:2}).run(), 'Título 2', Heading2)}
      {btn(editor.isActive('heading',{level:3}), ()=>editor.chain().focus().toggleHeading({level:3}).run(), 'Título 3', Heading3)}
      <div style={{ width:1, height:24, backgroundColor:'#e5e0d8', margin:'0 4px', alignSelf:'center' }}/>
      {btn(editor.isActive('bulletList'),  ()=>editor.chain().focus().toggleBulletList().run(),  'Lista',         List)}
      {btn(editor.isActive('orderedList'), ()=>editor.chain().focus().toggleOrderedList().run(), 'Lista Numerada',ListOrdered)}
      <div style={{ width:1, height:24, backgroundColor:'#e5e0d8', margin:'0 4px', alignSelf:'center' }}/>
      <button type="button" onClick={onImageUpload}
        style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:4, border:'1px solid #e5e0d8', cursor:'pointer', backgroundColor:'transparent', color:'#6b7280', fontSize:12, fontWeight:600, fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
        onMouseEnter={e=>{e.currentTarget.style.backgroundColor='rgba(200,151,43,0.1)';e.currentTarget.style.color='#c8972b';e.currentTarget.style.borderColor='#c8972b'}}
        onMouseLeave={e=>{e.currentTarget.style.backgroundColor='transparent';e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#e5e0d8'}}>
        Upload de imagens
      </button>
    </div>
  )
}

/* ── Publicação Form ────────────────────────────────────────── */
function PubForm({ form, setForm, error, preview, setPreview, fileRef, editor, uploading, onImageClick, onRemoveCover,
                   arquivoRef, arquivoFile, setArquivoFile, existingArquivo, onRemoveArquivo }) {
  const inputRef = useRef()
  return (
    <div>
      {error && <div style={S.error}><AlertCircle size={15}/>{error}</div>}

      {/* Capa */}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Imagem de capa</label>
        <div style={{ position:'relative' }}>
          <div style={{ width:'100%', height:120, borderRadius:8, border:'2px dashed #e5e0d8', overflow:'hidden', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f8f5f0', position:'relative', transition:'border-color 0.2s' }}
            onClick={()=>inputRef.current?.click()}
            onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
            {preview
              ? <img src={preview} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }}/>
              : <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <BookOpen size={28} color="#e5e0d8"/>
                  <span style={{ fontSize:12, color:'#9ca3af' }}>Clique para selecionar capa</span>
                </div>}
          </div>
          {preview && (
            <button type="button" onClick={e => { e.stopPropagation(); onRemoveCover() }}
              style={{ position:'absolute', top:6, right:6, width:24, height:24, borderRadius:'50%', border:'none', cursor:'pointer', backgroundColor:'rgba(0,0,0,0.55)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor='rgba(220,38,38,0.85)'}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0.55)'}>
              <X size={13}/>
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
          const f = e.target.files[0]; if(!f) return
          fileRef.current = f
          setPreview(URL.createObjectURL(f))
        }}/>
      </div>

      {/* Título */}
      <div style={{ marginBottom:16 }}>
        <label style={S.label}>Título *</label>
        <input style={S.input} value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Título da publicação" onFocus={focus} onBlur={blur}/>
      </div>

      {/* Editor */}
      <div style={{ marginBottom:4 }}>
        <label style={S.label}>Conteúdo</label>
      </div>
      <div style={{ border:'1px solid #e5e0d8', borderRadius:8, overflow:'hidden', minHeight:240 }}>
        <Toolbar editor={editor} onImageUpload={onImageClick}/>
        <EditorContent editor={editor} style={{ padding:'14px 16px', minHeight:200, fontSize:14, lineHeight:1.7, color:'#2c2c3e', outline:'none' }}/>
      </div>
      {uploading && <p style={{ margin:'6px 0 0', fontSize:12, color:'#9ca3af' }}>Enviando imagem...</p>}

      {/* Arquivo anexo */}
      <div style={{ marginTop:20 }}>
        <label style={S.label}>Arquivo anexo (PDF ou imagem)</label>
        {existingArquivo && !arquivoFile ? (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', border:'1px solid #e5e0d8', borderRadius:6, backgroundColor:'#f8f5f0' }}>
            <FileText size={15} color="#c8972b"/>
            <span style={{ flex:1, fontSize:13, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{existingArquivo}</span>
            <button type="button" onClick={onRemoveArquivo}
              style={{ display:'flex', padding:4, border:'none', background:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#dc2626'}
              onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
              <X size={14}/>
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ flex:1, padding:'10px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:13, color: arquivoFile ? '#2c2c3e' : '#9ca3af', backgroundColor:'#fff', cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
              onClick={()=>arquivoRef.current?.click()}>
              {arquivoFile ? arquivoFile.name : 'Clique para selecionar (PDF ou imagem)'}
            </div>
            <button type="button" onClick={()=>arquivoRef.current?.click()}
              style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderRadius:6, border:'1px solid #e5e0d8', color:'#6b7280', backgroundColor:'#fff', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
              <FileUp size={14}/>
            </button>
          </div>
        )}
        <input ref={arquivoRef} type="file" accept=".pdf,image/*" style={{ display:'none' }} onChange={e => {
          const f = e.target.files[0]; if(!f) return
          setArquivoFile(f)
        }}/>
        {arquivoFile && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
            <FileText size={13} color="#c8972b"/>
            <span style={{ fontSize:12, color:'#6b7280' }}>{arquivoFile.name}</span>
            <button type="button" onClick={()=>setArquivoFile(null)}
              style={{ display:'flex', border:'none', background:'none', cursor:'pointer', color:'#9ca3af', padding:2 }}>
              <X size={12}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Publicações ────────────────────────────────────────────── */
function PublicacoesTab() {
  const [list,        setList]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [form,        setForm]        = useState({ titulo:'' })
  const [preview,     setPreview]     = useState('')
  const [removeCapa,  setRemoveCapa]  = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [showBulkConfirm,setShowBulkConfirm]= useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [arquivoFile,    setArquivoFile]    = useState(null)
  const [existingArquivo,setExistingArquivo]= useState('')
  const [removeArquivo,  setRemoveArquivo]  = useState(false)
  const fileRef    = useRef(null)
  const imgInput   = useRef(null)
  const arquivoRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: 'Escreva o conteúdo da publicação aqui...' }),
    ],
    content: '',
  })

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/publicacoes/all'); setList(Array.isArray(r.data)?r.data:[]) }
    catch { setList([]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditTarget(null); setForm({ titulo:'' }); setPreview(''); fileRef.current=null; setRemoveCapa(false)
    setArquivoFile(null); setExistingArquivo(''); setRemoveArquivo(false)
    editor?.commands.setContent(''); setFormError(''); setModalOpen(true)
  }
  const openEdit = async (item) => {
    setEditTarget(item); setForm({ titulo:item.titulo }); setPreview(item.capaUrl||''); fileRef.current=null; setRemoveCapa(false)
    setArquivoFile(null); setExistingArquivo(''); setRemoveArquivo(false); setFormError(''); setModalOpen(true)
    try {
      const r = await api.get(`/publicacoes/${item.id}`)
      editor?.commands.setContent(r.data.conteudo||'')
      setExistingArquivo(r.data.arquivoNome || (r.data.arquivoUrl ? 'Arquivo existente' : ''))
    } catch {}
  }

  const handleImageUpload = async (file) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('foto', file)
      const r = await api.post('/publicacoes/image', fd)
      editor?.chain().focus().setImage({ src: r.data.url }).run()
    } catch { alert('Erro ao enviar imagem.') }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('titulo', form.titulo.trim())
      fd.append('conteudo', editor?.getHTML() || '')
      fd.append('publicado', 'true')
      if (fileRef.current) fd.append('foto', fileRef.current)
      else if (removeCapa) fd.append('removeCapa', 'true')
      if (arquivoFile) fd.append('arquivo', arquivoFile)
      else if (removeArquivo) fd.append('removeArquivo', 'true')
      editTarget ? await api.put(`/publicacoes/${editTarget.id}`, fd) : await api.post('/publicacoes', fd)
      setModalOpen(false); load()
    } catch (err) { setFormError(err.response?.data?.error || 'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/publicacoes/${deleteTarget.id}`); load() } catch {}
  }

  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === list.length ? new Set() : new Set(list.map(i=>i.id)))
  const handleBulkDelete = async () => {
    try { await Promise.all([...selectedIds].map(id => api.delete(`/publicacoes/${id}`))); setSelectedIds(new Set()); load() } catch{}
  }

  const fmt = iso => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })

  return (
    <>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button onClick={openAdd} style={S.btnPrimary}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='#a67a20'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          + Nova Publicação
        </button>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:'#fef3cd', borderRadius:8, marginBottom:16, border:'1px solid #f9d971' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', flex:1 }}>{selectedIds.size} selecionada(s)</span>
          <button onClick={toggleAll} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size===list.length?'Desmarcar todos':'Selecionar todos'}</button>
          <button onClick={()=>setShowBulkConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, backgroundColor:'#dc2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>Excluir {selectedIds.size}</button>
        </div>
      )}

      {loading ? <LoadingSpinner/> : list.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 0', gap:10 }}>
          <BookOpen size={40} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhuma publicação criada.</p>
        </div>
      ) : list.map(item => (
        <div key={item.id} style={{ ...S.card, border: selectedIds.has(item.id)?'1px solid #c8972b':'1px solid #e5e0d8' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
            <input type="checkbox" checked={selectedIds.has(item.id)} onChange={()=>toggleSelect(item.id)} style={{ cursor:'pointer', accentColor:'#c8972b', flexShrink:0, width:16, height:16 }}/>
            {item.capaUrl
              ? <img src={item.capaUrl} alt="" style={{ width:56, height:56, borderRadius:6, objectFit:'cover', flexShrink:0 }}/>
              : <div style={{ width:56, height:56, borderRadius:6, backgroundColor:'#f8f5f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><BookOpen size={22} color="#e5e0d8"/></div>}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.titulo}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <span style={{ fontSize:12, color:'#9ca3af' }}>{fmt(item.createdAt)}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              <button onClick={()=>openEdit(item)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#2c2c3e'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}><Pencil size={16}/></button>
              <button onClick={()=>setDeleteTarget(item)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#dc2626'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}><Trash2 size={16}/></button>
            </div>
          </div>
        </div>
      ))}

      {/* Input hidden para imagem no editor */}
      <input ref={imgInput} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(f) handleImageUpload(f); e.target.value='' }}/>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?'Editar Publicação':'Nova Publicação'}
        footer={<>
          <button style={S.btnSecondary} onClick={()=>setModalOpen(false)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2c2c3e';e.currentTarget.style.color='#2c2c3e'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>Cancelar</button>
          <button style={{...S.btnPrimary,opacity:saving?0.7:1}} onClick={handleSave} disabled={saving}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
            {saving?'Salvando...':'Salvar'}
          </button>
        </>}
      >
        <PubForm form={form} setForm={setForm} error={formError} preview={preview} setPreview={setPreview}
          fileRef={fileRef} editor={editor} uploading={uploading} onImageClick={()=>imgInput.current?.click()}
          onRemoveCover={() => { setPreview(''); fileRef.current = null; setRemoveCapa(true) }}
          arquivoRef={arquivoRef} arquivoFile={arquivoFile} setArquivoFile={setArquivoFile}
          existingArquivo={removeArquivo ? '' : existingArquivo}
          onRemoveArquivo={() => { setExistingArquivo(''); setArquivoFile(null); setRemoveArquivo(true) }}/>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Publicação" message={`Excluir "${deleteTarget?.titulo}"?`}/>
      <ConfirmModal isOpen={showBulkConfirm} onClose={()=>setShowBulkConfirm(false)} onConfirm={handleBulkDelete}
        title="Excluir Publicações" message={`Excluir ${selectedIds.size} publicação(ões) selecionada(s)? Esta ação não pode ser desfeita.`}/>
    </>
  )
}

/* ── Documentos ─────────────────────────────────────────────── */
const EXT_ICON = { pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', ppt:'📋', pptx:'📋', txt:'📃' }
const fmtSize  = b => b >= 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`

function LeiturasModal({ doc, onClose }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const fmt = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'

  useEffect(() => {
    if (!doc) return
    setLoading(true)
    api.get(`/documentos/${doc.id}/leituras`)
      .then(r => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [doc])

  if (!doc) return null
  return (
    <Modal isOpen={!!doc} onClose={onClose} title={`Acessos — ${doc.nome}`}>
      {loading ? <LoadingSpinner/> : list.length === 0 ? (
        <p style={{ textAlign:'center', color:'#9ca3af', fontSize:14, padding:'24px 0' }}>Nenhum usuário acessou ainda.</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {/* Legenda */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'8px 14px', borderRadius:8, backgroundColor:'#f8f5f0', marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px' }}>Usuário</span>
            <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center' }}>Abriu</span>
            <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center' }}>Última página</span>
          </div>
          {list.map(l => (
            <div key={l.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, alignItems:'center', padding:'10px 14px', borderRadius:8, backgroundColor:'#fff', border:'1px solid #e5e0d8' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.user.nome || l.user.email}</div>
                <div style={{ fontSize:11, color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.user.email}</div>
              </div>
              <div style={{ fontSize:11, color:'#6b7280', textAlign:'center' }}>{fmt(l.aberturaEm)}</div>
              <div style={{ fontSize:11, textAlign:'center', color: l.concluidoEm ? '#16a34a' : '#9ca3af', fontWeight: l.concluidoEm ? 600 : 400 }}>
                {l.concluidoEm ? fmt(l.concluidoEm) : 'Não concluiu'}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

function DocumentosTab() {
  const [list,           setList]           = useState([])
  const [loading,        setLoading]        = useState(true)
  const [uploading,      setUploading]      = useState(false)
  const [formError,      setFormError]      = useState('')
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [showBulkConfirm,setShowBulkConfirm]= useState(false)
  const [leiturasDoc,    setLeiturasDoc]    = useState(null)
  const [nome,        setNome]        = useState('')
  const [descricao,   setDescricao]   = useState('')
  const [file,        setFile]        = useState(null)
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/documentos'); setList(Array.isArray(r.data)?r.data:[]) }
    catch { setList([]) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleUpload = async () => {
    if (!file)        { setFormError('Selecione um arquivo.'); return }
    if (!nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setUploading(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('nome', nome.trim())
      fd.append('descricao', descricao.trim())
      await api.post('/documentos', fd)
      setNome(''); setDescricao(''); setFile(null); fileRef.current.value=''
      load()
    } catch (err) { setFormError(err.response?.data?.error || 'Erro ao enviar.') }
    finally { setUploading(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/documentos/${deleteTarget.id}`); load() } catch {}
  }

  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === list.length ? new Set() : new Set(list.map(d=>d.id)))
  const handleBulkDelete = async () => {
    try { await Promise.all([...selectedIds].map(id => api.delete(`/documentos/${id}`))); setSelectedIds(new Set()); load() } catch{}
  }

  const fmt = iso => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })

  return (
    <>
      {/* Upload form */}
      <div style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'18px 20px', marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b', marginBottom:14 }}>Enviar novo documento</div>
        {formError && <div style={S.error}><AlertCircle size={15}/>{formError}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={S.label}>Nome *</label>
            <input style={S.input} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do documento" onFocus={focus} onBlur={blur}/>
          </div>
          <div>
            <label style={S.label}>Descrição</label>
            <input style={S.input} value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Breve descrição (opcional)" onFocus={focus} onBlur={blur}/>
          </div>
          <div>
            <label style={S.label}>Arquivo *</label>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ flex:1, padding:'10px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:13, color: file ? '#2c2c3e' : '#9ca3af', backgroundColor:'#fff', cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                onClick={()=>fileRef.current?.click()}>
                {file ? file.name : 'Clique para selecionar (PDF ou imagem)'}
              </div>
              <button onClick={()=>fileRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:13, fontWeight:600, color:'#6b7280', backgroundColor:'#fff', cursor:'pointer', fontFamily:"'Poppins',sans-serif", flexShrink:0, transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
                <FileUp size={14}/>
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,image/*" style={{ display:'none' }} onChange={e=>setFile(e.target.files[0]||null)}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={handleUpload} disabled={uploading} style={{...S.btnPrimary, opacity:uploading?0.7:1, display:'flex', alignItems:'center', gap:8}}
              onMouseEnter={e=>{if(!uploading)e.currentTarget.style.backgroundColor='#a67a20'}}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
              <FileUp size={15}/>{uploading ? 'Enviando...' : 'Enviar documento'}
            </button>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:'#fef3cd', borderRadius:8, marginBottom:16, border:'1px solid #f9d971' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', flex:1 }}>{selectedIds.size} selecionado(s)</span>
          <button onClick={toggleAll} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size===list.length?'Desmarcar todos':'Selecionar todos'}</button>
          <button onClick={()=>setShowBulkConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, backgroundColor:'#dc2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>Excluir {selectedIds.size}</button>
        </div>
      )}

      {/* Lista */}
      {loading ? <LoadingSpinner/> : list.length===0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 0', gap:10 }}>
          <FileText size={40} color="#e5e0d8"/>
          <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Nenhum documento enviado.</p>
        </div>
      ) : list.map(doc => (
        <div key={doc.id} style={{ ...S.card, border: selectedIds.has(doc.id)?'1px solid #c8972b':'1px solid #e5e0d8' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
            <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={()=>toggleSelect(doc.id)} style={{ cursor:'pointer', accentColor:'#c8972b', flexShrink:0, width:16, height:16 }}/>
            <div style={{ fontSize:28, flexShrink:0 }}>{EXT_ICON[doc.fileType] || '📁'}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.nome}</div>
              {doc.descricao && <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{doc.descricao}</div>}
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>
                {doc.fileType.toUpperCase()} · {doc.tamanho ? fmtSize(doc.tamanho) : '—'} · {fmt(doc.createdAt)}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <button onClick={()=>setLeiturasDoc(doc)}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:6, background:'none', border:'1px solid #e5e0d8', cursor:'pointer', color:'#6b7280', fontSize:11, fontWeight:600, fontFamily:"'Poppins',sans-serif", transition:'all 0.15s', whiteSpace:'nowrap' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
                <Users size={12}/>{doc.totalAberturas ?? 0} acesso(s)
              </button>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', padding:8, borderRadius:6, color:'#9ca3af', transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#2563eb'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}>
                <Download size={16}/>
              </a>
              <button onClick={()=>setDeleteTarget(doc)} style={{ display:'flex', padding:8, borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#9ca3af', transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#dc2626'} onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}><Trash2 size={16}/></button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmModal isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Documento" message={`Excluir "${deleteTarget?.nome}"?`}/>
      <ConfirmModal isOpen={showBulkConfirm} onClose={()=>setShowBulkConfirm(false)} onConfirm={handleBulkDelete}
        title="Excluir Documentos" message={`Excluir ${selectedIds.size} documento(s) selecionado(s)? Esta ação não pode ser desfeita.`}/>
      <LeiturasModal doc={leiturasDoc} onClose={()=>setLeiturasDoc(null)}/>
    </>
  )
}

/* ── Página principal ───────────────────────────────────────── */
export default function AdminEstudos() {
  const [tab, setTab] = useState('publicacoes')
  const TABS = [
    { id:'publicacoes', label:'Publicações', Icon: BookOpen },
    { id:'documentos',  label:'Documentos',  Icon: FileText },
  ]

  return (
    <div style={S.page}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Estudos</h1>
        <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Gerencie publicações e documentos para os irmãos</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #e5e0d8', marginBottom:24, gap:4 }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', fontSize:13, fontWeight:600, background:'none', border:'none', borderBottom: tab===id ? '2px solid #c8972b' : '2px solid transparent', color: tab===id ? '#c8972b' : '#6b7280', cursor:'pointer', fontFamily:"'Poppins',sans-serif", marginBottom:'-1px', transition:'color 0.15s' }}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {tab === 'publicacoes' && <PublicacoesTab/>}
      {tab === 'documentos'  && <DocumentosTab/>}

      {/* Estilo do editor */}
      <style>{`
        .ProseMirror { outline: none; min-height: 200px; }
        .ProseMirror p { margin: 0 0 10px; }
        .ProseMirror h2 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; color: #2c2c3e; }
        .ProseMirror h3 { font-size: 17px; font-weight: 700; margin: 14px 0 6px; color: #2c2c3e; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 20px; margin: 0 0 10px; }
        .ProseMirror li { margin-bottom: 4px; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 6px; margin: 8px 0; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  )
}
