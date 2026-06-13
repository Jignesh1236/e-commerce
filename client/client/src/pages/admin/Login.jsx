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

  const MAX = 8

  const press = (val) => {
    if (loading) return
    if (val === '←') { setPin(p => p.slice(0,-1)); setError(''); return }
    if (val === '✓') { submit(); return }
    if (pin.length >= MAX) return
    const next = pin + val
    setPin(next)
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
    } catch {
      setError('Wrong PIN. Try again.')
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
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
              boxShadow: '0 4px 16px rgba(46,125,50,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
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
                    background: 'linear-gradient(180deg, #3da03d 0%, #2e7d32 60%, #276b2c 100%)',
                    border: '1px solid #1b5e20',
                    borderBottomWidth: 2,
                    color: 'white',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 8px rgba(46,125,50,0.4)',
                  } : isAction ? {
                    background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    border: '1px solid var(--border)',
                    borderBottomWidth: 2,
                    color: 'var(--text-muted)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                  } : {
                    background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-card))',
                    border: '1px solid var(--border)',
                    borderBottomWidth: 2,
                    color: 'var(--text)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), var(--shadow-sm)',
                  }}>
                  {key}
                </button>
              )
            })}
          </div>
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
