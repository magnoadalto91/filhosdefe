import { useEffect, useState } from 'react'
import { Music, Search, X, ChevronDown, Play, Youtube, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

/* ── Music Card ───────────────────────────────────────────── */
function MusicCard({ music, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 8,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        backgroundColor: '#ffffff', border: '1px solid #e5e0d8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.14)' : '0 4px 20px rgba(0,0,0,0.10)',
        transition: 'box-shadow 0.2s', cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(200,151,43,0.12)' }}>
        <Music size={18} style={{ color: '#c8972b' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#2c2c3e' }}>{music.titulo}</div>
        {music.letra && (
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {music.letra.slice(0, 100)}...
          </div>
        )}
      </div>
    </button>
  )
}

/* ── Music Modal ──────────────────────────────────────────── */
function MusicModal({ music, onClose }) {
  if (!music) return null
  return (
    <Modal isOpen={!!music} onClose={onClose} title={music.titulo}>
      {music.letra ? (
        <pre style={{ fontSize: 14, lineHeight: 1.7, color: '#2c2c3e', whiteSpace: 'pre-wrap', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
          {music.letra}
        </pre>
      ) : (
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Letra não disponível.</p>
      )}
    </Modal>
  )
}

/* ── Music Group ──────────────────────────────────────────── */
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
        <div style={{ borderTop: '1px solid #f0ece5', padding: '8px' }}>
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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', gap: 12 }}>
        <Music size={40} style={{ color: '#e5e0d8' }} />
        <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Nenhuma música encontrada.</p>
      </div>
    )
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

/* ── Main Page ────────────────────────────────────────────── */
export default function Musicas() {
  const navigate      = useNavigate()
  const [musicas,     setMusicas]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)
  const [playlistUrl, setPlaylistUrl] = useState(null)

  useEffect(() => {
    api.get('/musicas')
      .then(r => setMusicas(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
    api.get('/notificacoes/playlist')
      .then(r => setPlaylistUrl(r.data?.playlistUrl || null))
      .catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: '#3a2a1a', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Music size={18} color="#c8972b" />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b' }}>
            Pontos Cantados
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ponto cantado..."
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
      <div style={{ flex: 1, padding: 16, paddingBottom: 80, backgroundColor: '#f8f5f0' }}>
        {loading ? <LoadingSpinner /> : musicas.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', gap: 12 }}>
            <Music size={40} style={{ color: '#e5e0d8' }} />
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Nenhuma música cadastrada.</p>
          </div>
        ) : (
          <>
            {playlistUrl && (
              <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', marginBottom: 14, borderRadius: 8, backgroundColor: '#fff', border: '1px solid #fecaca', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(220,38,38,0.15)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Youtube size={20} color="#dc2626"/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2c2c3e' }}>Playlist completa do Terreiro</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Ouça todos os pontos cantados no YouTube</div>
                </div>
                <Play size={14} color="#dc2626" style={{ flexShrink: 0 }}/>
              </a>
            )}
            <MusicGroups musicas={musicas} onSelect={setSelected} search={search} />
          </>
        )}
      </div>

      {/* Fixed back footer */}
      <div
        onClick={() => navigate(-1)}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '18px 20px 24px', background: 'linear-gradient(to top, rgba(255,255,255,0.97) 60%, transparent)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, cursor: 'pointer', zIndex: 30, userSelect: 'none' }}
      >
        <ArrowLeft size={22} color="#2c2c3e" />
        <span style={{ fontSize: 18, fontWeight: 800, color: 'transparent', WebkitTextStroke: '1.5px #2c2c3e', fontFamily: "'Poppins', sans-serif", letterSpacing: '2px', textTransform: 'uppercase' }}>
          Voltar
        </span>
      </div>

      <MusicModal music={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
