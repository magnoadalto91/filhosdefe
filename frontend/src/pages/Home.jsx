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
      <div style={{
        position: 'relative',
        minHeight: 'clamp(340px, 55vh, 580px)',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1c1c2e 0%, #2c2230 50%, #1c2c2e 100%)',
        overflow: 'hidden',
      }}>
        {/* Decoração geométrica */}
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,43,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,43,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,151,43,0.06) 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 24px', width: '100%' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: '#c8972b', backgroundColor: 'rgba(200,151,43,0.15)', padding: '5px 16px', borderRadius: 20, marginBottom: 20 }}>
            Bem-vindo ao Terreiro
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, maxWidth: 600, marginBottom: 18, margin: '0 0 18px' }}>
            A Umbanda: uma<br/>religião de amor e paz
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'rgba(255,255,255,0.75)', maxWidth: 480, lineHeight: 1.75, marginBottom: 32 }}>
            Conecte-se às entidades, aprenda sobre ervas sagradas e acompanhe nossas giras espirituais.
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
