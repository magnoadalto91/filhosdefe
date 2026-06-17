import { useEffect, useState } from 'react'
import { BookOpen, FileText, Download, ArrowLeft, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router'
import api from '../api/axios'

const apiBase = () => api.defaults.baseURL || '/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

const TABS = [
  { id:'publicacoes', label:'Publicações', Icon: BookOpen },
  { id:'documentos',  label:'Documentos',  Icon: FileText },
]

const EXT_ICON = { pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', ppt:'📋', pptx:'📋', txt:'📃' }
const fmtSize  = b => b >= 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`
const fmtDate  = iso => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

/* ── Publicação modal ─────────────────────────────────────── */
function PubModal({ pub, onClose }) {
  if (!pub) return null
  return (
    <Modal isOpen={!!pub} onClose={onClose} title={pub.titulo}>
      {pub.capaUrl && <img src={pub.capaUrl} alt="" style={{ width:'100%', borderRadius:8, marginBottom:16, objectFit:'cover', maxHeight:220, display:'block' }}/>}
      <p style={{ margin:'0 0 16px', fontSize:12, color:'#9ca3af' }}>{fmtDate(pub.createdAt)}</p>
      <div
        style={{ fontSize:14, lineHeight:1.8, color:'#2c2c3e' }}
        dangerouslySetInnerHTML={{ __html: pub.conteudo }}
      />
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
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(true)
  const [selected,setSelected]= useState(null)
  const [loadingPub, setLoadingPub] = useState(false)

  useEffect(() => {
    api.get('/publicacoes')
      .then(r => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const open = async (item) => {
    setLoadingPub(true)
    try {
      const r = await api.get(`/publicacoes/${item.id}`)
      setSelected(r.data)
    } catch {}
    finally { setLoadingPub(false) }
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
                <div style={{ fontSize:15, fontWeight:700, color:'#2c2c3e', marginBottom:6 }}>{item.titulo}</div>
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

/* ── Documentos tab ───────────────────────────────────────── */
function DocumentosTab() {
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/documentos')
      .then(r => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner/>
  if (list.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 16px', gap:12 }}>
      <FileText size={40} style={{ color:'#e5e0d8' }}/>
      <p style={{ margin:0, fontSize:14, color:'#9ca3af', fontFamily:"'Poppins',sans-serif" }}>Nenhum documento disponível.</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {list.map(doc => (
        <a key={doc.id} href={`${apiBase()}/documentos/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'14px 16px', textDecoration:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'box-shadow 0.2s', cursor:'pointer' }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'}>
          <div style={{ fontSize:32, flexShrink:0 }}>{EXT_ICON[doc.fileType] || '📁'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#2c2c3e', fontFamily:"'Poppins',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.nome}</div>
            {doc.descricao && <div style={{ fontSize:12, color:'#6b7280', marginTop:2, fontFamily:"'Poppins',sans-serif" }}>{doc.descricao}</div>}
            <div style={{ fontSize:11, color:'#9ca3af', marginTop:4, fontFamily:"'Poppins',sans-serif" }}>
              {doc.fileType.toUpperCase()}{doc.tamanho ? ` · ${fmtSize(doc.tamanho)}` : ''} · {fmtDate(doc.createdAt)}
            </div>
          </div>
          <Download size={18} style={{ color:'#c8972b', flexShrink:0 }}/>
        </a>
      ))}
    </div>
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

