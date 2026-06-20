import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import api from '../utils/api'
import {
  FiPackage, FiMessageCircle, FiMapPin, FiArrowLeft,
  FiRefreshCw, FiClock, FiCheckCircle, FiTruck, FiShoppingBag
} from 'react-icons/fi'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered']

const STATUS_META = {
  Pending:            { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: FiClock,        label: 'Pending',          desc: 'Your order has been received' },
  Confirmed:          { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: FiCheckCircle,  label: 'Confirmed',         desc: 'Order confirmed by the store' },
  'Out for Delivery': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: FiTruck,        label: 'Out for Delivery',  desc: 'Your order is on the way!' },
  Delivered:          { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: FiPackage,      label: 'Delivered',         desc: 'Order delivered successfully' },
  Cancelled:          { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: FiShoppingBag,  label: 'Cancelled',         desc: 'This order was cancelled' },
}

const STEP_ICONS = [FiShoppingBag, FiCheckCircle, FiTruck, FiPackage]

function buildWhatsAppTrack(order, whatsappNumber) {
  const items = order.items.map(i => `• ${i.name} × ${i.qty} = ₹${i.price * i.qty}`).join('\n')
  const msg = [
    `Hi! I want to check my order status 🙏`,
    ``,
    `*Order ID:* #${order._id.slice(-6).toUpperCase()}`,
    `*Items:*`,
    items,
    `*Total:* ₹${order.totalAmount + order.deliveryCharge}`,
    `*Status:* ${order.status}`,
  ].join('\n')
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
}

function PulsingDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: 'var(--primary)' }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: 'var(--primary)' }} />
    </span>
  )
}

