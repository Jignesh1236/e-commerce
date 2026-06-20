import { Link } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'

export default function OrderSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface)' }}>
      <div className="sku-card w-full max-w-sm p-8 text-center">
        <FiCheckCircle size={64} className="mx-auto mb-4" style={{ color: 'var(--primary)' }} />
        <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Your order details have been sent via WhatsApp. The store will confirm shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/orders" className="sku-btn w-full">Track My Orders</Link>
          <Link to="/" className="sku-btn-outline w-full text-center" style={{ justifyContent: 'center' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
