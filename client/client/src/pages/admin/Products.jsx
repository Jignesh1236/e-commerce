import { useEffect, useRef, useState } from 'react'
import api from '../../utils/api'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiCheck } from 'react-icons/fi'
import { optimizeImage } from '../../utils/cloudinary'

const EMPTY = { name: '', price: '', discountPercent: 0, category: '', stock: '', deliveryTime: '', description: '', freeDelivery: false, featured: false }
const QUICK_EMOJIS = ['🥦','🥕','🍎','🍌','🥩','🐟','🥛','🧀','🥚','🍞','🫙','🧴','🛒','🌿','🫚','🧹','🍫','🌽','🥑','🍋']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [removedImages, setRemovedImages] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const [showQuickCat, setShowQuickCat] = useState(false)
  const [quickCat, setQuickCat] = useState({ name: '', icon: '' })
  const [savingCat, setSavingCat] = useState(false)
  const fileRef = useRef()

  const createQuickCategory = async () => {
    if (!quickCat.name.trim()) return
    setSavingCat(true)
    try {
      const r = await api.post('/categories', { name: quickCat.name.trim(), icon: quickCat.icon, active: true })
      const newCat = r.data.category
      setCategories(prev => [...prev, newCat])
      setForm(f => ({ ...f, category: newCat.name }))
      setQuickCat({ name: '', icon: '' })
      setShowQuickCat(false)
    } catch (e) {
      alert(e.response?.data?.message || 'Could not create category')
    } finally {
      setSavingCat(false)
    }
  }

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/products?limit=200'), api.get('/categories?all=true')])
      .then(([p, c]) => {
        setProducts(p.data.products || [])
        setCategories(c.data.categories || [])
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null); setEditProduct(null)
    setForm(EMPTY); setRemovedImages([]); setPreviewFiles([])
    setShowForm(true)
  }
  const openEdit = (p) => {
    setEditing(p._id); setEditProduct(p)
    setForm({ name: p.name, price: p.price, discountPercent: p.discountPercent || 0, category: p.category || '', stock: p.stock, deliveryTime: p.deliveryTime || '', description: p.description || '', freeDelivery: p.freeDelivery || false, featured: p.featured || false })
    setRemovedImages([]); setPreviewFiles([])
    setShowForm(true)
  }

  const revokeAllPreviews = (files) => files.forEach(f => URL.revokeObjectURL(f.url))

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    setPreviewFiles(prev => {
      revokeAllPreviews(prev)
      return files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    })
  }

  const save = async () => {
    if (!form.name || !form.price) return alert('Name and price are required')
    if (!form.category) return alert('Please select a category')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const files = fileRef.current?.files
      if (files) for (let f of files) fd.append('images', f)
      if (removedImages.length) removedImages.forEach(url => fd.append('removeImages', url))
      if (editing) await api.put(`/products/${editing}`, fd)
      else await api.post('/products', fd)
      setShowForm(false)
      setPreviewFiles(prev => { revokeAllPreviews(prev); return [] })
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      setProducts(p => p.filter(x => x._id !== id))
    } catch {
      alert('Could not delete product')
    } finally {
      setDeleting(null)
    }
  }

  const removeExisting = (url) => {
    setRemovedImages(r => [...r, url])
    setEditProduct(p => ({ ...p, images: p.images.filter(i => i !== url) }))
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold">Products <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 18 }}>({products.length})</span></h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your product catalogue</p>
        </div>
        <button onClick={openAdd} className="sku-btn sku-btn-sm"><FiPlus size={15} /> Add Product</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or category…" className="sku-input mb-4" />

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="sku-card p-12 text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-bold mb-1">{search ? 'No products match your search' : 'No products yet'}</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Try a different search term' : 'Add your first product to get started'}
          </p>
          {!search && <button onClick={openAdd} className="sku-btn sku-btn-sm"><FiPlus size={14} /> Add Product</button>}
        </div>
      ) : (
        <div className="sku-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
                  {['','Name','Price','Stock','Category','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id} className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                        style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                        {p.images?.[0] ? (
                          <img src={optimizeImage(p.images[0], 'thumb')} alt=""
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://placehold.co/100x100?text=📦' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-semibold truncate">{p.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {p.featured && <span className="sku-badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: 10 }}>⭐ Featured</span>}
                        {p.images?.length > 1 && <span className="sku-badge" style={{ background: 'var(--surface-inset)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 10 }}>🖼 {p.images.length} pics</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-extrabold" style={{ color: 'var(--primary)' }}>
                        ₹{p.discountPercent > 0 ? Math.round(p.price * (1 - p.discountPercent / 100)) : p.price}
                      </span>
                      {p.discountPercent > 0 && (
                        <span className="text-xs line-through ml-1" style={{ color: 'var(--text-muted)' }}>₹{p.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold"
                        style={{ color: p.stock === 0 ? 'var(--danger)' : p.stock < 5 ? 'var(--warning)' : 'var(--text)' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{p.category || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="sku-btn-outline"
                          style={{ padding: '6px', borderRadius: 10, width: 34, height: 34 }}>
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => del(p._id)}
                          disabled={deleting === p._id}
                          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-wait"
                          style={{ color: 'var(--danger)', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="sku-card w-full max-w-lg p-5 max-h-[92vh] overflow-y-auto animate-fade-up"
            style={{ borderRadius: 24 }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-extrabold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="sku-btn-outline"
                style={{ padding: 7, borderRadius: 10, width: 34, height: 34 }}>
                <FiX size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                ['name', 'Product Name *', 'text'],
                ['price', 'Price (₹) *', 'number'],
                ['discountPercent', 'Discount %', 'number'],
                ['stock', 'Stock Quantity *', 'number'],
                ['deliveryTime', 'Delivery Time (e.g. 2-4 hours)', 'text']
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input type={type} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="sku-input" min={type === 'number' ? 0 : undefined} />
                </div>
              ))}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>Category *</label>
                  <button type="button"
                    onClick={() => { setShowQuickCat(v => !v); setQuickCat({ name: '', icon: '' }) }}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                    style={{
                      color: showQuickCat ? 'var(--danger)' : 'var(--primary)',
                      background: showQuickCat ? 'rgba(192,57,43,0.08)' : 'var(--primary-glow)',
                      border: `1px solid ${showQuickCat ? 'rgba(192,57,43,0.2)' : 'rgba(46,125,50,0.2)'}`,
                    }}>
                    {showQuickCat ? <><FiX size={11} /> Cancel</> : <><FiPlus size={11} /> New Category</>}
                  </button>
                </div>

                {showQuickCat ? (
                  <div className="rounded-2xl overflow-hidden animate-fade-up"
                    style={{ border: '2px solid var(--primary)', background: 'var(--surface-inset)' }}>
                    <div className="p-3 flex flex-col gap-2">
                      <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                        ✨ Quick create category
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={quickCat.name}
                          onChange={e => setQuickCat(q => ({ ...q, name: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && createQuickCategory()}
                          placeholder="Category name…"
                          className="sku-input flex-1 py-2 text-sm"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={quickCat.icon}
                          onChange={e => setQuickCat(q => ({ ...q, icon: e.target.value }))}
                          placeholder="🥦"
                          className="sku-input text-xl text-center"
                          style={{ width: 54, padding: '8px' }}
                        />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {QUICK_EMOJIS.map(e => (
                          <button key={e} type="button"
                            onClick={() => setQuickCat(q => ({ ...q, icon: e }))}
                            className="text-lg transition-transform hover:scale-110 active:scale-95"
                            style={{
                              padding: '4px 6px', borderRadius: 8,
                              background: quickCat.icon === e ? 'var(--primary-glow)' : 'transparent',
                              border: `1px solid ${quickCat.icon === e ? 'var(--primary)' : 'transparent'}`
                            }}>
                            {e}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={createQuickCategory}
                        disabled={savingCat || !quickCat.name.trim()}
                        className="sku-btn sku-btn-sm w-full">
                        {savingCat ? 'Creating…' : <><FiCheck size={13} /> Create & Select</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <select value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="sku-input">
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="sku-input resize-none" placeholder="Product details, features, notes…" />
              </div>

              {editing && editProduct?.images?.length > 0 && (
                <div>
                  <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>Current Images</label>
                  <div className="flex gap-2 flex-wrap">
                    {editProduct.images.map((url, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden"
                        style={{ border: '2px solid var(--border)' }}>
                        <img src={optimizeImage(url, 'thumb')} alt=""
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://placehold.co/100x100?text=📦' }} />
                        <button onClick={() => removeExisting(url)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--danger)', color: 'white' }}>
                          <FiX size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {removedImages.length > 0 && (
                    <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>
                      {removedImages.length} image(s) will be removed on save
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>
                  {editing ? 'Add More Images' : 'Product Images'} (up to 10)
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-all hover:border-[var(--primary)]"
                  style={{ border: '2px dashed var(--border)', background: 'var(--surface-inset)' }}>
                  <FiImage size={28} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    Click to select images
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    JPG, PNG, WebP · max 10MB each
                  </span>
                  <input type="file" accept="image/*" multiple ref={fileRef}
                    onChange={handleFiles} className="hidden" />
                </label>
                {previewFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {previewFiles.map((f, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden"
                        style={{ border: '2px solid var(--primary)' }}>
                        <img src={f.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 p-3 rounded-xl"
                style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                {[['freeDelivery', '🚚 Free Delivery'], ['featured', '⭐ Featured']].map(([key, lbl]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold">
                    <input type="checkbox" checked={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-[var(--primary)]" />
                    {lbl}
                  </label>
                ))}
              </div>

              <button onClick={save} disabled={saving} className="sku-btn w-full sku-btn-lg">
                {saving ? 'Saving…' : editing ? '✓ Update Product' : '+ Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