export default function OrderTracking() {
  const { id } = useParams()
  const { config } = useConfig()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [statusChanged, setStatusChanged] = useState(false)
  const prevStatusRef = useRef(null)
  const mountedRef = useRef(true)

  const whatsappNumber = config?.whatsappNumber || '919999999999'

  const fetchOrder = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const r = await api.get(`/orders/${id}`)
      if (!mountedRef.current) return
      const newOrder = r.data.order
      if (prevStatusRef.current && newOrder.status !== prevStatusRef.current) {
        setStatusChanged(true)
        setTimeout(() => { if (mountedRef.current) setStatusChanged(false) }, 3000)
      }
      prevStatusRef.current = newOrder.status
      setOrder(newOrder)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      if (!mountedRef.current) return
      setError('Order not found or could not be loaded.')
    } finally {
      if (!mountedRef.current) return
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    mountedRef.current = true
    prevStatusRef.current = null
    fetchOrder()
    const interval = setInterval(() => fetchOrder(), 15000)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [id, fetchOrder])

  if (loading) return (
    <div className="max-w-lg mx-auto p-4 pb-nav flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--primary-glow)', border: '1px solid var(--border)' }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading order…</p>
    </div>
  )

  if (error) return (
    <div className="max-w-lg mx-auto p-4 pb-nav flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <FiPackage size={28} style={{ color: '#ef4444' }} />
      </div>
      <h2 className="text-lg font-bold mb-2">Order Not Found</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{error}</p>
      <Link to="/orders" className="sku-btn">← Back to Orders</Link>
    </div>
  )

  const meta = STATUS_META[order.status] || STATUS_META.Pending
  const statusIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'
  const isDelivered = order.status === 'Delivered'
  const isLive = !isDelivered && !isCancelled

  return (
    <div className="max-w-lg mx-auto p-4 pb-nav">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/orders"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <FiArrowLeft size={16} style={{ color: 'var(--text)' }} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>
            Order Track
          </h1>
          <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
            #{order._id.slice(-6).toUpperCase()}
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--primary-glow)', border: '1px solid rgba(234,88,12,0.25)', color: 'var(--primary)' }}>
            <PulsingDot />
            Live
          </div>
        )}
        <button onClick={() => fetchOrder(true)} disabled={refreshing}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-muted)' }}>
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Status Changed Toast */}
      {statusChanged && (
        <div className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-up"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <FiCheckCircle size={16} />
          Status updated to <strong>{order.status}</strong>
        </div>
      )}

      {/* Hero Status Card */}
      <div className="sku-card overflow-hidden mb-4">
        <div className="relative p-5"
          style={{ background: `linear-gradient(135deg, ${meta.bg}, transparent)` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: meta.bg, border: `1.5px solid ${meta.color}30`, boxShadow: `0 4px 16px ${meta.color}25` }}>
              <meta.icon size={24} style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Current Status</p>
              <h2 className="text-xl font-extrabold" style={{ color: meta.color }}>{meta.label}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{meta.desc}</p>
            </div>
          </div>

          {isLive && lastUpdated && (
            <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <FiClock size={10} />
              Last checked {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              <span className="ml-1 opacity-70">· auto-refreshes every 15s</span>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        {!isCancelled && (
          <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
            <div className="flex items-start">
              {STATUS_STEPS.map((step, i) => {
                const done = statusIndex === STATUS_STEPS.length - 1 ? true : i < statusIndex
                const active = i === statusIndex
                const Icon = STEP_ICONS[i]
                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div className={`flex-1 h-0.5 transition-all duration-700 ${i === 0 ? 'opacity-0' : ''}`}
                        style={{ background: done || (active && i > 0) ? 'var(--primary)' : 'var(--border)' }} />
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                        style={{
                          background: done ? 'var(--primary)' : active ? 'var(--primary)' : 'var(--surface-card)',
                          border: done || active ? '2px solid var(--primary)' : '2px solid var(--border)',
                          boxShadow: active ? `0 0 0 4px var(--primary-glow)` : 'none',
                          transform: active ? 'scale(1.15)' : 'scale(1)',
                        }}>
                        {done && !active ? (
                          <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <Icon size={13} style={{ color: active ? 'white' : 'var(--border)' }} />
                        )}
                      </div>
                      <div className={`flex-1 h-0.5 transition-all duration-700 ${i === STATUS_STEPS.length - 1 ? 'opacity-0' : ''}`}
                        style={{ background: done && i < STATUS_STEPS.length - 1 ? 'var(--primary)' : 'var(--border)' }} />
                    </div>
                    <p className="text-center mt-2 leading-tight"
                      style={{
                        fontSize: 9,
                        fontWeight: active ? 800 : 500,
                        color: active ? 'var(--primary)' : done ? 'var(--text-muted)' : 'var(--border)',
                        maxWidth: 56,
                      }}>
                      {step}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Status History Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="sku-card overflow-hidden mb-4">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Timeline</p>
          </div>
          <div className="px-4 py-3">
            {[...order.statusHistory].reverse().map((h, i, arr) => {
              const hMeta = STATUS_META[h.status] || STATUS_META.Pending
              const isFirst = i === 0
              return (
                <div key={i} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isFirst ? hMeta.bg : 'var(--surface-inset)',
                        border: `1.5px solid ${isFirst ? hMeta.color : 'var(--border)'}`,
                      }}>
                      <hMeta.icon size={12} style={{ color: isFirst ? hMeta.color : 'var(--text-muted)' }} />
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: 'var(--border)', minHeight: 18 }} />
                    )}
                  </div>
                  <div className="pb-3 flex-1">
                    <p className="text-sm font-bold" style={{ color: isFirst ? hMeta.color : 'var(--text)' }}>
                      {hMeta.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(h.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="sku-card overflow-hidden mb-4">
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <FiShoppingBag size={14} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
            Items · {order.items.reduce((s, i) => s + i.qty, 0)} pcs
          </p>
        </div>
        <div className="px-4 py-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2"
              style={{ borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--surface-inset)', color: 'var(--text-muted)', minWidth: 24 }}>
                  {item.qty}×
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.name}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>₹{order.totalAmount}</span>
          </div>
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            <span>Delivery</span>
            <span style={{ color: order.deliveryCharge === 0 ? '#10b981' : undefined, fontWeight: order.deliveryCharge === 0 ? 700 : undefined }}>
              {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between font-extrabold text-base" style={{ color: 'var(--primary)' }}>
            <span>Total</span>
            <span>₹{order.totalAmount + order.deliveryCharge}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="sku-card overflow-hidden mb-4">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <FiMapPin size={14} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Delivery Address</p>
          </div>
          <div className="px-4 py-3">
            <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text)' }}>{order.address.name}</p>
            {order.address.phone && (
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>📞 {order.address.phone}</p>
            )}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {order.address.fullAddress}
              {order.address.landmark && `, near ${order.address.landmark}`}
              {order.address.pincode && ` — ${order.address.pincode}`}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isDelivered && !isCancelled && (
          <a href={buildWhatsAppTrack(order, whatsappNumber)}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
            }}>
            <FiMessageCircle size={16} />
            Chat on WhatsApp
          </a>
        )}
        {(isDelivered || isCancelled) && (
          <a href={buildWhatsAppTrack(order, whatsappNumber)}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all sku-btn-outline">
            <FiMessageCircle size={15} />
            Contact Support
          </a>
        )}
        <Link to="/orders"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all sku-btn-outline">
          All Orders
        </Link>
      </div>
    </div>
  )
}
