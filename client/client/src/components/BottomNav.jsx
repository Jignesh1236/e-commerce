import { NavLink } from 'react-router-dom'
import { FiHome, FiShoppingCart, FiHeart, FiClock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

export default function BottomNav() {
  const { count } = useCart()

  const links = [
    { to: '/', icon: FiHome, label: 'Home' },
    { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
    { to: '/cart', icon: FiShoppingCart, label: 'Cart', badge: count },
    { to: '/orders', icon: FiClock, label: 'Orders' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'linear-gradient(180deg, var(--surface-card) 0%, var(--surface-raised) 100%)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.12), 0 -1px 0 var(--border-light)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      {links.map(({ to, icon: Icon, label, badge }) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-semibold transition-all ${
              isActive ? '' : 'opacity-60'
            }`
          }
          style={({ isActive }) => ({ color: isActive ? 'var(--primary)' : 'var(--text)' })}
        >
          {({ isActive }) => (
            <>
              <div className="relative flex items-center justify-center">
                <div className={`flex items-center justify-center w-9 h-8 rounded-xl transition-all ${
                  isActive ? 'shadow-sm' : ''
                }`}
                  style={isActive ? {
                    background: 'var(--primary-glow)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.1)'
                  } : {}}>
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                    style={{ background: 'var(--danger)', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
