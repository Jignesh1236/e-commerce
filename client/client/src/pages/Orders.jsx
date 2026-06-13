import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import api from '../utils/api'
import { FiPackage, FiMessageCircle, FiMapPin, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered']

const STATUS_META = {
  Pending:          { color: '#f5a623', bg: 'rgba(245,166,35,0.12)',  icon: '🕐', label: 'Pending' },
  Confirmed:        { color: '#4a90e2', bg: 'rgba(74,144,226,0.12)', icon: '✅', label: 'Confirmed' },
  'Out for Delivery': { color: '#7b68ee', bg: 'rgba(123,104,238,0.12)', icon: '🛵', label: 'Out for Delivery' },
  Delivered:        { color: '#2d7a2d', bg: 'rgba(45,122,45,0.12)',  icon: '📦', label: 'Delivered' },
  Cancelled:        { color: '#e05252', bg: 'rgba(224,82,82,0.12)',  icon: '❌', label: 'Cancelled' },
}

function buildWhatsAppTrack(order, whatsappNumber) {
  const items = order.items.map(i => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join('\n')
  const msg = [
    `Hi! I want to check my order status 🙏`,
    ``,
    `*Order ID:* #${order._id.slice(-6).toUpperCase()}`,
    `*Date:* ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    `*Items:*`,
    items,
    `*Total:* ₹${order.totalAmount + order.deliveryCharge}`,
    `*Status:* ${order.status}`,
  ].join('\n')
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
}

export default function Orders() {
  const { user } = useUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('919999999999')

  useEffect(() => {
    api.get('/config').then(r => {
      const n = (r.data.config || r.data)?.whatsappNumber
      if (n) setWhatsappNumber(n)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    api.get(`/orders/user/${user._id}`)
      .then(r => setOrders(r.data.orders || r.data || []))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="max-w-lg mx-auto p-4 pb-nav text-center py-16">
      <p>Please complete onboarding first.</p>
      <Link to="/" className="sku-btn mt-4 inline-flex">Go Home</Link>
    </div>
  )

  if (loading) return (
    <div className="max-w-lg mx-auto p-4 pb-nav flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!orders.length) return (
    <div className="max-w-lg mx-auto p-4 pb-nav flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--surface-inset)', border: '2px solid var(--border)' }}>
        <FiPackage size={36} style={{ color: 'var(--border)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2">No orders yet</h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Your order history will appear here</p>
      <Link to="/" className="sku-btn">Start Shopping</Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto p-4 pb-nav">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text)' }}>My Orders</h1>
        <span className="sku-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46,125,50,0.2)' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map(order => {
          const meta = STATUS_META[order.status] || STATUS_META.Pending
          const statusIndex = STATUS_STEPS.indexOf(order.status)
          const isCancelled = order.status === 'Cancelled'
          const isDelivered = order.status === 'Delivered'

          return (
            <div key={order._id} className="sku-card overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="font-extrabold text-sm tracking-wider" style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <FiClock size={10} />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: meta.bg, color: meta.color }}>
                  <span>{meta.icon}</span> {meta.label}
                </div>
              </div>

              {/* Status timeline */}
              {!isCancelled && (
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
                  <div className="flex items-start">
                    {STATUS_STEPS.map((s, i) => {
                      const done = i < statusIndex
                      const active = i === statusIndex
                      return (
                        <div key={s} className="flex flex-col items-center flex-1">
                          <div className="flex items-center w-full">
                            <div className={`w-full h-0.5 ${i === 0 ? 'opacity-0' : ''}`}
                              style={{ background: done || active ? 'var(--primary)' : 'var(--border)' }} />
                            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                              style={{
                                background: done ? 'var(--primary)' : active ? 'var(--primary)' : 'var(--border)',
                                boxShadow: active ? '0 0 0 3px rgba(46,125,50,0.25)' : 'none',
                              }}>
                              {done ? (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <div className="w-2 h-2 rounded-full" style={{ background: active ? 'white' : 'var(--surface-card)' }} />
                              )}
                            </div>
                            <div className={`w-full h-0.5 ${i === STATUS_STEPS.length - 1 ? 'opacity-0' : ''}`}
                              style={{ background: done ? 'var(--primary)' : 'var(--border)' }} />
                          </div>
                          <p className="text-center mt-1.5 leading-tight"
                            style={{
                              fontSize: 9,
                              fontWeight: active ? 700 : 500,
                              color: active ? 'var(--primary)' : done ? 'var(--text-muted)' : 'var(--border)',
                              maxWidth: 52,
                            }}>
                            {s}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span style={{ color: 'var(--text)' }}>{item.name} <span style={{ color: 'var(--text-muted)' }}>× {item.qty}</span></span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Address */}
              {order.address && (
                <div className="px-4 py-2.5 flex items-start gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
                  <FiMapPin size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{order.address.name}</span>
                    {order.address.phone && <span> · {order.address.phone}</span>}
                    <br />
                    {order.address.fullAddress}
                    {order.address.landmark && `, ${order.address.landmark}`}
                    {order.address.pincode && ` — ${order.address.pincode}`}
                  </p>
                </div>
              )}

              {/* Total + WhatsApp */}
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Delivery: {order.deliveryCharge === 0 ? <span style={{ color: 'var(--primary)', fontWeight: 700 }}>FREE</span> : `₹${order.deliveryCharge}`}
                  </p>
                  <p className="font-extrabold text-base" style={{ color: 'var(--primary)' }}>
                    Total ₹{order.totalAmount + order.deliveryCharge}
                  </p>
                </div>

                {!isDelivered && !isCancelled && (
                  <a href={buildWhatsAppTrack(order, whatsappNumber)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      color: 'white',
                      boxShadow: '0 3px 12px rgba(37,211,102,0.35)',
                    }}>
                    <FiMessageCircle size={15} />
                    Go to Chat
                  </a>
                )}
                {isDelivered && (
                  <a href={buildWhatsAppTrack(order, whatsappNumber)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0"
                    style={{
                      background: 'var(--surface-inset)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}>
                    <FiMessageCircle size={13} />
                    Contact Support
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
