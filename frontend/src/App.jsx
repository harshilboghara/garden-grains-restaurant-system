import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/layout/AdminLayout'
import BackgroundParticles from './components/ui/BackgroundParticles'
import CartSidebar from './components/cart/CartSidebar'

// Initialize Stripe - with fallback to avoid empty string error
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey && stripeKey.trim() ? loadStripe(stripeKey) : Promise.resolve(null)
import Home from './pages/Home'
import Menu from './pages/Menu'
import About from './pages/About'
import Story from './pages/Story'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import Catering from './pages/Catering'
import Delivery from './pages/Delivery'
import Help from './pages/Help'
import FAQ from './pages/FAQ'
import Refunds from './pages/Refunds'
import Accessibility from './pages/Accessibility'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Reservations from './pages/Reservations'
import AdminDashboard from './pages/admin/Dashboard'
import AdminPanel from './pages/admin/AdminPanel'
import AdminLogin from './pages/AdminLogin'
import AdminMenu from './pages/admin/Menu'
import AdminOrders from './pages/admin/Orders'
import AdminCreateOrder from './pages/admin/CreateOrder'
import AdminReservations from './pages/admin/Reservations'
import AdminDiscounts from './pages/admin/Discounts'
import AdminUsers from './pages/admin/Users'
import AdminFeedback from './pages/admin/Feedback'
import AdminInventory from './pages/admin/Inventory'

import ForgotPassword from './pages/ForgotPassword'

import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import Chatbot from './components/chat/Chatbot'
import Feedback from './pages/Feedback'

import SocketListener from './components/common/SocketListener'
import ScrollToTop from './components/common/ScrollToTop'

function App() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin-login';
  const isAdminUser = isAuthenticated && user?.role === 'admin';

  // If admin is logged in and tries to access public website, redirect to admin
  if (isAdminUser && !isAdminPath) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <BackgroundParticles />
      <Elements stripe={stripePromise}>
        <ScrollToTop />
        <SocketListener />
        <div className="min-h-screen bg-pearl text-dark-slate relative overflow-hidden">
          {!isAdminPath && <Navbar />}
          
          <main className={`${!isAdminPath ? 'min-h-screen relative' : ''}`}>
            {isAdminPath ? (
              <AdminLayout>
                <Routes>
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                  <Route path="/admin/menu" element={<AdminRoute><AdminMenu /></AdminRoute>} />
                  <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                  <Route path="/admin/orders/create" element={<AdminRoute><AdminCreateOrder /></AdminRoute>} />
                  <Route path="/admin/reservations" element={<AdminRoute><AdminReservations /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />
                  <Route path="/admin/discounts" element={<AdminRoute><AdminDiscounts /></AdminRoute>} />
                  <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />

                  <Route path="*" element={<Navigate to="/admin" replace />} />

                </Routes>
              </AdminLayout>
            ) : (
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/story" element={<Story />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/catering" element={<Catering />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/help" element={<Help />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/refunds" element={<Refunds />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected Routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
              </Routes>
            )}
          </main>

          {!isAdminPath && !['/login', '/admin-login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) && <Footer />}
          {!isAdminPath && <Chatbot />}
          <CartSidebar />
        </div>
      </Elements>
    </>
  )
}

export default App
