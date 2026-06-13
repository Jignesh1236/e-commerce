import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { useUser } from '../context/UserContext'

export default function AddressModal({ onConfirm, onClose }) {
  const { user, updateUser } = useUser()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    fullAddress: user?.address || '',
    landmark: '',
    pincode: '',
  })
  const [error, setError] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = () => {
    if (!form.name || !form.phone || !form.fullAddress || !form.pincode) {
      setError('Please fill all required fields')
      return
    }
    if (!/^\d{10}$/.test(form.phone)) { setError('Enter valid 10-digit phone number'); return }
    if (!/^\d{6}$/.test(form.pincode)) { setError('Enter valid 6-digit pincode'); return }
    setError('')
    onConfirm(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="sku-card w-full max-w-md p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Delivery Address</h2>
          <button onClick={onClose} className="p-1 rounded-lg sku-btn-outline" style={{ padding: '6px' }}><FiX size={18} /></button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'Full Name *', name: 'name', placeholder: 'Your name' },
            { label: 'Phone Number *', name: 'phone', placeholder: '10-digit mobile number', type: 'tel' },
            { label: 'Full Address *', name: 'fullAddress', placeholder: 'House/Flat no, Street, Area' },
            { label: 'Landmark', name: 'landmark', placeholder: 'Near temple, school etc.' },
            { label: 'Pincode *', name: 'pincode', placeholder: '6-digit pincode', type: 'tel' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
              <input
                name={f.name}
                type={f.type || 'text'}
                value={form[f.name]}
                onChange={handle}
                placeholder={f.placeholder}
                className="sku-input"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={submit} className="sku-btn w-full mt-1">
            Confirm Order & Open WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
