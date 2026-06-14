import { useState } from 'react'
import { FiX, FiMapPin, FiPhone, FiUser, FiAlertCircle } from 'react-icons/fi'
import { useUser } from '../context/UserContext'

export default function AddressModal({ onConfirm, onClose }) {
  const { user } = useUser()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    fullAddress: user?.address ? user.address.split(',').slice(0, -2).join(',').trim() : '',
    landmark: '',
    pincode: user?.address ? (user.address.match(/\b\d{6}\b/)?.[0] || '') : '',
    notes: '',
  })
  const [error, setError] = useState('')

  const handle = (e) => {
    let val = e.target.value
    if (e.target.name === 'phone') val = val.replace(/\D/g, '').slice(0, 10)
    if (e.target.name === 'pincode') val = val.replace(/\D/g, '').slice(0, 6)
    setForm(f => ({ ...f, [e.target.name]: val }))
    setError('')
  }

  const submit = () => {
    if (!form.name.trim()) { setError('Naam zaroori hai'); return }
    if (!form.phone) { setError('Mobile number zaroori hai'); return }
    if (!/^\d{10}$/.test(form.phone)) { setError('10 digit ka valid mobile number daalo'); return }
    if (!form.fullAddress.trim()) { setError('Address zaroori hai'); return }
    if (!form.pincode) { setError('Pincode zaroori hai'); return }
    if (!/^\d{6}$/.test(form.pincode)) { setError('6 digit ka valid pincode daalo'); return }
    setError('')
    onConfirm(form)
  }

  const phoneMissing = !user?.phone

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto"
        style={{
          background: 'var(--surface-card)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 pt-5 pb-4 z-10"
          style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-extrabold">Delivery Details</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Order WhatsApp par bheja jayega
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
            <FiX size={17} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Alert if phone is missing */}
          {phoneMissing && (
            <div className="flex items-start gap-3 p-3 rounded-2xl"
              style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.2)' }}>
              <FiPhone size={15} style={{ color: 'var(--primary)', marginTop: 1, flexShrink: 0 }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--primary)' }}>
                Aapne abhi tak mobile number nahi diya. Order ke baad yeh aapke profile mein save ho jayega.
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              <FiUser size={11} /> Naam *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Aapka poora naam"
              className="sku-input"
              autoFocus
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              <FiPhone size={11} /> Mobile Number *
              {phoneMissing && (
                <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full normal-case"
                  style={{ background: 'rgba(234,88,12,0.1)', color: 'var(--primary)', border: '1px solid rgba(234,88,12,0.2)' }}>
                  Profile mein save hoga
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <div className="sku-input shrink-0 flex items-center justify-center font-bold text-sm"
                style={{ width: 56, color: 'var(--text-muted)', padding: '0 12px' }}>
                +91
              </div>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handle}
                placeholder="10-digit mobile number"
                className="sku-input flex-1"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              <FiMapPin size={11} /> Pata (Address) *
            </label>
            <textarea
              name="fullAddress"
              value={form.fullAddress}
              onChange={handle}
              placeholder="Ghar/flat number, gali, mohalla, area"
              className="sku-input resize-none"
              rows={2}
              style={{ lineHeight: 1.5 }}
            />
          </div>

          {/* Landmark + Pincode row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}>
                Landmark
              </label>
              <input
                name="landmark"
                value={form.landmark}
                onChange={handle}
                placeholder="Mandir/school ke paas…"
                className="sku-input"
              />
            </div>
            <div style={{ width: 120 }}>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}>
                Pincode *
              </label>
              <input
                name="pincode"
                type="tel"
                value={form.pincode}
                onChange={handle}
                placeholder="6-digit"
                className="sku-input"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Delivery notes */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              Delivery Note <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              name="notes"
              value={form.notes}
              onChange={handle}
              placeholder="Koi khaas baat driver ke liye…"
              className="sku-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.18)' }}>
              <FiAlertCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-5 pb-6 pt-3"
          style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border)' }}>
          <button onClick={submit} className="sku-btn w-full py-3.5 text-base font-bold">
            ✅ Confirm Order &amp; WhatsApp Par Bhejo
          </button>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            📱 WhatsApp number par order details jayegi
          </p>
        </div>
      </div>
    </div>
  )
}
