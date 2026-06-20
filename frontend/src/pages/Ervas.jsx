import { useEffect, useState } from 'react'
import { Leaf, Droplets, Search, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

const SUBTABS = [
  { id: 'ervas',  label: 'Ervas',  Icon: Leaf },
  { id: 'banhos', label: 'Banhos', Icon: Droplets },
]

/* ── Herb Card ─────────────────────────────────────────────── */
function HerbCard({ herb, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left',
        borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #e5e0d8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.07)',
        cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#f8f5f0', overflow: 'hidden', flexShrink: 0 }}>
        {herb.fotoUrl ? (
          <img src={herb.fotoUrl} alt={herb.nome}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: herb.emFalta ? 'grayscale(100%)' : 'none' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={32} style={{ color: '#e5e0d8' }} />
          </div>
        )}
        {herb.emFalta ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: 'rgba(220,38,38,0.9)', padding: '4px 10px', borderRadius: 20 }}>Em falta</span>
          </div>
        ) : herb.noQuintal && (
          <span style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: '#c8972b', color: '#fff' }}>
            No quintal
          </span>
        )}
      </div>
      <div style={{ padding: '12px 14px', flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2c2c3e' }}>{herb.nome}</div>
        {herb.usos && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {herb.usos}
          </div>
        )}
      </div>
    </button>
  )
}

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

/* ── Banho Card ─────────────────────────────────────────────── */
function BanhoCard({ banho, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left',
        borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #e5e0d8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.07)',
        cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
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
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2c2c3e' }}>{banho.nome}</div>
        {banho.descricao && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {banho.descricao}
          </div>
        )}
      </div>
    </button>
  )
}

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

/* ── Main Page ─────────────────────────────────────────────── */
export default function Ervas() {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState('ervas')

  const [ervas,  setErvas]  = useState([])
  const [banhos, setBanhos] = useState([])
  const [loadingErvas,  setLoadingErvas]  = useState(false)
  const [loadingBanhos, setLoadingBanhos] = useState(false)
  const [loadedErvas,   setLoadedErvas]   = useState(false)
  const [loadedBanhos,  setLoadedBanhos]  = useState(false)

  const [searchErvas,  setSearchErvas]  = useState('')
  const [searchBanhos, setSearchBanhos] = useState('')

  const [selectedHerb,  setSelectedHerb]  = useState(null)
  const [selectedBanho, setSelectedBanho] = useState(null)

  const fetchErvas = () => {
    if (loadedErvas) return
    setLoadingErvas(true)
    api.get('/ervas')
      .then(r => { setErvas(Array.isArray(r.data) ? r.data : []); setLoadedErvas(true) })
      .catch(() => {})
      .finally(() => setLoadingErvas(false))
  }

  const fetchBanhos = () => {
    if (loadedBanhos) return
    setLoadingBanhos(true)
    api.get('/banhos')
      .then(r => { setBanhos(Array.isArray(r.data) ? r.data : []); setLoadedBanhos(true) })
      .catch(() => {})
      .finally(() => setLoadingBanhos(false))
  }

  useEffect(() => { fetchErvas() }, [])

  const handleSubTab = id => {
    setSubTab(id)
    if (id === 'banhos') fetchBanhos()
  }

  const currentSearch = subTab === 'ervas' ? searchErvas : searchBanhos
  const setCurrentSearch = subTab === 'ervas' ? setSearchErvas : setSearchBanhos
  const isLoading = subTab === 'ervas' ? loadingErvas : loadingBanhos

  const filteredErvas = searchErvas
    ? ervas.filter(e => e.nome?.toLowerCase().includes(searchErvas.toLowerCase()))
    : ervas

  const filteredBanhos = searchBanhos
    ? banhos.filter(b => b.nome?.toLowerCase().includes(searchBanhos.toLowerCase()))
    : banhos

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1a3a2a', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Leaf size={18} color="#c8972b" />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
            Ervas e Banhos
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', backgroundColor: '#f8f5f0', borderBottom: '1px solid #e5e0d8' }}>
        {SUBTABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleSubTab(id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 8px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none',
              borderBottom: subTab === id ? '2px solid #c8972b' : '2px solid transparent',
              color: subTab === id ? '#c8972b' : '#9ca3af',
              cursor: 'pointer', transition: 'color 0.15s', fontFamily: "'Poppins', sans-serif",
              marginBottom: -1,
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}/>
          <input
            value={currentSearch}
            onChange={e => setCurrentSearch(e.target.value)}
            placeholder={subTab === 'ervas' ? 'Buscar erva...' : 'Buscar banho...'}
            style={{ width: '100%', padding: '9px 36px', border: '1px solid #e5e0d8', borderRadius: 6, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: '#2c2c3e', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8f5f0', transition: 'border-color 0.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = '#c8972b'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e0d8'}
          />
          {currentSearch && (
            <button onClick={() => setCurrentSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}>
              <X size={15}/>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 16, paddingBottom: 80, backgroundColor: '#f8f5f0' }}>
        {isLoading ? <LoadingSpinner /> : subTab === 'ervas' ? (
          filteredErvas.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', gap: 12 }}>
              <Leaf size={40} style={{ color: '#e5e0d8' }} />
              <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
                {searchErvas ? 'Nenhum resultado encontrado.' : 'Nenhuma erva cadastrada.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filteredErvas.map(e => <HerbCard key={e.id} herb={e} onClick={() => setSelectedHerb(e)} />)}
            </div>
          )
        ) : (
          filteredBanhos.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', gap: 12 }}>
              <Droplets size={40} style={{ color: '#e5e0d8' }} />
              <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
                {searchBanhos ? 'Nenhum resultado encontrado.' : 'Nenhum banho cadastrado.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filteredBanhos.map(b => <BanhoCard key={b.id} banho={b} onClick={() => setSelectedBanho(b)} />)}
            </div>
          )
        )}
      </div>

      {/* Fixed back footer */}
      <div
        onClick={() => navigate(-1)}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '18px 20px 24px', background: 'linear-gradient(to top, rgba(255,255,255,0.97) 60%, transparent)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, cursor: 'pointer', zIndex: 30, userSelect: 'none', borderTop: '1px solid #e5e0d8' }}
      >
        <ArrowLeft size={22} color="#b0a89e" />
        <span style={{ fontSize: 18, fontWeight: 500, color: 'transparent', WebkitTextStroke: '1px #b0a89e', fontFamily: "'Poppins', sans-serif", letterSpacing: '1px', textTransform: 'uppercase' }}>
          Voltar
        </span>
      </div>

      <HerbModal  herb={selectedHerb}    onClose={() => setSelectedHerb(null)} />
      <BanhoModal banho={selectedBanho}  onClose={() => setSelectedBanho(null)} />
    </div>
  )
}


