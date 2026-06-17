import { useEffect, useState } from 'react'
import { GlassWater, Search, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

function BebidaCard({ bebida, onClick }) {
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
        {bebida.fotoUrl ? (
          <img src={bebida.fotoUrl} alt={bebida.nome}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlassWater size={32} style={{ color: '#e5e0d8' }} />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px', flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2c2c3e' }}>{bebida.nome}</div>
        {bebida.descricao && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {bebida.descricao}
          </div>
        )}
      </div>
    </button>
  )
}

function BebidaModal({ bebida, onClose }) {
  if (!bebida) return null
  const secLabel = txt => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 6 }}>{txt}</div>
  )
  return (
    <Modal isOpen={!!bebida} onClose={onClose} title={bebida.nome}>
      {bebida.fotoUrl && (
        <img src={bebida.fotoUrl} alt={bebida.nome}
          style={{ width: '100%', height: 'auto', borderRadius: 6, marginBottom: 20, display: 'block' }}/>
      )}
      <div style={{ marginBottom: 16 }}>
        {secLabel('Nome')}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2c2c3e' }}>{bebida.nome}</div>
      </div>
      {bebida.descricao && (
        <div style={{ marginBottom: 16 }}>
          {secLabel('Descrição')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{bebida.descricao}</p>
        </div>
      )}
      {bebida.observacoes && (
        <div>
          {secLabel('Observações')}
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#2c2c3e', whiteSpace: 'pre-wrap' }}>{bebida.observacoes}</p>
        </div>
      )}
    </Modal>
  )
}

export default function Bebidas() {
  const navigate   = useNavigate()
  const [bebidas,  setBebidas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/bebidas')
      .then(r => setBebidas(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? bebidas.filter(b => b.nome?.toLowerCase().includes(search.toLowerCase()))
    : bebidas

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1a1a3a', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GlassWater size={18} color="#c8972b" />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
            Bebidas
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
            placeholder="Buscar bebida..."
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
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', gap: 12 }}>
            <GlassWater size={40} style={{ color: '#e5e0d8' }} />
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
              {search ? 'Nenhum resultado encontrado.' : 'Nenhuma bebida cadastrada.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {filtered.map(b => <BebidaCard key={b.id} bebida={b} onClick={() => setSelected(b)} />)}
          </div>
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

      <BebidaModal bebida={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

