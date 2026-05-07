import { useEffect, useState } from 'react'
import { Music, Plus, Search, Pencil, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { titulo: '', letra: '', youtubeUrl: '' }

function MusicForm({ form, setForm, error }) {
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
          placeholder="Nome da música"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Letra</label>
        <textarea
          value={form.letra}
          onChange={(e) => setForm(f => ({ ...f, letra: e.target.value }))}
          rows={8}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Letra da música..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>URL do YouTube</label>
        <input
          value={form.youtubeUrl}
          onChange={(e) => setForm(f => ({ ...f, youtubeUrl: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="https://youtube.com/..."
        />
      </div>
    </div>
  )
}

export default function AdminMusicas() {
  const [musicas, setMusicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/musicas')
      setMusicas(Array.isArray(res.data) ? res.data : res.data.musicas || [])
    } catch {
      setMusicas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (m) => {
    setEditTarget(m)
    setForm({ titulo: m.titulo || '', letra: m.letra || '', youtubeUrl: m.youtubeUrl || '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await api.put(`/musicas/${editTarget._id}`, form)
      } else {
        await api.post('/musicas', form)
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
      await api.delete(`/musicas/${deleteTarget._id}`)
      load()
    } catch {
      // ignore
    }
  }

  const filtered = musicas.filter(m =>
    m.titulo?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F8F5FF' }}>Músicas</h1>
          <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>{musicas.length} ponto(s) cantado(s)</p>
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

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A78BFA' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar música..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
        />
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Music size={40} style={{ color: '#2D1B69' }} />
          <p className="text-sm" style={{ color: '#A78BFA' }}>Nenhuma música encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(124,58,237,0.2)' }}
              >
                <Music size={16} style={{ color: '#7C3AED' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: '#F8F5FF' }}>{m.titulo}</div>
                {m.letra && (
                  <div className="text-xs truncate mt-0.5" style={{ color: '#A78BFA' }}>{m.letra.slice(0, 60)}...</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {m.youtubeUrl && (
                  <a
                    href={m.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: '#A78BFA' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <button
                  onClick={() => openEdit(m)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#A78BFA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F8F5FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(m)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Música' : 'Nova Música'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#7C3AED', color: '#fff', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        <MusicForm form={form} setForm={setForm} error={formError} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Música"
        message={`Tem certeza que deseja excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
