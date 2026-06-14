import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiX, FiChevronRight, FiPlus, FiMinus, FiHeart, FiClock, FiChevronLeft, FiFilter, FiZap } from 'react-icons/fi'
import api from '../utils/api'
import { useUser } from '../context/UserContext'
import useAutoRefresh from '../hooks/useAutoRefresh'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { optimizeImage } from '../utils/cloudinary'

const SORT_OPTIONS = [
  { value: '', label: '✨ Default' },
  { value: 'price_asc', label: '💰 Low → High' },
  { value: 'price_desc', label: '💎 High → Low' },
  { value: 'newest', label: '🆕 Newest' },
  { value: 'top_rated', label: '⭐ Top Rated' },
]

function ProductCard({ product, compact = false }) {
  const { items, addItem, updateQty, removeItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const cartItem = items.find(i => i.productId === product._id)
  const discountedPrice = product.discountPercent > 0
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : product.price
  const wishlisted = isWishlisted(product._id)
  const outOfStock = product.stock === 0

  return (
    <div className="flex flex-col overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderRadius: 16,
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        minWidth: compact ? 140 : undefined,
      }}>
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <img src={optimizeImage(product.images?.[0], 'card')} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          style={{ background: 'var(--surface-inset)' }}
          onError={e => { e.target.src = 'https://placehold.co/400x400?text=📦' }} />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white font-bold text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)' }}>Out of Stock</span>
          </div>
        )}
        {product.discountPercent > 0 && (
          <span className="absolute top-0 left-0 text-white text-[10px] font-black px-2 py-1"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              borderTopLeftRadius: 16,
              borderBottomRightRadius: 12,
            }}>
            {product.discountPercent}% OFF
          </span>
        )}
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product._id) }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
          style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <FiHeart size={12} fill={wishlisted ? '#dc2626' : 'none'} color={wishlisted ? '#dc2626' : 'var(--text-muted)'} />
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
            <button disabled className="w-full rounded-xl py-1.5 text-[10px] font-semibold cursor-not-allowed"
              style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>Out of Stock</button>
          ) : cartItem ? (
            <div className="flex items-center justify-between rounded-xl overflow-hidden"
              style={{ border: '1.5px solid var(--primary)', background: 'var(--surface-card)' }}>
              <button onClick={() => cartItem.qty === 1 ? removeItem(product._id) : updateQty(product._id, cartItem.qty - 1)}
                className="w-8 h-7 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: 'var(--primary)' }}>
                <FiMinus size={11} strokeWidth={3} />
              </button>
              <span className="font-extrabold text-xs" style={{ color: 'var(--text)' }}>{cartItem.qty}</span>
              <button onClick={() => updateQty(product._id, cartItem.qty + 1)}
                className="w-8 h-7 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: 'var(--primary)' }}>
                <FiPlus size={11} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button onClick={() => addItem(product)} className="w-full sku-btn rounded-xl py-1.5 text-[10px] gap-1">
              <FiPlus size={11} strokeWidth={3} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function HorizontalRow({ title, products, onViewAll }) {
  const rowRef = useRef()
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }
  if (!products || products.length === 0) return null
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>{title}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <FiChevronLeft size={14} />
          </button>
          <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <FiChevronRight size={14} />
          </button>
          {onViewAll && (
            <button onClick={onViewAll} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ color: 'var(--primary)', background: 'var(--primary-glow)', border: '1px solid rgba(234,88,12,0.25)' }}>
              View All
            </button>
          )}
        </div>
      </div>
      <div ref={rowRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => (
          <div key={p._id} style={{ width: 150, flexShrink: 0 }}>
            <ProductCard product={p} compact />
          </div>
        ))}
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
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categoryRows, setCategoryRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [storeName, setStoreName] = useState('Quick Store')
  const [storeTagline, setStoreTagline] = useState('Fresh products, fast delivery')
  const [minP, setMinP] = useState('')
  const [maxP, setMaxP] = useState('')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [heroBannerIdx, setHeroBannerIdx] = useState(0)

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
    api.get('/categories').then(r => {
      const cats = r.data.categories || r.data || []
      setCategories(cats)
      cats.slice(0, 4).forEach(cat => {
        api.get(`/products?category=${encodeURIComponent(cat.name)}&limit=10`)
          .then(r => setCategoryRows(prev => ({ ...prev, [cat.name]: r.data.products || [] })))
          .catch(() => {})
      })
    }).catch(() => {})
    api.get('/config').then(r => {
      const c = r.data.config || r.data
      if (c?.storeName) setStoreName(c.storeName)
      if (c?.tagline) setStoreTagline(c.tagline)
    }).catch(() => {})
    api.get('/products/featured').then(r => setFeaturedProducts(r.data.products || [])).catch(() => {})
  }, [])

  const refreshProducts = useCallback(() => loadProducts(1, true), [loadProducts])
  useEffect(() => { loadMeta() }, [loadMeta])
  useEffect(() => { loadProducts(1, true) }, [loadProducts])
  useAutoRefresh(refreshProducts, 30000)
  useAutoRefresh(loadMeta, 60000)

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setHeroBannerIdx(i => (i + 1) % banners.length), 4000)
    return () => clearInterval(t)
  }, [banners.length])

  useEffect(() => { setHeroBannerIdx(0) }, [banners.length])

  const activeBanner = banners[heroBannerIdx] || null
  const loadMore = () => { const n = page + 1; setPage(n); loadProducts(n, false) }
  const activeCat = categories.find(c => c.name === category)

  return (
    <div style={{ background: 'var(--surface)' }}>

      {/* ── HERO BANNER (only when not filtering) ── */}
      {!isFiltered && (
        <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
          {/* Background */}
          {banners.length > 0 ? banners.map((b, i) => (
            <div key={b._id || i} className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === heroBannerIdx ? 1 : 0, zIndex: 0 }}>
              <img src={b.imageUrl} alt={b.title || ''} className="w-full h-full object-cover"
                style={{ objectPosition: b.objectPosition || '50% 50%' }} />
            </div>
          )) : (
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 60%, #f97316 100%)', zIndex: 0 }} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1
          }} />

          {/* Decorative glow */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: '#fb923c', zIndex: 1 }} />

          {/* Content */}
          <div className="relative max-w-6xl mx-auto px-5 py-10 md:py-14 flex flex-col md:flex-row md:items-center gap-6" style={{ zIndex: 2 }}>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-3 uppercase tracking-wider"
                style={{ background: '#fbbf24', color: '#c2410c' }}>
                <FiZap size={11} /> Super Saver
              </div>
              {firstName && (
                <p className="text-white/70 text-sm font-medium mb-1 flex items-center gap-1.5">
                  <span>👋</span> Hello, {firstName}!
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-1.5 tracking-tight italic transition-all duration-500">
                {activeBanner?.title || storeName}
              </h1>
              {activeBanner?.subtitle ? (
                <p className="text-white/65 text-sm mb-5 max-w-md line-clamp-3">{activeBanner.subtitle}</p>
              ) : (
                <p className="text-white/65 text-sm mb-5">{storeTagline}</p>
              )}
              <div className="flex gap-3 flex-wrap">
                <form onSubmit={e => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) setParam('search', v) }}
                  className="flex gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={15} style={{ color: 'rgba(0,0,0,0.4)' }} />
                    <input name="q" placeholder="Search products…"
                      className="pl-9 pr-4 py-2.5 rounded-2xl text-sm font-medium outline-none w-52 md:w-72"
                      style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--text)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #c2410c, #ea580c)', boxShadow: '0 4px 14px rgba(234,88,12,0.4)' }}>
                    Search
                  </button>
                </form>
              </div>
            </div>

            {/* Desktop categories quick-jump */}
            {(() => {
              const heroCategories = categories.filter(c => c.showInHero)
              const displayCategories = heroCategories.length > 0 ? heroCategories : categories.slice(0, 6)
              return displayCategories.length > 0 ? (
                <div className="hidden lg:flex flex-col gap-1.5 shrink-0" style={{ minWidth: 190 }}>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Browse Categories</p>
                  {displayCategories.slice(0, 8).map(c => (
                    <button key={c._id} onClick={() => setParam('category', c.name)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-left transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      <span>{c.icon || '📦'}</span>
                      <span className="flex-1 line-clamp-1">{c.name}</span>
                      <FiChevronRight size={11} className="opacity-50" />
                    </button>
                  ))}
                </div>
              ) : null
            })()}
          </div>

          {/* Pagination dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 3 }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setHeroBannerIdx(i)}
                  className="rounded-full transition-all duration-300 hover:scale-125"
                  style={{ width: i === heroBannerIdx ? 20 : 6, height: 6, background: i === heroBannerIdx ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', padding: 0, cursor: 'pointer' }} />
              ))}
            </div>
          )}

          {banners.length > 1 && (
            <>
              <button onClick={() => setHeroBannerIdx(i => (i - 1 + banners.length) % banners.length)}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', zIndex: 3 }}>
                <FiChevronLeft size={18} />
              </button>
              <button onClick={() => setHeroBannerIdx(i => (i + 1) % banners.length)}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', zIndex: 3 }}>
                <FiChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      )}

      {/* ── MOBILE SEARCH (shown when filtering or on mobile) ── */}
      <div className={`px-4 pt-4 pb-2 ${isFiltered ? 'block' : 'md:hidden'}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={15} />
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => setParam('search', e.target.value)}
              className="sku-input pl-9 py-2.5" />
            {search && (
              <button onClick={() => setParam('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <FiX size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          <button onClick={() => setShowMobileFilter(v => !v)}
            className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: showMobileFilter ? 'var(--primary)' : 'var(--surface-card)',
              color: showMobileFilter ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border)'
            }}>
            <FiFilter size={16} />
          </button>
        </div>

        {showMobileFilter && (
          <div className="md:hidden mt-3 p-3 rounded-2xl flex flex-col gap-3 animate-fade-up"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Sort By</p>
              <div className="flex gap-1.5 flex-wrap">
                {SORT_OPTIONS.filter(o => o.value).map(o => (
                  <button key={o.value} onClick={() => setParam('sort', sort === o.value ? '' : o.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: sort === o.value ? 'var(--primary)' : 'var(--surface-inset)',
                      color: sort === o.value ? 'white' : 'var(--text-muted)',
                      border: `1px solid ${sort === o.value ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Price Range (₹)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minP}
                  onChange={e => setMinP(e.target.value)} onBlur={() => setParam('minPrice', minP)}
                  onKeyDown={e => e.key === 'Enter' && setParam('minPrice', minP)}
                  className="sku-input py-1.5 text-sm flex-1" />
                <input type="number" placeholder="Max" value={maxP}
                  onChange={e => setMaxP(e.target.value)} onBlur={() => setParam('maxPrice', maxP)}
                  onKeyDown={e => e.key === 'Enter' && setParam('maxPrice', maxP)}
                  className="sku-input py-1.5 text-sm flex-1" />
              </div>
            </div>
            {isFiltered && (
              <button onClick={() => { setMinP(''); setMaxP(''); setSearchParams({}); setShowMobileFilter(false) }}
                className="text-xs font-bold py-2 rounded-xl"
                style={{ color: 'var(--danger)', background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.2)' }}>
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-6xl mx-auto px-4 pb-nav md:pt-6 pt-2">

        {!isFiltered ? (
          <div className="md:flex md:gap-6">
            <div className="flex-1 min-w-0">

              {/* ── CATEGORIES (mobile horizontal scroll) ── */}
              {categories.length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-base tracking-tight" style={{ color: 'var(--text)' }}>Shop by Category</h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                      <button key={cat._id} onClick={() => setParam('category', cat.name)}
                        className="shrink-0 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        style={{ width: 72 }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                          style={{
                            background: 'var(--surface-raised)',
                            border: '1.5px solid var(--border)',
                            boxShadow: '0 2px 8px rgba(234,88,12,0.1)',
                          }}>
                          {cat.icon || '📦'}
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ── FEATURED PRODUCTS (horizontal row) ── */}
              {featuredProducts.length > 0 && (
                <section className="mb-6 -mx-4 px-4 py-5 rounded-none md:rounded-2xl"
                  style={{ background: 'rgba(234,88,12,0.06)', borderTop: '1px solid rgba(234,88,12,0.12)', borderBottom: '1px solid rgba(234,88,12,0.12)' }}>
                  <HorizontalRow
                    title={<span className="flex items-center gap-2">Bestsellers <FiZap size={15} style={{ color: 'var(--primary)' }} /></span>}
                    products={featuredProducts}
                    onViewAll={() => setParam('sort', 'top_rated')}
                  />
                </section>
              )}

              {/* ── PER-CATEGORY ROWS ── */}
              {categories.slice(0, 4).map(cat => (
                categoryRows[cat.name]?.length > 0 && (
                  <HorizontalRow
                    key={cat._id}
                    title={`${cat.icon || '🛍'} ${cat.name}`}
                    products={categoryRows[cat.name]}
                    onViewAll={() => setParam('category', cat.name)}
                  />
                )
              ))}

              {/* ── ALL PRODUCTS GRID ── */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black text-base tracking-tight" style={{ color: 'var(--text)' }}>Daily Essentials</h2>
                <div className="flex items-center gap-2">
                  {SORT_OPTIONS.filter(o => o.value).slice(0, 3).map(o => (
                    <button key={o.value} onClick={() => setParam('sort', sort === o.value ? '' : o.value)}
                      className="hidden md:block px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: sort === o.value ? 'var(--primary)' : 'var(--surface-inset)',
                        color: sort === o.value ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${sort === o.value ? 'var(--primary)' : 'var(--border)'}`,
                      }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl" style={{ height: 220 }} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="font-bold text-base mb-1">No products found</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              )}

              {hasMore && !loading && products.length > 0 && (
                <div className="text-center mt-6">
                  <button onClick={loadMore} className="sku-btn sku-btn-sm">Load More</button>
                </div>
              )}
              {loading && products.length > 0 && (
                <div className="text-center mt-4">
                  <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                </div>
              )}
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 shrink-0" style={{ width: 220 }}>
              <div className="sku-card p-4 sticky top-24">
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Sort</p>
                <div className="flex flex-col gap-1">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => setParam('sort', o.value)}
                      className="text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: sort === o.value ? 'var(--primary-glow)' : 'transparent',
                        color: sort === o.value ? 'var(--primary)' : 'var(--text-muted)',
                        border: `1px solid ${sort === o.value ? 'rgba(234,88,12,0.3)' : 'transparent'}`,
                      }}>
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Price (₹)</p>
                  <div className="flex flex-col gap-2">
                    <input type="number" placeholder="Min price" value={minP}
                      onChange={e => setMinP(e.target.value)} onBlur={() => setParam('minPrice', minP)}
                      onKeyDown={e => e.key === 'Enter' && setParam('minPrice', minP)}
                      className="sku-input py-2 text-sm" />
                    <input type="number" placeholder="Max price" value={maxP}
                      onChange={e => setMaxP(e.target.value)} onBlur={() => setParam('maxPrice', maxP)}
                      onKeyDown={e => e.key === 'Enter' && setParam('maxPrice', maxP)}
                      className="sku-input py-2 text-sm" />
                  </div>
                </div>
              </div>
            </aside>
          </div>

        ) : (
          /* ── FILTERED VIEW ── */
          <div className="md:flex md:gap-6">
            <div className="flex-1 min-w-0">
              {activeCat && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{activeCat.icon || '📦'}</span>
                  <h2 className="font-black text-xl" style={{ color: 'var(--text)' }}>{activeCat.name}</h2>
                  <button onClick={() => setParam('category', '')}
                    className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl"
                    style={{ color: 'var(--danger)', background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.2)' }}>
                    <FiX size={13} />
                  </button>
                </div>
              )}

              {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl" style={{ height: 220 }} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="font-bold text-base mb-1">No products found</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Try a different search or clear filters</p>
                  <button onClick={() => { setMinP(''); setMaxP(''); setSearchParams({}) }} className="sku-btn sku-btn-sm">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {products.map(p => <ProductCard key={p._id} product={p} />)}
                  </div>
                  {hasMore && !loading && (
                    <div className="text-center mt-6">
                      <button onClick={loadMore} className="sku-btn sku-btn-sm">Load More</button>
                    </div>
                  )}
                  {loading && (
                    <div className="text-center mt-4">
                      <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Desktop sidebar for filtered view */}
            <aside className="hidden lg:flex flex-col gap-4 shrink-0" style={{ width: 220 }}>
              <div className="sku-card p-4 sticky top-24">
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Categories</p>
                <div className="flex flex-col gap-1 mb-4">
                  <button onClick={() => setParam('category', '')}
                    className="text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: !category ? 'var(--primary-glow)' : 'transparent',
                      color: !category ? 'var(--primary)' : 'var(--text-muted)',
                      border: `1px solid ${!category ? 'rgba(234,88,12,0.3)' : 'transparent'}`,
                    }}>
                    All Products
                  </button>
                  {categories.map(c => (
                    <button key={c._id} onClick={() => setParam('category', c.name)}
                      className="text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                      style={{
                        background: category === c.name ? 'var(--primary-glow)' : 'transparent',
                        color: category === c.name ? 'var(--primary)' : 'var(--text-muted)',
                        border: `1px solid ${category === c.name ? 'rgba(234,88,12,0.3)' : 'transparent'}`,
                      }}>
                      <span>{c.icon || '📦'}</span> {c.name}
                    </button>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Sort</p>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setParam('sort', o.value)}
                        className="text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: sort === o.value ? 'var(--primary-glow)' : 'transparent',
                          color: sort === o.value ? 'var(--primary)' : 'var(--text-muted)',
                          border: `1px solid ${sort === o.value ? 'rgba(234,88,12,0.3)' : 'transparent'}`,
                        }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <input type="number" placeholder="Min price" value={minP}
                      onChange={e => setMinP(e.target.value)} onBlur={() => setParam('minPrice', minP)}
                      onKeyDown={e => e.key === 'Enter' && setParam('minPrice', minP)}
                      className="sku-input py-2 text-sm" />
                    <input type="number" placeholder="Max price" value={maxP}
                      onChange={e => setMaxP(e.target.value)} onBlur={() => setParam('maxPrice', maxP)}
                      onKeyDown={e => e.key === 'Enter' && setParam('maxPrice', maxP)}
                      className="sku-input py-2 text-sm" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
