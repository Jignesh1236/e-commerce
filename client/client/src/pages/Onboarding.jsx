import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiMapPin, FiSmile } from 'react-icons/fi'

const SOURCES = ['Instagram', 'Facebook', 'WhatsApp', 'Friend/Family', 'Google Search', 'Other']

const STEPS = [
  { id: 1, icon: '👋', title: "What's your name?", sub: 'Tell us who you are' },
  { id: 2, icon: '📍', title: 'Where do we deliver?', sub: 'Your default delivery address' },
  { id: 3, icon: '🎉', title: 'Almost done!', sub: 'One last thing' },
]

export default function Onboarding() {
  const { checkIP, onboard } = useUser()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState('forward')
  const [form, setForm] = useState({
    name: '', phone: '',
    flat: '', area: '', city: '', pincode: '', landmark: '',
    source: '', tos: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkIP().then(res => {
      if (res.exists) navigate('/', { replace: true })
      else setChecking(false)
    })
  }, [])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate1 = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter 10-digit number'
    setErrors(e)
    return !Object.keys(e).length
  }

  const validate2 = () => {
    const e = {}
    if (!form.flat.trim()) e.flat = 'House/Flat no. required'
    if (!form.area.trim()) e.area = 'Area required'
    if (!form.city.trim()) e.city = 'City required'
    if (!form.pincode.trim()) e.pincode = 'Pincode required'
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode'
    setErrors(e)
    return !Object.keys(e).length
  }

  const validate3 = () => {
    const e = {}
    if (!form.source) e.source = 'Please select an option'
    if (!form.tos) e.tos = 'Please accept to continue'
    setErrors(e)
    return !Object.keys(e).length
  }

  const next = () => {
    if (step === 1 && !validate1()) return
    if (step === 2 && !validate2()) return
    setDirection('forward')
    setStep(s => s + 1)
  }

  const back = () => {
    setDirection('back')
    setStep(s => s - 1)
    setErrors({})
  }

  const submit = async () => {
    if (!validate3()) return
    setLoading(true)
    try {
      const fullAddress = [form.flat, form.area, form.city, form.pincode, form.landmark].filter(Boolean).join(', ')
      await onboard({
        name: form.name.trim(),
        phone: form.phone.trim(),
        source: form.source,
        address: fullAddress,
      })
      navigate('/', { replace: true })
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    </div>
  )

  const current = STEPS[step - 1]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex w-96 flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 50%, #388e3c 100%)',
        }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="text-4xl mb-3">🛒</div>
          <h1 className="text-2xl font-extrabold text-white leading-tight">Welcome to the Store!</h1>
          <p className="text-white/70 mt-2 text-sm">Fresh products delivered to your door. Quick setup, no account needed.</p>
        </div>
        <div className="relative flex flex-col gap-4">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: step >= s.id ? 1 : 0.4 }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0"
                style={{
                  background: step > s.id ? 'rgba(255,255,255,0.9)' : step === s.id ? 'white' : 'rgba(255,255,255,0.15)',
                  color: step >= s.id ? 'var(--primary-dark)' : 'white',
                  boxShadow: step === s.id ? '0 0 0 4px rgba(255,255,255,0.3)' : 'none',
                }}>
                {step > s.id ? <FiCheck size={14} /> : s.id}
              </div>
              <span className="text-sm font-medium" style={{ color: step >= s.id ? 'white' : 'rgba(255,255,255,0.5)' }}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          {/* Mobile step dots */}
          <div className="flex justify-center gap-2 mb-6 lg:hidden">
            {STEPS.map(s => (
              <div key={s.id} className="transition-all duration-300 rounded-full"
                style={{
                  width: step === s.id ? 24 : 8,
                  height: 8,
                  background: step >= s.id ? 'var(--primary)' : 'var(--border)',
                }} />
            ))}
          </div>

          <div className="sku-card p-6 md:p-8"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}>

            {/* Step header */}
            <div className="mb-6">
              <div className="text-4xl mb-3">{current.icon}</div>
              <h2 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>{current.title}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{current.sub}</p>
            </div>

            {/* Step 1: Name + Phone */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Your Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="sku-input text-base"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && next()}
                  />
                  {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Mobile Number <span className="normal-case font-normal">(optional, for delivery updates)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="sku-input shrink-0 flex items-center justify-center font-bold text-sm px-3"
                      style={{ width: 56, color: 'var(--text-muted)' }}>
                      +91
                    </div>
                    <input
                      value={form.phone}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit number"
                      type="tel"
                      className="sku-input flex-1 text-base"
                      onKeyDown={e => e.key === 'Enter' && next()}
                    />
                  </div>
                  {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phone}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Detailed Address */}
            {step === 2 && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Flat / House No. & Building *
                    </label>
                    <input value={form.flat} onChange={e => set('flat', e.target.value)}
                      placeholder="e.g. B-204, Shiv Apartment" className="sku-input" autoFocus />
                    {errors.flat && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.flat}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Street / Area / Colony *
                    </label>
                    <input value={form.area} onChange={e => set('area', e.target.value)}
                      placeholder="e.g. MG Road, Sector 12" className="sku-input" />
                    {errors.area && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.area}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      City *
                    </label>
                    <input value={form.city} onChange={e => set('city', e.target.value)}
                      placeholder="Delhi" className="sku-input" />
                    {errors.city && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Pincode *
                    </label>
                    <input value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="110001" type="tel" className="sku-input" />
                    {errors.pincode && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.pincode}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Landmark <span className="normal-case font-normal">(optional)</span>
                    </label>
                    <input value={form.landmark} onChange={e => set('landmark', e.target.value)}
                      placeholder="Near temple, school, metro station…" className="sku-input" />
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  💡 You can update this address at checkout too
                </p>
              </div>
            )}

            {/* Step 3: Source + TOS */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    How did you find us? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOURCES.map(s => (
                      <button key={s} type="button"
                        onClick={() => set('source', s)}
                        className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                        style={{
                          border: `2px solid ${form.source === s ? 'var(--primary)' : 'var(--border)'}`,
                          background: form.source === s ? 'var(--primary-glow)' : 'var(--surface-inset)',
                          color: form.source === s ? 'var(--primary)' : 'var(--text)',
                          boxShadow: form.source === s ? '0 0 0 3px rgba(46,125,50,0.1)' : 'none',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.source && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.source}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-colors"
                  style={{ background: form.tos ? 'var(--primary-glow)' : 'var(--surface-inset)', border: `1px solid ${form.tos ? 'var(--primary)' : 'var(--border)'}` }}>
                  <div className="mt-0.5 w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-all"
                    style={{
                      background: form.tos ? 'var(--primary)' : 'var(--surface)',
                      border: `2px solid ${form.tos ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                    {form.tos && <FiCheck size={11} color="white" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={form.tos} onChange={e => set('tos', e.target.checked)} />
                  <span className="text-sm" style={{ color: 'var(--text)' }}>
                    I agree to the{' '}
                    <a href="/terms-of-service" target="_blank" className="underline font-semibold" style={{ color: 'var(--primary)' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy-policy" target="_blank" className="underline font-semibold" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
                  </span>
                </label>
                {errors.tos && <p className="text-xs -mt-2" style={{ color: 'var(--danger)' }}>{errors.tos}</p>}
                {errors.submit && <p className="text-sm" style={{ color: 'var(--danger)' }}>{errors.submit}</p>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={back} className="sku-btn-outline px-4 py-3 flex items-center gap-2">
                  <FiArrowLeft size={16} /> Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={next} className="sku-btn flex-1 py-3 flex items-center justify-center gap-2 text-base font-bold">
                  Continue <FiArrowRight size={16} />
                </button>
              ) : (
                <button onClick={submit} disabled={loading}
                  className="sku-btn flex-1 py-3 flex items-center justify-center gap-2 text-base font-bold">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Setting up…</>
                  ) : (
                    <><FiCheck size={16} /> Let's Shop! 🎉</>
                  )}
                </button>
              )}
            </div>

            {step === 1 && (
              <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                No account creation needed · Your IP identifies you
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
