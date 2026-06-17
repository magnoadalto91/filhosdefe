import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

function fmtData(iso) {
  const d = new Date(iso)
  const date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const hora = `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`
  return `${date.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })} às ${hora}`
}

export default function PresencaModal() {
  const { isAuthenticated } = useAuth()
  const [pending,       setPending]       = useState([])
  const [idx,           setIdx]           = useState(0)
  const [step,          setStep]          = useState('choice')   // 'choice' | 'recusa'
  const [justificativa, setJustificativa] = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [loaded,        setLoaded]        = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/giras/presenca-pendente')
      .then(r => setPending(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [isAuthenticated])

  const gira = pending[idx]

  // Nothing to show
  if (!loaded || !gira) return null

  const total  = pending.length
  const number = idx + 1

  const advance = () => {
    setStep('choice')
    setJustificativa('')
    setError('')
    setIdx(i => i + 1)   // when idx >= total, gira becomes undefined → modal disappears
  }

  const submit = async (confirmado, just = '') => {
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/giras/${gira.id}/presenca`, {
        confirmado,
        justificativa: just,
      })
      advance()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmar = () => submit(true)

  const handleEnviarRecusa = () => {
    if (!justificativa.trim()) {
      setError('Por favor, informe o motivo da ausência.')
      return
    }
    submit(false, justificativa.trim())
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backgroundColor: 'rgba(28,28,46,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: '#1a1a3a', padding: '22px 28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={18} color="#c8972b" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b' }}>
                Confirmação de Presença
              </span>
            </div>
            {total > 1 && (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {number} / {total}
              </span>
            )}
          </div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 20, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
            {gira.titulo}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize' }}>
            {fmtData(gira.data)}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {step === 'choice' && (
            <>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                {gira.descricao || 'Você poderá participar desta Gira? Confirme sua presença abaixo.'}
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleConfirmar}
                  disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '14px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    backgroundColor: '#059669', color: '#fff',
                    fontSize: 15, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                    opacity: submitting ? 0.7 : 1, transition: 'background 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#047857' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#059669' }}
                >
                  <CheckCircle size={19} />
                  {submitting ? 'Salvando...' : 'Vou estar presente'}
                </button>

                <button
                  onClick={() => { setStep('recusa'); setError('') }}
                  disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '14px 20px', borderRadius: 10, border: '1px solid #fecaca', cursor: 'pointer',
                    backgroundColor: '#fff', color: '#dc2626',
                    fontSize: 15, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
                    opacity: submitting ? 0.7 : 1, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = '#fef2f2' } }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff' }}
                >
                  <XCircle size={19} />
                  Não poderei ir
                </button>
              </div>
            </>
          )}

          {step === 'recusa' && (
            <>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Sentimos muito. Por favor, informe o motivo da sua ausência:
              </p>

              <textarea
                value={justificativa}
                onChange={e => { setJustificativa(e.target.value); setError('') }}
                placeholder="Descreva o motivo..."
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px', border: '1px solid #e5e0d8',
                  borderRadius: 8, fontSize: 14, fontFamily: "'Poppins', sans-serif",
                  color: '#2c2c3e', outline: 'none', resize: 'vertical',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                  backgroundColor: '#f8f5f0',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#c8972b' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e0d8' }}
                autoFocus
              />

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#dc2626', marginTop: 10 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  onClick={() => { setStep('choice'); setError('') }}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 8,
                    border: '1px solid #e5e0d8', background: '#fff',
                    fontSize: 14, fontWeight: 600, color: '#6b7280',
                    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2c2c3e'; e.currentTarget.style.color = '#2c2c3e' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#6b7280' }}
                >
                  Voltar
                </button>
                <button
                  onClick={handleEnviarRecusa}
                  disabled={submitting}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 8, border: 'none',
                    backgroundColor: '#dc2626', color: '#fff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    opacity: submitting ? 0.7 : 1, transition: 'background 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#b91c1c' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#dc2626' }}
                >
                  {submitting ? 'Salvando...' : 'Enviar justificativa'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
