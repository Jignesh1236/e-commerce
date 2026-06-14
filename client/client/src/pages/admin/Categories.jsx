import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTag, FiHome } from 'react-icons/fi'

const EMPTY = { name: '', icon: '', order: 0, active: true, showInHero: false }

const EMOJI_SUGGESTIONS = ['🥦','🥕','🍎','🍌','🥩','🐔','🐟','🥛','🧀','🥚','🍞','🌾','🫙','🧴','🧹','🛒','🍫','🍬','🌿','🫚','🧄','🧅','🍅','🌽','🫑','🥑','🍋','🍊','🍇','🥝']

export default function AdminCategories() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/categories?all=true')
      .then(r => setCats(r.data.categories || []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (c) => {
    setEditing(c._id)
    setForm({ name: c.name, icon: c.icon || '', order: c.order || 0, active: c.active !== false, showInHero: c.showInHero === true })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) return alert('Category name is required')
    setSaving(true)
    try {
      if (editing) await api.put(`/categories/${editing}`, form)
      else await api.post('/categories', form)
      setShowForm(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Could not save category')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"? Products in this category will not be deleted.`)) return
    await api.delete(`/categories/${id}`)
    setCats(c => c.filter(x => x._id !== id))
  }

  const toggleActive = async (cat) => {
    try {
      const r = await api.put(`/categories/${cat._id}`, { ...cat, active: !cat.active })
      setCats(c => c.map(x => x._id === cat._id ? r.data.category : x))
    } catch {}
  }

  const toggleHero = async (cat) => {
    try {
      const r = await api.put(`/categories/${cat._id}`, { showInHero: !cat.showInHero })
      setCats(c => c.map(x => x._id === cat._id ? r.data.category : x))
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold">Categories</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage product categories shown in the store
          </p>
        </div>
        <button onClick={openAdd} className="sku-btn sku-btn-sm">
          <FiPlus size={15} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <div className="sku-card p-12 text-center">
          <div className="text-5xl mb-3">🏷️</div>
          <p className="font-bold mb-1">No categories yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Add categories to organize your products
          </p>
          <button onClick={openAdd} className="sku-btn sku-btn-sm"><FiPlus size={14} /> Add First Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cats.map(cat => (
            <div key={cat._id} className="sku-card p-4 flex items-center gap-3 transition-all hover:shadow-lg animate-fade-up">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{
                  background: cat.active
                    ? 'linear-gradient(135deg, var(--primary-glow), rgba(46,125,50,0.08))'
                    : 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  boxShadow: cat.active ? '0 2px 6px var(--primary-glow)' : 'none',
                  opacity: cat.active ? 1 : 0.5
                }}>
                {cat.icon || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold truncate"
                    style={{ color: cat.active ? 'var(--text)' : 'var(--text-muted)' }}>
                    {cat.name}
                  </p>
                  {!cat.active && (
                    <span className="sku-badge text-xs"
                      style={{ background: 'var(--surface-inset)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      Hidden
                    </span>
                  )}
                  {cat.showInHero && (
                    <span className="sku-badge text-xs"
                      style={{ background: 'rgba(234,88,12,0.1)', color: 'var(--primary)', border: '1px solid rgba(234,88,12,0.25)' }}>
                      🏠 Hero
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Order: {cat.order || 0}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleHero(cat)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: cat.showInHero
                      ? 'linear-gradient(135deg,#ea580c,#c2410c)'
                      : 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    border: `1px solid ${cat.showInHero ? '#c2410c' : 'var(--border)'}`,
                    color: cat.showInHero ? 'white' : 'var(--text-muted)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title={cat.showInHero ? 'Remove from Hero' : 'Show in Hero'}>
                  <FiHome size={13} />
                </button>
                <button onClick={() => toggleActive(cat)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: cat.active
                      ? 'linear-gradient(135deg,#ea580c,#c2410c)'
                      : 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    border: '1px solid var(--border)',
                    color: cat.active ? 'white' : 'var(--text-muted)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title={cat.active ? 'Hide category' : 'Show category'}>
                  <FiCheck size={15} />
                </button>
                <button onClick={() => openEdit(cat)}
                  className="sku-btn-outline w-9 h-9 transition-all hover:scale-105"
                  style={{ padding: 0, borderRadius: 12 }}>
                  <FiEdit2 size={15} />
                </button>
                <button onClick={() => del(cat._id, cat.name)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    border: '1px solid var(--border)',
                    color: 'var(--danger)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="sku-card w-full max-w-md p-5 animate-fade-up" style={{ borderRadius: 24 }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-extrabold">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="sku-btn-outline"
                style={{ padding: 7, borderRadius: 10, width: 34, height: 34 }}>
                <FiX size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>Category Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fresh Vegetables"
                  className="sku-input" autoFocus />
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>Emoji Icon</label>
                <input type="text" value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🥦 paste any emoji"
                  className="sku-input text-2xl" style={{ lineHeight: 1.3 }} />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {EMOJI_SUGGESTIONS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, icon: e }))}
                      className="text-xl p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: form.icon === e ? 'var(--primary-glow)' : 'var(--surface-inset)',
                        border: `1px solid ${form.icon === e ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 10
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>Sort Order (lower = first)</label>
                <input type="number" value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                  className="sku-input" min={0} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl"
                style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                <div className="relative w-10 h-6">
                  <input type="checkbox" checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="sr-only" />
                  <div className="w-10 h-6 rounded-full transition-colors duration-200"
                    style={{ background: form.active ? 'var(--primary)' : 'var(--border)' }} />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: form.active ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <span className="text-sm font-semibold">
                  {form.active ? 'Visible in store' : 'Hidden from store'}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl"
                style={{ background: form.showInHero ? 'rgba(234,88,12,0.06)' : 'var(--surface-inset)', border: `1px solid ${form.showInHero ? 'rgba(234,88,12,0.3)' : 'var(--border)'}` }}>
                <div className="relative w-10 h-6">
                  <input type="checkbox" checked={form.showInHero}
                    onChange={e => setForm(f => ({ ...f, showInHero: e.target.checked }))}
                    className="sr-only" />
                  <div className="w-10 h-6 rounded-full transition-colors duration-200"
                    style={{ background: form.showInHero ? 'var(--primary)' : 'var(--border)' }} />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: form.showInHero ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <div>
                  <span className="text-sm font-semibold block">
                    {form.showInHero ? '🏠 Shown in Hero' : '🏠 Show in Hero'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Appears in home page banner sidebar
                  </span>
                </div>
              </label>

              <button onClick={save} disabled={saving} className="sku-btn w-full">
                {saving ? 'Saving…' : editing ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
