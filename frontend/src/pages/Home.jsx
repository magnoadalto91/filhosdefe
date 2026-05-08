import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

/* ─── Participate cards ──────────────────────────────────── */
const CARDS = [
  { title: 'Orixás / Entidades', to: '/aprenda?tab=entidades', bg: '#2c2c3e' },
  { title: 'Ervas Sagradas',     to: '/aprenda?tab=ervas',     bg: '#1a3a2a' },
  { title: 'Pontos Cantados',    to: '/aprenda?tab=musicas',   bg: '#3a2a1a' },
  { title: 'Giras',              to: '/calendario',             bg: '#1a1a3a' },
]

/* ─── Main ───────────────────────────────────────────────── */
export default function Home() {

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a3a' }}>

      {/* ───────────────── HERO ──────────────────────────── */}
      <div style={{ position: 'relative', minHeight: 'clamp(280px, 42vh, 440px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Imagem de fundo */}
        <img src="/fundo.png" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        {/* Overlay branco translúcido */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.50)' }}/>

        {/* Caixa de texto com borda dourada arredondada */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          padding: 'clamp(20px,4vw,36px) clamp(24px,6vw,52px)',
          margin: '20px 24px',
          border: '2px solid #c8972b',
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 0 0 5px rgba(200,151,43,0.14), 0 8px 32px rgba(0,0,0,0.1)',
          maxWidth: 440,
        }}>
          <img src="/logo.png" alt="Filhos de Fé"
            style={{ width: 'clamp(64px,14vw,96px)', height: 'auto', marginBottom: 14 }}/>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: '#c8972b', marginBottom: 8, display: 'block' }}>
            Bem-vindo ao Terreiro
          </span>
          <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, color: '#2c2c3e', lineHeight: 1.2, margin: '0 0 8px' }}>
            Filhos de Fé
          </h1>
          <p style={{ fontSize: 'clamp(12px,1.8vw,14px)', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
            Umbanda com amor e devoção
          </p>
        </div>
      </div>

      {/* ───────────────── CARDS ─────────────────────────── */}
      <div className="participate-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', flex: 1, gridAutoRows: '1fr' }}>
        <style>{`@media (min-width: 768px) { .participate-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
        {CARDS.map(({ title, to, bg }) => (
          <Link key={title} to={to}
            style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', backgroundColor: bg, transition: 'filter 0.2s', minHeight: 140 }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(200,151,43,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 24 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', lineHeight: 1.3, display: 'block', marginBottom: 12 }}>{title}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.4)', padding: '5px 14px', borderRadius: 2 }}>
                Ver mais <ArrowRight size={11} />
              </span>
            </div>
          </Link>
        ))}
      </div>


    </div>
  )
}
