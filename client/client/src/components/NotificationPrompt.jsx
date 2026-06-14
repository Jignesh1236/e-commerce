import { useState, useEffect } from 'react'
import { FiBell, FiX } from 'react-icons/fi'
import { usePushNotification } from '../hooks/usePushNotification'
import { useUser } from '../context/UserContext'

export default function NotificationPrompt() {
  const { user } = useUser()
  const { permission, subscribed, vapidAvailable, subscribe } = usePushNotification(user?._id)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!vapidAvailable) return
    if (permission !== 'default' || subscribed) return
    if (sessionStorage.getItem('notifDismissed')) return

    const t = setTimeout(() => setShow(true), 5000)
    return () => clearTimeout(t)
  }, [user, permission, subscribed, vapidAvailable])

  const handleAllow = async () => {
    setShow(false)
    await subscribe()
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('notifDismissed', '1')
  }

  if (!show) return null
  if (typeof window === 'undefined' || !('Notification' in window)) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-fade-in">
      <div className="sku-card p-4 flex items-start gap-3"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)' }}>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(234,88,12,0.1)', color: 'var(--primary)' }}>
          <FiBell size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm mb-0.5">🔔 Order Updates Paaye</p>
          <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Order confirm hone par, delivery ke time aur deliver hone par notification milegi
          </p>
          <div className="flex gap-2">
            <button onClick={handleAllow} className="sku-btn sku-btn-sm flex-1">
              Allow Karo
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors"
              style={{
                background: 'var(--surface-inset)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
              Abhi Nahi
            </button>
          </div>
        </div>

        <button onClick={handleDismiss} className="p-1 shrink-0 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <FiX size={16} />
        </button>
      </div>
    </div>
  )
}
