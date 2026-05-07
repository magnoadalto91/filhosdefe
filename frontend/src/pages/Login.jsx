import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

const S = {
  wrap: { minHeight: '100dvh', display: 'flex', fontFamily: "'Poppins', sans-serif", backgroundColor: '#f8f5f0' },
  panel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', padding: '40px 36px' },
  logo: { fontSize: 26, fontWeight: 800, color: '#c8972b', letterSpacing: '-0.5px', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6b7280', marginBottom: 28 },
  tabs: { display: 'flex', borderBottom: '1px solid #e5e0d8', marginBottom: 28, gap: 4 },
  tab: (active) => ({
    flex: 1, padding: '10px 4px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none',
    cursor: 'pointer', color: active ? '#c8972b' : '#6b7280',
    borderBottom: active ? '2px solid #c8972b' : '2px solid transparent',
    transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif",
  }),
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#2c2c3e', marginBottom: 6 },
  input: (focus) => ({
    width: '100%', padding: '11px 14px', border: `1px solid ${focus ? '#c8972b' : '#e5e0d8'}`,
    borderRadius: 6, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: '#2c2c3e',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', backgroundColor: '#fff',
  }),
  inputWrap: { position: 'relative', marginBottom: 16 },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 },
  btn: { width: '100%', padding: '13px', borderRadius: 6, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Poppins', sans-serif", marginTop: 4 },
  error: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 },
  success: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#16a34a', marginBottom: 16 },
  link: { background: 'none', border: 'none', color: '#c8972b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", padding: 0 },
}

function PasswordInput({ value, onChange, placeholder = 'Senha' }) {
  const [show, setShow] = useState(false)
  const [focus, setFocus] = useState(false)
  return (
    <div style={S.inputWrap}>
      <input
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ ...S.input(focus), paddingRight: 42 }}
      />
      <button type="button" style={S.eyeBtn} onClick={() => setShow(!show)}>
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

/* ── Tab Entrar ──────────────────────────────────────────── */
function TabEntrar({ onSwitchTab }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      const from = location.state?.from?.pathname
      navigate(from || (user.role === 'ADMIN' ? '/admin' : '/'), { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={S.error}>{error}</div>}
      <div style={S.inputWrap}>
        <label style={S.label}>E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com" required autoComplete="email"
          onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)}
          style={S.input(focusEmail)}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={S.label}>Senha</label>
        <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ textAlign: 'right', marginBottom: 20 }}>
        <button type="button" style={S.link} onClick={() => onSwitchTab('esqueci')}>
          Esqueci minha senha
        </button>
      </div>
      <button type="submit" disabled={loading}
        style={{ ...S.btn, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#a67a20' }}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
      >
        <LogIn size={16} /> {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

/* ── Tab Cadastrar ───────────────────────────────────────── */
function TabCadastrar({ onSwitchTab }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('As senhas não coincidem.')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    setLoading(true)
    try {
      await api.post('/auth/register', { email, password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div>
        <div style={S.success}>
          Conta criada com sucesso! Faça login para acessar o site.
        </div>
        <button type="button"
          style={{ ...S.btn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => onSwitchTab('entrar')}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
        >
          <LogIn size={16} /> Ir para login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={S.error}>{error}</div>}
      <div style={S.inputWrap}>
        <label style={S.label}>E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com" required autoComplete="email"
          onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)}
          style={S.input(focusEmail)}
        />
      </div>
      <div style={{ marginBottom: 0 }}>
        <label style={S.label}>Senha</label>
        <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Confirmar senha</label>
        <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirme sua senha" />
      </div>
      <button type="submit" disabled={loading}
        style={{ ...S.btn, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#a67a20' }}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
      >
        <UserPlus size={16} /> {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}

/* ── Tab Esqueci minha senha ─────────────────────────────── */
function TabEsqueci({ onSwitchTab }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Resend será configurado depois — por ora simula o envio
    await new Promise(r => setTimeout(r, 900))
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div>
        <div style={S.success}>
          Se esse e-mail estiver cadastrado, você receberá um link de recuperação em breve.
        </div>
        <button type="button"
          style={{ ...S.btn, backgroundColor: 'transparent', color: '#c8972b', border: '2px solid #c8972b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => onSwitchTab('entrar')}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#c8972b'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#c8972b' }}
        >
          <ArrowLeft size={16} /> Voltar ao login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>
      <div style={S.inputWrap}>
        <label style={S.label}>E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com" required
          onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)}
          style={S.input(focusEmail)}
        />
      </div>
      <button type="submit" disabled={loading}
        style={{ ...S.btn, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#a67a20' }}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
      >
        <KeyRound size={16} /> {loading ? 'Enviando...' : 'Enviar link'}
      </button>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button type="button" style={S.link} onClick={() => onSwitchTab('entrar')}>
          Voltar ao login
        </button>
      </div>
    </form>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function Login() {
  const [tab, setTab] = useState('entrar')

  const TABS = [
    { id: 'entrar', label: 'Entrar' },
    { id: 'cadastrar', label: 'Cadastrar' },
    { id: 'esqueci', label: 'Esqueci a senha' },
  ]

  return (
    <div style={S.wrap}>
      {/* Painel decorativo — só desktop */}
      <div style={{ flex: 1, display: 'none', position: 'relative', overflow: 'hidden' }} className="login-deco">
        <style>{`@media (min-width: 768px) { .login-deco { display: block !important; } }`}</style>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://picsum.photos/seed/umbanda99/900/1200)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,46,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', padding: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>Filhos de Fé</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 340 }}>
            Umbanda com amor e devoção. Um espaço sagrado de aprendizado e conexão espiritual.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div style={S.panel}>
        <div style={S.card}>
          <div style={S.logo}>Filhos de Fé</div>
          <p style={S.sub}>Umbanda com amor e devoção</p>
          <div style={S.tabs}>
            {TABS.map(t => (
              <button key={t.id} type="button" style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'entrar'    && <TabEntrar    onSwitchTab={setTab} />}
          {tab === 'cadastrar' && <TabCadastrar onSwitchTab={setTab} />}
          {tab === 'esqueci'   && <TabEsqueci   onSwitchTab={setTab} />}
        </div>
      </div>
    </div>
  )
}
