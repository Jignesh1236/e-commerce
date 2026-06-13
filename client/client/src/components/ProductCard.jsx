import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiPlus, FiMinus, FiClock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { optimizeImage } from '../utils/cloudinary'

export default function ProductCard({ product }) {
  const { items, addItem, updateQty, removeItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()

  const cartItem = items.find(i => i.productId === product._id)
  const discountedPrice = product.discountPercent > 0
    ? Math.round(product.price * (1 - product.discountPercent / 100))
    : product.price
  const wishlisted = isWishlisted(product._id)
  const outOfStock = product.stock === 0

  return (
    <div className="sku-card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ borderRadius: 16 }}>
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden">
        <img
          src={optimizeImage(product.images?.[0], 'card')}
          alt={product.name}
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          style={{ background: 'var(--surface-inset)' }}
          onError={e => { e.target.src = 'https://placehold.co/400x400?text=📦' }}
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white font-bold text-sm px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discountPercent > 0 && (
            <span className="sku-badge text-white"
              style={{ background: 'linear-gradient(135deg,#e05252,#c0392b)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              {product.discountPercent}% OFF
            </span>
          )}
          {product.freeDelivery && !outOfStock && (
            <span className="sku-badge text-white"
              style={{ background: 'linear-gradient(135deg,#2e7d32,#1b5e20)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              Free Delivery
            </span>
          )}
        </div>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product._id) }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.7)'
          }}>
          <FiHeart size={15}
            fill={wishlisted ? 'var(--danger)' : 'none'}
            color={wishlisted ? 'var(--danger)' : 'var(--text-muted)'} />
        </button>
        {product.images?.length > 1 && (
          <span className="absolute bottom-2 right-2 sku-badge text-white"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', fontSize: 10 }}>
            +{product.images.length - 1} more
          </span>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <Link to={`/product/${product._id}`}>
          <p className="font-semibold text-sm line-clamp-2 leading-snug"
            style={{ color: 'var(--text)' }}>{product.name}</p>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-extrabold" style={{ color: 'var(--primary)' }}>
            ₹{discountedPrice}
          </span>
          {product.discountPercent > 0 && (
            <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
              ₹{product.price}
            </span>
          )}
        </div>

        {product.deliveryTime && (
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <FiClock size={11} /> {product.deliveryTime}
          </p>
        )}

        <div className="mt-auto pt-1">
          {outOfStock ? (
            <button disabled className="w-full sku-btn sku-btn-sm"
              style={{ background: 'var(--border)', border: 'none', color: 'var(--text-muted)', boxShadow: 'none', cursor: 'not-allowed' }}>
              Out of Stock
            </button>
          ) : cartItem ? (
            <div className="flex items-center justify-between rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, var(--surface-inset), var(--surface-card))',
                border: '1px solid var(--border)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)'
              }}>
              <button
                onClick={() => cartItem.qty === 1 ? removeItem(product._id) : updateQty(product._id, cartItem.qty - 1)}
                className="w-10 h-9 flex items-center justify-center font-bold text-lg transition-colors hover:bg-black/5 active:bg-black/10"
                style={{ color: 'var(--primary)' }}>
                <FiMinus size={14} strokeWidth={3} />
              </button>
              <span className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>{cartItem.qty}</span>
              <button
                onClick={() => updateQty(product._id, cartItem.qty + 1)}
                className="w-10 h-9 flex items-center justify-center transition-colors hover:bg-black/5 active:bg-black/10"
                style={{ color: 'var(--primary)' }}>
                <FiPlus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button onClick={() => addItem(product)} className="w-full sku-btn sku-btn-sm">
              <FiShoppingCart size={13} /> Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
