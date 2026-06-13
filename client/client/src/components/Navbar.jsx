import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiHeart, FiSun, FiMoon, FiSearch, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

export default function Navbar({ storeName = 'My Store' }) {
  const { count } = useCart()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`)
  }
  const clearSearch = () => { setSearch(''); navigate('/') }

  return (
    <nav className="sticky top-0 z-50"
      style={{
        background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-card) 100%)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 0 var(--border-light), 0 4px 16px rgba(0,0,0,0.08)',
      }}>
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-5xl mx-auto">

        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-2 select-none">
          <span className="text-2xl">🛒</span>
          <span className="font-extrabold text-base md:text-lg hidden sm:block leading-tight"
            style={{ color: 'var(--primary)', textShadow: '0 1px 0 rgba(0,0,0,0.1)' }}>
            {storeName}
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sku-input pl-9 pr-8 py-2 text-sm"
            style={{ borderRadius: 24, fontSize: 14 }}
          />
          {search && (
            <button type="button" onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <FiX size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Theme toggle — pill style */}
          <button onClick={toggle}
            className="flex items-center gap-1 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{
              width: 68, height: 34,
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #1a2a3a, #0d1a2e)'
                : 'linear-gradient(135deg, #fef9c3, #fde68a)',
              border: `1.5px solid ${theme === 'dark' ? 'rgba(148,163,184,0.2)' : 'rgba(234,179,8,0.4)'}`,
              boxShadow: theme === 'dark'
                ? 'inset 0 1px 3px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.7)',
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {/* Moon */}
            <span className="absolute left-2 transition-all duration-300"
              style={{
                opacity: theme === 'dark' ? 1 : 0.35,
                transform: theme === 'dark' ? 'scale(1)' : 'scale(0.8)',
                fontSize: 14,
              }}>🌙</span>
            {/* Sun */}
            <span className="absolute right-2 transition-all duration-300"
              style={{
                opacity: theme === 'light' ? 1 : 0.35,
                transform: theme === 'light' ? 'scale(1)' : 'scale(0.8)',
                fontSize: 14,
              }}>☀️</span>
            {/* Slider knob */}
            <div className="absolute top-1 transition-all duration-300 rounded-full"
              style={{
                width: 26, height: 26,
                left: theme === 'dark' ? 38 : 4,
                background: theme === 'dark' ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: theme === 'dark'
                  ? '0 1px 4px rgba(0,0,0,0.5), 0 0 8px rgba(59,130,246,0.4)'
                  : '0 1px 4px rgba(0,0,0,0.2), 0 0 8px rgba(251,191,36,0.5)',
              }} />
          </button>

          <Link to="/wishlist"
            className="sku-btn-outline hidden sm:inline-flex"
            style={{ padding: '8px', borderRadius: '50%', width: 38, height: 38 }}>
            <FiHeart size={17} />
          </Link>

          <Link to="/cart" className="sku-btn sku-btn-sm relative" style={{ paddingLeft: 12, paddingRight: 14, gap: 5 }}>
            <FiShoppingCart size={16} />
            <span className="hidden xs:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                style={{ background: 'var(--danger)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
