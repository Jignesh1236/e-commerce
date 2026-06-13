import { useState, useEffect } from 'react'
import { FiBell, FiX } from 'react-icons/fi'
import { usePushNotification } from '../hooks/usePushNotification'
import { useUser } from '../context/UserContext'

export default function NotificationPrompt() {
  const { user } = useUser()
  const { permission, subscribed, subscribe } = usePushNotification(user?._id)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!user || permission !== 'default' || subscribed) return
    if (sessionStorage.getItem('notifDismissed')) return
    const t = setTimeout(() => setShow(true), 5000)
    return () => clearTimeout(t)
  }, [user, permission, subscribed])

  const handleAllow = async () => {
    await subscribe()
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('notifDismissed', '1')
  }

  if (!show || !('Notification' in window)) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="sku-card p-4 flex items-start gap-3" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(45,122,45,0.1)', color: 'var(--primary)' }}>
          <FiBell size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5">Order Notifications</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Get notified when your order is confirmed, shipped, and delivered</p>
          <div className="flex gap-2">
            <button onClick={handleAllow} className="sku-btn sku-btn-sm flex-1">Allow</button>
            <button onClick={handleDismiss} className="sku-btn-outline sku-btn-sm flex-1" style={{ fontSize: 13, padding: '6px 14px' }}>Not now</button>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 shrink-0" style={{ color: 'var(--text-muted)' }}>
          <FiX size={16} />
        </button>
      </div>
    </div>
  )
}
