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
    // Registra o SW e aguarda ficar ativo
    await navigator.serviceWorker.register('/sw.js')
    const reg = await navigator.serviceWorker.ready

    // Reporta o estado atual de permissão ao servidor (sempre, antes de qualquer decisão)
    const currentPermission = Notification.permission
    api.post('/push/permissao', { permissao: currentPermission }).catch(() => {})

    if (currentPermission === 'denied') return

    const permission = currentPermission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()

    // Reporta novamente se mudou (ex.: usuário acabou de conceder ou negar)
    if (permission !== currentPermission) {
      api.post('/push/permissao', { permissao: permission }).catch(() => {})
    }

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
