import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'

export default function AdminConfig() {
  const [config, setConfig] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/config'), api.get('/categories')])
      .then(([c, cat]) => { setConfig(c.data.config || c.data); setCategories(cat.data.categories || cat.data || []) })
      .finally(() => setLoading(false))
  }, [])

  const set = (path, value) => {
    setConfig(prev => {
      const parts = path.split('.')
      const next = { ...prev }
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] }
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/config', config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const addCat = async () => {
    if (!catName) return
    const r = await api.post('/categories', { name: catName, icon: catIcon || '📦', order: categories.length + 1 })
    setCategories(c => [...c, r.data.category || r.data])
    setCatName(''); setCatIcon('')
  }

  const delCat = async (id) => {
    if (!confirm('Delete category?')) return
    await api.delete(`/categories/${id}`)
    setCategories(c => c.filter(x => x._id !== id))
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>

  const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
      <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="sku-input" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Store Config</h1>
        <button onClick={save} disabled={saving} className="sku-btn sku-btn-sm">
          <FiSave size={14} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All'}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="sku-card p-4">
          <h2 className="font-bold mb-3">Store Identity</h2>
          <div className="flex flex-col gap-3">
            <Field label="Store Name" value={config?.storeName} onChange={v => set('storeName', v)} placeholder="My Store" />
            <Field label="WhatsApp Number (with country code)" value={config?.whatsappNumber} onChange={v => set('whatsappNumber', v)} placeholder="919876543210" />
          </div>
        </div>

        <div className="sku-card p-4">
          <h2 className="font-bold mb-3">Delivery Charges</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery Charge (₹)" type="number" value={config?.deliveryCharge} onChange={v => set('deliveryCharge', v)} />
            <Field label="Free Delivery Above (₹)" type="number" value={config?.freeDeliveryAbove} onChange={v => set('freeDeliveryAbove', v)} />
          </div>
        </div>

        <div className="sku-card p-4">
          <h2 className="font-bold mb-3">Store Timings</h2>
          <div className="flex flex-col gap-3">
            <Field label="Days" value={config?.storeTiming?.days} onChange={v => set('storeTiming.days', v)} placeholder="Monday - Saturday" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Time" value={config?.storeTiming?.open} onChange={v => set('storeTiming.open', v)} placeholder="08:00 AM" />
              <Field label="Closing Time" value={config?.storeTiming?.close} onChange={v => set('storeTiming.close', v)} placeholder="09:00 PM" />
            </div>
          </div>
        </div>

        <div className="sku-card p-4">
          <h2 className="font-bold mb-3">Social Links</h2>
          <div className="flex flex-col gap-3">
            <Field label="Instagram URL" value={config?.socialLinks?.instagram} onChange={v => set('socialLinks.instagram', v)} placeholder="https://instagram.com/yourstore" />
            <Field label="Facebook URL" value={config?.socialLinks?.facebook} onChange={v => set('socialLinks.facebook', v)} placeholder="https://facebook.com/yourstore" />
          </div>
        </div>

        <div className="sku-card p-4">
          <h2 className="font-bold mb-3">About Us & Contact</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>About Us Text</label>
              <textarea value={config?.aboutUs || ''} onChange={e => set('aboutUs', e.target.value)} rows={3} className="sku-input resize-none" placeholder="Tell customers about your store..." />
            </div>
            <Field label="Contact Phone" value={config?.contactInfo?.phone} onChange={v => set('contactInfo.phone', v)} />
            <Field label="Contact Email" value={config?.contactInfo?.email} onChange={v => set('contactInfo.email', v)} />
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Store Address</label>
              <textarea value={config?.contactInfo?.address || ''} onChange={e => set('contactInfo.address', e.target.value)} rows={2} className="sku-input resize-none" />
            </div>
          </div>
        </div>

        <div className="sku-card p-4">
          <h2 className="font-bold mb-3">Product Categories</h2>
          <div className="flex gap-2 mb-3">
            <input value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="Emoji 🥦" className="sku-input w-24 text-center" />
            <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category name" className="sku-input flex-1" />
            <button onClick={addCat} className="sku-btn sku-btn-sm shrink-0"><FiPlus size={14} /></button>
          </div>
          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <div key={c._id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="text-sm">{c.icon} {c.name}</span>
                <button onClick={() => delCat(c._id)} style={{ color: '#e05252' }}><FiTrash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={saving} className="sku-btn">
          <FiSave size={16} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}
