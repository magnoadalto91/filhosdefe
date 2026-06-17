import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Plus, Package, ShoppingCart, Check, Trash2, Pencil, X, Minus } from 'lucide-react'
import api from '../../api/axios'
import LoadingSpinner from '../../components/LoadingSpinner'

const S = {
  page:      { fontFamily: "'Poppins', sans-serif" },
  card:      { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e0d8', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14 },
  section:   { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b', marginBottom: 10, marginTop: 28 },
  btnGold:   { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, backgroundColor: '#c8972b', color: '#fff', transition: 'background 0.15s' },
  btnGhost:  { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1px solid #e5e0d8', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, backgroundColor: '#fff', color: '#6b7280', transition: 'all 0.15s' },
  input:     { padding: '9px 13px', border: '1px solid #e5e0d8', borderRadius: 7, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: '#2c2c3e', outline: 'none', width: '100%', boxSizing: 'border-box' },
  qtyBtn:    { width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e0d8', backgroundColor: '#f8f5f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' },
}

function PhotoPlaceholder() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: 'rgba(200,151,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Package size={22} color="#d1c4b0" />
    </div>
  )
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(28,28,46,0.45)', backdropFilter: 'blur(3px)', padding: 20 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%', fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#2c2c3e', lineHeight: 1.5 }}>{msg}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ ...S.btnGhost }}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...S.btnGold, backgroundColor: '#dc2626' }}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

function ItemModal({ item, onClose, onSaved }) {
  const [nome, setNome]       = useState(item?.nome || '')
  const [qtd, setQtd]         = useState(item?.quantidade ?? 0)
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(item?.fotoUrl || null)
  const [saving, setSaving]   = useState(false)
  const fileRef = useRef()

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('nome', nome.trim())
      fd.append('quantidade', qtd)
      if (file) fd.append('foto', file)
      const res = item
        ? await api.put(`/estoque/${item.id}`, fd)
        : await api.post('/estoque', fd)
      onSaved(res.data, !!item)
      onClose()
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(28,28,46,0.45)', backdropFilter: 'blur(3px)', padding: 20 }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%', fontFamily: "'Poppins', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#2c2c3e' }}>{item ? 'Editar item' : 'Novo item'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex', borderRadius: 6 }}><X size={20}/></button>
        </div>

        {/* Foto */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{ width: 90, height: 90, borderRadius: 12, margin: '0 auto 8px', cursor: 'pointer', border: '2px dashed #e5e0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#f8f5f0', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c8972b'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e0d8'}
          >
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Package size={28} color="#d1c4b0" />
            }
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Clique para {preview ? 'trocar' : 'adicionar'} foto</span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        {/* Nome */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Nome do item</label>
          <input style={S.input} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Vela branca" />
        </div>

        {/* Quantidade */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Quantidade</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" style={S.qtyBtn} onClick={() => setQtd(q => Math.max(0, q - 1))}><Minus size={14} color="#6b7280"/></button>
            <input
              type="number" min="0"
              style={{ ...S.input, width: 80, textAlign: 'center' }}
              value={qtd}
              onChange={e => setQtd(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <button type="button" style={S.qtyBtn} onClick={() => setQtd(q => q + 1)}><Plus size={14} color="#6b7280"/></button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>Cancelar</button>
          <button onClick={handleSave} disabled={saving || !nome.trim()} style={{ ...S.btnGold, opacity: (saving || !nome.trim()) ? 0.6 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemCard({ item, onEdit, onDelete, onToggleLista }) {
  const [loadingLista, setLoadingLista] = useState(false)
  const [qtd, setQtd] = useState(item.quantidade)
  const [savingQtd, setSavingQtd] = useState(false)
  const debounceRef = useRef(null)

  const handleQtyChange = (newQtd) => {
    setQtd(newQtd)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSavingQtd(true)
      try { await api.put(`/estoque/${item.id}`, { nome: item.nome, quantidade: newQtd }) }
      catch {}
      finally { setSavingQtd(false) }
    }, 700)
  }

  const handleToggle = async () => {
    setLoadingLista(true)
    try { await onToggleLista(item.id, !item.precisaRepor) }
    finally { setLoadingLista(false) }
  }

  return (
    <div style={S.card}>
      {/* Foto */}
      {item.fotoUrl
        ? <img src={item.fotoUrl} alt={item.nome} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        : <PhotoPlaceholder />
      }

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2c2c3e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
          <button style={S.qtyBtn} onClick={() => handleQtyChange(Math.max(0, qtd - 1))}><Minus size={13} color="#6b7280"/></button>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#2c2c3e', minWidth: 28, textAlign: 'center' }}>{qtd}</span>
          <button style={S.qtyBtn} onClick={() => handleQtyChange(qtd + 1)}><Plus size={13} color="#6b7280"/></button>
          {savingQtd && <span style={{ fontSize: 11, color: '#9ca3af' }}>salvando...</span>}
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleToggle}
          disabled={loadingLista}
          title={item.precisaRepor ? 'Marcar como reposto' : 'Adicionar à lista de compras'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s',
            backgroundColor: item.precisaRepor ? 'rgba(22,163,74,0.1)' : 'rgba(200,151,43,0.1)',
            color: item.precisaRepor ? '#16a34a' : '#c8972b',
            opacity: loadingLista ? 0.6 : 1,
          }}
        >
          {item.precisaRepor ? <><Check size={13}/> Reposto</> : <><ShoppingCart size={13}/> Lista de compras</>}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(item)} title="Editar"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e0d8', backgroundColor: '#fff', cursor: 'pointer', fontSize: 12, color: '#6b7280', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
          >
            <Pencil size={12}/> Editar
          </button>
          <button onClick={() => onDelete(item)} title="Excluir"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid #fecaca', backgroundColor: '#fff', cursor: 'pointer', color: '#dc2626', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <Trash2 size={13}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminEstoque() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)   // null | 'new' | item object
  const [confirm, setConfirm] = useState(null)   // null | item object

  useEffect(() => {
    api.get('/estoque').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSaved = (saved, isEdit) => {
    setItems(prev => isEdit
      ? prev.map(i => i.id === saved.id ? saved : i)
      : [...prev, saved].sort((a, b) => a.nome.localeCompare(b.nome))
    )
  }

  const handleDelete = async () => {
    if (!confirm) return
    try {
      await api.delete(`/estoque/${confirm.id}`)
      setItems(prev => prev.filter(i => i.id !== confirm.id))
    } catch {}
    setConfirm(null)
  }

  const handleToggleLista = async (id, precisaRepor) => {
    const res = await api.patch(`/estoque/${id}/lista`, { precisaRepor })
    setItems(prev => prev.map(i => i.id === id ? res.data : i))
  }

  if (loading) return <LoadingSpinner />

  const emEstoque = items.filter(i => !i.precisaRepor)
  const listaCompras = items.filter(i => i.precisaRepor)

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e0d8', backgroundColor: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#6b7280', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
          >
            <ArrowLeft size={15} /> Painel principal
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#2c2c3e' }}>Controle de Estoque</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{items.length} {items.length === 1 ? 'item cadastrado' : 'itens cadastrados'}</p>
          </div>
        </div>
        <button
          onClick={() => setModal('new')}
          style={S.btnGold}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
        >
          <Plus size={15} /> Adicionar item
        </button>
      </div>

      {/* Em estoque */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b' }}>
        Em Estoque · {emEstoque.length}
      </div>
      <p style={{ margin: '2px 0 12px', fontSize: 12, color: '#9ca3af' }}>Itens disponíveis no terreiro</p>

      {emEstoque.length === 0
        ? <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13, border: '1px dashed #e5e0d8', borderRadius: 10 }}>Nenhum item em estoque.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {emEstoque.map(item => (
              <ItemCard key={item.id} item={item}
                onEdit={setModal}
                onDelete={setConfirm}
                onToggleLista={handleToggleLista}
              />
            ))}
          </div>
      }

      {/* Lista de compras */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#dc2626', marginTop: 36 }}>
        Lista de Compras · {listaCompras.length}
      </div>
      <p style={{ margin: '2px 0 12px', fontSize: 12, color: '#9ca3af' }}>Itens que precisam ser abastecidos</p>

      {listaCompras.length === 0
        ? <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13, border: '1px dashed #e5e0d8', borderRadius: 10 }}>Nenhum item na lista de compras.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {listaCompras.map(item => (
              <ItemCard key={item.id} item={item}
                onEdit={setModal}
                onDelete={setConfirm}
                onToggleLista={handleToggleLista}
              />
            ))}
          </div>
      }

      {/* Modals */}
      {modal && (
        <ItemModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {confirm && (
        <ConfirmModal
          msg={`Excluir "${confirm.nome}" do estoque?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
