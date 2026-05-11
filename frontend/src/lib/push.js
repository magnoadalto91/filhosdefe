import api from '../api/axios'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export async function registerPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    const reg = await navigator.serviceWorker.register('/sw.js')

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const { data } = await api.get('/push/vapid-public-key')
    const applicationServerKey = urlBase64ToUint8Array(data.key)

    const existing = await reg.pushManager.getSubscription()
    const sub = existing ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })

    await api.post('/push/subscribe', sub.toJSON())
  } catch (err) {
    console.warn('[push] registro falhou:', err.message)
  }
}

export async function unregisterPush() {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } })
    await sub.unsubscribe()
  } catch (err) {
    console.warn('[push] cancelamento falhou:', err.message)
  }
}
