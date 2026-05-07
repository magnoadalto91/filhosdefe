import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function PrivateRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />

  return children
}
