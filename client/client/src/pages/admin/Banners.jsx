import { useEffect, useRef, useState, useCallback } from 'react'
import api from '../../utils/api'
import { FiTrash2, FiEye, FiEyeOff, FiPlus, FiX, FiMove, FiZoomIn, FiZoomOut, FiCheck, FiImage } from 'react-icons/fi'
import { optimizeImage } from '../../utils/cloudinary'

function HeroPreview({ imageUrl, title, objectPosition }) {
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 160, background: '#c2410c' }}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="preview"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
        />
      )}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.08) 100%)'
      }} />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black mb-2 uppercase tracking-wider w-fit"
          style={{ background: '#fbbf24', color: '#c2410c' }}>
          ⚡ Super Saver
        </div>
        <p className="text-white font-black text-lg leading-tight mb-1 italic">
          {title || 'Store Name'}
        </p>
        <p className="text-white/60 text-xs">Fresh products, fast delivery</p>
        <div className="flex gap-2 mt-2">
          <div className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'rgba(255,255,255,0.95)', color: '#1a1208' }}>
            Search products…
          </div>
          <div className="px-4 py-1.5 rounded-xl text-xs font-black text-white"
            style={{ background: 'linear-gradient(135deg,#c2410c,#ea580c)' }}>
            Search
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
        Home Preview
      </div>
    </div>
  )
}

