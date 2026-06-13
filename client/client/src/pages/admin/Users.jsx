import { useEffect, useState } from 'react'
import api from '../../utils/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users || r.data || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>
      <div className="sku-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Name', 'Source', 'Address', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: i < users.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{u.source || '—'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.address || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
