import { useEffect, useState, useRef } from 'react'
import { Users, Plus, Search, Pencil, Trash2, AlertCircle, Image, Music, Leaf } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { nome: '', historia: '', saudacao: '', coresVelas: '', foto: '' }

function EntityForm({ form, setForm, error, preview, setPreview }) {
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

      <div
        className="w-full h-36 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden"
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

      {[
        { field: 'nome', label: 'Nome *', placeholder: 'Nome da entidade' },
        { field: 'saudacao', label: 'Saudação', placeholder: 'Ex: Salve Ogum!' },
        { field: 'coresVelas', label: 'Cores das Velas', placeholder: 'Ex: Vermelho e branco' },
      ].map(({ field, label, placeholder }) => (
        <div key={field}>
          <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>{label}</label>
          <input
            value={form[field]}
            onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
            placeholder={placeholder}
          />
        </div>
      ))}

      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>História</label>
        <textarea
          value={form.historia}
          onChange={(e) => setForm(f => ({ ...f, historia: e.target.value }))}
          rows={5}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="História e características da entidade..."
        />
      </div>
    </div>
  )
}

function DetailModal({ entity, onClose }) {
  const [musicas, setMusicas] = useState([])
  const [ervas, setErvas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!entity) return
    setLoading(true)
    Promise.allSettled([
      api.get(`/entidades/${entity._id}/musicas`),
      api.get(`/entidades/${entity._id}/ervas`),
    ]).then(([m, e]) => {
      setMusicas(m.status === 'fulfilled' ? (Array.isArray(m.value.data) ? m.value.data : []) : [])
      setErvas(e.status === 'fulfilled' ? (Array.isArray(e.value.data) ? e.value.data : []) : [])
    }).finally(() => setLoading(false))
  }, [entity])

  if (!entity) return null

  return (
    <Modal isOpen={!!entity} onClose={onClose} title={entity.nome}>
      {entity.foto && (
        <img src={entity.foto} alt={entity.nome} className="w-full rounded-lg mb-4 object-cover max-h-48" />
      )}
      {entity.saudacao && (
        <div className="p-3 rounded-lg mb-3 italic text-sm"
          style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
          "{entity.saudacao}"
        </div>
      )}
      {entity.coresVelas && (
        <p className="text-sm mb-3" style={{ color: '#F8F5FF' }}>
          <span style={{ color: '#A78BFA' }}>Velas: </span>{entity.coresVelas}
        </p>
      )}
      {entity.historia && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ color: '#F8F5FF' }}>{entity.historia}</p>
      )}
      {loading ? <LoadingSpinner /> : (
        <>
          {musicas.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Music size={13} style={{ color: '#A78BFA' }} />
                <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Músicas associadas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {musicas.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid #2D1B69' }}>
                    {m.titulo || m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ervas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={13} style={{ color: '#A78BFA' }} />
                <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Ervas associadas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ervas.map((e, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.3)' }}>
                    {e.nome || e}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

export default function AdminEntidades() {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/entidades')
      setEntidades(Array.isArray(res.data) ? res.data : res.data.entidades || [])
    } catch {
      setEntidades([])
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
    setForm({ nome: e.nome || '', historia: e.historia || '', saudacao: e.saudacao || '', coresVelas: e.coresVelas || '', foto: e.foto || '' })
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
        await api.put(`/entidades/${editTarget._id}`, form)
      } else {
        await api.post('/entidades', form)
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
      await api.delete(`/entidades/${deleteTarget._id}`)
      load()
    } catch {
      // ignore
    }
  }

  const filtered = entidades.filter(e =>
    e.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F8F5FF' }}>Entidades</h1>
          <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>{entidades.length} entidade(s) cadastrada(s)</p>
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
          placeholder="Buscar entidade..."
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
          <Users size={40} style={{ color: '#2D1B69' }} />
          <p className="text-sm" style={{ color: '#A78BFA' }}>Nenhuma entidade encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((e) => (
            <div
              key={e._id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
            >
              <button
                className="w-full aspect-square block relative"
                style={{ backgroundColor: '#0D0818' }}
                onClick={() => setDetailTarget(e)}
              >
                {e.foto ? (
                  <img src={e.foto} alt={e.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users size={32} style={{ color: '#2D1B69' }} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 px-2 py-1.5"
                  style={{ background: 'linear-gradient(transparent, rgba(13,8,24,0.9))' }}>
                  <div className="text-xs font-semibold truncate" style={{ color: '#F8F5FF' }}>{e.nome}</div>
                </div>
              </button>
              {e.saudacao && (
                <div className="px-2.5 py-1.5">
                  <div className="text-xs italic truncate" style={{ color: '#A78BFA' }}>"{e.saudacao}"</div>
                </div>
              )}
              <div className="flex gap-1 p-2">
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
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Entidade' : 'Nova Entidade'}
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
        <EntityForm form={form} setForm={setForm} error={formError} preview={preview} setPreview={setPreview} />
      </Modal>

      <DetailModal entity={detailTarget} onClose={() => setDetailTarget(null)} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Entidade"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
      />
    </div>
  )
}
