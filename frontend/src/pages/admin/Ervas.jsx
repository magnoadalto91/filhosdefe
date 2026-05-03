import { useEffect, useState, useRef } from 'react'
import { Leaf, Plus, Search, Pencil, Trash2, AlertCircle, Image } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { nome: '', descricao: '', usos: '', noQuintal: false, foto: '' }

function HerbForm({ form, setForm, error, preview, setPreview }) {
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      setForm(f => ({ ...f, foto: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}>
          <AlertCircle size={15} />{error}
        </div>
      )}

      {/* Photo */}
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Foto</label>
        <div
          className="w-full h-36 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative"
          style={{ backgroundColor: '#0D0818', border: '2px dashed #2D1B69' }}
          onClick={() => fileRef.current?.click()}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Image size={28} style={{ color: '#2D1B69' }} />
              <span className="text-xs mt-1" style={{ color: '#A78BFA' }}>Clique para selecionar imagem</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Nome *</label>
        <input
          value={form.nome}
          onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Nome da erva"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Descrição da erva..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Usos</label>
        <textarea
          value={form.usos}
          onChange={(e) => setForm(f => ({ ...f, usos: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Usos e propriedades..."
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
          style={{ backgroundColor: form.noQuintal ? '#7C3AED' : '#2D1B69' }}
          onClick={() => setForm(f => ({ ...f, noQuintal: !f.noQuintal }))}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full transition-transform"
            style={{
              backgroundColor: '#fff',
              left: form.noQuintal ? '1.25rem' : '0.25rem',
            }}
          />
        </div>
        <span className="text-sm" style={{ color: '#F8F5FF' }}>Temos no quintal</span>
      </label>
    </div>
  )
}

export default function AdminErvas() {
  const [ervas, setErvas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ervas')
      setErvas(Array.isArray(res.data) ? res.data : res.data.ervas || [])
    } catch {
      setErvas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setPreview('')
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (e) => {
    setEditTarget(e)
    setForm({ nome: e.nome || '', descricao: e.descricao || '', usos: e.usos || '', noQuintal: e.noQuintal || false, foto: e.foto || '' })
    setPreview(e.foto || '')
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await api.put(`/ervas/${editTarget._id}`, form)
      } else {
        await api.post('/ervas', form)
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
      await api.delete(`/ervas/${deleteTarget._id}`)
      load()
    } catch {
      // ignore
    }
  }

  const filtered = ervas.filter(e =>
    e.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F8F5FF' }}>Ervas</h1>
          <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>{ervas.length} erva(s) cadastrada(s)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#7C3AED', color: '#fff' }}
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A78BFA' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar erva..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Leaf size={40} style={{ color: '#2D1B69' }} />
          <p className="text-sm" style={{ color: '#A78BFA' }}>Nenhuma erva encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((e) => (
            <div
              key={e._id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
            >
              <div className="aspect-video relative" style={{ backgroundColor: '#0D0818' }}>
                {e.foto ? (
                  <img src={e.foto} alt={e.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf size={28} style={{ color: '#2D1B69' }} />
                  </div>
                )}
                {e.noQuintal && (
                  <div
                    className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(245,158,11,0.9)', color: '#0D0818' }}
                  >
                    Quintal
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <div className="font-semibold text-sm truncate" style={{ color: '#F8F5FF' }}>{e.nome}</div>
                {e.descricao && (
                  <div className="text-xs mt-0.5 line-clamp-2" style={{ color: '#A78BFA' }}>{e.descricao}</div>
                )}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => openEdit(e)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-colors"
                    style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}
                    onMouseEnter={(ev) => ev.currentTarget.style.borderColor = '#7C3AED'}
                    onMouseLeave={(ev) => ev.currentTarget.style.borderColor = '#2D1B69'}
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteTarget(e)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}
                    onMouseEnter={(ev) => { ev.currentTarget.style.borderColor = '#EF4444'; ev.currentTarget.style.color = '#EF4444' }}
                    onMouseLeave={(ev) => { ev.currentTarget.style.borderColor = '#2D1B69'; ev.currentTarget.style.color = '#A78BFA' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Erva' : 'Nova Erva'}
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
        <HerbForm form={form} setForm={setForm} error={formError} preview={preview} setPreview={setPreview} />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Erva"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
      />
    </div>
  )
}
