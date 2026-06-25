import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/pwaInstall.js'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  // Registra o SW em todo carregamento — não só ao habilitar push.
  // Quando o SW muda (novo deploy injeta timestamp diferente), o browser
  // detecta, instala o novo SW, e o controllerchange recarrega a página.
  navigator.serviceWorker.register('/sw.js').catch(() => {})

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
