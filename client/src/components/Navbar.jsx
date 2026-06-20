import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiHeart, FiSun, FiMoon, FiSearch, FiX, FiZap, FiClock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

export default function Navbar({ storeName = 'My Store', storeLogo = '' }) {
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
        background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        boxShadow: '0 2px 12px rgba(194,65,12,0.4)',
      }}>
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-5xl mx-auto">

        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-2 select-none">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName}
              className="object-contain rounded-lg border-2 border-white/30"
              style={{ width: 36, height: 36 }}
              onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <span className="text-2xl drop-shadow-sm">⚡</span>
          )}
          <span className="font-black text-base md:text-lg hidden sm:block leading-tight italic tracking-tight text-white drop-shadow-sm">
            {storeName}
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            size={15} style={{ color: 'rgba(0,0,0,0.45)' }} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm w-full outline-none"
            style={{
              borderRadius: 24,
              background: 'rgba(255,255,255,0.92)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: '#1a1208',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              fontSize: 14,
            }}
          />
          {search && (
            <button type="button" onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <FiX size={14} style={{ color: '#7a6050' }} />
            </button>
          )}
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Theme toggle */}
          <button onClick={toggle}
            className="flex items-center gap-1 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{
              width: 68, height: 34,
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #1a2a3a, #0d1a2e)'
                : 'rgba(255,255,255,0.25)',
              border: `1.5px solid ${theme === 'dark' ? 'rgba(148,163,184,0.2)' : 'rgba(255,255,255,0.5)'}`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <span className="absolute left-2 transition-all duration-300"
              style={{
                opacity: theme === 'dark' ? 1 : 0.6,
                transform: theme === 'dark' ? 'scale(1)' : 'scale(0.8)',
                fontSize: 14,
              }}>🌙</span>
            <span className="absolute right-2 transition-all duration-300"
              style={{
                opacity: theme === 'light' ? 1 : 0.5,
                transform: theme === 'light' ? 'scale(1)' : 'scale(0.8)',
                fontSize: 14,
              }}>☀️</span>
            <div className="absolute top-1 transition-all duration-300 rounded-full"
              style={{
                width: 26, height: 26,
                left: theme === 'dark' ? 38 : 4,
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                  : 'linear-gradient(135deg, #fff, rgba(255,255,255,0.85))',
                boxShadow: theme === 'dark'
                  ? '0 1px 4px rgba(0,0,0,0.5), 0 0 8px rgba(59,130,246,0.4)'
                  : '0 1px 4px rgba(0,0,0,0.2)',
              }} />
          </button>

          <Link to="/orders"
            className="hidden sm:inline-flex items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              padding: '8px', width: 38, height: 38,
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: 'white',
            }}
            title="My Orders">
            <FiClock size={17} />
          </Link>

          <Link to="/wishlist"
            className="hidden sm:inline-flex items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              padding: '8px', width: 38, height: 38,
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: 'white',
            }}>
            <FiHeart size={17} />
          </Link>

          <Link to="/cart"
            className="hidden sm:relative sm:flex items-center gap-1.5 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              padding: '7px 16px 7px 12px',
              borderRadius: 24,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(4px)',
            }}>
            <FiShoppingCart size={16} />
            <span>Cart</span>
            {count > 0 && (
              <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] flex items-center justify-center font-extrabold"
                style={{ background: 'white', color: 'var(--primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
