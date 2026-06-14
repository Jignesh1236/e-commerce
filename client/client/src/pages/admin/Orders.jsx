import { useEffect, useState } from 'react'
import api from '../../utils/api'

const STATUSES = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled']
const STATUS_COLORS = { Pending: '#f5a623', Confirmed: '#4a90e2', 'Out for Delivery': '#7b68ee', Delivered: '#2d7a2d', Cancelled: '#e05252' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [exporting, setExporting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const load = () => {
    setLoading(true)
    const q = filter ? `?status=${filter}` : ''
    api.get(`/orders${q}`).then(r => setOrders(r.data.orders || r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await api.put(`/orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
    } catch {
      alert('Could not update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const exportExcel = async () => {
    setExporting(true)
    try {
      const q = filter ? `?status=${filter}` : ''
      const r = await api.get(`/admin/export/orders${q}`, { responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'orders.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>
        <div className="flex gap-2 flex-wrap">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="sku-input py-1.5 text-sm w-auto">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={exportExcel} disabled={exporting} className="sku-btn sku-btn-sm">
            {exporting ? 'Exporting...' : '📥 Export Excel'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <div key={order._id} className="sku-card p-4">
              <div className="flex flex-wrap gap-2 justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="font-semibold">{order.address?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.address?.phone} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <select
                  value={order.status}
                  onChange={e => updateStatus(order._id, e.target.value)}
                  disabled={updatingId === order._id}
                  className="sku-input py-1 text-sm w-auto font-bold disabled:opacity-50 disabled:cursor-wait"
                  style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} × {item.qty}</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{order.address?.fullAddress?.slice(0, 40)}…</span>
                <span className="font-bold" style={{ color: 'var(--primary)' }}>₹{order.totalAmount + order.deliveryCharge}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No orders found</p>}
        </div>
      )}
    </div>
  )
}
