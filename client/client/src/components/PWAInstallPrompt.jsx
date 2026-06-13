import { useState, useEffect } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwaDismissed')
    if (dismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    setShow(false)
    sessionStorage.setItem('pwaDismissed', '1')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="sku-card p-4 flex items-center gap-3" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'var(--primary)', color: 'white' }}>🛒</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install App</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add to home screen for quick access</p>
        </div>
        <button onClick={install} className="sku-btn sku-btn-sm shrink-0">
          <FiDownload size={14} /> Install
        </button>
        <button onClick={dismiss} className="p-1" style={{ color: 'var(--text-muted)' }}>
          <FiX size={18} />
        </button>
      </div>
    </div>
  )
}
