import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { FiTrendingUp, FiPackage, FiUsers, FiAlertTriangle } from 'react-icons/fi'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data.dashboard || r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>

  const metrics = [
    { label: 'Total Revenue', value: `₹${data?.totalSales || 0}`, icon: FiTrendingUp, color: '#2d7a2d' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: FiPackage, color: '#4a90e2' },
    { label: 'New Users Today', value: data?.newUsersToday || 0, icon: FiUsers, color: '#7b68ee' },
    { label: 'New This Week', value: data?.newUsersWeek || 0, icon: FiUsers, color: '#f5a623' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="sku-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
              <m.icon size={18} style={{ color: m.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {data?.lowStock?.length > 0 && (
          <div className="sku-card p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2"><FiAlertTriangle style={{ color: '#f5a623' }} /> Low Stock</h2>
            <div className="flex flex-col gap-2">
              {data.lowStock.map(p => (
                <div key={p._id} className="flex justify-between items-center text-sm p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <span className="line-clamp-1 flex-1">{p.name}</span>
                  <span className="font-bold ml-2" style={{ color: '#e05252' }}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.topProducts?.length > 0 && (
          <div className="sku-card p-4">
            <h2 className="font-bold mb-3">🏆 Top Selling</h2>
            <div className="flex flex-col gap-2">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 text-sm p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <span className="w-5 text-center font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <span className="flex-1 line-clamp-1">{p.name}</span>
                  <span className="font-bold" style={{ color: 'var(--primary)' }}>{p.totalSold} sold</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
