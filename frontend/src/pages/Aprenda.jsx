import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { Users, Leaf, Music, Play, ChevronDown, Search, X, Youtube, Droplets } from 'lucide-react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

const TABS = [
  { id: 'entidades', label: 'Orixás / Entidades', Icon: Users },
  { id: 'ervas',     label: 'Ervas / Banhos',     Icon: Leaf },
  { id: 'musicas',   label: 'Musicas',             Icon: Music },
]

const ERVA_SUBTABS = [
  { id: 'ervas',   label: 'Ervas',  Icon: Leaf },
  { id: 'banhos',  label: 'Banhos', Icon: Droplets },
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
      <div style={{ width: 110, flexShrink: 0, backgroundColor: '#f8f5f0', position: 'relative', overflow: 'hidden' }}>
        {entity.fotoUrl
          ? <img src={entity.fotoUrl} alt={entity.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 110 }}/>
          : <div style={{ width: '100%', minHeight: 110, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={32} style={{ color: '#e5e0d8' }}/></div>}
      </div>
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#f8f5f0', overflow: 'hidden', flexShrink: 0 }}>
        {herb.fotoUrl ? (
          <img src={herb.fotoUrl} alt={herb.nome}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={32} style={{ color: '#e5e0d8' }} />
          </div>
        )}
        {herb.noQuintal && (
          <span style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: '#c8972b', color: '#fff' }}>
            No quintal
          </span>
        )}
      </div>
      <div style={{ padding: '12px 14px', flex: 1 }}>
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

