import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

/* ─── picsum helpers ─────────────────────────────────────── */
const PIC = (seed, w = 1600, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

/* ─── Hero slides ────────────────────────────────────────── */
const SLIDES = [
  {
    img: PIC('umbanda1', 1600, 700),
    tag: 'Bem-vindo ao Terreiro',
    title: 'A Umbanda: uma\nreligião de amor e paz',
    sub: 'Conecte-se às entidades, aprenda sobre ervas sagradas e acompanhe nossas giras espirituais.',
    cta: { label: 'Comece aqui', to: '/aprenda' },
  },
  {
    img: PIC('prayer42', 1600, 700),
    tag: 'Próximas Giras',
    title: 'Orações para cada\nnecessidade e momento',
    sub: 'Acompanhe o calendário de giras e fique por dentro de todas as atividades do terreiro.',
    cta: { label: 'Ver calendário', to: '/calendario' },
  },
  {
    img: PIC('spiritual7', 1600, 700),
    tag: 'Conhecimento Sagrado',
    title: 'Ervas, entidades\ne pontos cantados',
    sub: 'Um acervo completo de conhecimento sobre a tradição umbandista ao seu alcance.',
    cta: { label: 'Explorar', to: '/aprenda' },
  },
]

/* ─── Participate cards ──────────────────────────────────── */
const CARDS = [
  { img: PIC('entity33', 800, 600), title: 'Orixás / Entidades', to: '/aprenda' },
  { img: PIC('herbs77', 800, 600),  title: 'Ervas Sagradas', to: '/aprenda' },
  { img: PIC('music88', 800, 600),  title: 'Pontos Cantados', to: '/aprenda' },
  { img: PIC('ritual55', 800, 600), title: 'Giras', to: '/calendario' },
]

/* ─── Services ───────────────────────────────────────────── */
const SERVICES = [
  {
    img: PIC('bible10', 800, 500),
    title: 'Pontos Cantados',
    desc: 'Biblioteca completa com letras e links do YouTube para os principais pontos da Umbanda sagrada.',
    to: '/aprenda',
  },
  {
    img: PIC('calendar20', 800, 500),
    title: 'Calendário de Giras',
    desc: 'Acompanhe todas as giras do terreiro, veja quais entidades serão chamadas e o que preparar.',
    to: '/calendario',
  },
  {
    img: PIC('garden30', 800, 500),
    title: 'Ervas do Terreiro',
    desc: 'Conheça as ervas medicinais e espirituais, incluindo as cultivadas no nosso próprio quintal.',
    to: '/aprenda',
  },
]


/* ─── SectionHeader ──────────────────────────────────────── */
function SectionHeader({ label, title, sub, center = true }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 48 }}>
      <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b', marginBottom: 8 }}>
        {label}
      </span>
      <h2 style={{ fontSize: 34, fontWeight: 800, color: '#2c2c3e', lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontSize: 15, color: '#6b7280', marginTop: 12, maxWidth: 520, margin: '12px auto 0' }}>{sub}</p>}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────── */
export default function Home() {
  const S = { fontFamily: "'Poppins', sans-serif" }

  return (
    <div style={S}>

      {/* ───────────────── 1. HERO SLIDER ────────────────── */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation loop
        style={{ width: '100%' }}
      >
        {SLIDES.map((sl, i) => (
          <SwiperSlide key={i}>
            <div style={{ position: 'relative', minHeight: 'clamp(360px, 58vh, 620px)', display: 'flex', alignItems: 'center' }}>
              {/* Imagem de fundo via <img> — funciona em iOS/Android */}
              <img src={sl.img} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,46,0.62)' }} />
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 24px', width: '100%' }}>
                <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b', backgroundColor: 'rgba(200,151,43,0.18)', padding: '4px 14px', borderRadius: 20, marginBottom: 16 }}>
                  {sl.tag}
                </span>
                <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, whiteSpace: 'pre-line', maxWidth: 600, marginBottom: 16 }}>
                  {sl.title}
                </h1>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', maxWidth: 500, lineHeight: 1.7, marginBottom: 28 }}>
                  {sl.sub}
                </p>
                <Link to={sl.cta.to}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 4, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
                >
                  {sl.cta.label} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ───────────────── 2. PARTICIPATE CARDS ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }} className="participate-grid">
        <style>{`@media (min-width: 768px) { .participate-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
        {CARDS.map(({ img, title, to }) => (
          <Link key={title} to={to} className="part-card" style={{ position: 'relative', overflow: 'hidden', display: 'block', textDecoration: 'none' }}>
            <style>{`.part-card { aspect-ratio: 1/1; } @media (min-width: 768px) { .part-card { aspect-ratio: 3/4; } }`}</style>
            {/* <img> é mais confiável que background-image no iOS */}
            <img src={img} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,46,0.55)', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,151,43,0.68)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,28,46,0.55)'}
            />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>{title}</span>
              <span style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff', border: '1px solid rgba(255,255,255,0.7)', padding: '6px 16px', borderRadius: 2 }}>
                Ver mais <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ───────────────── 3. SERVICES ───────────────────── */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <SectionHeader label="Nosso Conteúdo" title="Tudo que você precisa saber" sub="Acesse o conhecimento ancestral da Umbanda organizado para facilitar seu aprendizado e devoção." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 28 }} className="services-grid">
            <style>{`@media (min-width: 640px) { .services-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (min-width: 1024px) { .services-grid { grid-template-columns: repeat(3, 1fr) !important; } }`}</style>
            {SERVICES.map(({ img, title, desc, to }) => (
              <Link key={title} to={to} style={{ display: 'block', textDecoration: 'none', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e0d8', transition: 'box-shadow 0.25s, transform 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.14)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ aspectRatio: '16/10', overflow: 'hidden', backgroundColor: '#f8f5f0' }}>
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2c2c3e', marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>{desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#c8972b' }}>
                    Saiba mais <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
