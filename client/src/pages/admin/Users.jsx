import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiChevronUp, FiPackage, FiUser, FiPhone, FiMapPin, FiClock } from 'react-icons/fi'
import api from '../../utils/api'

const STATUS_COLORS = {
  Pending: { bg: 'rgba(212,130,10,0.12)', color: '#d4820a', border: 'rgba(212,130,10,0.25)' },
  Confirmed: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', border: 'rgba(37,99,235,0.2)' },
  'Out for Delivery': { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: 'rgba(124,58,237,0.2)' },
  Delivered: { bg: 'rgba(234,88,12,0.10)', color: '#ea580c', border: 'rgba(234,88,12,0.2)' },
  Cancelled: { bg: 'rgba(192,57,43,0.1)', color: '#c0392b', border: 'rgba(192,57,43,0.2)' },
}

function UserOrderHistory({ userId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/user/${userId}`)
      .then(r => setOrders(r.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="flex items-center gap-2 py-4 px-6" style={{ color: 'var(--text-muted)' }}>
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading orders…</span>
    </div>
  )

  if (orders.length === 0) return (
    <div className="py-5 px-6 text-center">
      <div className="text-3xl mb-1.5">🛒</div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No orders placed yet</p>
    </div>
  )

  return (
    <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
      {orders.map((order, idx) => {
        const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending
        return (
          <div key={order._id} className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-card)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {order._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                {order.status}
              </span>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <FiClock size={11} />
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <span className="font-extrabold text-sm" style={{ color: 'var(--primary)' }}>₹{order.totalAmount}</span>
            </div>

            {/* Order items */}
            <div className="px-4 py-3 flex flex-col gap-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs"
                      style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46,125,50,0.2)' }}>
                      {item.qty}x
                    </div>
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{item.name}</span>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: 'var(--text-muted)' }}>
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            {order.address && (
              <div className="px-4 py-2.5 flex items-start gap-2"
                style={{ borderTop: '1px solid var(--border)' }}>
                <FiMapPin size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {order.address.fullAddress}
                  {order.address.landmark ? `, ${order.address.landmark}` : ''}
                  {order.address.pincode ? ` — ${order.address.pincode}` : ''}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function UserRow({ user, idx, total }) {
  const [expanded, setExpanded] = useState(false)
  const [orderCount, setOrderCount] = useState(null)
  const fetchedRef = useRef(false)

  const handleExpand = () => {
    setExpanded(v => !v)
    if (!fetchedRef.current) {
      fetchedRef.current = true
      api.get(`/orders/user/${user._id}`)
        .then(r => setOrderCount((r.data.orders || []).length))
        .catch(() => setOrderCount(0))
    }
  }

  return (
    <>
      <tr
        className="transition-colors cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
        style={{ borderBottom: (expanded || idx < total - 1) ? '1px solid var(--border)' : 'none' }}
        onClick={handleExpand}>
        <td className="px-4 py-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46,125,50,0.2)' }}>
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{user.name}</p>
          {user.phone && (
            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
              <FiPhone size={10} /> {user.phone}
            </p>
          )}
        </td>
        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          {user.source || '—'}
        </td>
        <td className="px-4 py-3 max-w-[160px]">
          {user.address ? (
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.address}</p>
          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
          {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </td>
        <td className="px-4 py-3">
          {orderCount !== null ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: orderCount > 0 ? 'var(--primary-glow)' : 'var(--surface-inset)',
                color: orderCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
                border: `1px solid ${orderCount > 0 ? 'rgba(46,125,50,0.2)' : 'var(--border)'}`,
              }}>
              {orderCount} order{orderCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <div className="w-16 h-5 skeleton rounded-full" />
          )}
        </td>
        <td className="px-4 py-3">
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: expanded ? 'var(--primary-glow)' : 'var(--surface-inset)',
              color: expanded ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${expanded ? 'rgba(46,125,50,0.2)' : 'var(--border)'}`,
            }}>
            {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr style={{ borderBottom: idx < total - 1 ? '1px solid var(--border)' : 'none' }}>
          <td colSpan={7} style={{ background: 'var(--surface-inset)', padding: 0 }}>
            <div className="animate-fade-up">
              <div className="px-4 pt-3 pb-1 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <FiPackage size={13} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Order History
                </span>
              </div>
              <UserOrderHistory userId={user._id} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users || r.data || [])).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.address?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold">Users <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 18 }}>({users.length})</span></h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Click any user to see their order history</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
          style={{ background: 'var(--primary-glow)', border: '1px solid rgba(46,125,50,0.2)' }}>
          <FiUser size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{users.length} total</span>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, phone or address…" className="sku-input mb-4" />

      {filtered.length === 0 ? (
        <div className="sku-card p-12 text-center">
          <div className="text-5xl mb-3">👤</div>
          <p className="font-bold mb-1">{search ? 'No users match' : 'No users yet'}</p>
        </div>
      ) : (
        <div className="sku-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
                  {['', 'Name', 'Source', 'Address', 'Joined', 'Orders', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <UserRow key={u._id} user={u} idx={i} total={filtered.length} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
