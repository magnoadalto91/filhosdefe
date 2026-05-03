import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Star, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
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
      className="min-h-dvh flex items-center justify-center p-4"
      style={{ backgroundColor: '#0D0818' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl p-8"
        style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid #7C3AED' }}
            >
              <Star size={32} style={{ color: '#F59E0B' }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#F59E0B' }}>Filhos de Fé</h1>
          <p className="text-sm mt-1" style={{ color: '#A78BFA' }}>Acesse sua conta</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm"
            style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#A78BFA' }}>
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A78BFA' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#0D0818',
                  border: '1px solid #2D1B69',
                  color: '#F8F5FF',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#A78BFA' }}>
              Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A78BFA' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#0D0818',
                  border: '1px solid #2D1B69',
                  color: '#F8F5FF',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-opacity mt-2"
            style={{ backgroundColor: '#7C3AED', color: '#fff', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
