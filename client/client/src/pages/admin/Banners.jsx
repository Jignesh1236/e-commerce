import { useEffect, useRef, useState } from 'react'
import api from '../../utils/api'
import { FiTrash2, FiEye, FiEyeOff, FiPlus } from 'react-icons/fi'
import { optimizeImage } from '../../utils/cloudinary'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', link: '' })
  const fileRef = useRef()

  const load = () => api.get('/banners?all=true').then(r => setBanners(r.data.banners || r.data || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const add = async () => {
    const file = fileRef.current?.files[0]
    if (!file) return alert('Select an image first')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', form.title)
      fd.append('link', form.link)
      await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      fileRef.current.value = ''
      setForm({ title: '', link: '' })
      load()
    } finally {
      setUploading(false)
    }
  }

  const del = async (id) => {
    if (!confirm('Delete banner?')) return
    await api.delete(`/banners/${id}`)
    setBanners(b => b.filter(x => x._id !== id))
  }

  const toggle = async (id, active) => {
    await api.put(`/banners/${id}`, { active: !active })
    setBanners(b => b.map(x => x._id === id ? { ...x, active: !x.active } : x))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>
      <div className="sku-card p-4 mb-6">
        <h2 className="font-bold mb-3">Add Banner</h2>
        <div className="flex flex-col gap-3">
          <input type="file" accept="image/*" ref={fileRef} className="sku-input py-2 text-sm" />
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (optional)" className="sku-input" />
          <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="Link URL (optional, e.g. /?category=Fruits)" className="sku-input" />
          <button onClick={add} disabled={uploading} className="sku-btn sku-btn-sm self-start">
            <FiPlus size={14} /> {uploading ? 'Uploading...' : 'Add Banner'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-7 h-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {banners.map(b => (
            <div key={b._id} className="sku-card overflow-hidden">
              <img src={optimizeImage(b.imageUrl, 'banner')} alt={b.title} className="w-full h-32 object-cover" onError={e => { e.target.src = 'https://placehold.co/400x200?text=Banner' }} />
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{b.title || 'Untitled'}</p>
                  {b.link && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{b.link}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggle(b._id, b.active)} style={{ color: b.active ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {b.active ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                  </button>
                  <button onClick={() => del(b._id)} style={{ color: '#e05252' }}><FiTrash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