function CropModal({ file, onClose, onConfirm }) {
  const [imgSrc, setImgSrc] = useState('')
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(50)
  const [scale, setScale] = useState(1)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, px: 50, py: 50 })
  const imgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, px: posX, py: posY })
  }, [posX, posY])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = -(e.clientX - dragStart.x) / rect.width * 100
    const dy = -(e.clientY - dragStart.y) / rect.height * 100
    setPosX(Math.max(0, Math.min(100, dragStart.px + dx)))
    setPosY(Math.max(0, Math.min(100, dragStart.py + dy)))
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: t.clientX, y: t.clientY, px: posX, py: posY })
  }, [posX, posY])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return
    const t = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const dx = -(t.clientX - dragStart.x) / rect.width * 100
    const dy = -(t.clientY - dragStart.y) / rect.height * 100
    setPosX(Math.max(0, Math.min(100, dragStart.px + dx)))
    setPosY(Math.max(0, Math.min(100, dragStart.py + dy)))
  }, [isDragging, dragStart])

  const objectPosition = `${posX.toFixed(0)}% ${posY.toFixed(0)}%`

  const PRESETS = [
    { label: 'Top Left',    px: 0,   py: 0 },
    { label: 'Top Center',  px: 50,  py: 0 },
    { label: 'Top Right',   px: 100, py: 0 },
    { label: 'Center Left', px: 0,   py: 50 },
    { label: 'Center',      px: 50,  py: 50 },
    { label: 'Center Right',px: 100, py: 50 },
    { label: 'Bottom Left', px: 0,   py: 100 },
    { label: 'Bottom',      px: 50,  py: 100 },
    { label: 'Bottom Right',px: 100, py: 100 },
  ]

  const handleConfirm = () => {
    onConfirm({ file, objectPosition, title, link })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl flex flex-col"
        style={{
          background: 'var(--surface-card)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '96vh',
          overflow: 'hidden',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-extrabold">Adjust Banner Image</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Drag image to reposition · Scale with +/− buttons
            </p>
          </div>
          <button onClick={onClose} className="sku-btn-outline" style={{ padding: 7, borderRadius: 10, width: 34, height: 34 }}>
            <FiX size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

          {/* Image adjuster */}
          <div>
            <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Drag to reposition
            </p>
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-2xl select-none"
              style={{
                height: 200,
                background: '#111',
                cursor: isDragging ? 'grabbing' : 'grab',
                border: '2px solid var(--border)',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {imgSrc && (
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="crop"
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ objectPosition, transform: `scale(${scale})`, transformOrigin: `${posX}% ${posY}%`, transition: isDragging ? 'none' : 'transform 0.2s' }}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <FiMove size={24} className="text-white drop-shadow-lg" />
                  <span className="text-white text-xs font-semibold drop-shadow-lg">Drag to move</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                {objectPosition}
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Zoom:</span>
              <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(1)))}
                className="sku-btn-outline" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}>
                <FiZoomOut size={14} />
              </button>
              <span className="text-sm font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3, +(s + 0.1).toFixed(1)))}
                className="sku-btn-outline" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}>
                <FiZoomIn size={14} />
              </button>
              <button onClick={() => { setScale(1); setPosX(50); setPosY(50) }}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Reset
              </button>

              {/* Quick position presets */}
              <div className="ml-auto grid grid-cols-3 gap-0.5" style={{ width: 78 }}>
                {PRESETS.map(p => (
                  <button key={p.label}
                    onClick={() => { setPosX(p.px); setPosY(p.py) }}
                    title={p.label}
                    className="w-6 h-6 rounded-md transition-all hover:scale-110"
                    style={{
                      background: Math.abs(posX - p.px) < 5 && Math.abs(posY - p.py) < 5
                        ? 'var(--primary)'
                        : 'var(--border)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Home Preview */}
          <div>
            <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Home Page Preview
            </p>
            <HeroPreview imageUrl={imgSrc} title={title} objectPosition={objectPosition} />
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Banner Title (optional)
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Fresh Vegetables, Mega Sale"
                className="sku-input"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Replaces store name as the hero heading</p>
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Link URL (optional)
              </label>
              <input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="e.g. /?category=Vegetables"
                className="sku-input"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="sku-btn-outline flex-1">Cancel</button>
          <button onClick={handleConfirm} className="sku-btn flex-1">
            <FiCheck size={15} /> Upload Banner
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState(null)
  const fileRef = useRef()

  const load = () => api.get('/banners?all=true').then(r => setBanners(r.data.banners || r.data || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setCropFile(file)
    e.target.value = ''
  }

  const handleCropConfirm = async ({ file, objectPosition, title, link }) => {
    setCropFile(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', title)
      fd.append('link', link)
      fd.append('objectPosition', objectPosition)
      await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      load()
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.message || e.message))
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
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold">Banners</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Hero slideshow images for the home page
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="sku-btn sku-btn-sm">
          <FiPlus size={14} /> {uploading ? 'Uploading…' : 'Add Banner'}
        </button>
        <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleFileChange} />
      </div>

      {/* Empty state */}
      {!loading && banners.length === 0 && (
        <div className="sku-card p-12 text-center mb-4">
          <div className="text-5xl mb-3">🖼️</div>
          <p className="font-bold mb-1">No banners yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Upload banner images to show in the home page hero slideshow
          </p>
          <button onClick={() => fileRef.current?.click()} className="sku-btn sku-btn-sm">
            <FiPlus size={14} /> Upload First Banner
          </button>
        </div>
      )}

      {/* Banner grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((b, idx) => (
            <div key={b._id} className="sku-card overflow-hidden animate-fade-up">
              {/* Live mini hero preview */}
              <HeroPreview
                imageUrl={optimizeImage(b.imageUrl, 'banner')}
                title={b.title}
                objectPosition={b.objectPosition || '50% 50%'}
              />
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'var(--primary)' }}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{b.title || 'Untitled Banner'}</p>
                    {b.link && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{b.link}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggle(b._id, b.active)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{
                      background: b.active ? 'var(--primary-glow)' : 'var(--surface-inset)',
                      border: `1px solid ${b.active ? 'rgba(234,88,12,0.3)' : 'var(--border)'}`,
                      color: b.active ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                    title={b.active ? 'Hide banner' : 'Show banner'}>
                    {b.active ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => del(b._id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{
                      background: 'rgba(224,82,82,0.08)',
                      border: '1px solid rgba(224,82,82,0.2)',
                      color: '#e05252',
                    }}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              {!b.active && (
                <div className="mx-3 mb-3 text-center text-xs font-semibold py-1.5 rounded-xl"
                  style={{ background: 'var(--surface-inset)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Hidden — not shown on home page
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading overlay */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="sku-card p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="font-bold">Uploading banner…</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
          </div>
        </div>
      )}

      {/* Crop modal */}
      {cropFile && (
        <CropModal
          file={cropFile}
          onClose={() => setCropFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}
