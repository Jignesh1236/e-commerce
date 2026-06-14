import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { FiCheck, FiArrowRight, FiPhone } from 'react-icons/fi'

export default function Onboarding() {
  const { checkIP, onboard, loginByNamePhone } = useUser()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [mode, setMode] = useState('new')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [recovered, setRecovered] = useState(false)

  useEffect(() => {
    checkIP().then(res => {
      if (res.exists) navigate('/', { replace: true })
      else setChecking(false)
    })
  }, [])

  const submitNew = async () => {
    const e = {}
    if (!name.trim()) e.name = 'Naam zaroori hai'
    if (phone && !/^\d{10}$/.test(phone)) e.phone = '10 digit ka number daalo'
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      const result = await onboard({ name: name.trim(), phone: phone.trim() })
      if (result) {
        setRecovered(false)
        navigate('/', { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (err.response?.status === 409) {
        setErrors({ submit: 'Is IP se pehle se account hai. Dusre device par try karo ya naam+mobile se login karo.' })
      } else {
        setErrors({ submit: 'Kuch galat hua. Dobara try karo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const submitLogin = async () => {
    const e = {}
    if (!name.trim()) e.name = 'Naam zaroori hai'
    if (!phone) e.phone = 'Mobile number zaroori hai'
    else if (!/^\d{10}$/.test(phone)) e.phone = '10 digit ka number daalo'
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      await loginByNamePhone({ name: name.trim(), phone: phone.trim() })
      navigate('/', { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 404) {
        setErrors({ submit: 'Is mobile number se koi account nahi mila.' })
      } else if (status === 401) {
        setErrors({ submit: 'Naam match nahi hua. Sahi naam daalo jo pehle diya tha.' })
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
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>
      {/* Left panel — desktop */}
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
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}>👋</div>
            <div>
              <p className="text-white font-bold text-sm">Bas naam daalo</p>
              <p className="text-white/60 text-xs mt-0.5">Koi account ya password ki zaroorat nahi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}>📱</div>
            <div>
              <p className="text-white font-bold text-sm">Dusre device par? Login karo</p>
              <p className="text-white/60 text-xs mt-0.5">Naam + mobile se pehla account recover karo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="sku-card p-6 md:p-8"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}>

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'var(--surface-inset)' }}>
              <button
                onClick={() => { setMode('new'); setErrors({}) }}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: mode === 'new' ? 'var(--surface-card)' : 'transparent',
                  color: mode === 'new' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: mode === 'new' ? 'var(--shadow-sm)' : 'none',
                }}>
                👋 New User
              </button>
              <button
                onClick={() => { setMode('login'); setErrors({}) }}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: mode === 'login' ? 'var(--surface-card)' : 'transparent',
                  color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                }}>
                📱 Returning User
              </button>
            </div>

            {mode === 'new' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                    Aapka naam kya hai?
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Bas itna batao, aur shopping shuru karo!
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
                      onKeyDown={e => e.key === 'Enter' && submitNew()}
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Mobile Number{' '}
                      <span className="normal-case font-normal">(optional — order ke liye zaroori hoga)</span>
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
                        onKeyDown={e => e.key === 'Enter' && submitNew()}
                      />
                    </div>
                    {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phone}</p>}
                  </div>

                  {errors.submit && (
                    <p className="text-sm px-3 py-2 rounded-xl" style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.15)' }}>
                      {errors.submit}
                    </p>
                  )}

                  <button onClick={submitNew} disabled={loading}
                    className="sku-btn w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold mt-1">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Setting up…</>
                    ) : (
                      <><FiCheck size={16} /> Shopping Shuru Karo! 🎉</>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                  Koi account nahi chahiye · Aapka IP aapko identify karta hai
                </p>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                    Wapas aaye! 👋
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Apna naam aur mobile number daalo jo pehle diya tha
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
                      onKeyDown={e => e.key === 'Enter' && submitLogin()}
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Mobile Number * <span className="normal-case font-normal">(registered wala)</span>
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
                        onKeyDown={e => e.key === 'Enter' && submitLogin()}
                      />
                    </div>
                    {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phone}</p>}
                  </div>

                  <div className="p-3 rounded-xl flex items-start gap-2"
                    style={{ background: 'var(--primary-glow)', border: '1px solid rgba(234,88,12,0.2)' }}>
                    <FiPhone size={14} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: 'var(--primary)' }}>
                      Wahi naam aur mobile daalo jo pehle store mein diya tha. Aapka account is device mein aa jayega.
                    </p>
                  </div>

                  {errors.submit && (
                    <p className="text-sm px-3 py-2 rounded-xl" style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.15)' }}>
                      {errors.submit}
                    </p>
                  )}

                  <button onClick={submitLogin} disabled={loading}
                    className="sku-btn w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold mt-1">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Dhundh raha hoon…</>
                    ) : (
                      <><FiArrowRight size={16} /> Login Karo</>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                  Pehli baar aa rahe ho? "New User" tab use karo
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
