import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { FiCheck, FiArrowRight } from 'react-icons/fi'

export default function Onboarding() {
  const { checkIP, onboard } = useUser()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [welcomed, setWelcomed] = useState(null)

  useEffect(() => {
    checkIP().then(res => {
      if (res.exists) navigate('/', { replace: true })
      else setChecking(false)
    })
  }, [])

  const submit = async () => {
    const e = {}
    if (!name.trim()) e.name = 'Naam zaroori hai'
    if (phone && !/^\d{10}$/.test(phone)) e.phone = '10 digit ka number daalo'
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      const result = await onboard({ name: name.trim(), phone: phone.trim() })
      if (result?.recovered) {
        setWelcomed('back')
      } else {
        setWelcomed('new')
      }
      setTimeout(() => navigate('/', { replace: true }), 900)
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ submit: 'Is device se pehle se account hai. Mobile number daalo toh account recover ho sakta hai.' })
      } else {
        setErrors({ submit: 'Kuch galat hua. Dobara try karo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pehchaan rahe hain…</p>
      </div>
    </div>
  )

  if (welcomed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, var(--primary), #f97316)', boxShadow: '0 8px 24px rgba(234,88,12,0.35)' }}>
          {welcomed === 'back' ? '👋' : '🎉'}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>
            {welcomed === 'back' ? `Wapas aaye, ${name}!` : `Swagat hai, ${name}!`}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {welcomed === 'back' ? 'Aapka account mil gaya ✓' : 'Account ban gaya ✓'}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex w-96 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 50%, #f97316 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="text-4xl mb-3">🛒</div>
          <h1 className="text-2xl font-extrabold text-white leading-tight">Welcome to the Store!</h1>
          <p className="text-white/70 mt-2 text-sm">Fresh products delivered to your door. Quick setup, no account needed.</p>
        </div>
        <div className="relative flex flex-col gap-3">
          {[
            { icon: '⚡', title: 'Sirf naam daalo', sub: 'Koi password ya account nahi chahiye' },
            { icon: '📱', title: 'Mobile optional hai', sub: 'Dusre device pe recover karne ke liye helpful' },
            { icon: '🔄', title: 'Auto-detect', sub: 'Naya ho ya purana — sab automatic' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>{icon}</div>
              <div>
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-white/60 text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="sku-card p-6 md:p-8"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}>

            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: 'linear-gradient(135deg, var(--primary), #f97316)', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                🛒
              </div>
              <h2 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                Apna naam daalo
              </h2>
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Naye ho ya purane — sab automatically detect ho jayega
              </p>
            </div>

            <div className="flex flex-col gap-4">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Aapka Naam *
                </label>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })) }}
                  placeholder="e.g. Ramesh Kumar"
                  className="sku-input text-base"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Mobile Number{' '}
                  <span className="normal-case font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <div className="sku-input shrink-0 flex items-center justify-center font-bold text-sm px-3"
                    style={{ width: 56, color: 'var(--text-muted)' }}>
                    +91
                  </div>
                  <input
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(er => ({ ...er, phone: '' })) }}
                    placeholder="10-digit number"
                    type="tel"
                    className="sku-input flex-1 text-base"
                    onKeyDown={e => e.key === 'Enter' && submit()}
                  />
                </div>
                {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phone}</p>}
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Dusre device pe purana account recover karne ke liye mobile daalo
                </p>
              </div>

              {errors.submit && (
                <p className="text-sm px-3 py-2.5 rounded-xl" style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.15)' }}>
                  {errors.submit}
                </p>
              )}

              <button onClick={submit} disabled={loading}
                className="sku-btn w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold mt-1">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Detect kar rahe hain…</>
                ) : (
                  <><FiArrowRight size={16} /> Aage Badho</>
                )}
              </button>
            </div>

            <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
              Koi account ya password nahi chahiye · Auto-detect enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
