import { useState } from 'react'
import { Share2, MoreVertical, Smartphone, Download, Home, Monitor } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInstallPrompt, clearInstallPrompt, isPWA } from '../lib/pwaInstall'

const ua = navigator.userAgent
const IS_IOS     = /iPad|iPhone|iPod/.test(ua)
const IS_ANDROID = /Android/.test(ua)
const IS_MOBILE  = IS_IOS || IS_ANDROID

/* ── Número do passo ───────────────────────── */
function StepNum({ n }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#c8972b', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {n}
    </div>
  )
}

/* ── Linha de passo ───────────────────────── */
function Step({ n, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
      <StepNum n={n}/>
      <div style={{ fontSize: 13, color: '#2c2c3e', lineHeight: 1.6, paddingTop: 2 }}>{children}</div>
    </div>
  )
}

/* ── Texto em destaque ────────────────────── */
function Tag({ children }) {
  return (
    <strong style={{ backgroundColor: '#f0ece5', borderRadius: 4, padding: '1px 6px', fontWeight: 700, color: '#2c2c3e' }}>
      {children}
    </strong>
  )
}

/* ── Aviso: procure o ícone ───────────────── */
function HomeHint() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: 'rgba(200,151,43,0.08)', border: '1px solid rgba(200,151,43,0.25)', borderRadius: 8, padding: '11px 14px', marginBottom: 18 }}>
      <Home size={15} color="#c8972b" style={{ flexShrink: 0 }}/>
      <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
        Após instalar, <strong style={{ color: '#2c2c3e' }}>abra sempre pelo ícone do app</strong> na tela inicial — não pelo navegador.
      </span>
    </div>
  )
}

/* ── iOS ──────────────────────────────────── */
function IOSSteps() {
  return (
    <div style={{ backgroundColor: '#f8f5f0', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Smartphone size={15} color="#c8972b"/>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
          Instalar no iPhone / iPad (Safari)
        </span>
      </div>
      <Step n={1}>
        Abra esta página no <Tag>Safari</Tag> — não funciona no Chrome do iOS
      </Step>
      <Step n={2}>
        Toque no ícone <Share2 size={13} style={{ display:'inline', verticalAlign:'middle', color:'#2563eb' }}/> <Tag>Compartilhar</Tag> na barra inferior do Safari
      </Step>
      <Step n={3}>
        Role a lista e toque em <Tag>Adicionar à Tela de Início</Tag>
      </Step>
      <Step n={4}>
        Toque em <Tag>Adicionar</Tag> no canto superior direito para confirmar
      </Step>
    </div>
  )
}

/* ── Android ──────────────────────────────── */
function AndroidSteps({ onInstall, prompted }) {
  const prompt = getInstallPrompt()
  return (
    <div>
      {prompt && !prompted ? (
        <button onClick={onInstall}
          style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', backgroundColor: '#c8972b', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}>
          <Download size={16}/> Instalar aplicativo
        </button>
      ) : (
        <div style={{ backgroundColor: '#f8f5f0', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Smartphone size={15} color="#c8972b"/>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
              Instalar no Android (Chrome)
            </span>
          </div>
          <Step n={1}>
            Toque no menu <MoreVertical size={13} style={{ display:'inline', verticalAlign:'middle' }}/> nos <Tag>três pontos</Tag> no canto superior direito
          </Step>
          <Step n={2}>
            Selecione <Tag>Adicionar à tela inicial</Tag> ou <Tag>Instalar aplicativo</Tag>
          </Step>
          <Step n={3}>
            Toque em <Tag>Instalar</Tag> para confirmar
          </Step>
        </div>
      )}
    </div>
  )
}

/* ── Desktop ──────────────────────────────── */
function DesktopMessage() {
  return (
    <div>
      {/* Opção 1: instalar no Chrome do computador */}
      <div style={{ backgroundColor: '#f8f5f0', borderRadius: 10, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Monitor size={15} color="#c8972b"/>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
            Opção 1 — Instalar no computador (Chrome)
          </span>
        </div>
        <Step n={1}>
          Abra esta página no <Tag>Google Chrome</Tag> ou <Tag>Microsoft Edge</Tag>
        </Step>
        <Step n={2}>
          Clique no ícone <Download size={13} style={{ display:'inline', verticalAlign:'middle' }}/> que aparece no <Tag>canto direito da barra de endereço</Tag>
        </Step>
        <Step n={3}>
          Clique em <Tag>Instalar</Tag> e confirme — o app abrirá como janela própria
        </Step>
      </div>

      {/* Opção 2: usar no celular */}
      <div style={{ backgroundColor: '#f8f5f0', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Smartphone size={15} color="#c8972b"/>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
            Opção 2 — Instalar no celular (recomendado)
          </span>
        </div>
        <Step n={1}>
          Abra este mesmo link no <Tag>Chrome</Tag> (Android) ou <Tag>Safari</Tag> (iPhone)
        </Step>
        <Step n={2}>
          Siga os passos para <Tag>Adicionar à tela inicial</Tag>
        </Step>
        <Step n={3}>
          Abra o app pelo ícone instalado — não pelo navegador
        </Step>
      </div>
    </div>
  )
}

/* ── Guard principal ──────────────────────── */
export default function PWAGuard({ children }) {
  const { isAdmin } = useAuth()
  const [prompted, setPrompted] = useState(false)

  if (import.meta.env.DEV || isAdmin || isPWA()) return children

  const handleInstall = async () => {
    const prompt = getInstallPrompt()
    if (!prompt) { setPrompted(true); return }
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    clearInstallPrompt()
    if (outcome === 'accepted') window.location.reload()
    else setPrompted(true)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,15,38,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: "'Poppins',sans-serif", overflowY: 'auto' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, maxWidth: 420, width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', margin: 'auto' }}>

        {/* Cabeçalho */}
        <div style={{ backgroundColor: '#1a1a3a', padding: '28px 28px 22px', textAlign: 'center' }}>
          <img src="/logo.png" alt="" style={{ width: 48, height: 'auto', marginBottom: 10 }}/>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: '#c8972b', marginBottom: 6 }}>
            Filhos de Fé
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            Instale o aplicativo
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            O acesso é permitido apenas pelo app instalado
          </p>
        </div>

        {/* Corpo */}
        <div style={{ padding: '22px 24px 26px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280', lineHeight: 1.7, textAlign: 'center' }}>
            Para usar todas as funcionalidades e receber notificações das Giras, instale o app seguindo os passos abaixo.
          </p>

          <HomeHint/>

          {IS_IOS     && <IOSSteps/>}
          {IS_ANDROID && <AndroidSteps onInstall={handleInstall} prompted={prompted}/>}
          {!IS_MOBILE && <DesktopMessage/>}
        </div>
      </div>
    </div>
  )
}
