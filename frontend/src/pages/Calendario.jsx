import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, Music, ListChecks, FileText, Play, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

// Converte ISO datetime para Date local sem aplicar offset de fuso horário
// (evita que 2026-06-04T00:00:00Z vire 03/06 no Brasil UTC-3)
function parseUTC(iso) {
  const d = new Date(iso)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function fmtHora(iso) {
  const d = new Date(iso)
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function girasByDay(giras, year, month) {
  const map = {}
  giras.forEach(g => {
    const d = parseUTC(g.data)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!map[day]) map[day] = []
      map[day].push(g)
    }
  })
  return map
}

const S = { fontFamily:"'Poppins',sans-serif" }

/* ── Section label ───────────────────────────────────────── */
const SecLabel = ({ Icon, text }) => (
  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
    {Icon && <Icon size={14} style={{ color:'#c8972b', flexShrink:0 }}/>}
    <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b' }}>{text}</span>
  </div>
)

const secBlock = { marginBottom:16 }

/* ── Botão voltar ─────────────────────────────────────────── */
const BtnVoltar = ({ onClick }) => (
  <button onClick={onClick}
    style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:6, border:'1px solid #e5e0d8', fontSize:13, fontWeight:600, color:'#6b7280', background:'#fff', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8972b';e.currentTarget.style.color='#c8972b'}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d8';e.currentTarget.style.color='#6b7280'}}>
    <ArrowLeft size={15}/> Voltar para o calendário
  </button>
)