/* ── Banho Card ──────────────────────────────────────────── */
function BanhoCard({ banho, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#f8f5f0', overflow: 'hidden', flexShrink: 0 }}>
        {banho.fotoUrl ? (
          <img src={banho.fotoUrl} alt={banho.nome}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={32} style={{ color: '#e5e0d8' }} />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px', flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#2c2c3e' }}>{banho.nome}</div>
        {banho.descricao && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {banho.descricao}
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

/* ── Banho Detail Modal ──────────────────────────────────── */
function BanhoModal({ banho, onClose }) {
  if (!banho) return null
  const secLabel = txt => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 6 }}>{txt}</div>
  )
  return (
    <Modal isOpen={!!banho} onClose={onClose} title={banho.nome}>
      {banho.fotoUrl && (
        <img src={banho.fotoUrl} alt={banho.nome}
          style={{ width: '100%', height: 'auto', borderRadius: 6, marginBottom: 20, display: 'block' }}/>
      )}
      <div style={{ marginBottom: 16 }}>
        {secLabel('Nome')}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2c2c3e' }}>{banho.nome}</div>
      </div>
      {banho.descricao && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Descrição')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{banho.descricao}</p>
        </div>
      )}
      {banho.ingredientes && (
        <div>
          {secLabel('Ingredientes')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{banho.ingredientes}</p>
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
      <div style={{ width: '40px', height: '40px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(200,151,43,0.12)' }}>
        <Music size={18} style={{ color: '#c8972b' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#2c2c3e' }}>{music.titulo}</div>
        {music.letra && (
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {music.letra.slice(0, 100)}...
          </div>
        )}
      </div>
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
      <div style={{ marginBottom: 16 }}>
        {secLabel('Nome')}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2c2c3e' }}>{entity.nome}</div>
      </div>
      {entity.saudacao && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Saudação')}
          <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: 'rgba(200,151,43,0.08)', border: '1px solid rgba(200,151,43,0.2)', fontSize: 14, fontStyle: 'italic', color: '#c8972b' }}>
            "{entity.saudacao}"
          </div>
        </div>
      )}
      {entity.diaSemana && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Dia da Semana')}
          <div style={{ fontSize: 14, color: '#2c2c3e' }}>{entity.diaSemana}</div>
        </div>
      )}
      {entity.coresVelas && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Cores das Velas')}
          <div style={{ fontSize: 14, color: '#2c2c3e' }}>{entity.coresVelas}</div>
        </div>
      )}
      {entity.historia && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('História')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{entity.historia}</p>
        </div>
      )}
      {entity.oferendas && (
        <div>
          {secLabel('Oferendas')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{entity.oferendas}</p>
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
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
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

/* ── Search Bar ──────────────────────────────────────────── */
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}/>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 36px', border: '1px solid #e5e0d8', borderRadius: 6, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: '#2c2c3e', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8f5f0', transition: 'border-color 0.2s' }}
        onFocus={e => e.currentTarget.style.borderColor = '#c8972b'}
        onBlur={e => e.currentTarget.style.borderColor = '#e5e0d8'}
      />
      {value && (
        <button onClick={() => onChange('')}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}>
          <X size={15}/>
        </button>
      )}
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
  const [ervaSubTab, setErvaSubTab] = useState('ervas')

  const [data, setData] = useState({ entidades: [], ervas: [], banhos: [], musicas: [] })
  const [loading, setLoading] = useState({ entidades: false, ervas: false, banhos: false, musicas: false })
  const [loaded, setLoaded] = useState({ entidades: false, ervas: false, banhos: false, musicas: false })

  // Busca individual por sub-contexto
  const [searches, setSearches] = useState({ entidades: '', ervas: '', banhos: '', musicas: '' })
  const setSearch = (key, val) => setSearches(s => ({ ...s, [key]: val }))

  const [playlistUrl, setPlaylistUrl] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedHerb,   setSelectedHerb]   = useState(null)
  const [selectedBanho,  setSelectedBanho]  = useState(null)
  const [selectedMusic,  setSelectedMusic]  = useState(null)

  const fetchKey = async (key) => {
    if (loaded[key]) return
    setLoading(l => ({ ...l, [key]: true }))
    try {
      const endpoints = { entidades: '/entidades', ervas: '/ervas', banhos: '/banhos', musicas: '/musicas' }
      const res = await api.get(endpoints[key])
      const list = Array.isArray(res.data) ? res.data : res.data[key] || []
      setData(d => ({ ...d, [key]: list }))
      setLoaded(l => ({ ...l, [key]: true }))
    } catch {
      // ignore
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  useEffect(() => {
    if (tab === 'ervas') {
      fetchKey('ervas')
      fetchKey('banhos')
    } else {
      fetchKey(tab)
    }
  }, [tab])

  useEffect(() => {
    api.get('/notificacoes/playlist')
      .then(r => setPlaylistUrl(r.data?.playlistUrl || null))
      .catch(() => {})
  }, [])

  // Chave de busca ativa: quando tab=ervas usa o sub-tab
  const activeSearchKey = tab === 'ervas' ? ervaSubTab : tab
  const activeSearch    = searches[activeSearchKey]

  // Loading do conteúdo atual
  const isLoadingCurrent = tab === 'ervas'
    ? (loading.ervas || loading.banhos)
    : loading[tab]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* Tab bar principal */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8' }}>
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

      {/* Sub-tabs de Ervas / Bebidas */}
      {tab === 'ervas' && (
        <div style={{ display: 'flex', backgroundColor: '#f8f5f0', borderBottom: '1px solid #e5e0d8' }}>
          {ERVA_SUBTABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setErvaSubTab(id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                borderBottom: ervaSubTab === id ? '2px solid #c8972b' : '2px solid transparent',
                color: ervaSubTab === id ? '#c8972b' : '#9ca3af',
                cursor: 'pointer',
                transition: 'color 0.15s',
                fontFamily: "'Poppins', sans-serif",
                marginBottom: '-1px',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Search bar individual por contexto */}
      <div style={{ position: 'sticky', top: tab === 'ervas' ? 108 : 65, zIndex: 19, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8', padding: '10px 16px' }}>
        <SearchBar
          value={activeSearch}
          onChange={val => setSearch(activeSearchKey, val)}
          placeholder={
            tab === 'entidades' ? 'Buscar orixá ou entidade...'
            : tab === 'ervas' && ervaSubTab === 'ervas' ? 'Buscar erva...'
            : tab === 'ervas' && ervaSubTab === 'banhos' ? 'Buscar banho...'
            : 'Buscar ponto cantado...'
          }
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px', backgroundColor: '#f8f5f0' }}>
        {isLoadingCurrent ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'entidades' && (() => {
              const q = activeSearch.toLowerCase()
              const list = q ? data.entidades.filter(e => e.nome?.toLowerCase().includes(q)) : data.entidades
              return list.length === 0
                ? <EmptyState icon={Users} message={q ? 'Nenhum resultado encontrado.' : 'Nenhuma entidade cadastrada.'} />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {list.map(e => <EntityCard key={e.id} entity={e} onClick={() => setSelectedEntity(e)} />)}
                  </div>
                )
            })()}

            {tab === 'ervas' && ervaSubTab === 'ervas' && (() => {
              const q = searches.ervas.toLowerCase()
              const list = q ? data.ervas.filter(e => e.nome?.toLowerCase().includes(q)) : data.ervas
              return list.length === 0
                ? <EmptyState icon={Leaf} message={q ? 'Nenhum resultado encontrado.' : 'Nenhuma erva cadastrada.'} />
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {list.map(e => <HerbCard key={e.id} herb={e} onClick={() => setSelectedHerb(e)} />)}
                  </div>
                )
            })()}

            {tab === 'ervas' && ervaSubTab === 'banhos' && (() => {
              const q = searches.banhos.toLowerCase()
              const list = q ? data.banhos.filter(b => b.nome?.toLowerCase().includes(q)) : data.banhos
              return list.length === 0
                ? <EmptyState icon={Droplets} message={q ? 'Nenhum resultado encontrado.' : 'Nenhum banho cadastrado.'} />
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {list.map(b => <BanhoCard key={b.id} banho={b} onClick={() => setSelectedBanho(b)} />)}
                  </div>
                )
            })()}

            {tab === 'musicas' && (
              data.musicas.length === 0
                ? <EmptyState icon={Music} message="Nenhuma música cadastrada." />
                : <>
                    {playlistUrl && (
                      <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', marginBottom:14, borderRadius:8, backgroundColor:'#fff', border:'1px solid #fecaca', textDecoration:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'box-shadow 0.2s' }}
                        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(220,38,38,0.15)'}
                        onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'}>
                        <div style={{ width:38, height:38, borderRadius:8, backgroundColor:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Youtube size={20} color="#dc2626"/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'#2c2c3e' }}>Playlist completa do Terreiro</div>
                          <div style={{ fontSize:12, color:'#9ca3af', marginTop:1 }}>Ouça todos os pontos cantados no YouTube</div>
                        </div>
                        <Play size={14} color="#dc2626" style={{ flexShrink:0 }}/>
                      </a>
                    )}
                    <MusicGroups musicas={data.musicas} onSelect={setSelectedMusic} search={searches.musicas} />
                  </>
            )}
          </>
        )}
      </div>

      <EntityModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      <HerbModal   herb={selectedHerb}     onClose={() => setSelectedHerb(null)} />
      <BanhoModal  banho={selectedBanho}   onClose={() => setSelectedBanho(null)} />
      <MusicModal  music={selectedMusic}   onClose={() => setSelectedMusic(null)} />
    </div>
  )
}
