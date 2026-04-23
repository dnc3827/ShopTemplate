import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'

// Pages - MODULE 3A (Public)
import LandingPage from './pages/LandingPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'

// Pages - MODULE 3B (Auth + Checkout + Account)
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import OTPPage from './pages/OTPPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import AccountPage from './pages/AccountPage'

// Pages - MODULE 3C (Admin)
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStats from './pages/admin/AdminStats'
import AdminTemplates from './pages/admin/AdminTemplates'
import AdminCategories from './pages/admin/AdminCategories'
import AdminPromotions from './pages/admin/AdminPromotions'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <div>Loading Admin...</div>
  if (!user || !profile?.is_admin) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto md:px-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/san-pham" element={<ProductsPage />} />
            <Route path="/san-pham/:slug" element={<ProductDetailPage />} />

            {/* Auth Process Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
            <Route path="/quen-mat-khau/otp" element={<OTPPage />} />

            {/* Protected User Routes */}
            <Route path="/checkout/:template_id" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/thanh-toan-thanh-cong" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path="/tai-khoan/*" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

            {/* Admin Routes with Nested Layout */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
               <Route index element={<AdminDashboard />} />
               <Route path="stats" element={<AdminStats />} />
               <Route path="templates" element={<AdminTemplates />} />
               <Route path="categories" element={<AdminCategories />} />
               <Route path="promotions" element={<AdminPromotions />} />
               <Route path="users" element={<AdminUsers />} />
               <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}

export default App
