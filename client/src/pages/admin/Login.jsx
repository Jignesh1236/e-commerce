import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

const PAD = [['1','2','3'],['4','5','6'],['7','8','9'],['←','0','✓']]

export default function AdminLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [otpStep, setOtpStep] = useState('request')
  const [otp, setOtp] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [resetField, setResetField] = useState('otp')

  const MAX = 8

  const press = (val) => {
    if (loading) return
    if (val === '←') { setPin(p => p.slice(0, -1)); setError(''); return }
    if (val === '✓') { submit(); return }
    if (pin.length >= MAX) return
    setPin(pin + val)
    setError('')
  }

  const submit = async () => {
    if (!pin || loading) return
    setLoading(true)
    setError('')
    try {
      const r = await api.post('/admin/login', { pin })
      localStorage.setItem('adminToken', r.data.token)
      navigate('/admin/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Wrong PIN. Try again.')
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
  }

  const [devOtp, setDevOtp] = useState('')

  const requestOtp = async () => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const r = await api.post('/admin/forgot-pin', { action: 'request' })
      setMaskedEmail(r.data.maskedEmail || '')
      setOtpStep('verify')
      if (r.data.devOtp) {
        setDevOtp(r.data.devOtp)
        setSuccessMsg(`Dev mode: OTP is ${r.data.devOtp} (SMTP not configured)`)
      } else {
        setSuccessMsg('OTP sent! Check your recovery email.')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const resetPad = (val) => {
    if (loading) return
    if (resetField === 'otp') {
      if (val === '←') { setOtp(p => p.slice(0, -1)); return }
      if (val === '✓') { verifyOtp(); return }
      if (otp.length >= 6) return
      setOtp(otp + val)
    } else if (resetField === 'newPin') {
      if (val === '←') { setNewPin(p => p.slice(0, -1)); return }
      if (val === '✓') { setResetField('confirmPin'); return }
      if (newPin.length >= MAX) return
      setNewPin(newPin + val)
    } else if (resetField === 'confirmPin') {
      if (val === '←') { setConfirmPin(p => p.slice(0, -1)); return }
      if (val === '✓') { verifyOtp(); return }
      if (confirmPin.length >= MAX) return
      setConfirmPin(confirmPin + val)
    }
    setError('')
  }

  const verifyOtp = async () => {
    if (!otp) { setError('Enter OTP first'); return }
    if (!newPin) { setError('Enter new PIN'); setResetField('newPin'); return }
    if (newPin !== confirmPin) { setError('PINs do not match'); setConfirmPin(''); setResetField('confirmPin'); return }
    if (newPin.length < 4) { setError('PIN must be at least 4 digits'); return }

    setLoading(true)
    setError('')
    try {
      await api.post('/admin/forgot-pin', { action: 'verify', otp, newPin })
      setSuccessMsg('PIN reset successfully! You can now log in.')
      setTimeout(() => {
        setMode('login')
        setOtp(''); setNewPin(''); setConfirmPin('')
        setOtpStep('request'); setResetField('otp')
        setSuccessMsg(''); setError('')
      }, 2000)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to reset PIN.')
    } finally {
      setLoading(false)
    }
  }

  const resetFieldLabel = resetField === 'otp' ? 'OTP' : resetField === 'newPin' ? 'New PIN' : 'Confirm PIN'
  const resetFieldValue = resetField === 'otp' ? otp : resetField === 'newPin' ? newPin : confirmPin
  const resetFieldMax = resetField === 'otp' ? 6 : MAX

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--surface)' }}>
        <div className="w-full max-w-xs">
          <div className="sku-card p-7 flex flex-col items-center gap-5"
            style={{ borderRadius: 24 }}>

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              🔑
            </div>

            <div className="text-center">
              <h1 className="text-xl font-extrabold mb-1">Reset PIN</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {otpStep === 'request'
                  ? 'An OTP will be sent to your recovery email'
                  : maskedEmail ? `OTP sent to ${maskedEmail}` : 'Enter OTP from your recovery email'}
              </p>
            </div>

            {successMsg && (
              <p className="text-xs font-semibold text-center px-2 py-1.5 rounded-lg w-full"
                style={{ color: '#16a34a', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
                {successMsg}
              </p>
            )}

            {error && (
              <p className="text-xs font-semibold text-center px-2 py-1.5 rounded-lg w-full"
                style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)' }}>
                {error}
              </p>
            )}

            {otpStep === 'request' ? (
              <button
                onClick={requestOtp}
                disabled={loading}
                className="w-full h-12 rounded-2xl text-base font-bold transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)',
                  color: 'white',
                  boxShadow: '0 3px 8px rgba(124,58,237,0.4)',
                  opacity: loading ? 0.7 : 1
                }}>
                {loading ? 'Sending…' : 'Send OTP to Email'}
              </button>
            ) : (
              <>
                <div className="w-full flex flex-col gap-2">
                  {['otp', 'newPin', 'confirmPin'].map((field) => {
                    const val = field === 'otp' ? otp : field === 'newPin' ? newPin : confirmPin
                    const label = field === 'otp' ? 'OTP Code' : field === 'newPin' ? 'New PIN' : 'Confirm PIN'
                    const max = field === 'otp' ? 6 : MAX
                    const active = resetField === field
                    return (
                      <button key={field} onClick={() => { setResetField(field); setError('') }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                        style={{
                          background: active ? 'rgba(124,58,237,0.08)' : 'var(--surface-card)',
                          border: active ? '1.5px solid #7c3aed' : '1.5px solid var(--border)',
                        }}>
                        <span className="text-xs font-semibold" style={{ color: active ? '#7c3aed' : 'var(--text-muted)' }}>
                          {label}
                        </span>
                        <div className="flex gap-1.5">
                          {Array(Math.max(val.length || (field === 'otp' ? 6 : 4), field === 'otp' ? 6 : 4)).fill(0).map((_, i) => (
                            <div key={i} className="rounded-full transition-all"
                              style={{
                                width: 8, height: 8,
                                background: i < val.length ? (active ? '#7c3aed' : 'var(--primary)') : 'var(--border)',
                                transform: i < val.length ? 'scale(1.2)' : 'scale(1)'
                              }} />
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Entering: <span style={{ color: '#7c3aed', fontWeight: 700 }}>{resetFieldLabel}</span>
                  {' '}— tap a field above to switch
                </p>

                <div className="grid grid-cols-3 gap-3 w-full">
                  {PAD.flat().map((key) => {
                    const isAction = key === '←' || key === '✓'
                    const isEnter = key === '✓'
                    return (
                      <button key={key} onClick={() => resetPad(key)} disabled={loading}
                        className="h-14 rounded-2xl text-lg font-bold transition-all duration-100 select-none active:scale-95"
                        style={isEnter ? {
                          background: 'linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)',
                          border: '1px solid #5b21b6',
                          color: 'white',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(124,58,237,0.4)',
                        } : isAction ? {
                          background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                          borderTop: '1px solid var(--border)',
                          borderLeft: '1px solid var(--border)',
                          borderRight: '1px solid var(--border)',
                          borderBottom: '2px solid var(--border)',
                          color: 'var(--text-muted)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                        } : {
                          background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                          borderTop: '1px solid var(--border)',
                          borderLeft: '1px solid var(--border)',
                          borderRight: '1px solid var(--border)',
                          borderBottom: '2px solid var(--border)',
                          color: 'var(--text)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                        }}>
                        {key}
                      </button>
                    )
                  })}
                </div>

                <button onClick={requestOtp} disabled={loading}
                  className="text-xs font-semibold transition-opacity"
                  style={{ color: '#7c3aed', opacity: loading ? 0.5 : 1 }}>
                  Resend OTP
                </button>
              </>
            )}

            <button onClick={() => {
              setMode('login')
              setOtp(''); setNewPin(''); setConfirmPin('')
              setOtpStep('request'); setResetField('otp')
              setError(''); setSuccessMsg('')
            }}
              className="text-xs font-semibold transition-opacity"
              style={{ color: 'var(--text-muted)' }}>
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--surface)' }}>
      <div className="w-full max-w-xs">
        <div className="sku-card p-7 flex flex-col items-center gap-5"
          style={{ borderRadius: 24 }}>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              boxShadow: '0 4px 16px rgba(234,88,12,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            🔐
          </div>

          <div className="text-center">
            <h1 className="text-xl font-extrabold mb-1">Admin Login</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter your PIN</p>
          </div>

          <div className={`flex gap-3 justify-center ${shake ? 'animate-shake' : ''}`}
            style={{ animation: shake ? 'shake 0.5s ease' : 'none' }}>
            {Array(Math.max(pin.length || 4, 4)).fill(0).map((_, i) => (
              <div key={i}
                className="w-3 h-3 rounded-full transition-all duration-150"
                style={{
                  background: i < pin.length ? 'var(--primary)' : 'var(--border)',
                  boxShadow: i < pin.length ? '0 0 6px var(--primary-glow)' : 'inset 0 1px 2px rgba(0,0,0,0.15)',
                  transform: i < pin.length ? 'scale(1.2)' : 'scale(1)'
                }} />
            ))}
          </div>

          {error && (
            <p className="text-xs font-semibold text-center px-2 py-1.5 rounded-lg w-full"
              style={{ color: 'var(--danger)', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)' }}>
              {error}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 w-full">
            {PAD.flat().map((key) => {
              const isAction = key === '←' || key === '✓'
              const isEnter = key === '✓'
              return (
                <button key={key} onClick={() => press(key)} disabled={loading}
                  className="h-14 rounded-2xl text-lg font-bold transition-all duration-100 select-none active:scale-95"
                  style={isEnter ? {
                    background: 'linear-gradient(180deg, #f97316 0%, #ea580c 60%, #dc4a00 100%)',
                    borderTop: '1px solid #c2410c',
                    borderLeft: '1px solid #c2410c',
                    borderRight: '1px solid #c2410c',
                    borderBottom: '2px solid #c2410c',
                    color: 'white',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 8px rgba(234,88,12,0.4)',
                  } : isAction ? {
                    background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    borderTop: '1px solid var(--border)',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '2px solid var(--border)',
                    color: 'var(--text-muted)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                  } : {
                    background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    borderTop: '1px solid var(--border)',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '2px solid var(--border)',
                    color: 'var(--text)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                  }}>
                  {key}
                </button>
              )
            })}
          </div>

          <button onClick={() => { setMode('forgot'); setError('') }}
            className="text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}>
            Forgot PIN?
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          45%       { transform: translateX(8px); }
          75%       { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  )
}
