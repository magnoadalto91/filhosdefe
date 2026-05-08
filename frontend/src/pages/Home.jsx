import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

/* ─── Participate cards ──────────────────────────────────── */
const CARDS = [
  { title: 'Orixás / Entidades', to: '/aprenda', bg: '#2c2c3e' },
  { title: 'Ervas Sagradas',     to: '/aprenda', bg: '#1a3a2a' },
  { title: 'Pontos Cantados',    to: '/aprenda', bg: '#3a2a1a' },
  { title: 'Giras',              to: '/calendario', bg: '#1a1a3a' },
]

/* ─── Main ───────────────────────────────────────────────── */
export default function Home() {

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ───────────────── HERO ──────────────────────────── */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e0d8' }}>
        <div className="hero-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,7vw,72px) 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
          <style>{`@media(min-width:768px){.hero-inner{justify-content:space-between!important;}}.hero-logo{width:clamp(160px,28vw,260px);flex-shrink:0;}`}</style>

          {/* Logo */}
          <img src="/logo.png" alt="Filhos de Fé" className="hero-logo"
            style={{ display: 'block' }}/>

          {/* Texto */}
          <div style={{ textAlign: 'center' }} className="hero-text">
            <style>{`@media(min-width:768px){.hero-text{text-align:left!important;}}`}</style>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: '#c8972b', display: 'block', marginBottom: 14 }}>
              Bem-vindo ao Terreiro
            </span>
            <h1 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 800, color: '#2c2c3e', lineHeight: 1.2, margin: '0 0 16px' }}>
              Filhos de Fé
            </h1>
            <p style={{ fontSize: 'clamp(14px,1.8vw,16px)', color: '#6b7280', lineHeight: 1.75, maxWidth: 420, margin: '0 0 28px' }}>
              Umbanda com amor e devoção. Conecte-se às entidades, aprenda sobre ervas sagradas e acompanhe nossas giras espirituais.
            </p>
            <Link to="/aprenda"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 4, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
            >
              Comece aqui <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ───────────────── CARDS ─────────────────────────── */}
      <div className="participate-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <style>{`@media (min-width: 768px) { .participate-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
        {CARDS.map(({ title, to, bg }) => (
          <Link key={title} to={to}
            style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1', textDecoration: 'none', backgroundColor: bg, transition: 'filter 0.2s' }}
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
