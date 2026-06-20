import { useEffect, useRef, useState } from 'react'
import api from '../../utils/api'
import { FiPlus, FiTrash2, FiSave, FiImage, FiX, FiCheck, FiUpload } from 'react-icons/fi'

export default function AdminConfig() {
  const [config, setConfig] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const logoRef = useRef()

  useEffect(() => {
    Promise.all([api.get('/config'), api.get('/categories')])
      .then(([c, cat]) => {
        setConfig(c.data.config || c.data)
        setCategories(cat.data.categories || cat.data || [])
      })
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

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
  }

  const uploadLogo = async () => {
    const file = logoRef.current?.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('logo', file)
      const r = await api.post('/config/logo', fd)
      setConfig(r.data.config)
      setLogoPreview(null)
      if (logoRef.current) logoRef.current.value = ''
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Logo upload failed. Please try again.')
    } finally {
      setLogoUploading(false)
    }
  }

  const removeLogo = async () => {
    if (!confirm('Remove store logo?')) return
    try {
      const r = await api.delete('/config/logo')
      setConfig(r.data.config)
      setLogoPreview(null)
      if (logoRef.current) logoRef.current.value = ''
    } catch {
      alert('Failed to remove logo.')
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
      <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="sku-input" />
    </div>
  )

  const currentLogo = logoPreview || config?.logo

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Store Config</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Store ka naam, logo aur baaki settings</p>
        </div>
        <button onClick={save} disabled={saving} className="sku-btn sku-btn-sm">
          <FiSave size={14} />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All'}
        </button>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── ORDER SETTINGS ── */}
        <div className="sku-card p-5" style={{ border: '2px solid rgba(37,211,102,0.35)', background: 'rgba(37,211,102,0.04)' }}>
          <h2 className="font-extrabold text-base mb-1 flex items-center gap-2">
            <span className="text-lg">📲</span> Order WhatsApp Number
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Customers ke orders <strong>is number pe</strong> WhatsApp se aayenge. Country code ke saath daalo (bina + ke).
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center px-3 py-2.5 rounded-xl text-sm font-bold shrink-0"
              style={{ background: 'rgba(37,211,102,0.12)', color: '#128C7E', border: '1px solid rgba(37,211,102,0.3)' }}>
              <span>+</span>
            </div>
            <input
              type="tel"
              value={config?.whatsappNumber || ''}
              onChange={e => set('whatsappNumber', e.target.value)}
              placeholder="919876543210"
              className="sku-input flex-1 font-mono text-base"
            />
          </div>
          {config?.whatsappNumber && (
            <p className="text-xs mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(37,211,102,0.08)', color: '#128C7E', border: '1px solid rgba(37,211,102,0.2)' }}>
              ✅ Orders jayenge: <strong>wa.me/{config.whatsappNumber}</strong>
            </p>
          )}
        </div>

        {/* ── STORE IDENTITY (Logo + Name) ── */}
        <div className="sku-card p-5">
          <h2 className="font-extrabold text-base mb-4 flex items-center gap-2">
            <span className="text-lg">🏪</span> Store Identity
          </h2>

          <div className="flex gap-5 items-start flex-wrap">
            {/* Logo upload box */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ border: '2px dashed var(--border)', background: 'var(--surface-inset)' }}>
                {currentLogo ? (
                  <>
                    <img src={currentLogo} alt="Store logo"
                      className="w-full h-full object-contain p-2" />
                    <button
                      onClick={() => {
                        if (logoPreview) {
                          setLogoPreview(null)
                          if (logoRef.current) logoRef.current.value = ''
                        } else {
                          removeLogo()
                        }
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--danger)', color: 'white' }}>
                      <FiX size={10} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <FiImage size={22} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px] font-medium text-center px-1" style={{ color: 'var(--text-muted)' }}>
                      No logo
                    </span>
                  </div>
                )}
              </div>

              <label className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105 flex items-center gap-1"
                style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(46,125,50,0.2)' }}>
                <FiUpload size={11} />
                {currentLogo ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" ref={logoRef}
                  onChange={handleLogoSelect} />
              </label>

              {logoPreview && (
                <button onClick={uploadLogo} disabled={logoUploading}
                  className="sku-btn sku-btn-sm text-xs w-full flex items-center justify-center gap-1">
                  {logoUploading ? (
                    <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                  ) : (
                    <><FiCheck size={11} /> Save Logo</>
                  )}
                </button>
              )}
            </div>

            {/* Name + Tagline */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <Field
                label="Store Name *"
                value={config?.storeName}
                onChange={v => set('storeName', v)}
                placeholder="e.g. Fresh Bazaar"
              />
              <Field
                label="Tagline"
                value={config?.tagline}
                onChange={v => set('tagline', v)}
                placeholder="e.g. Fresh products, fast delivery"
              />
            </div>
          </div>

          {logoPreview && (
            <p className="text-xs mt-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(212,130,10,0.08)', color: 'var(--warning)', border: '1px solid rgba(212,130,10,0.2)' }}>
              ⚠️ Logo select ki hai — "Save Logo" dabao upload karne ke liye
            </p>
          )}
        </div>

        {/* ── DELIVERY ── */}
        <div className="sku-card p-4">
          <h2 className="font-extrabold text-base mb-3 flex items-center gap-2"><span>🚚</span> Delivery Charges</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery Charge (₹)" type="number" value={config?.deliveryCharge} onChange={v => set('deliveryCharge', v)} />
            <Field label="Free Delivery Above (₹)" type="number" value={config?.freeDeliveryAbove} onChange={v => set('freeDeliveryAbove', v)} />
          </div>
        </div>

        {/* ── TIMINGS ── */}
        <div className="sku-card p-4">
          <h2 className="font-extrabold text-base mb-3 flex items-center gap-2"><span>⏰</span> Store Timings</h2>
          <div className="flex flex-col gap-3">
            <Field label="Days" value={config?.storeTiming?.days} onChange={v => set('storeTiming.days', v)} placeholder="Monday - Saturday" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Time" value={config?.storeTiming?.open} onChange={v => set('storeTiming.open', v)} placeholder="08:00 AM" />
              <Field label="Closing Time" value={config?.storeTiming?.close} onChange={v => set('storeTiming.close', v)} placeholder="09:00 PM" />
            </div>
          </div>
        </div>

        {/* ── SOCIAL ── */}
        <div className="sku-card p-4">
          <h2 className="font-extrabold text-base mb-3 flex items-center gap-2"><span>📱</span> Social Links</h2>
          <div className="flex flex-col gap-3">
            <Field label="Instagram URL" value={config?.socialLinks?.instagram} onChange={v => set('socialLinks.instagram', v)} placeholder="https://instagram.com/yourstore" />
            <Field label="Facebook URL" value={config?.socialLinks?.facebook} onChange={v => set('socialLinks.facebook', v)} placeholder="https://facebook.com/yourstore" />
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="sku-card p-4">
          <h2 className="font-extrabold text-base mb-3 flex items-center gap-2"><span>📋</span> About Us & Contact</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>About Us Text</label>
              <textarea value={config?.aboutUs || ''} onChange={e => set('aboutUs', e.target.value)} rows={3} className="sku-input resize-none" placeholder="Tell customers about your store..." />
            </div>
            <Field label="Contact Phone" value={config?.contactInfo?.phone} onChange={v => set('contactInfo.phone', v)} />
            <Field label="Contact Email" value={config?.contactInfo?.email} onChange={v => set('contactInfo.email', v)} />
            <div>
              <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Store Address</label>
              <textarea value={config?.contactInfo?.address || ''} onChange={e => set('contactInfo.address', e.target.value)} rows={2} className="sku-input resize-none" />
            </div>
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div className="sku-card p-4">
          <h2 className="font-extrabold text-base mb-3 flex items-center gap-2"><span>🗂</span> Product Categories</h2>
          <div className="flex gap-2 mb-3">
            <input value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="🥦" className="sku-input w-16 text-center text-lg" />
            <input value={catName} onChange={e => setCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="Category name" className="sku-input flex-1" />
            <button onClick={addCat} className="sku-btn sku-btn-sm shrink-0"><FiPlus size={14} /></button>
          </div>
          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <div key={c._id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                <span className="text-sm font-medium">{c.icon} {c.name}</span>
                <button onClick={() => delCat(c._id)} className="p-1 rounded-lg transition-colors hover:bg-red-50"
                  style={{ color: 'var(--danger)' }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No categories yet</p>
            )}
          </div>
        </div>

      </div>

      <div className="mt-5 flex justify-end">
        <button onClick={save} disabled={saving} className="sku-btn sku-btn-lg">
          <FiSave size={16} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}