/* ── Modal de Entidade ───────────────────────────────────── */
function EntityDetailModal({ entity, onClose }) {
  return (
    <Modal isOpen={!!entity} onClose={onClose} title={entity?.nome || ''} zIndex={60}
      footer={<BtnVoltar onClick={onClose}/>}
    >
      {entity && (
        <div style={S}>
          {entity.fotoUrl && (
            <img src={entity.fotoUrl} alt={entity.nome}
              style={{ width:'100%', height:'auto', borderRadius:6, marginBottom:20, display:'block' }}/>
          )}

          <div style={secBlock}>
            <SecLabel Icon={Users} text="Nome"/>
            <div style={{ fontSize:20, fontWeight:800, color:'#2c2c3e' }}>{entity.nome}</div>
          </div>

          {entity.saudacao && (
            <div style={secBlock}>
              <SecLabel text="Saudação"/>
              <div style={{ padding:'10px 14px', borderRadius:6, backgroundColor:'rgba(200,151,43,0.08)', border:'1px solid rgba(200,151,43,0.2)', fontSize:14, fontStyle:'italic', color:'#c8972b' }}>
                "{entity.saudacao}"
              </div>
            </div>
          )}

          {entity.coresVelas && (
            <div style={secBlock}>
              <SecLabel text="Cores das Velas"/>
              <div style={{ fontSize:14, color:'#2c2c3e' }}>{entity.coresVelas}</div>
            </div>
          )}

          {entity.historia && (
            <div>
              <SecLabel text="História"/>
              <p style={{ margin:0, fontSize:14, lineHeight:1.75, color:'#2c2c3e', whiteSpace:'pre-wrap' }}>{entity.historia}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

/* ── Modal de Música ─────────────────────────────────────── */
function MusicDetailModal({ music, onClose }) {
  return (
    <Modal isOpen={!!music} onClose={onClose} title={music?.titulo || ''} zIndex={60}
      footer={<BtnVoltar onClick={onClose}/>}
    >
      {music && (
        <div style={S}>
          {music.youtubeUrl && (
            <a href={music.youtubeUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:6, marginBottom:20, fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', textDecoration:'none', color:'#c8972b', border:'2px solid #c8972b', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.backgroundColor='#c8972b';e.currentTarget.style.color='#fff'}}
              onMouseLeave={e=>{e.currentTarget.style.backgroundColor='transparent';e.currentTarget.style.color='#c8972b'}}>
              <Play size={15}/> Ouvir no YouTube
            </a>
          )}
          {music.letra
            ? <pre style={{ margin:0, fontSize:14, lineHeight:1.75, color:'#2c2c3e', whiteSpace:'pre-wrap', fontFamily:"'Poppins',sans-serif" }}>{music.letra}</pre>
            : <p style={{ margin:0, fontSize:14, color:'#9ca3af' }}>Letra não disponível.</p>}
        </div>
      )}
    </Modal>
  )
}

/* ── Gira Detail Modal ───────────────────────────────────── */
function GiraDetailModal({ giraId, onClose, onEntityClick, onMusicClick }) {
  const [gira,    setGira]    = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!giraId) { setGira(null); return }
    setLoading(true)
    api.get(`/giras/${giraId}`)
      .then(r => setGira(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [giraId])

  const entidades = gira?.entidades?.map(e => e.entidade).filter(Boolean) || []
  const musicas   = gira?.musicas?.map(m => m.musica).filter(Boolean)     || []
  const rotinas   = gira?.rotinas?.map(r => r.rotina).filter(Boolean)     || []

  const dateStr = gira
    ? parseUTC(gira.data).toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : ''
  const timeStr = gira ? fmtHora(gira.data) : ''

  return (
    <Modal isOpen={!!giraId} onClose={onClose} title={gira?.titulo || '...'}>
      {loading ? <LoadingSpinner/> : gira ? (
        <div style={{ display:'flex', flexDirection:'column', gap:20, ...S }}>

          <div style={{ fontSize:13, fontWeight:600, color:'#c8972b', textTransform:'capitalize' }}>{dateStr} às {timeStr}</div>

          {gira.descricao && (
            <p style={{ margin:0, fontSize:14, lineHeight:1.7, color:'#2c2c3e' }}>{gira.descricao}</p>
          )}

          {gira.instrucoes && (
            <div style={{ padding:'14px 16px', borderRadius:6, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8' }}>
              <SecLabel Icon={FileText} text="Instruções"/>
              <p style={{ margin:0, fontSize:14, lineHeight:1.7, color:'#2c2c3e', whiteSpace:'pre-wrap' }}>{gira.instrucoes}</p>
            </div>
          )}

          {/* Orixás / Entidades */}
          {entidades.length > 0 && (
            <div>
              <SecLabel Icon={Users} text="Orixás / Entidades"/>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {entidades.map(e => (
                  <button key={e.id}
                    onClick={() => onEntityClick(e)}
                    style={{ padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:600, backgroundColor:'rgba(200,151,43,0.1)', color:'#c8972b', border:'1px solid rgba(200,151,43,0.3)', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
                    onMouseEnter={ev=>{ev.currentTarget.style.backgroundColor='#c8972b';ev.currentTarget.style.color='#fff'}}
                    onMouseLeave={ev=>{ev.currentTarget.style.backgroundColor='rgba(200,151,43,0.1)';ev.currentTarget.style.color='#c8972b'}}>
                    {e.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Músicas */}
          {musicas.length > 0 && (
            <div>
              <SecLabel Icon={Music} text="Pontos Cantados"/>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {musicas.map((m, i) => (
                  <button key={m.id}
                    onClick={() => onMusicClick(m)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:6, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8', cursor:'pointer', width:'100%', textAlign:'left', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s' }}
                    onMouseEnter={ev=>{ev.currentTarget.style.borderColor='#c8972b';ev.currentTarget.style.backgroundColor='rgba(200,151,43,0.06)'}}
                    onMouseLeave={ev=>{ev.currentTarget.style.borderColor='#e5e0d8';ev.currentTarget.style.backgroundColor='#f8f5f0'}}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#c8972b', minWidth:22, fontFamily:'monospace' }}>{String(i+1).padStart(2,'0')}.</span>
                    <span style={{ fontSize:14, color:'#2c2c3e', fontWeight:500 }}>{m.titulo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rotinas */}
          {rotinas.length > 0 && (
            <div>
              <SecLabel Icon={ListChecks} text="Rotinas"/>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {rotinas.map((r, i) => (
                  <div key={r.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderRadius:6, backgroundColor:'#f8f5f0', border:'1px solid #e5e0d8' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#c8972b', minWidth:22, fontFamily:'monospace', marginTop:2 }}>{String(i+1).padStart(2,'0')}.</span>
                    <div>
                      <div style={{ fontSize:14, color:'#2c2c3e', fontWeight:500 }}>{r.titulo}</div>
                      {r.descricao && <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{r.descricao}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entidades.length===0 && musicas.length===0 && rotinas.length===0 && (
            <p style={{ margin:0, fontSize:13, color:'#9ca3af' }}>Nenhum vínculo cadastrado para esta gira.</p>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

/* ── Day Cell ────────────────────────────────────────────── */
function DayCell({ day, hasGira, isToday, onClick }) {
  const [hovered, setHovered] = useState(false)
  let bg='transparent', color='#2c2c3e', border='1px solid #e5e0d8'
  if (hasGira) { bg=hovered?'#a67a20':'#c8972b'; color='#fff'; border='1px solid #c8972b' }
  else if (isToday) { bg='rgba(200,151,43,0.10)'; color='#c8972b'; border='1px solid rgba(200,151,43,0.35)' }

  return (
    <button onClick={onClick} disabled={!hasGira}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ width:'100%', aspectRatio:'1/1', borderRadius:4, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, backgroundColor:bg, border, color, cursor:hasGira?'pointer':'default', transition:'background-color 0.15s', ...S }}>
      <span style={{ fontSize:13, fontWeight:600, lineHeight:1 }}>{day}</span>
      {hasGira && <Calendar size={9} style={{ color:'#fff' }}/>}
    </button>
  )
}

/* ── Gira List Card ──────────────────────────────────────── */
function GiraListCard({ gira, onClick }) {
  const [hovered, setHovered] = useState(false)
  const date = parseUTC(gira.data)
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:8, backgroundColor:'#fff', border:'1px solid #e5e0d8', boxShadow:hovered?'0 8px 28px rgba(0,0,0,0.12)':'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', transition:'box-shadow 0.2s', ...S }}>
      <div style={{ flexShrink:0, width:44, height:44, borderRadius:6, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#c8972b' }}>
        <span style={{ fontSize:16, fontWeight:700, lineHeight:1, color:'#fff' }}>{date.getDate()}</span>
        <span style={{ fontSize:10, lineHeight:1.2, color:'rgba(255,255,255,0.85)', textTransform:'uppercase' }}>{date.toLocaleString('pt-BR',{month:'short'})}</span>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{gira.titulo}</div>
        <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{fmtHora(gira.data)}</div>
        {gira.descricao && <div style={{ fontSize:12, color:'#6b7280', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{gira.descricao}</div>}
      </div>
    </button>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Calendario() {
  const navigate = useNavigate()
  const today = new Date()
  const [year,          setYear]          = useState(today.getFullYear())
  const [month,         setMonth]         = useState(today.getMonth())
  const [giras,         setGiras]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [selectedGiraId,setSelectedGiraId]= useState(null)
  const [selectedEntity,setSelectedEntity]= useState(null)
  const [selectedMusic, setSelectedMusic] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/giras')
      .then(res => setGiras(Array.isArray(res.data) ? res.data : res.data.giras || []))
      .catch(() => setGiras([]))
      .finally(() => setLoading(false))
  }, [])

  const prevMonth = () => { if (month===0){setYear(y=>y-1);setMonth(11)}else setMonth(m=>m-1) }
  const nextMonth = () => { if (month===11){setYear(y=>y+1);setMonth(0)}else setMonth(m=>m+1) }

  const days    = buildCalendarDays(year, month)
  const giraMap = girasByDay(giras, year, month)

  const navBtn = { background:'none', border:'none', cursor:'pointer', padding:8, borderRadius:4, color:'#c8972b', display:'flex', alignItems:'center', justifyContent:'center', transition:'background-color 0.15s' }

  return (
    <div style={{ padding:16, paddingBottom:80, backgroundColor:'#fff', minHeight:'100%', ...S }}>

      <div style={{ textAlign:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#2c2c3e', margin:'0 0 4px' }}>Calendário</h1>
        <p style={{ fontSize:14, color:'#6b7280', margin:0 }}>Acompanhe as giras do terreiro</p>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button style={navBtn} onClick={prevMonth}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='rgba(200,151,43,0.10)'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          <ChevronLeft size={22}/>
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#2c2c3e' }}>{MONTHS[month]}</div>
          <div style={{ fontSize:13, color:'#6b7280' }}>{year}</div>
        </div>
        <button style={navBtn} onClick={nextMonth}
          onMouseEnter={e=>e.currentTarget.style.backgroundColor='rgba(200,151,43,0.10)'}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
          <ChevronRight size={22}/>
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6, backgroundColor:'#f8f5f0', borderRadius:4, padding:'4px 0' }}>
        {DAYS_OF_WEEK.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', padding:'4px 0', color:'#6b7280' }}>{d}</div>
        ))}
      </div>

      {loading ? <LoadingSpinner/> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {days.map((day, i) => {
            const hasGira = day !== null && giraMap[day]?.length > 0
            const isToday = day===today.getDate() && month===today.getMonth() && year===today.getFullYear()
            return (
              <div key={i}>
                {day===null
                  ? <div style={{ aspectRatio:'1/1' }}/>
                  : <DayCell day={day} hasGira={hasGira} isToday={isToday}
                      onClick={() => hasGira && setSelectedGiraId(giraMap[day][0].id)}/>}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:14, fontSize:12, color:'#6b7280' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:12, height:12, borderRadius:2, backgroundColor:'#c8972b' }}/> Gira programada
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:12, height:12, borderRadius:2, backgroundColor:'rgba(200,151,43,0.15)', border:'1px solid rgba(200,151,43,0.35)' }}/> Hoje
        </div>
      </div>

      {giras.length > 0 && (
        <div style={{ marginTop:28 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b', marginBottom:12 }}>
            Próximas Giras
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {giras.map(g => (
              <GiraListCard key={g.id} gira={g} onClick={() => setSelectedGiraId(g.id)}/>
            ))}
          </div>
        </div>
      )}

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

      <GiraDetailModal
        giraId={selectedGiraId}
        onClose={() => setSelectedGiraId(null)}
        onEntityClick={e => setSelectedEntity(e)}
        onMusicClick={m => setSelectedMusic(m)}
      />
      <EntityDetailModal entity={selectedEntity} onClose={() => setSelectedEntity(null)}/>
      <MusicDetailModal  music={selectedMusic}   onClose={() => setSelectedMusic(null)}/>
    </div>
  )
}

