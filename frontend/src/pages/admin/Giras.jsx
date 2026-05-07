import { useEffect, useState } from 'react'
import { Calendar, Plus, Pencil, Trash2, AlertCircle, Users, Music, ListChecks, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { titulo: '', data: '', descricao: '', instrucoes: '' }

function GiraForm({ form, setForm, error }) {
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
          placeholder="Título da gira"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Data *</label>
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF', colorScheme: 'dark' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
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
          placeholder="Descrição da gira..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>Instruções</label>
        <textarea
          value={form.instrucoes}
          onChange={(e) => setForm(f => ({ ...f, instrucoes: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF' }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
          placeholder="Instruções para os participantes..."
        />
      </div>
    </div>
  )
}

function MultiSelectField({ label, Icon, allItems, selectedIds, onChange, nameKey = 'titulo' }) {
  const [open, setOpen] = useState(false)

  const toggle = (id) => {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]
    )
  }

  const selectedNames = allItems
    .filter(i => selectedIds.includes(i._id))
    .map(i => i[nameKey] || i.nome)

  return (
    <div>
      <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: '#A78BFA' }}>
        <span className="flex items-center gap-1"><Icon size={12} />{label}</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69', color: '#F8F5FF', textAlign: 'left' }}
      >
        <span style={{ color: selectedNames.length ? '#F8F5FF' : '#A78BFA' }}>
          {selectedNames.length ? selectedNames.slice(0, 2).join(', ') + (selectedNames.length > 2 ? ` +${selectedNames.length - 2}` : '') : `Selecionar ${label.toLowerCase()}...`}
        </span>
        {open ? <ChevronUp size={14} style={{ color: '#A78BFA' }} /> : <ChevronDown size={14} style={{ color: '#A78BFA' }} />}
      </button>
      {open && (
        <div
          className="mt-1 rounded-lg overflow-hidden max-h-40 overflow-y-auto"
          style={{ backgroundColor: '#0D0818', border: '1px solid #2D1B69' }}
        >
          {allItems.length === 0 ? (
            <div className="p-3 text-xs text-center" style={{ color: '#A78BFA' }}>Nenhum item disponível</div>
          ) : allItems.map((item) => {
            const isSelected = selectedIds.includes(item._id)
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => toggle(item._id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left"
                style={{
                  backgroundColor: isSelected ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: isSelected ? '#F8F5FF' : '#A78BFA',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.1)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isSelected ? '#7C3AED' : 'transparent',
                    border: `1px solid ${isSelected ? '#7C3AED' : '#2D1B69'}`,
                  }}
                >
                  {isSelected && <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#fff' }} />}
                </div>
                {item[nameKey] || item.nome}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AssocModal({ gira, allEntidades, allMusicas, allRotinas, onClose, onSaved }) {
  const [entidades, setEntidades] = useState(gira?.entidades?.map(e => e._id || e) || [])
  const [musicas, setMusicas] = useState(gira?.musicas?.map(m => m._id || m) || [])
  const [rotinas, setRotinas] = useState(gira?.rotinas?.map(r => r._id || r) || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await api.put(`/giras/${gira._id}`, {
        ...gira,
        entidades,
        musicas,
        rotinas,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar associações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={!!gira}
      onClose={onClose}
      title={`Associações — ${gira?.titulo}`}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: '#7C3AED', color: '#fff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}>
            <AlertCircle size={15} />{error}
          </div>
        )}
        <MultiSelectField
          label="Entidades"
          Icon={Users}
          allItems={allEntidades}
          selectedIds={entidades}
          onChange={setEntidades}
          nameKey="nome"
        />
        <MultiSelectField
          label="Músicas"
          Icon={Music}
          allItems={allMusicas}
          selectedIds={musicas}
          onChange={setMusicas}
          nameKey="titulo"
        />
        <MultiSelectField
          label="Rotinas"
          Icon={ListChecks}
          allItems={allRotinas}
          selectedIds={rotinas}
          onChange={setRotinas}
          nameKey="titulo"
        />
      </div>
    </Modal>
  )
}

function GiraCard({ gira, isPast, onEdit, onDelete, onAssoc }) {
  const date = new Date(gira.data)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        backgroundColor: '#1A1030',
        border: `1px solid ${isPast ? '#2D1B69' : 'rgba(245,158,11,0.3)'}`,
        opacity: isPast ? 0.7 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold" style={{ color: '#F8F5FF' }}>{gira.titulo}</div>
            <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: isPast ? '#A78BFA' : '#F59E0B' }}>
              <Clock size={11} />{dateStr}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onAssoc(gira)} className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#A78BFA' }} title="Gerenciar associações"
              onMouseEnter={(e) => e.currentTarget.style.color = '#7C3AED'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}>
              <ListChecks size={15} />
            </button>
            <button onClick={() => onEdit(gira)} className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#A78BFA' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F8F5FF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}>
              <Pencil size={15} />
            </button>
            <button onClick={() => onDelete(gira)} className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#A78BFA' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A78BFA'}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {gira.descricao && (
          <p className="text-xs line-clamp-2 mb-2" style={{ color: '#A78BFA' }}>{gira.descricao}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {gira.entidades?.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid #2D1B69' }}>
              <Users size={10} />{gira.entidades.length} entidade{gira.entidades.length !== 1 ? 's' : ''}
            </span>
          )}
          {gira.musicas?.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid #2D1B69' }}>
              <Music size={10} />{gira.musicas.length} música{gira.musicas.length !== 1 ? 's' : ''}
            </span>
          )}
          {gira.rotinas?.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid #2D1B69' }}>
              <ListChecks size={10} />{gira.rotinas.length} rotina{gira.rotinas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminGiras() {
  const [giras, setGiras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [assocTarget, setAssocTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [allEntidades, setAllEntidades] = useState([])
  const [allMusicas, setAllMusicas] = useState([])
  const [allRotinas, setAllRotinas] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/giras')
      const list = Array.isArray(res.data) ? res.data : res.data.giras || []
      setGiras([...list].sort((a, b) => new Date(b.data) - new Date(a.data)))
    } catch {
      setGiras([])
    } finally {
      setLoading(false)
    }
  }

  const loadRelated = async () => {
    const [e, m, r] = await Promise.allSettled([
      api.get('/entidades'),
      api.get('/musicas'),
      api.get('/rotinas'),
    ])
    setAllEntidades(e.status === 'fulfilled' ? (Array.isArray(e.value.data) ? e.value.data : []) : [])
    setAllMusicas(m.status === 'fulfilled' ? (Array.isArray(m.value.data) ? m.value.data : []) : [])
    setAllRotinas(r.status === 'fulfilled' ? (Array.isArray(r.value.data) ? r.value.data : []) : [])
  }

  useEffect(() => { load(); loadRelated() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (g) => {
    setEditTarget(g)
    const dateStr = g.data ? new Date(g.data).toISOString().split('T')[0] : ''
    setForm({ titulo: g.titulo || '', data: dateStr, descricao: g.descricao || '', instrucoes: g.instrucoes || '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setFormError('Título é obrigatório.'); return }
    if (!form.data) { setFormError('Data é obrigatória.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await api.put(`/giras/${editTarget._id}`, form)
      } else {
        await api.post('/giras', form)
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
      await api.delete(`/giras/${deleteTarget._id}`)
      load()
    } catch {
      // ignore
    }
  }

  const now = new Date()
  const upcoming = giras.filter(g => new Date(g.data) >= now)
  const past = giras.filter(g => new Date(g.data) < now)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F8F5FF' }}>Giras</h1>
          <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>{upcoming.length} próxima(s) · {past.length} passada(s)</p>
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
      ) : giras.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Calendar size={40} style={{ color: '#2D1B69' }} />
          <p className="text-sm" style={{ color: '#A78BFA' }}>Nenhuma gira cadastrada.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F59E0B' }}>
                Próximas giras
              </h2>
              <div className="space-y-3">
                {[...upcoming].reverse().map(g => (
                  <GiraCard key={g._id} gira={g} isPast={false}
                    onEdit={openEdit} onDelete={setDeleteTarget} onAssoc={setAssocTarget} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#A78BFA' }}>
                Giras passadas
              </h2>
              <div className="space-y-3">
                {past.map(g => (
                  <GiraCard key={g._id} gira={g} isPast={true}
                    onEdit={openEdit} onDelete={setDeleteTarget} onAssoc={setAssocTarget} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Gira' : 'Nova Gira'}
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
        <GiraForm form={form} setForm={setForm} error={formError} />
      </Modal>

      {/* Associations Modal */}
      {assocTarget && (
        <AssocModal
          gira={assocTarget}
          allEntidades={allEntidades}
          allMusicas={allMusicas}
          allRotinas={allRotinas}
          onClose={() => setAssocTarget(null)}
          onSaved={load}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Gira"
        message={`Tem certeza que deseja excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
