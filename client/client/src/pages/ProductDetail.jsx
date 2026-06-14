import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiPlus, FiMinus, FiClock, FiTruck, FiChevronLeft, FiStar, FiZoomIn } from 'react-icons/fi'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useUser } from '../context/UserContext'
import { optimizeImage } from '../utils/cloudinary'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'

function ImageViewer({ images, name }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const thumbsRef = useRef(null)

  const go = (i) => {
    setActive(i)
    // scroll thumb into view
    const row = thumbsRef.current
    if (row) {
      const thumb = row.children[i]
      if (thumb) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  const prev = () => go((active - 1 + images.length) % images.length)
  const next = () => go((active + 1) % images.length)

  // keyboard nav in lightbox
  useEffect(() => {
    if (!lightbox) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, active])

  return (
    <>
      <div className="sku-card overflow-hidden">
        {/* Main image */}
        <div className="relative overflow-hidden group"
          style={{ background: 'var(--surface-inset)', cursor: 'zoom-in' }}
          onClick={() => setLightbox(true)}>
          <img
            key={active}
            src={optimizeImage(images[active], 'detail')}
            alt={`${name} ${active + 1}`}
            className="w-full object-contain transition-opacity duration-200"
            style={{ height: 340, background: 'var(--surface-card)' }}
            onError={e => { e.target.src = 'https://placehold.co/800x600?text=📦' }}
          />
          {/* Zoom hint */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
            <FiZoomIn size={11} /> Tap to zoom
          </div>
          {/* Nav arrows (desktop) */}
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <FiChevronLeft size={18} style={{ color: 'var(--text)' }} />
              </button>
              <button onClick={e => { e.stopPropagation(); next() }}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rotate-180"
                style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <FiChevronLeft size={18} style={{ color: 'var(--text)' }} />
              </button>
            </>
          )}
          {/* dot counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {images.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-200"
                  style={{
                    width: i === active ? 20 : 6, height: 6,
                    background: i === active ? 'var(--primary)' : 'rgba(0,0,0,0.25)',
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div ref={thumbsRef}
            className="flex gap-2 p-3 overflow-x-auto"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-inset)', scrollbarWidth: 'none' }}>
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                className="shrink-0 transition-all duration-150"
                style={{
                  width: 64, height: 64,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: `2.5px solid ${i === active ? 'var(--primary)' : 'var(--border)'}`,
                  boxShadow: i === active ? '0 0 0 3px var(--primary-glow)' : 'none',
                  transform: i === active ? 'scale(1.08)' : 'scale(1)',
                  outline: 'none',
                  flexShrink: 0,
                }}>
                <img
                  src={optimizeImage(img, 'thumb')}
                  alt={`view ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', display: 'block' }}
                  onError={e => { e.target.src = 'https://placehold.co/100x100?text=📦' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onClick={() => setLightbox(false)}>✕</button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <FiChevronLeft size={22} />
              </button>
              <button onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center rotate-180"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <FiChevronLeft size={22} />
              </button>
            </>
          )}
          <img
            src={optimizeImage(images[active], 'detail')}
            alt={`${name} ${active + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
            onError={e => { e.target.src = 'https://placehold.co/800x600?text=📦' }}
          />
          <p className="absolute bottom-6 text-white/60 text-sm">{active + 1} / {images.length}</p>
        </div>
      )}
    </>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { items, addItem, updateQty, removeItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { user } = useUser()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/${id}`)
    ]).then(([pRes, rRes]) => {
      const p = pRes.data.product || pRes.data
      setProduct(p)
      setReviews(Array.isArray(rRes.data) ? rRes.data : rRes.data.reviews || [])
      if (p?.category) {
        api.get(`/products?category=${encodeURIComponent(p.category)}&limit=8`).then(r => {
          setRelated((r.data.products || []).filter(rp => rp._id !== id))
        })
      }
    }).catch(() => {}).finally(() => setLoading(false))
    window.scrollTo(0, 0)
  }, [id])

  const cartItem = items.find(i => i.productId === id)
  const wishlisted = product ? isWishlisted(product._id) : false
  const discountedPrice = product?.discountPercent > 0
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : product?.price

  const submitReview = async () => {
    if (!user) return
    setSubmitting(true)
    try {
      await api.post('/reviews', { userId: user._id, productId: id, ...reviewForm })
      const r = await api.get(`/reviews/${id}`)
      setReviews(Array.isArray(r.data) ? r.data : r.data.reviews || [])
      setReviewForm({ rating: 5, comment: '' })
    } catch (e) {
      alert(e.response?.data?.message || 'Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return (
    <div className="max-w-5xl mx-auto p-4 pb-nav">
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div className="skeleton rounded-2xl mb-4 md:mb-0" style={{ height: 360 }} />
        <div className="flex flex-col gap-3">
          <div className="skeleton h-7 w-3/4 rounded-xl" />
          <div className="skeleton h-10 w-1/3 rounded-xl" />
          <div className="skeleton h-5 w-1/2 rounded-xl" />
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-lg font-bold mb-2">Product not found</p>
      <button onClick={() => navigate(-1)} className="sku-btn sku-btn-sm mt-2">Go Back</button>
    </div>
  )

  const images = product.images?.length ? product.images : null

  return (
    <div className="pb-nav">
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-medium mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}>
          <FiChevronLeft size={18} /> Back
        </button>

        {/* Desktop: 2-col | Mobile: stacked */}
        <div className="md:grid md:grid-cols-2 md:gap-8 mb-8">

          {/* Image gallery */}
          <div className="mb-4 md:mb-0 md:sticky md:top-20 self-start">
            {images
              ? <ImageViewer images={images} name={product.name} />
              : (
                <div className="sku-card w-full flex items-center justify-center text-6xl"
                  style={{ height: 280, background: 'var(--surface-inset)' }}>
                  📦
                </div>
              )
            }
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {product.discountPercent > 0 && (
                <span className="sku-badge text-white" style={{ background: 'linear-gradient(135deg,#e05252,#c0392b)' }}>
                  {product.discountPercent}% OFF
                </span>
              )}
              {product.freeDelivery && (
                <span className="sku-badge text-white" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                  🚚 Free Delivery
                </span>
              )}
              {product.stock === 0 && (
                <span className="sku-badge text-white" style={{ background: '#6b6b5a' }}>Out of Stock</span>
              )}
              {product.category && (
                <span className="sku-badge" style={{ background: 'var(--surface-inset)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {product.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold leading-snug" style={{ color: 'var(--text)' }}>
              {product.name}
            </h1>

            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)' }}>
                  <FiStar size={12} fill="white" color="white" />
                  <span className="text-sm font-bold text-white">{avgRating}</span>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>₹{discountedPrice}</span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-lg line-through" style={{ color: 'var(--text-muted)' }}>₹{product.price}</span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(224,82,82,0.1)', color: 'var(--danger)' }}>
                    Save ₹{product.price - discountedPrice}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.deliveryTime && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <FiClock size={13} /> {product.deliveryTime}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <FiTruck size={13} />
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {product.description && (
              <div className="p-4 rounded-2xl text-sm leading-relaxed"
                style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {product.description}
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3">
              {product.stock === 0 ? (
                <button disabled className="sku-btn flex-1 opacity-50 cursor-not-allowed">Out of Stock</button>
              ) : cartItem ? (
                <div className="flex items-center rounded-2xl overflow-hidden flex-1"
                  style={{ border: '2px solid var(--primary)', background: 'var(--surface-card)', boxShadow: '0 0 0 3px var(--primary-glow)' }}>
                  <button onClick={() => cartItem.qty === 1 ? removeItem(product._id) : updateQty(product._id, cartItem.qty - 1)}
                    className="px-5 py-4 flex-1 flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors"
                    style={{ color: 'var(--primary)' }}>
                    <FiMinus size={16} strokeWidth={3} />
                  </button>
                  <span className="font-extrabold text-lg px-5"
                    style={{ color: 'var(--text)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                    {cartItem.qty}
                  </span>
                  <button onClick={() => updateQty(product._id, cartItem.qty + 1)}
                    className="px-5 py-4 flex-1 flex items-center justify-center hover:bg-black/5 active:bg-black/10 transition-colors"
                    style={{ color: 'var(--primary)' }}>
                    <FiPlus size={16} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button onClick={() => addItem(product)} className="sku-btn flex-1 py-4 text-base">
                  <FiShoppingCart size={18} /> Add to Cart
                </button>
              )}
              <button onClick={() => toggle(product._id)}
                className="sku-btn-outline px-5" style={{ borderRadius: 16, minWidth: 54 }}>
                <FiHeart size={20} fill={wishlisted ? 'var(--danger)' : 'none'} color={wishlisted ? 'var(--danger)' : 'var(--primary)'} />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'var(--primary-glow)', border: '1px solid rgba(234,88,12,0.2)' }}>
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>Order via WhatsApp</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add to cart → Checkout → Order sent to WhatsApp. No upfront payment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-extrabold mb-3" style={{ color: 'var(--text)' }}>Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="sku-card p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Reviews</h2>
            {avgRating && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>{avgRating}</span>
                <div>
                  <StarRating value={Math.round(parseFloat(avgRating))} size={14} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{reviews.length} reviews</p>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="mb-5 p-4 rounded-2xl" style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-bold mb-3">Write a Review</p>
              <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} editable />
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience…" rows={2} className="sku-input resize-none text-sm mb-3 mt-3" />
              <button onClick={submitReview} disabled={submitting || !reviewForm.comment} className="sku-btn sku-btn-sm">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-xl text-center text-sm"
              style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Complete onboarding to leave a review
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r._id} className="p-3 rounded-xl" style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-semibold text-sm">{r.userId?.name || 'Customer'}</p>
                        <StarRating value={r.rating} size={13} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
