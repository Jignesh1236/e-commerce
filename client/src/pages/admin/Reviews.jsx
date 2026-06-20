import { useEffect, useState } from 'react'
import api from '../../utils/api'
import StarRating from '../../components/StarRating'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => api.get('/reviews/all').then(r => setReviews(r.data || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this review?')) return
    setDeletingId(id)
    try {
      await api.delete(`/reviews/${id}`)
      setReviews(r => r.filter(x => x._id !== id))
    } catch {
      alert('Could not delete review')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h1>
      {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p> : (
        <div className="flex flex-col gap-3">
          {reviews.map(r => (
            <div key={r._id} className="sku-card p-4 flex gap-4 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm">{r.userId?.name || 'User'}</span>
                  <StarRating value={r.rating} size={14} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--primary)' }}>{r.productId?.name || 'Product'}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.comment || '—'}</p>
              </div>
              <button onClick={() => del(r._id)} disabled={deletingId === r._id}
                className="sku-btn sku-btn-sm sku-btn-danger shrink-0 disabled:opacity-50">
                {deletingId === r._id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
