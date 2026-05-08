import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { Users, Leaf, Music, Play, ChevronDown, Search, X } from 'lucide-react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

const TABS = [
  { id: 'entidades', label: 'Orixás / Entidades', Icon: Users },
  { id: 'ervas', label: 'Ervas', Icon: Leaf },
  { id: 'musicas', label: 'Musicas', Icon: Music },
]

/* ── Entity Card ─────────────────────────────────────────── */
function EntityCard({ entity, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        textAlign: 'left',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e0d8',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        fontFamily: "'Poppins', sans-serif",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Imagem */}
      <div style={{ width: 110, flexShrink: 0, backgroundColor: '#f8f5f0', position: 'relative', overflow: 'hidden' }}>
        {entity.fotoUrl
          ? <img src={entity.fotoUrl} alt={entity.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 110 }}/>
          : <div style={{ width: '100%', minHeight: 110, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={32} style={{ color: '#e5e0d8' }}/></div>}
      </div>

      {/* Conteúdo com seções */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, textAlign: 'left' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 2 }}>Nome</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2c2c3e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entity.nome}</div>
        </div>

        {entity.saudacao && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 2 }}>Saudação</div>
            <div style={{ fontSize: 13, fontStyle: 'italic', color: '#6b7280' }}>"{entity.saudacao}"</div>
          </div>
        )}

        {entity.historia && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 2 }}>História</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {entity.historia}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

/* ── Herb Card ───────────────────────────────────────────── */
function HerbCard({ herb, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e0d8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#f8f5f0' }}>
        {herb.fotoUrl ? (
          <img src={herb.fotoUrl} alt={herb.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={32} style={{ color: '#e5e0d8' }} />
          </div>
        )}
        {herb.noQuintal && (
          <span style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: '#c8972b', color: '#fff' }}>
            No quintal
          </span>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#2c2c3e' }}>{herb.nome}</div>
        {herb.usos && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {herb.usos}
          </div>
        )}
      </div>
    </button>
  )
}

/* ── Herb Detail Modal ───────────────────────────────────── */
function HerbModal({ herb, onClose }) {
  if (!herb) return null
  const secLabel = txt => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 6 }}>{txt}</div>
  )
  return (
    <Modal isOpen={!!herb} onClose={onClose} title={herb.nome}>
      {herb.fotoUrl && (
        <img src={herb.fotoUrl} alt={herb.nome}
          style={{ width: '100%', height: 'auto', borderRadius: 6, marginBottom: 20, display: 'block' }}/>
      )}

      <div style={{ marginBottom: 16 }}>
        {secLabel('Nome')}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2c2c3e', display: 'flex', alignItems: 'center', gap: 10 }}>
          {herb.nome}
          {herb.noQuintal && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, backgroundColor: '#c8972b', color: '#fff' }}>
              No quintal
            </span>
          )}
        </div>
      </div>

      {herb.usos && (
        <div>
          {secLabel('Usos e propriedades')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{herb.usos}</p>
        </div>
      )}
    </Modal>
  )
}

/* ── Music Card ──────────────────────────────────────────── */
function MusicCard({ music, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e0d8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.14)' : '0 4px 20px rgba(0,0,0,0.10)',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: 'rgba(200,151,43,0.12)',
        }}
      >
        <Music size={18} style={{ color: '#c8972b' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#2c2c3e' }}>{music.titulo}</div>
        {music.letra && (
          <div
            style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {music.letra.slice(0, 100)}...
          </div>
        )}
        {music.youtubeUrl && (
          <div style={{ fontSize: '12px', color: '#c8972b', marginTop: '4px', fontWeight: 600 }}>
            Ver no YouTube
          </div>
        )}
      </div>
      {music.youtubeUrl && (
        <Play size={16} style={{ color: '#c8972b', flexShrink: 0, marginTop: '2px' }} />
      )}
    </button>
  )
}

/* ── Entity Detail Modal ─────────────────────────────────── */
const secLabel = txt => (
  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 6 }}>{txt}</div>
)

