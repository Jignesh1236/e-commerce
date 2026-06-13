import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'
import api from '../utils/api'
import { optimizeImage } from '../utils/cloudinary'

export default function Wishlist() {
  const { ids, toggle } = useWishlist()
  const { addItem, items: cartItems } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ids.length) { setLoading(false); return }
    const fetches = ids.map(id => api.get(`/products/${id}`).then(r => r.data.product || r.data).catch(() => null))
    Promise.all(fetches).then(results => {
      setProducts(results.filter(Boolean))
      setLoading(false)
    })
  }, [ids.join(',')])

  if (!ids.length) return (
    <div className="max-w-lg mx-auto p-4 pb-nav flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FiHeart size={64} className="mb-4" style={{ color: 'var(--border)' }} />
      <h2 className="text-xl font-bold mb-2">Wishlist is empty</h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Tap ❤️ on any product to save it here</p>
      <Link to="/" className="sku-btn">Browse Products</Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto p-4 pb-nav">
      <h1 className="text-xl font-bold mb-4">Wishlist ({ids.length})</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map(p => {
            const inCart = cartItems.some(i => i.productId === p._id)
            return (
              <div key={p._id} className="sku-card p-3 flex gap-3">
                <Link to={`/product/${p._id}`}>
                  <img src={optimizeImage(p.images?.[0], 'thumb')} alt={p.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    style={{ background: 'var(--border)' }}
                    onError={e => { e.target.src = 'https://placehold.co/100x100?text=?' }} />
                </Link>
                <div className="flex-1">
                  <Link to={`/product/${p._id}`}>
                    <p className="font-semibold text-sm line-clamp-2">{p.name}</p>
                  </Link>
                  <p className="font-bold mt-1" style={{ color: 'var(--primary)' }}>
                    ₹{p.discountPercent > 0 ? Math.round(p.price * (1 - p.discountPercent / 100)) : p.price}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => addItem(p)} disabled={inCart || p.stock === 0}
                      className={`sku-btn sku-btn-sm flex-1 ${(inCart || p.stock === 0) ? 'opacity-50' : ''}`}>
                      <FiShoppingCart size={13} /> {inCart ? 'In Cart' : p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button onClick={() => toggle(p._id)} className="sku-btn-outline px-3 py-1.5" style={{ borderRadius: 6 }}>
                      <FiHeart size={14} fill="#e05252" color="#e05252" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
