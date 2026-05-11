let _prompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _prompt = e
})

export const getInstallPrompt   = () => _prompt
export const clearInstallPrompt = () => { _prompt = null }

export const isPWA = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  !!window.navigator.standalone
