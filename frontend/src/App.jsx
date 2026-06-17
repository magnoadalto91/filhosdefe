import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import PrivateRoute from './components/PrivateRoute'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Aprenda from './pages/Aprenda'
import Calendario from './pages/Calendario'
import Estudos from './pages/Estudos'
import Bebidas from './pages/Bebidas'
import Cigarros from './pages/Cigarros'
import Login from './pages/Login'

import Dashboard from './pages/admin/Dashboard'
import AdminMusicas from './pages/admin/Musicas'
import AdminErvas from './pages/admin/Ervas'
import AdminBebidas from './pages/admin/Bebidas'
import AdminBanhos from './pages/admin/Banhos'
import AdminCigarros from './pages/admin/Cigarros'
import AdminEntidades from './pages/admin/Entidades'
import AdminGiras from './pages/admin/Giras'
import AdminRotinas from './pages/admin/Rotinas'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminAgregadores from './pages/admin/Agregadores'
import AdminNotificacoes from './pages/admin/Notificacoes'
import AdminEstudos from './pages/admin/Estudos'

/* Todas as páginas públicas exigem login */
function PublicPage({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

/* Páginas admin exigem login + role ADMIN */
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
        <ScrollToTop />
        <Routes>
          {/* Única rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas do site (exigem autenticação) */}
          <Route path="/" element={<PublicPage><Home /></PublicPage>} />
          <Route path="/aprenda" element={<PublicPage><Aprenda /></PublicPage>} />
          <Route path="/calendario" element={<PublicPage><Calendario /></PublicPage>} />
          <Route path="/estudos" element={<PublicPage><Estudos /></PublicPage>} />
          <Route path="/bebidas" element={<PublicPage><Bebidas /></PublicPage>} />
          <Route path="/cigarros" element={<PublicPage><Cigarros /></PublicPage>} />

          {/* Rotas admin (exigem ADMIN) */}
          <Route path="/admin" element={<AdminPage><Dashboard /></AdminPage>} />
          <Route path="/admin/musicas" element={<AdminPage><AdminMusicas /></AdminPage>} />
          <Route path="/admin/ervas" element={<AdminPage><AdminErvas /></AdminPage>} />
          <Route path="/admin/bebidas" element={<AdminPage><AdminBebidas /></AdminPage>} />
          <Route path="/admin/banhos" element={<AdminPage><AdminBanhos /></AdminPage>} />
          <Route path="/admin/cigarros" element={<AdminPage><AdminCigarros /></AdminPage>} />
          <Route path="/admin/entidades" element={<AdminPage><AdminEntidades /></AdminPage>} />
          <Route path="/admin/giras" element={<AdminPage><AdminGiras /></AdminPage>} />
          <Route path="/admin/rotinas" element={<AdminPage><AdminRotinas /></AdminPage>} />
          <Route path="/admin/usuarios"    element={<AdminPage><AdminUsuarios /></AdminPage>} />
          <Route path="/admin/agregadores"   element={<AdminPage><AdminAgregadores /></AdminPage>} />
          <Route path="/admin/estudos"      element={<AdminPage><AdminEstudos /></AdminPage>} />
          <Route path="/admin/notificacoes" element={<AdminPage><AdminNotificacoes /></AdminPage>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
