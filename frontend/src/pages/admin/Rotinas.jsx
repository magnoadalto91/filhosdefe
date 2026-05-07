import { useEffect, useState } from 'react'
import { ListChecks, Plus, Pencil, Trash2, AlertCircle, GripVertical } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { titulo: '', descricao: '', ordem: 1 }

function RotinaForm({ form, setForm, error }) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}>
          <AlertCircle size={15} />{error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Título *</label>
        <input
          value={form.titulo}
          onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Título da rotina"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Descrição detalhada da rotina..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Ordem</label>
        <input
          type="number"
          min="1"
          value={form.ordem}
          onChange={(e) => setForm(f => ({ ...f, ordem: parseInt(e.target.value) || 1 }))}
          className="w-24 px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
        />
      </div>
    </div>
  )
}

export default function AdminRotinas() {
  const [rotinas, setRotinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/rotinas')
      const list = Array.isArray(res.data) ? res.data : res.data.rotinas || []
      setRotinas([...list].sort((a, b) => (a.ordem || 0) - (b.ordem || 0)))
    } catch {
      setRotinas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditTarget(null)
    const nextOrdem = rotinas.length > 0 ? Math.max(...rotinas.map(r => r.ordem || 0)) + 1 : 1
    setForm({ ...emptyForm, ordem: nextOrdem })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (r) => {
    setEditTarget(r)
    setForm({ titulo: r.titulo || '', descricao: r.descricao || '', ordem: r.ordem || 1 })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await api.put(`/rotinas/${editTarget._id}`, form)
      } else {
        await api.post('/rotinas', form)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/rotinas/${deleteTarget._id}`)
      load()
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F8F5FF' }}>Rotinas</h1>
          <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>{rotinas.length} rotina(s) cadastrada(s)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.6)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.4)' }}
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : rotinas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <ListChecks size={40} style={{ color: '#2D1B69' }} />
          <p className="text-sm" style={{ color: '#A78BFA' }}>Nenhuma rotina cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rotinas.map((r) => (
            <div
              key={r._id}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
            >
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                <GripVertical size={16} style={{ color: '#2D1B69' }} />
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}
                >
                  {r.ordem}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: '#F8F5FF' }}>{r.titulo}</div>
                {r.descricao && (
                  <div className="text-xs mt-0.5 line-clamp-2" style={{ color: '#A78BFA' }}>{r.descricao}</div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#A78BFA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F8F5FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(r)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#A78BFA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Rotina' : 'Nova Rotina'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#7C3AED', color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <RotinaForm form={form} setForm={setForm} error={formError} />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Rotina"
        message={`Tem certeza que deseja excluir "${deleteTarget?.titulo}"?`}
      />
    </div>
  )
}
