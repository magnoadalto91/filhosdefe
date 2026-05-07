import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        backgroundColor: '#ffffff',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Left — form side */}
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            padding: '40px',
          }}
        >
          {/* Logo / title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#c8972b',
                margin: '0 0 6px',
                letterSpacing: '0.5px',
              }}
            >
              Filhos de Fé
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
              Acesse sua conta
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '14px',
                backgroundColor: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.25)',
                color: '#dc2626',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#2c2c3e',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    paddingLeft: '42px',
                    paddingRight: '14px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    fontSize: '15px',
                    color: '#2c2c3e',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e0d8',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#c8972b' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e0d8' }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#2c2c3e',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    paddingLeft: '42px',
                    paddingRight: '14px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    fontSize: '15px',
                    color: '#2c2c3e',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e0d8',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#c8972b' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e0d8' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: loading ? '#a67a20' : '#c8972b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
                fontFamily: "'Poppins', sans-serif",
                marginTop: '4px',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#a67a20' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#c8972b' }}
            >
              {loading ? (
                <div
                  className="animate-spin"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                  }}
                />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {/* Right — decorative panel (hidden on mobile) */}
      <div
        style={{
          flex: '0 0 45%',
          position: 'relative',
          overflow: 'hidden',
          display: 'none',
        }}
        className="login-deco-panel"
      >
        <style>{`
          @media (min-width: 768px) {
            .login-deco-panel { display: block !important; }
          }
        `}</style>
        {/* Picsum spiritual background */}
        <img
          src="https://picsum.photos/seed/spirit/800/900"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Gold gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(200,151,43,0.82) 0%, rgba(166,122,32,0.70) 60%, rgba(28,28,46,0.55) 100%)',
          }}
        />
        {/* Panel text */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '48px 40px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 16px',
              lineHeight: 1.25,
              letterSpacing: '0.5px',
            }}
          >
            Filhos de Fé
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.7,
              maxWidth: '280px',
              margin: 0,
            }}
          >
            Um espaço de aprendizado, fé e conexão com as entidades.
          </p>
        </div>
      </div>
    </div>
  )
}
