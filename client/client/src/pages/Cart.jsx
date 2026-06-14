import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useConfig } from '../context/ConfigContext'
import AddressModal from '../components/AddressModal'
import api from '../utils/api'
import { buildWhatsAppMessage, openWhatsApp } from '../utils/whatsapp'
import { optimizeImage } from '../utils/cloudinary'

export default function Cart() {
  const { items, updateQty, removeItem, clearCart, total, count } = useCart()
  const { user, syncUserFromOrder } = useUser()
  const { config } = useConfig()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [placing, setPlacing] = useState(false)

  const freeDeliveryAbove = config?.freeDeliveryAbove ?? 500
  const deliveryCharge = config ? (total >= freeDeliveryAbove ? 0 : config.deliveryCharge || 0) : null

  const handlePlaceOrder = () => setShowModal(true)

  const handleConfirm = async (address) => {
    if (!user) return
    setPlacing(true)
    try {
      const charge = total >= freeDeliveryAbove ? 0 : (config?.deliveryCharge || 0)
      await api.post('/orders', {
        userId: user._id,
        items: items.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
        totalAmount: total,
        deliveryCharge: charge,
        address,
      })
      syncUserFromOrder(address)
      const msg = buildWhatsAppMessage({ user, address, items, total, deliveryCharge: charge })
      openWhatsApp(config?.whatsappNumber || '919999999999', msg)
      clearCart()
      setShowModal(false)
      navigate('/order-success')
    } catch {
      alert('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (!items.length) return (
    <div className="max-w-lg mx-auto p-4 pb-nav flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FiShoppingBag size={64} className="mb-4" style={{ color: 'var(--border)' }} />
      <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Add products to get started</p>
      <Link to="/" className="sku-btn">Browse Products</Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto p-4 pb-nav">
      <h1 className="text-xl font-bold mb-4">Your Cart ({count} items)</h1>

      <div className="flex flex-col gap-3 mb-4">
        {items.map(item => (
          <div key={item.productId} className="sku-card p-3 flex gap-3">
            <img src={optimizeImage(item.image, 'thumb')} alt={item.name}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
              style={{ background: 'var(--border)' }}
              onError={e => { e.target.src = 'https://placehold.co/100x100?text=?' }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--primary)' }}>₹{item.price}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 sku-card px-2 py-1">
                  <button onClick={() => item.qty === 1 ? removeItem(item.productId) : updateQty(item.productId, item.qty - 1)}>
                    <FiMinus size={13} style={{ color: 'var(--primary)' }} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, item.qty + 1)}
                    disabled={item.stock > 0 && item.qty >= item.stock}
                    style={{ opacity: (item.stock > 0 && item.qty >= item.stock) ? 0.3 : 1, cursor: (item.stock > 0 && item.qty >= item.stock) ? 'not-allowed' : 'pointer' }}>
                    <FiPlus size={13} style={{ color: 'var(--primary)' }} />
                  </button>
                </div>
                <span className="text-sm font-bold ml-auto">₹{item.price * item.qty}</span>
                <button onClick={() => removeItem(item.productId)} className="p-1.5 rounded-lg" style={{ color: '#e05252' }}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sku-card p-4 mb-4">
        {config && total < freeDeliveryAbove && (
          <div className="mb-3 p-3 rounded-lg text-sm text-center font-medium"
            style={{ background: 'rgba(45,122,45,0.08)', color: 'var(--primary)' }}>
            Add ₹{freeDeliveryAbove - total} more for FREE delivery!
          </div>
        )}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{total}</span></div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
            {deliveryCharge === null ? (
              <span style={{ color: 'var(--text-muted)' }}>Calculating…</span>
            ) : (
              <span style={{ color: deliveryCharge === 0 ? 'var(--primary)' : 'var(--text)' }}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            )}
          </div>
          <div className="flex justify-between font-bold text-base pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <span>Total</span>
            {deliveryCharge === null ? (
              <span style={{ color: 'var(--text-muted)' }}>Calculating…</span>
            ) : (
              <span style={{ color: 'var(--primary)' }}>₹{total + deliveryCharge}</span>
            )}
          </div>
        </div>
      </div>

      <button onClick={handlePlaceOrder} disabled={placing} className="sku-btn w-full text-base py-3">
        {placing ? 'Placing...' : '🛒 Place Order via WhatsApp'}
      </button>

      {showModal && <AddressModal onConfirm={handleConfirm} onClose={() => setShowModal(false)} />}
    </div>
  )
}
