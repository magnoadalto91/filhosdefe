import { useEffect, useState } from 'react'
import { Users, Search, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

function EntityCard({ entity, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', textAlign: 'left', borderRadius: 8, overflow: 'hidden',
        backgroundColor: '#ffffff', border: '1px solid #e5e0d8',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s', fontFamily: "'Poppins', sans-serif",
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

export default function Entidades() {
  const navigate    = useNavigate()
  const [entidades, setEntidades] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [selected,  setSelected]  = useState(null)

  useEffect(() => {
    api.get('/entidades')
      .then(r => setEntidades(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? entidades.filter(e => e.nome?.toLowerCase().includes(search.toLowerCase()))
    : entidades

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: '#2c2c3e', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={18} color="#c8972b" />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b' }}>
            Orixás / Entidades
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
            placeholder="Buscar orixá ou entidade..."
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
            <Users size={40} style={{ color: '#e5e0d8' }} />
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
              {search ? 'Nenhum resultado encontrado.' : 'Nenhuma entidade cadastrada.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(e => <EntityCard key={e.id} entity={e} onClick={() => setSelected(e)} />)}
          </div>
        )}
      </div>

      {/* Fixed back button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e0d8', boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'center', zIndex: 30 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 8, border: '1px solid #e5e0d8', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#6b7280', fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
        >
          <ArrowLeft size={17} /> Voltar
        </button>
      </div>

      <EntityModal entity={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
