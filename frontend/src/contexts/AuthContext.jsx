import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { registerPush, unregisterPush } from '../lib/push'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      api.get('/auth/me')
        .then((res) => { setUser(res.data.user); registerPush() })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken } = res.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    const meRes = await api.get('/auth/me')
    setUser(meRes.data.user)
    localStorage.setItem('user', JSON.stringify(meRes.data.user))
    registerPush()
    return meRes.data.user
  }

  const logout = () => {
    unregisterPush()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
