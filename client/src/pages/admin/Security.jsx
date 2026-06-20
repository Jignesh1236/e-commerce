import { useState } from 'react'
import { FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi'
import api from '../../utils/api'

const PAD = [['1','2','3'],['4','5','6'],['7','8','9'],['←','0','✓']]

export default function AdminSecurity() {
  const [field, setField] = useState('current')
  const [current, setCurrent] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showValues, setShowValues] = useState(false)

  const fields = [
    { key: 'current', label: 'Current PIN',  value: current, max: 8 },
    { key: 'new',     label: 'New PIN',       value: newPin,  max: 8 },
    { key: 'confirm', label: 'Confirm PIN',   value: confirm, max: 8 },
  ]

  const getValue = (key) => key === 'current' ? current : key === 'new' ? newPin : confirm
  const setValue = (key, v) => {
    if (key === 'current') setCurrent(v)
    else if (key === 'new') setNewPin(v)
    else setConfirm(v)
  }

  const press = (val) => {
    if (loading) return
    const cur = getValue(field)
    const max = 8
    if (val === '←') { setValue(field, cur.slice(0, -1)); setError(''); return }
    if (val === '✓') {
      if (field === 'current') { setField('new'); return }
      if (field === 'new') { setField('confirm'); return }
      if (field === 'confirm') { submit(); return }
    }
    if (cur.length >= max) return
    setValue(field, cur + val)
    setError('')
  }

  const submit = async () => {
    if (!current) { setError('Current PIN daalo'); setField('current'); return }
    if (!newPin || newPin.length < 4) { setError('New PIN kam se kam 4 digits ka hona chahiye'); setField('new'); return }
    if (newPin !== confirm) { setError('New PIN aur Confirm PIN match nahi kar rahe'); setConfirm(''); setField('confirm'); return }
    if (current === newPin) { setError('New PIN current PIN se alag hona chahiye'); setNewPin(''); setConfirm(''); setField('new'); return }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/admin/change-pin', { currentPin: current, newPin })
      setSuccess('PIN successfully change ho gaya! ✅')
      setCurrent(''); setNewPin(''); setConfirm('')
      setField('current')
    } catch (e) {
      setError(e.response?.data?.message || 'PIN change failed. Try again.')
      if (e.response?.status === 401) { setCurrent(''); setField('current') }
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setCurrent(''); setNewPin(''); setConfirm('')
    setField('current'); setError(''); setSuccess('')
  }

  return (
    <div className="max-w-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Security</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Admin PIN change karo</p>
      </div>

      <div className="sku-card p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 3px 10px rgba(234,88,12,0.35)' }}>
            <FiLock size={18} color="white" />
          </div>
          <div>
            <p className="font-bold text-sm">PIN Change</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pehle current PIN verify hoga</p>
          </div>
          <button
            onClick={() => setShowValues(v => !v)}
            className="ml-auto p-2 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {showValues ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>

        {/* Field selectors */}
        <div className="flex flex-col gap-2">
          {fields.map(({ key, label, value }) => {
            const active = field === key
            const filled = value.length > 0
            return (
              <button key={key} onClick={() => { setField(key); setError('') }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
                style={{
                  background: active ? 'rgba(234,88,12,0.06)' : 'var(--surface-inset)',
                  border: active ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                }}>
                <span className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {label}
                </span>
                <div className="flex items-center gap-1.5">
                  {showValues && filled ? (
                    <span className="font-mono text-sm font-bold" style={{ color: active ? 'var(--primary)' : 'var(--text)' }}>
                      {value}
                    </span>
                  ) : (
                    Array(Math.max(value.length || 4, 4)).fill(0).map((_, i) => (
                      <div key={i} className="rounded-full transition-all duration-150"
                        style={{
                          width: 8, height: 8,
                          background: i < value.length
                            ? (active ? 'var(--primary)' : 'var(--text-muted)')
                            : 'var(--border)',
                          transform: i < value.length ? 'scale(1.2)' : 'scale(1)'
                        }} />
                    ))
                  )}
                  {filled && <FiCheck size={12} style={{ color: '#16a34a', marginLeft: 4 }} />}
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-center font-medium" style={{ color: 'var(--text-muted)' }}>
          Abhi enter kar rahe ho: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {field === 'current' ? 'Current PIN' : field === 'new' ? 'New PIN' : 'Confirm PIN'}
          </span>
        </p>

        {error && (
          <p className="text-xs font-semibold text-center px-3 py-2.5 rounded-xl"
            style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)' }}>
            ❌ {error}
          </p>
        )}
        {success && (
          <p className="text-xs font-semibold text-center px-3 py-2.5 rounded-xl"
            style={{ color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
            {success}
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5">
          {PAD.flat().map((key) => {
            const isEnter = key === '✓'
            const isBack = key === '←'
            return (
              <button key={key} onClick={() => press(key)} disabled={loading}
                className="h-14 rounded-2xl text-lg font-bold transition-all duration-100 select-none active:scale-95"
                style={isEnter ? {
                  background: loading
                    ? 'var(--surface-inset)'
                    : 'linear-gradient(180deg, #f97316 0%, #ea580c 60%, #dc4a00 100%)',
                  borderTop: '1px solid #c2410c',
                  borderLeft: '1px solid #c2410c',
                  borderRight: '1px solid #c2410c',
                  borderBottom: '2px solid #c2410c',
                  color: 'white',
                  boxShadow: loading ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 8px rgba(234,88,12,0.35)',
                  opacity: loading ? 0.6 : 1,
                } : {
                  background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                  borderTop: '1px solid var(--border)',
                  borderLeft: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '2px solid var(--border)',
                  color: isBack ? 'var(--text-muted)' : 'var(--text)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                }}>
                {loading && isEnter ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : key}
              </button>
            )
          })}
        </div>

        <button onClick={reset}
          className="text-xs font-semibold text-center transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}>
          Reset fields
        </button>
      </div>

      <p className="text-xs text-center mt-4 px-4" style={{ color: 'var(--text-muted)' }}>
        PIN change ke baad next login pe naya PIN use karna hoga
      </p>
    </div>
  )
}