function EntityModal({ entity, onClose }) {
  if (!entity) return null
  return (
    <Modal isOpen={!!entity} onClose={onClose} title={entity.nome}>

      {entity.fotoUrl && (
        <img src={entity.fotoUrl} alt={entity.nome}
          style={{ width: '100%', height: 'auto', borderRadius: 6, marginBottom: 20, display: 'block' }}/>
      )}

      {/* Nome */}
      <div style={{ marginBottom: 16 }}>
        {secLabel('Nome')}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2c2c3e' }}>{entity.nome}</div>
      </div>

      {/* Saudação */}
      {entity.saudacao && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Saudação')}
          <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: 'rgba(200,151,43,0.08)', border: '1px solid rgba(200,151,43,0.2)', fontSize: 14, fontStyle: 'italic', color: '#c8972b' }}>
            "{entity.saudacao}"
          </div>
        </div>
      )}

      {/* Cores das Velas */}
      {entity.coresVelas && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Cores das Velas')}
          <div style={{ fontSize: 14, color: '#2c2c3e' }}>{entity.coresVelas}</div>
        </div>
      )}

      {/* História */}
      {entity.historia && (
        <div>
          {secLabel('História')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{entity.historia}</p>
        </div>
      )}

    </Modal>
  )
}

/* ── Music Detail Modal ──────────────────────────────────── */
function MusicModal({ music, onClose }) {
  if (!music) return null
  return (
    <Modal isOpen={!!music} onClose={onClose} title={music.titulo}>
      {music.youtubeUrl && (
        <a
          href={music.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textDecoration: 'none',
            color: '#c8972b',
            border: '2px solid #c8972b',
            transition: 'background-color 0.15s, color 0.15s',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c8972b'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#c8972b'
          }}
        >
          <Play size={15} />
          Ouvir no YouTube
        </a>
      )}
      {music.letra ? (
        <pre style={{ fontSize: '14px', lineHeight: 1.7, color: '#2c2c3e', whiteSpace: 'pre-wrap', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
          {music.letra}
        </pre>
      ) : (
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Letra nao disponivel.</p>
      )}
    </Modal>
  )
}

/* ── Music Groups (collapse por agregador) ───────────────── */
function MusicGroup({ label, musicas, onSelect, defaultOpen, forceOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = forceOpen || open
  return (
    <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e0d8', backgroundColor: '#fff' }}>
      <button
        onClick={() => { if (!forceOpen) setOpen(o => !o) }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c8972b', flexShrink: 0 }}/>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#2c2c3e' }}>{label}</span>
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>({musicas.length})</span>
        </div>
        <ChevronDown size={16} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}/>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid #f0ece5', padding: '8px 8px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {musicas.map(m => <MusicCard key={m.id} music={m} onClick={() => onSelect(m)} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function MusicGroups({ musicas, onSelect, search }) {
  const q = search.toLowerCase()
  const filtered = q
    ? musicas.filter(m => m.titulo?.toLowerCase().includes(q) || m.agregador?.nome?.toLowerCase().includes(q))
    : musicas

  const groups = []
  const grouped = {}
  filtered.forEach(m => {
    const key = m.agregador ? `${m.agregador.ordem ?? 0}_${m.agregador.id}` : '__sem__'
    if (!grouped[key]) {
      grouped[key] = { label: m.agregador ? m.agregador.nome : 'Outros', musicas: [], ordem: m.agregador?.ordem ?? 9999 }
      groups.push(key)
    }
    grouped[key].musicas.push(m)
  })
  groups.sort((a, b) => grouped[a].ordem - grouped[b].ordem)

  if (filtered.length === 0) {
    return <EmptyState icon={Music} message="Nenhuma música encontrada." />
  }

  return (
    <div>
      {groups.map((key, i) => (
        <MusicGroup key={key} label={grouped[key].label} musicas={grouped[key].musicas}
          onSelect={onSelect} defaultOpen={i === 0} forceOpen={!!q} />
      ))}
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────── */
function EmptyState({ icon: Icon, message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px', gap: '12px' }}>
      <Icon size={40} style={{ color: '#e5e0d8' }} />
      <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, fontFamily: "'Poppins', sans-serif" }}>{message}</p>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Aprenda() {
  const location = useLocation()
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(location.search)
    const t = p.get('tab')
    return ['entidades','ervas','musicas'].includes(t) ? t : 'entidades'
  })
  const [data, setData] = useState({ entidades: [], ervas: [], musicas: [] })
  const [loading, setLoading] = useState({ entidades: false, ervas: false, musicas: false })
  const [loaded, setLoaded] = useState({ entidades: false, ervas: false, musicas: false })
  const [search, setSearch] = useState('')
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedHerb,   setSelectedHerb]   = useState(null)
  const [selectedMusic,  setSelectedMusic]  = useState(null)

  const fetchTab = async (tabId) => {
    if (loaded[tabId]) return
    setLoading((l) => ({ ...l, [tabId]: true }))
    try {
      const endpoints = { entidades: '/entidades', ervas: '/ervas', musicas: '/musicas' }
      const res = await api.get(endpoints[tabId])
      const list = Array.isArray(res.data) ? res.data : res.data[tabId] || []
      setData((d) => ({ ...d, [tabId]: list }))
      setLoaded((l) => ({ ...l, [tabId]: true }))
    } catch {
      // ignore
    } finally {
      setLoading((l) => ({ ...l, [tabId]: false }))
    }
  }

  useEffect(() => { fetchTab(tab); setSearch('') }, [tab])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* Tab bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e0d8',
        }}
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '12px 8px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: 'none',
              border: 'none',
              borderBottom: tab === id ? '2px solid #c8972b' : '2px solid transparent',
              color: tab === id ? '#c8972b' : '#6b7280',
              cursor: 'pointer',
              transition: 'color 0.15s',
              fontFamily: "'Poppins', sans-serif",
              marginBottom: '-1px',
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ position: 'sticky', top: 65, zIndex: 19, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8', padding: '10px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'entidades' ? 'Buscar orixá ou entidade...' : tab === 'ervas' ? 'Buscar erva...' : 'Buscar ponto cantado...'}
            style={{ width: '100%', padding: '9px 36px', border: '1px solid #e5e0d8', borderRadius: 6, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: '#2c2c3e', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8f5f0', transition: 'border-color 0.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = '#c8972b'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e0d8'}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}>
              <X size={15}/>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px', backgroundColor: '#f8f5f0' }}>
        {loading[tab] ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'entidades' && (() => {
              const q = search.toLowerCase()
              const list = q
                ? data.entidades.filter(e => e.nome?.toLowerCase().includes(q))
                : data.entidades
              return list.length === 0
                ? <EmptyState icon={Users} message={q ? 'Nenhum resultado encontrado.' : 'Nenhuma entidade cadastrada.'} />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {list.map(e => <EntityCard key={e.id} entity={e} onClick={() => setSelectedEntity(e)} />)}
                  </div>
                )
            })()}

            {tab === 'ervas' && (() => {
              const q = search.toLowerCase()
              const list = q
                ? data.ervas.filter(e => e.nome?.toLowerCase().includes(q))
                : data.ervas
              return list.length === 0
                ? <EmptyState icon={Leaf} message={q ? 'Nenhum resultado encontrado.' : 'Nenhuma erva cadastrada.'} />
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {list.map(e => <HerbCard key={e.id} herb={e} onClick={() => setSelectedHerb(e)} />)}
                  </div>
                )
            })()}

            {tab === 'musicas' && (
              data.musicas.length === 0
                ? <EmptyState icon={Music} message="Nenhuma música cadastrada." />
                : <MusicGroups musicas={data.musicas} onSelect={setSelectedMusic} search={search} />
            )}
          </>
        )}
      </div>

      <EntityModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      <HerbModal   herb={selectedHerb}     onClose={() => setSelectedHerb(null)} />
      <MusicModal  music={selectedMusic}   onClose={() => setSelectedMusic(null)} />
    </div>
  )
}
