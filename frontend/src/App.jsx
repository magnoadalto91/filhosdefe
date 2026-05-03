import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import PrivateRoute from './components/PrivateRoute'

import Home from './pages/Home'
import Aprenda from './pages/Aprenda'
import Calendario from './pages/Calendario'
import Login from './pages/Login'

import Dashboard from './pages/admin/Dashboard'
import AdminMusicas from './pages/admin/Musicas'
import AdminErvas from './pages/admin/Ervas'
import AdminEntidades from './pages/admin/Entidades'
import AdminGiras from './pages/admin/Giras'
import AdminRotinas from './pages/admin/Rotinas'

function PublicPage({ children }) {
  return <Layout>{children}</Layout>
}

function AdminPage({ children }) {
  return (
    <PrivateRoute requireAdmin>
      <AdminLayout>{children}</AdminLayout>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicPage><Home /></PublicPage>} />
          <Route path="/aprenda" element={<PublicPage><Aprenda /></PublicPage>} />
          <Route path="/calendario" element={<PublicPage><Calendario /></PublicPage>} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminPage><Dashboard /></AdminPage>} />
          <Route path="/admin/musicas" element={<AdminPage><AdminMusicas /></AdminPage>} />
          <Route path="/admin/ervas" element={<AdminPage><AdminErvas /></AdminPage>} />
          <Route path="/admin/entidades" element={<AdminPage><AdminEntidades /></AdminPage>} />
          <Route path="/admin/giras" element={<AdminPage><AdminGiras /></AdminPage>} />
          <Route path="/admin/rotinas" element={<AdminPage><AdminRotinas /></AdminPage>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
