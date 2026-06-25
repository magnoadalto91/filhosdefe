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

function ItemCard({ item, onEdit, onDelete, onToggleLista, selected, onToggleSelect }) {
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
    <div style={{ backgroundColor: selected ? '#fef9f0' : '#fff', borderRadius: 12, border: selected ? '2px solid #c8972b' : '1px solid #e5e0d8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', fontFamily: "'Poppins', sans-serif" }}>

      {/* Cabeçalho: checkbox + foto + nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px' }}>
        <input type="checkbox" checked={!!selected} onChange={() => onToggleSelect?.(item.id)}
          style={{ cursor: 'pointer', accentColor: '#c8972b', flexShrink: 0, width: 17, height: 17 }}/>
        {item.fotoUrl
          ? <img src={item.fotoUrl} alt={item.nome} style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}/>
          : <div style={{ width: 54, height: 54, borderRadius: 10, backgroundColor: 'rgba(200,151,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={22} color="#d1c4b0"/>
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2c2c3e', lineHeight: 1.35, wordBreak: 'break-word' }}>{item.nome}</div>
          {savingQtd && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>salvando...</div>}
        </div>
      </div>

      {/* Controle de quantidade */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '10px 16px', backgroundColor: '#f8f5f0', borderTop: '1px solid #f0ece5', borderBottom: '1px solid #f0ece5' }}>
        <button
          onClick={() => handleQtyChange(Math.max(0, qtd - 1))}
          style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #e5e0d8', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.backgroundColor = 'rgba(200,151,43,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.backgroundColor = '#fff' }}>
          <Minus size={16} color="#6b7280"/>
        </button>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#2c2c3e', minWidth: 40, textAlign: 'center' }}>{qtd}</span>
        <button
          onClick={() => handleQtyChange(qtd + 1)}
          style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #e5e0d8', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.backgroundColor = 'rgba(200,151,43,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.backgroundColor = '#fff' }}>
          <Plus size={16} color="#6b7280"/>
        </button>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px 14px' }}>
        <button
          onClick={handleToggle} disabled={loadingLista}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
            transition: 'all 0.15s', opacity: loadingLista ? 0.6 : 1,
            backgroundColor: item.precisaRepor ? 'rgba(22,163,74,0.12)' : 'rgba(200,151,43,0.12)',
            color: item.precisaRepor ? '#16a34a' : '#c8972b',
          }}>
          {item.precisaRepor ? <><Check size={15}/> Marcar reposto</> : <><ShoppingCart size={15}/> Precisa repor</>}
        </button>
        <button onClick={() => onEdit(item)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e0d8', backgroundColor: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b7280', transition: 'all 0.15s', flexShrink: 0, fontFamily: "'Poppins', sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}>
          <Pencil size={14}/> Editar
        </button>
        <button onClick={() => onDelete(item)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fff', cursor: 'pointer', color: '#dc2626', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
          <Trash2 size={15}/>
        </button>
      </div>
    </div>
  )
}

export default function AdminEstoque() {
  const [items,          setItems]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [modal,          setModal]          = useState(null)
  const [confirm,        setConfirm]        = useState(null)
  const [selectedIds,    setSelectedIds]    = useState(new Set())
  const [bulkConfirm,    setBulkConfirm]    = useState(false)

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

  const toggleSelect = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const toggleAll    = () => setSelectedIds(prev => prev.size === items.length ? new Set() : new Set(items.map(i=>i.id)))
  const handleBulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map(id => api.delete(`/estoque/${id}`)))
      setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
    } catch {}
    setBulkConfirm(false)
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
      <div style={{ marginBottom: 28 }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e0d8', backgroundColor: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#6b7280', transition: 'all 0.15s', whiteSpace: 'nowrap', marginBottom: 16 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8972b'; e.currentTarget.style.color = '#c8972b' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
        >
          <ArrowLeft size={15} /> Painel principal
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#2c2c3e', whiteSpace: 'nowrap' }}>Controle de Estoque</h1>
            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
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
      </div>

      {/* Em estoque */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8972b' }}>
        Em Estoque · {emEstoque.length}
      </div>
      <p style={{ margin: '2px 0 12px', fontSize: 12, color: '#9ca3af' }}>Itens disponíveis no terreiro</p>

      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:'#fef3cd', borderRadius:8, marginBottom:16, border:'1px solid #f9d971' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', flex:1, fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size} selecionado(s)</span>
          <button onClick={toggleAll} style={{ fontSize:12, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>{selectedIds.size===items.length?'Desmarcar todos':'Selecionar todos'}</button>
          <button onClick={()=>setBulkConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, backgroundColor:'#dc2626', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>Excluir {selectedIds.size}</button>
        </div>
      )}

      {emEstoque.length === 0
        ? <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13, border: '1px dashed #e5e0d8', borderRadius: 10 }}>Nenhum item em estoque.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {emEstoque.map(item => (
              <ItemCard key={item.id} item={item}
                onEdit={setModal}
                onDelete={setConfirm}
                onToggleLista={handleToggleLista}
                selected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
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
                selected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
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
      {bulkConfirm && (
        <ConfirmModal
          msg={`Excluir ${selectedIds.size} item(s) selecionado(s) do estoque?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkConfirm(false)}
        />
      )}
    </div>
  )
}
