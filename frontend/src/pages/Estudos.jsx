import { useEffect, useState, useCallback } from 'react'
import { BookOpen, FileText, ArrowLeft, Calendar, X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const TABS = [
  { id:'publicacoes', label:'Publicações', Icon: BookOpen },
  { id:'documentos',  label:'Documentos',  Icon: FileText },
]

const EXT_ICON = { pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', ppt:'📋', pptx:'📋', txt:'📃' }
const fmtSize  = b => b >= 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`
const fmtDate  = iso => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

// fl_attachment:nome faz o Cloudinary servir com Content-Disposition: attachment; filename="nome",
// forçando download com o nome correto mesmo dentro do WebView da PWA
const toDownloadUrl = (url, nome) => {
  if (!url) return url
  const safe = nome ? encodeURIComponent(nome.replace(/[/:]/g, '_')) : null
  const flag = safe ? `fl_attachment:${safe}` : 'fl_attachment'
  return url.replace('/upload/', `/upload/${flag}/`)
}

/* ── Publicação modal ─────────────────────────────────────── */
function PubModal({ pub, onClose }) {
  if (!pub) return null
  const Icon = pub.arquivoType === 'pdf' ? FileText : Download
  return (
    <Modal isOpen={!!pub} onClose={onClose} title={pub.titulo}>
      {pub.capaUrl && <img src={pub.capaUrl} alt="" style={{ width:'100%', borderRadius:8, marginBottom:16, objectFit:'cover', maxHeight:220, display:'block' }}/>}
      <p style={{ margin:'0 0 16px', fontSize:12, color:'#9ca3af' }}>{fmtDate(pub.createdAt)}</p>
      <div style={{ fontSize:14, lineHeight:1.8, color:'#2c2c3e' }} dangerouslySetInnerHTML={{ __html: pub.conteudo }}/>
      {pub.arquivoUrl && (
        <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid #e5e0d8' }}>
          <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px', fontFamily:"'Poppins',sans-serif" }}>Arquivo anexo</p>
          <a href={toDownloadUrl(pub.arquivoUrl, pub.arquivoNome)} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:8, border:'1px solid #e5e0d8', backgroundColor:'#f8f5f0', textDecoration:'none', transition:'border-color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='#c8972b'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e0d8'}>
            <Icon size={20} color="#c8972b"/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pub.arquivoNome || 'Arquivo anexo'}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Toque para baixar</div>
            </div>
            <Download size={16} color="#9ca3af"/>
          </a>
        </div>
      )}
      <style>{`
        .pub-content h2 { font-size:20px; font-weight:700; margin:16px 0 8px; }
        .pub-content h3 { font-size:17px; font-weight:700; margin:14px 0 6px; }
        .pub-content ul, .pub-content ol { padding-left:20px; margin-bottom:10px; }
        .pub-content img { max-width:100%; border-radius:6px; margin:8px 0; }
        .pub-content a { color:#c8972b; }
      `}</style>
    </Modal>
  )
}

/* ── Publicações tab ──────────────────────────────────────── */
function PublicacoesTab() {
  const [list,       setList]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)
  const [loadingPub, setLoadingPub] = useState(false)

  useEffect(() => {
    api.get('/publicacoes')
      .then(r => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const open = async (item) => {
    setLoadingPub(true)
    try { const r = await api.get(`/publicacoes/${item.id}`); setSelected(r.data) }
    catch {} finally { setLoadingPub(false) }
  }

  if (loading || loadingPub) return <LoadingSpinner/>
  if (list.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 16px', gap:12 }}>
      <BookOpen size={40} style={{ color:'#e5e0d8' }}/>
      <p style={{ margin:0, fontSize:14, color:'#9ca3af', fontFamily:"'Poppins',sans-serif" }}>Nenhuma publicação disponível.</p>
    </div>
  )

  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {list.map(item => (
          <button key={item.id} onClick={() => open(item)}
            style={{ width:'100%', textAlign:'left', backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', cursor:'pointer', transition:'box-shadow 0.2s', fontFamily:"'Poppins',sans-serif", padding:0 }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'}>
            <div style={{ display:'flex', gap:0 }}>
              {item.capaUrl && (
                <div style={{ width:90, flexShrink:0, overflow:'hidden' }}>
                  <img src={item.capaUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', minHeight:80 }}/>
                </div>
              )}
              <div style={{ flex:1, padding:'14px 16px' }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#2c2c3e', marginBottom:4 }}>{item.titulo}</div>
                {item.conteudo && (
                  <div style={{ fontSize:12, color:'#6b7280', marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.5 }}>
                    {item.conteudo.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#9ca3af' }}>
                  <Calendar size={11}/>{fmtDate(item.createdAt)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <PubModal pub={selected} onClose={() => setSelected(null)}/>
    </>
  )
}

/* ── PDF Viewer ───────────────────────────────────────────── */
function PdfViewer({ doc, onClose, onConcluded }) {
  const [numPages,     setNumPages]     = useState(null)
  const [currentPage,  setCurrentPage]  = useState(1)
  const [pageWidth,    setPageWidth]    = useState(window.innerWidth)
  const [concluded,    setConcluded]    = useState(false)

  useEffect(() => {
    const onResize = () => setPageWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
    if (numPages === 1 && !concluded) {
      setConcluded(true)
      onConcluded()
    }
  }, [concluded, onConcluded])

  const goNext = () => {
    const next = Math.min(currentPage + 1, numPages)
    setCurrentPage(next)
    if (next === numPages && !concluded) {
      setConcluded(true)
      onConcluded()
    }
  }

  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1))

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', flexDirection:'column', backgroundColor:'#1c1c2e' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', backgroundColor:'#2c2c3e', flexShrink:0 }}>
        <button onClick={onClose}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:8, background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', color:'#fff', flexShrink:0 }}>
          <X size={18}/>
        </button>
        <span style={{ fontSize:14, fontWeight:600, color:'#fff', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'Poppins',sans-serif" }}>
          {doc.nome}
        </span>
        {numPages && (
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', flexShrink:0, fontFamily:"'Poppins',sans-serif" }}>
            {currentPage}/{numPages}
          </span>
        )}
      </div>

      {/* PDF content */}
      <div style={{ flex:1, overflow:'auto', display:'flex', justifyContent:'center', backgroundColor:'#404040' }}>
        <Document
          file={doc.fileUrl}
          onLoadSuccess={onLoadSuccess}
          loading={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'#fff', fontFamily:"'Poppins',sans-serif", fontSize:14 }}>Carregando...</div>}
          error={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'#f87171', fontFamily:"'Poppins',sans-serif", fontSize:14 }}>Erro ao carregar documento.</div>}
        >
          <Page pageNumber={currentPage} width={Math.min(pageWidth, 900)} renderTextLayer={true} renderAnnotationLayer={true}/>
        </Document>
      </div>

      {/* Navigation */}
      {numPages && numPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, padding:'12px 16px', backgroundColor:'#2c2c3e', flexShrink:0 }}>
          <button onClick={goPrev} disabled={currentPage <= 1}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:'none', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', backgroundColor: currentPage <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)', color: currentPage <= 1 ? 'rgba(255,255,255,0.3)' : '#fff', fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, transition:'background 0.15s' }}>
            <ChevronLeft size={16}/> Anterior
          </button>
          <button onClick={goNext} disabled={currentPage >= numPages}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:'none', cursor: currentPage >= numPages ? 'not-allowed' : 'pointer', backgroundColor: currentPage >= numPages ? 'rgba(255,255,255,0.05)' : '#c8972b', color: currentPage >= numPages ? 'rgba(255,255,255,0.3)' : '#fff', fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, transition:'background 0.15s' }}>
            Próxima <ChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Documentos tab ───────────────────────────────────────── */
function DocumentosTab() {
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    api.get('/documentos')
      .then(r => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openDoc = async (doc) => {
    setViewing(doc)
    if (!doc.aberto) {
      try { await api.post(`/documentos/${doc.id}/leitura`) } catch {}
      setList(prev => prev.map(d => d.id === doc.id ? { ...d, aberto: true } : d))
    }
  }

  const onConcluded = useCallback(() => {
    if (!viewing) return
    api.post(`/documentos/${viewing.id}/conclusao`).catch(() => {})
    setList(prev => prev.map(d => d.id === viewing.id ? { ...d, concluido: true } : d))
  }, [viewing])

  if (loading) return <LoadingSpinner/>
  if (list.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 16px', gap:12 }}>
      <FileText size={40} style={{ color:'#e5e0d8' }}/>
      <p style={{ margin:0, fontSize:14, color:'#9ca3af', fontFamily:"'Poppins',sans-serif" }}>Nenhum documento disponível.</p>
    </div>
  )

  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {list.map(doc => (
          <button key={doc.id} onClick={() => openDoc(doc)}
            style={{ display:'flex', alignItems:'center', gap:14, width:'100%', textAlign:'left', backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'14px 16px', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'box-shadow 0.2s', fontFamily:"'Poppins',sans-serif" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'}>
            <div style={{ fontSize:32, flexShrink:0 }}>{EXT_ICON[doc.fileType] || '📁'}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.nome}</div>
              {doc.descricao && <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{doc.descricao}</div>}
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>
                {doc.fileType.toUpperCase()}{doc.tamanho ? ` · ${fmtSize(doc.tamanho)}` : ''} · {fmtDate(doc.createdAt)}
              </div>
            </div>
          </button>
        ))}
      </div>
      {viewing && (
        <PdfViewer doc={viewing} onClose={() => setViewing(null)} onConcluded={onConcluded}/>
      )}
    </>
  )
}

/* ── Página ───────────────────────────────────────────────── */
export default function Estudos() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('publicacoes')

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', backgroundColor:'#ffffff', fontFamily:"'Poppins',sans-serif" }}>

      {/* Tab bar */}
      <div style={{ position:'sticky', top:0, zIndex:20, display:'flex', backgroundColor:'#ffffff', borderBottom:'1px solid #e5e0d8' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 8px', fontSize:'13px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', background:'none', border:'none', borderBottom: tab===id ? '2px solid #c8972b' : '2px solid transparent', color: tab===id ? '#c8972b' : '#6b7280', cursor:'pointer', transition:'color 0.15s', fontFamily:"'Poppins',sans-serif", marginBottom:'-1px' }}>
            <Icon size={18}/>{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:'16px', paddingBottom:80, backgroundColor:'#f8f5f0' }}>
        {tab === 'publicacoes' && <PublicacoesTab/>}
        {tab === 'documentos'  && <DocumentosTab/>}
      </div>

      {/* Fixed back footer */}
      <div
        onClick={() => navigate(-1)}
        style={{ position:'fixed', bottom:0, left:0, right:0, padding:'18px 20px 24px', background:'linear-gradient(to top, rgba(255,255,255,0.97) 60%, transparent)', display:'flex', justifyContent:'center', alignItems:'center', gap:10, cursor:'pointer', zIndex:30, userSelect:'none', borderTop:'1px solid #e5e0d8' }}
      >
        <ArrowLeft size={22} color="#b0a89e"/>
        <span style={{ fontSize:18, fontWeight:500, color:'transparent', WebkitTextStroke:'1px #b0a89e', fontFamily:"'Poppins',sans-serif", letterSpacing:'1px', textTransform:'uppercase' }}>
          Voltar
        </span>
      </div>
    </div>
  )
}
