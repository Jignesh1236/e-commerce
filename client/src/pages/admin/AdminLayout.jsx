import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FiGrid, FiPackage, FiUsers, FiStar, FiImage, FiSettings, FiLogOut, FiMenu, FiX, FiShoppingBag, FiTag, FiBell, FiSun, FiMoon, FiLock } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { to: '/admin/dashboard', icon: FiGrid,      label: 'Dashboard',  emoji: '📊' },
  { to: '/admin/products',  icon: FiShoppingBag, label: 'Products',  emoji: '🛍' },
  { to: '/admin/categories',icon: FiTag,       label: 'Categories', emoji: '🏷' },
  { to: '/admin/orders',    icon: FiPackage,   label: 'Orders',     emoji: '📦' },
  { to: '/admin/users',     icon: FiUsers,     label: 'Users',      emoji: '👥' },
  { to: '/admin/reviews',   icon: FiStar,      label: 'Reviews',    emoji: '⭐' },
  { to: '/admin/banners',   icon: FiImage,     label: 'Banners',    emoji: '🖼' },
  { to: '/admin/config',    icon: FiSettings,  label: 'Config',     emoji: '⚙️' },
  { to: '/admin/security',  icon: FiLock,      label: 'Security',   emoji: '🔐' },
]

const PAGE_TITLES = {
  '/admin/dashboard':  'Dashboard',
  '/admin/products':   'Products',
  '/admin/categories': 'Categories',
  '/admin/orders':     'Orders',
  '/admin/users':      'Users',
  '/admin/reviews':    'Reviews',
  '/admin/banners':    'Banners',
  '/admin/config':     'Config',
  '/admin/security':   'Security',
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin/login')
  }, [])

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin Panel'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-card) 100%)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08), inset -1px 0 0 var(--border-light)',
        }}>

        {/* Sidebar header */}
        <div className="p-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: '0 3px 10px rgba(234,88,12,0.4)',
              }}>
              🛒
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight" style={{ color: 'var(--primary)' }}>Admin Panel</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Store Manager</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest px-3 pt-2 pb-1"
            style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Main</p>
          {NAV.slice(0, 4).map(({ to, icon: Icon, label, emoji }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: '0 2px 8px rgba(234,88,12,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                color: 'white',
              } : { color: 'var(--text)' }}>
              <span className="text-base w-5 text-center">{emoji}</span>
              {label}
            </NavLink>
          ))}

          <p className="text-xs font-bold uppercase tracking-widest px-3 pt-3 pb-1"
            style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Content</p>
          {NAV.slice(4).map(({ to, icon: Icon, label, emoji }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: '0 2px 8px rgba(234,88,12,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                color: 'white',
              } : { color: 'var(--text)' }}>
              <span className="text-base w-5 text-center">{emoji}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark'
              ? <><FiSun size={15} style={{ color: '#f59e0b' }} /> Light Mode</>
              : <><FiMoon size={15} /> Dark Mode</>}
          </button>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            style={{ color: 'var(--danger)' }}>
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Top header bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
          style={{
            background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
          {/* Mobile menu + page title */}
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)}
              className="md:hidden sku-btn-outline"
              style={{ padding: '7px', borderRadius: 10, width: 36, height: 36 }}>
              <FiMenu size={18} />
            </button>
            <div>
              <h1 className="font-extrabold text-base leading-tight" style={{ color: 'var(--text)' }}>
                {currentTitle}
              </h1>
              <p className="text-xs hidden md:block" style={{ color: 'var(--text-muted)' }}>
                Admin · Store Management
              </p>
            </div>
          </div>

          {/* Right: theme + logout on desktop */}
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {theme === 'dark' ? <><FiSun size={14} style={{ color: '#f59e0b' }} /> Light</> : <><FiMoon size={14} /> Dark</>}
            </button>
            <button onClick={logout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ color: 'var(--danger)', border: '1px solid rgba(224,82,82,0.2)', background: 'rgba(224,82,82,0.05)' }}>
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
