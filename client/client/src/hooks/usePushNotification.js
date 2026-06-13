import { useState, useEffect } from 'react'
import api from '../utils/api'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotification(userId) {
  const [permission, setPermission] = useState(Notification.permission)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!userId) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription()
      if (existing) setSubscribed(true)
    }).catch(() => {})
  }, [userId])

  const subscribe = async () => {
    if (!userId) return false
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return false

      const keyRes = await api.get('/push/vapid-key')
      const vapidKey = keyRes.data.publicKey
      if (!vapidKey) return false

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      await api.post('/push/subscribe', { userId, subscription })
      setSubscribed(true)
      return true
    } catch (err) {
      console.error('Push subscribe error:', err)
      return false
    }
  }

  const unsubscribe = async () => {
    if (!userId) return
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) await subscription.unsubscribe()
      await api.delete('/push/unsubscribe', { data: { userId } })
      setSubscribed(false)
    } catch (err) {
      console.error('Push unsubscribe error:', err)
    }
  }

  return { permission, subscribed, subscribe, unsubscribe }
}
