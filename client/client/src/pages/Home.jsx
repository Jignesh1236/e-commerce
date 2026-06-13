import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiX, FiChevronRight, FiStar, FiShoppingCart, FiPlus, FiMinus, FiHeart, FiClock } from 'react-icons/fi'
import api from '../utils/api'
import BannerSlider from '../components/BannerSlider'
import { useUser } from '../context/UserContext'
import useAutoRefresh from '../hooks/useAutoRefresh'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { optimizeImage } from '../utils/cloudinary'

const SORT_OPTIONS = [
  { value: '', label: '✨ Default' },
  { value: 'price_asc', label: '💰 Price: Low → High' },
  { value: 'price_desc', label: '💎 Price: High → Low' },
  { value: 'newest', label: '🆕 Newest First' },
  { value: 'top_rated', label: '⭐ Top Rated' },
]

// Inline compact product card for grid
function GridCard({ product }) {
  const { items, addItem, updateQty, removeItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const cartItem = items.find(i => i.productId === product._id)
  const discountedPrice = product.discountPercent > 0
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : product.price
  const wishlisted = isWishlisted(product._id)
  const outOfStock = product.stock === 0

  return (
    <div className="sku-card flex flex-col overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderRadius: 16 }}>
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <img src={optimizeImage(product.images?.[0], 'card')} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          style={{ background: 'var(--surface-inset)' }}
          onError={e => { e.target.src = 'https://placehold.co/400x400?text=📦' }} />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white font-bold text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.6)' }}>Out of Stock</span>
          </div>
        )}
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 sku-badge text-white text-[10px]"
            style={{ background: 'linear-gradient(135deg,#e05252,#c0392b)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            {product.discountPercent}% OFF
          </span>
        )}
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product._id) }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
          style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <FiHeart size={13} fill={wishlisted ? 'var(--danger)' : 'none'} color={wishlisted ? 'var(--danger)' : 'var(--text-muted)'} />
        </button>
      </Link>
      <div className="p-2.5 flex flex-col flex-1 gap-1">
        <Link to={`/product/${product._id}`}>
          <p className="font-semibold text-xs leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>{product.name}</p>
        </Link>
        {product.deliveryTime && (
          <p className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
            <FiClock size={9} /> {product.deliveryTime}
          </p>
        )}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-sm font-extrabold" style={{ color: 'var(--primary)' }}>₹{discountedPrice}</span>
          {product.discountPercent > 0 && (
            <span className="text-[10px] line-through" style={{ color: 'var(--text-muted)' }}>₹{product.price}</span>
          )}
        </div>
        <div className="mt-auto pt-1">
          {outOfStock ? (
            <button disabled className="w-full rounded-xl py-1.5 text-xs font-semibold cursor-not-allowed"
              style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>Out of Stock</button>
          ) : cartItem ? (
            <div className="flex items-center justify-between rounded-xl overflow-hidden"
              style={{ border: '1.5px solid var(--primary)', background: 'var(--surface-card)' }}>
              <button onClick={() => cartItem.qty === 1 ? removeItem(product._id) : updateQty(product._id, cartItem.qty - 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: 'var(--primary)' }}>
                <FiMinus size={12} strokeWidth={3} />
              </button>
              <span className="font-extrabold text-xs" style={{ color: 'var(--text)' }}>{cartItem.qty}</span>
              <button onClick={() => updateQty(product._id, cartItem.qty + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: 'var(--primary)' }}>
                <FiPlus size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button onClick={() => addItem(product)} className="w-full sku-btn rounded-xl py-1.5 text-xs gap-1">
              <FiPlus size={12} strokeWidth={3} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [storeName, setStoreName] = useState('Fresh Store')
  const [storeTagline, setStoreTagline] = useState('Fresh products, fast delivery')
  const [minP, setMinP] = useState('')
  const [maxP, setMaxP] = useState('')

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const isFiltered = !!(search || category || sort || minPrice || maxPrice)
  const firstName = user?.name?.split(' ')[0] || ''

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
    setPage(1)
  }

  const loadProducts = useCallback(async (pageNum = 1, replace = true) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (sort) params.set('sort', sort)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      params.set('page', pageNum); params.set('limit', 20)
      const r = await api.get(`/products?${params}`)
      const data = r.data
      const prods = data.products || data.data?.products || []
      setProducts(prev => replace ? prods : [...prev, ...prods])
      setHasMore(pageNum < (data.pagination?.pages || 1))
    } finally { setLoading(false) }
  }, [search, category, sort, minPrice, maxPrice])

  const loadMeta = useCallback(() => {
    api.get('/banners').then(r => setBanners(r.data.banners || r.data || [])).catch(() => {})
    api.get('/categories').then(r => setCategories(r.data.categories || r.data || [])).catch(() => {})
    api.get('/config').then(r => {
      const c = r.data.config || r.data
      if (c?.storeName) setStoreName(c.storeName)
      if (c?.tagline) setStoreTagline(c.tagline)
    }).catch(() => {})
  }, [])

  const refreshProducts = useCallback(() => loadProducts(1, true), [loadProducts])
  useEffect(() => { loadMeta() }, [loadMeta])
  useEffect(() => { loadProducts(1, true) }, [loadProducts])
  useAutoRefresh(refreshProducts, 30000)
  useAutoRefresh(loadMeta, 60000)

  const loadMore = () => { const n = page + 1; setPage(n); loadProducts(n, false) }
  const activeCat = categories.find(c => c.name === category)

  return (
    <div style={{ background: 'var(--surface)' }}>

      {/* ═══════════════════════════════════════════════════
          HERO — desktop only, hidden when filtering
      ═══════════════════════════════════════════════════ */}
      {!isFiltered && (
        <div className="hidden md:block relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 45%, #388e3c 75%, #43a047 100%)',
            minHeight: 220,
          }}>
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.07]" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: 'white', transform: 'translateY(50%)' }} />
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" style={{ fill: 'white' }}>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="1.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <div className="relative max-w-6xl mx-auto px-8 py-10 flex items-center gap-12">
            {/* Text */}
            <div className="flex-1 min-w-0">
              {firstName && (
                <p className="text-white/70 text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <span className="text-base">👋</span> Hello, {firstName}!
                </p>
              )}
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-1 tracking-tight">
                {storeName}
              </h1>
              <p className="text-white/70 text-base mb-6">{storeTagline}</p>
              {/* Search */}
              <form onSubmit={e => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) setParam('search', v) }}
                className="flex gap-2 max-w-lg">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: 'rgba(0,0,0,0.35)' }} />
                  <input name="q" placeholder="Search products, brands…"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--text)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                </div>
                <button type="submit" className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
                  Search
                </button>
              </form>
            </div>

            {/* Category quick-jump */}
            {categories.length > 0 && (
              <div className="hidden lg:flex flex-col gap-2 shrink-0" style={{ minWidth: 180 }}>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Categories</p>
                {categories.slice(0, 5).map(c => (
                  <button key={c._id} onClick={() => setParam('category', c.name)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-left transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <span className="text-base">{c.icon}</span>
                    <span className="flex-1">{c.name}</span>
                    <FiChevronRight size={12} className="opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={16} />
          <input type="text" placeholder="Search products..." value={search}
            onChange={e => setParam('search', e.target.value)}
            className="sku-input pl-9 py-2.5" />
          {search && (
            <button onClick={() => setParam('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <FiX size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MAIN LAYOUT: Sidebar (desktop) + Content
      ═══════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 pb-nav md:flex md:gap-6 md:pt-6 pt-2">

        {/* ── DESKTOP SIDEBAR ──────────────────────────── */}
        <aside className="hidden md:block shrink-0" style={{ width: 220 }}>
          {/* Categories */}
          {categories.length > 0 && (
            <div className="sku-card p-4 mb-4">
              <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Categories
              </p>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => setParam('category', '')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all text-left"
                  style={{
                    background: !category ? 'var(--primary-glow)' : 'transparent',
                    color: !category ? 'var(--primary)' : 'var(--text)',
                    border: !category ? '1px solid rgba(46,125,50,0.2)' : '1px solid transparent',
                  }}>
                  <span className="text-base">🛍</span> All Products
                </button>
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => setParam('category', cat.name === category ? '' : cat.name)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all text-left"
                    style={{
                      background: category === cat.name ? 'var(--primary-glow)' : 'transparent',
                      color: category === cat.name ? 'var(--primary)' : 'var(--text)',
                      border: category === cat.name ? '1px solid rgba(46,125,50,0.2)' : '1px solid transparent',
                    }}>
                    <span className="text-base">{cat.icon || '📦'}</span>
                    <span className="flex-1 line-clamp-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="sku-card p-4 mb-4">
            <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Sort By</p>
            <div className="flex flex-col gap-0.5">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setParam('sort', o.value)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    background: sort === o.value ? 'var(--primary-glow)' : 'transparent',
                    color: sort === o.value ? 'var(--primary)' : 'var(--text)',
                    border: sort === o.value ? '1px solid rgba(46,125,50,0.2)' : '1px solid transparent',
                  }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className="sku-card p-4 mb-4">
            <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Price Range (₹)</p>
            <div className="flex flex-col gap-2">
              <input type="number" placeholder="Min price" value={minP}
                onChange={e => setMinP(e.target.value)}
                onBlur={() => setParam('minPrice', minP)}
                onKeyDown={e => e.key === 'Enter' && setParam('minPrice', minP)}
                className="sku-input py-2 text-sm" />
              <input type="number" placeholder="Max price" value={maxP}
                onChange={e => setMaxP(e.target.value)}
                onBlur={() => setParam('maxPrice', maxP)}
                onKeyDown={e => e.key === 'Enter' && setParam('maxPrice', maxP)}
                className="sku-input py-2 text-sm" />
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinP(''); setMaxP(''); setParam('minPrice', ''); setTimeout(() => setParam('maxPrice', ''), 10) }}
                  className="text-xs text-center py-1.5 rounded-xl transition-all"
                  style={{ color: 'var(--danger)', background: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.15)' }}>
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {isFiltered && (
            <button onClick={() => { setMinP(''); setMaxP(''); setSearchParams({}) }}
              className="w-full sku-btn-outline py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              <FiX size={14} /> Clear All Filters
            </button>
          )}
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Banners */}
          {banners.length > 0 && !isFiltered && (
            <div className="mb-5"><BannerSlider banners={banners} /></div>
          )}

          {/* Mobile: category chips */}
          {categories.length > 0 && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setParam('category', '')}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!category ? 'sku-btn sku-btn-sm' : 'sku-btn-outline'}`}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setParam('category', cat.name === category ? '' : cat.name)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${category === cat.name ? 'sku-btn sku-btn-sm' : 'sku-btn-outline'}`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Mobile: sort row */}
          <div className="md:hidden flex gap-2 mb-4 items-center overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {SORT_OPTIONS.filter(o => o.value).map(o => (
              <button key={o.value} onClick={() => setParam('sort', sort === o.value ? '' : o.value)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: sort === o.value ? 'var(--primary)' : 'var(--surface-inset)',
                  color: sort === o.value ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${sort === o.value ? 'var(--primary)' : 'var(--border)'}`,
                }}>
                {o.label}
              </button>
            ))}
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-lg leading-tight" style={{ color: 'var(--text)' }}>
                {search ? `"${search}"` : activeCat ? `${activeCat.icon || ''} ${activeCat.name}` : '🛍 All Products'}
              </h2>
              {!loading && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {products.length} product{products.length !== 1 ? 's' : ''} {isFiltered ? 'found' : 'available'}
                </p>
              )}
            </div>
            {isFiltered && (
              <button onClick={() => { setMinP(''); setMaxP(''); setSearchParams({}) }}
                className="md:hidden flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ color: 'var(--danger)', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)' }}>
                <FiX size={11} /> Clear
              </button>
            )}
          </div>

          {/* Product grid */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="sku-card overflow-hidden" style={{ borderRadius: 16 }}>
                  <div className="skeleton" style={{ aspectRatio: '1/1' }} />
                  <div className="p-2.5 flex flex-col gap-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="skeleton h-7 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-bold mb-1">No products found</p>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Try a different search or remove filters</p>
              <button onClick={() => { setMinP(''); setMaxP(''); setSearchParams({}) }} className="sku-btn">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map(p => <GridCard key={p._id} product={p} />)}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <button onClick={loadMore} disabled={loading} className="sku-btn-outline px-10 py-3 font-semibold">
                    {loading ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
