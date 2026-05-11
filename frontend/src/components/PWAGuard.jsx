import { useState } from 'react'
import { Share2, Plus, MoreVertical, Smartphone, CheckCircle, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInstallPrompt, clearInstallPrompt, isPWA } from '../lib/pwaInstall'

const ua = navigator.userAgent
const IS_IOS     = /iPad|iPhone|iPod/.test(ua)
const IS_ANDROID = /Android/.test(ua)

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

/* ── Instrução de destaque ────────────────── */
function Tag({ children }) {
  return (
    <strong style={{ backgroundColor: '#f8f5f0', borderRadius: 4, padding: '1px 6px', fontWeight: 700, color: '#2c2c3e' }}>
      {children}
    </strong>
  )
}

/* ── iOS ──────────────────────────────────── */
function IOSSteps() {
  return (
    <div style={{ backgroundColor: '#f8f5f0', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Smartphone size={15} color="#c8972b"/>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8972b' }}>
          Passos no Safari (iOS)
        </span>
      </div>
      <Step n={1}>
        Abra esta página no <Tag>Safari</Tag> (não no Chrome)
      </Step>
      <Step n={2}>
        Toque no botão <Share2 size={13} style={{ display:'inline', verticalAlign:'middle', color:'#2563eb' }}/> <Tag>Compartilhar</Tag> na barra inferior
      </Step>
      <Step n={3}>
        Role para baixo e toque em <Tag>Adicionar à Tela de Início</Tag>
      </Step>
      <Step n={4}>
        Confirme tocando em <Tag>Adicionar</Tag> no canto superior direito
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
              Passos no Chrome (Android)
            </span>
          </div>
          <Step n={1}>
            Toque no menu <MoreVertical size={13} style={{ display:'inline', verticalAlign:'middle' }}/> no canto superior direito do Chrome
          </Step>
          <Step n={2}>
            Selecione <Tag>Adicionar à tela inicial</Tag> ou <Tag>Instalar aplicativo</Tag>
          </Step>
          <Step n={3}>
            Confirme tocando em <Tag>Instalar</Tag>
          </Step>
        </div>
      )}
    </div>
  )
}

/* ── Desktop ──────────────────────────────── */
function DesktopMessage() {
  return (
    <div style={{ backgroundColor: '#f8f5f0', borderRadius: 10, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
      <Smartphone size={32} color="#e5e0d8" style={{ marginBottom: 12 }}/>
      <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
        Este aplicativo é projetado para <strong>dispositivos móveis</strong>.<br/>
        Acesse pelo <strong>Chrome</strong> (Android) ou <strong>Safari</strong> (iPhone) e instale na tela inicial.
      </p>
    </div>
  )
}

/* ── Guard principal ──────────────────────── */
export default function PWAGuard({ children }) {
  const { user, isAdmin } = useAuth()
  const [prompted,       setPrompted]       = useState(false)
  const [showAfterMsg,   setShowAfterMsg]   = useState(false)

  // Dev, admin ou já rodando como PWA → libera direto
  if (import.meta.env.DEV || !user || isAdmin || isPWA()) return children

  const handleInstall = async () => {
    const prompt = getInstallPrompt()
    if (!prompt) { setPrompted(true); return }
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    clearInstallPrompt()
    if (outcome === 'accepted') setShowAfterMsg(true)
    else setPrompted(true)
  }

  const handleAlreadyInstalled = () => setShowAfterMsg(true)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,15,38,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, maxWidth: 420, width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

        {/* Cabeçalho */}
        <div style={{ backgroundColor: '#1a1a3a', padding: '28px 28px 22px', textAlign: 'center' }}>
          <img src="/logo.png" alt="" style={{ width: 48, height: 'auto', marginBottom: 10 }}/>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: '#c8972b', marginBottom: 6 }}>
            Filhos de Fé
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            {showAfterMsg ? 'Quase lá!' : 'Instale o aplicativo'}
          </h2>
        </div>

        {/* Corpo */}
        <div style={{ padding: '24px 24px 28px' }}>
          {showAfterMsg ? (
            /* Mensagem pós-instalação */
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={52} color="#c8972b" style={{ marginBottom: 14 }}/>
              <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#2c2c3e' }}>
                App instalado!
              </p>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                Feche este navegador e abra o <strong>Filhos de Fé</strong> pelo ícone na sua tela inicial para continuar.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#f8f5f0', borderRadius: 8, padding: '12px 16px' }}>
                <Plus size={16} color="#c8972b" style={{ flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: '#6b7280', textAlign: 'left' }}>
                  Procure o ícone do app na tela inicial do seu celular
                </span>
              </div>
            </div>
          ) : (
            /* Instruções de instalação */
            <>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: '#6b7280', lineHeight: 1.7, textAlign: 'center' }}>
                Para receber notificações e usar todas as funcionalidades, é necessário instalar o app no seu celular.
              </p>

              {IS_IOS     && <IOSSteps/>}
              {IS_ANDROID && <AndroidSteps onInstall={handleInstall} prompted={prompted}/>}
              {!IS_IOS && !IS_ANDROID && <DesktopMessage/>}

              <button onClick={handleAlreadyInstalled}
                style={{ width: '100%', padding: '11px', borderRadius: 8, border: '1px solid #e5e0d8', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2c2c3e'; e.currentTarget.style.color = '#2c2c3e' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e0d8'; e.currentTarget.style.color = '#9ca3af' }}>
                Já instalei — abrir pelo ícone
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
