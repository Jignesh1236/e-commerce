import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider, useUser } from './context/UserContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import NotificationPrompt from './components/NotificationPrompt'
import api from './utils/api'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Orders from './pages/Orders'
import OrderSuccess from './pages/OrderSuccess'
import About from './pages/About'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AdminLogin from './pages/admin/Login'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminReviews from './pages/admin/Reviews'
import AdminBanners from './pages/admin/Banners'
import AdminConfig from './pages/admin/Config'
import AdminCategories from './pages/admin/Categories'

function RequireOnboarding({ children }) {
  const { user, checkIP } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [checking, setChecking] = useState(!user)

  useEffect(() => {
    if (user) { setChecking(false); return }
    checkIP().then(res => {
      if (!res.exists) {
        navigate('/onboarding', { replace: true, state: { from: location.pathname } })
      } else {
        setChecking(false)
      }
    })
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  return children
}

function StoreLayout({ children, storeName, storeLogo }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar storeName={storeName} storeLogo={storeLogo} />
      <main>{children}</main>
      <BottomNav />
      <PWAInstallPrompt />
      <NotificationPrompt />
    </div>
  )
}

function StoreRoute({ children, storeName, storeLogo }) {
  return (
    <RequireOnboarding>
      <StoreLayout storeName={storeName} storeLogo={storeLogo}>{children}</StoreLayout>
    </RequireOnboarding>
  )
}

export default function App() {
  const [storeName, setStoreName] = useState('My Store')
  const [storeLogo, setStoreLogo] = useState('')

  useEffect(() => {
    api.get('/config').then(r => {
      const c = r.data.config || r.data
      if (c?.storeName) setStoreName(c.storeName)
      if (c?.logo) setStoreLogo(c.logo)
    }).catch(() => {})
  }, [])

  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/privacy-policy" element={<StoreLayout storeName={storeName} storeLogo={storeLogo}><PrivacyPolicy /></StoreLayout>} />
                <Route path="/terms-of-service" element={<StoreLayout storeName={storeName} storeLogo={storeLogo}><TermsOfService /></StoreLayout>} />
                <Route path="/" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><Home /></StoreRoute>} />
                <Route path="/product/:id" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><ProductDetail /></StoreRoute>} />
                <Route path="/cart" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><Cart /></StoreRoute>} />
                <Route path="/wishlist" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><Wishlist /></StoreRoute>} />
                <Route path="/orders" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><Orders /></StoreRoute>} />
                <Route path="/order-success" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><OrderSuccess /></StoreRoute>} />
                <Route path="/about" element={<StoreRoute storeName={storeName} storeLogo={storeLogo}><About /></StoreRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="config" element={<AdminConfig />} />
                </Route>
                <Route path="*" element={
                  <StoreRoute storeName={storeName} storeLogo={storeLogo}>
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                      <p className="text-6xl mb-4">🔍</p>
                      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
                      <a href="/" className="sku-btn mt-4 inline-flex">Go Home</a>
                    </div>
                  </StoreRoute>
                } />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
