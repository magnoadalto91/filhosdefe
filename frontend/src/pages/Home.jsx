import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Users, Leaf, Music, Calendar, ArrowRight, Star, BookOpen, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

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
  { img: PIC('entity33', 800, 600), label: 'Participe', title: 'Entidades', to: '/aprenda' },
  { img: PIC('herbs77', 800, 600),  label: 'Participe', title: 'Ervas Sagradas', to: '/aprenda' },
  { img: PIC('music88', 800, 600),  label: 'Participe', title: 'Pontos Cantados', to: '/aprenda' },
  { img: PIC('ritual55', 800, 600), label: 'Participe', title: 'Giras', to: '/calendario' },
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

/* ─── Stats ──────────────────────────────────────────────── */
const STATS = [
  { value: '40+', label: 'Entidades' },
  { value: '100+', label: 'Ervas Sagradas' },
  { value: '200+', label: 'Pontos Cantados' },
  { value: '12+', label: 'Anos de Tradição' },
]

/* ─── FAQs ───────────────────────────────────────────────── */
const FAQS = [
  { q: 'O que é a Umbanda?', a: 'A Umbanda é uma religião brasileira que integra influências do candomblé africano, do espiritismo kardecista, do catolicismo e das tradições indígenas. É uma religião de amor, caridade e fé.' },
  { q: 'O que é uma Gira?', a: 'Gira é a cerimônia religiosa da Umbanda onde os médiuns incorporam entidades espirituais como Pretos-Velhos, Caboclos e Exus para prestar assistência espiritual à comunidade.' },
  { q: 'Como participar das giras?', a: 'Qualquer pessoa pode participar como assistente. Basta se vestir com roupas brancas e chegar com respeito e abertura. Consulte o calendário para saber as datas e horários.' },
  { q: 'O que são os pontos cantados?', a: 'Pontos cantados são músicas sagradas que invocam e saúdam as entidades espirituais durante as giras. Cada entidade possui seus próprios pontos e melodias característicos.' },
]

/* ─── FaqItem ────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid #e5e0d8', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 20px', background: open ? '#f8f5f0' : '#fff', cursor: 'pointer', border: 'none', textAlign: 'left', fontFamily: "'Poppins', sans-serif" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#2c2c3e' }}>{q}</span>
        {open
          ? <ChevronUp size={18} style={{ color: '#c8972b', flexShrink: 0 }} />
          : <ChevronDown size={18} style={{ color: '#6b7280', flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', background: '#f8f5f0' }}>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

/* ─── GiraCard ───────────────────────────────────────────── */
function GiraCard({ gira }) {
  const date = new Date(gira.data)
  const day   = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e0d8', display: 'flex', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.14)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
    >
      <div style={{ backgroundColor: '#c8972b', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', minWidth: 72 }}>
        <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{day}</span>
        <span style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{month}</span>
      </div>
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#2c2c3e', marginBottom: 4 }}>{gira.titulo}</div>
        {gira.entidades?.length > 0 && (
          <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} style={{ color: '#c8972b' }} />
            {gira.entidades.slice(0, 3).map(e => e.nome).join(', ')}
            {gira.entidades.length > 3 && ` +${gira.entidades.length - 3}`}
          </div>
        )}
        {gira.instrucoes && (
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {gira.instrucoes}
          </p>
        )}
      </div>
    </div>
  )
}

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
  const [giras, setGiras]         = useState([])
  const [entidades, setEntidades] = useState([])
  const [loadingG, setLoadingG]   = useState(true)
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    api.get('/giras').then(r => setGiras(Array.isArray(r.data) ? r.data.slice(0, 3) : [])).catch(() => {}).finally(() => setLoadingG(false))
    api.get('/entidades').then(r => setEntidades(Array.isArray(r.data) ? r.data.slice(0, 8) : [])).catch(() => {})
  }, [])

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
            <div style={{
              position: 'relative',
              minHeight: 'clamp(360px, 58vh, 620px)',
              backgroundImage: `url(${sl.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
            }}>
              {/* dark overlay */}
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
        {CARDS.map(({ img, label, title, to }) => (
          <Link key={title} to={to} style={{ position: 'relative', overflow: 'hidden', display: 'block', minHeight: 220, textDecoration: 'none' }} className="part-card">
            <style>{`.part-card { min-height: 220px; } @media (min-width: 768px) { .part-card { min-height: 300px; } }`}</style>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.4s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,46,0.60)', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,151,43,0.70)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,28,46,0.60)'}
            />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center', minHeight: 'inherit' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>{label}</span>
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

      {/* ───────────────── 4. ABOUT BANNER ───────────────── */}
      <section style={{ position: 'relative', padding: '80px 0', backgroundImage: `url(${PIC('faith100', 1600, 700)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,46,0.72)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center' }} className="about-grid">
          <style>{`@media (min-width: 768px) { .about-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b', display: 'block', marginBottom: 12 }}>Nossa Missão</span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: 20 }}>
              Compartilhando fé e amor com a comunidade
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.80)', lineHeight: 1.8, marginBottom: 24 }}>
              O Terreiro Filhos de Fé é um espaço de acolhimento, aprendizado e conexão espiritual. Nossa missão é preservar as tradições da Umbanda e transmitir conhecimento às novas gerações com amor e caridade.
            </p>
            <Link to="/aprenda"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 4, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#c8972b', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a67a20'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c8972b'}
            >
              Conhecer mais <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            {[
              'Preservação das tradições umbandistas',
              'Aprendizado das ervas sagradas e medicinais',
              'Conhecimento das entidades e seus ensinamentos',
              'Comunidade unida pela fé e pela caridade',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <Star size={16} style={{ color: '#c8972b', flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── 5. UPCOMING GIRAS ─────────────── */}
      <section style={{ backgroundColor: '#f8f5f0', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }} className="giras-header">
            <style>{`@media (min-width: 640px) { .giras-header { flex-direction: row !important; align-items: flex-end; justify-content: space-between; } }`}</style>
            <div>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#c8972b', marginBottom: 8 }}>Agenda</span>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: '#2c2c3e' }}>Próximas Giras</h2>
            </div>
            <Link to="/calendario" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#c8972b', textDecoration: 'none' }}>
              Ver calendário <ArrowRight size={14} />
            </Link>
          </div>
          {loadingG ? <LoadingSpinner /> : giras.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 20 }} className="giras-grid">
              <style>{`@media (min-width: 640px) { .giras-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (min-width: 1024px) { .giras-grid { grid-template-columns: repeat(3, 1fr) !important; } }`}</style>
              {giras.map(g => <GiraCard key={g.id} gira={g} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Nenhuma gira programada em breve.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────── 6. STATS ──────────────────────── */}
      <section style={{ backgroundColor: '#ffffff', padding: '72px 0', borderTop: '1px solid #e5e0d8', borderBottom: '1px solid #e5e0d8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, textAlign: 'center' }} className="stats-grid">
          <style>{`@media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 800, color: '#c8972b', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── 7. ENTITIES GRID ─────────────── */}
      {entidades.length > 0 && (
        <section style={{ backgroundColor: '#f8f5f0', padding: '80px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <SectionHeader label="Entidades" title="Guias Espirituais do Terreiro" sub="Conheça as entidades que trabalham em nosso terreiro, suas histórias e ensinamentos sagrados." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="entities-grid">
              <style>{`@media (min-width: 640px) { .entities-grid { grid-template-columns: repeat(3, 1fr) !important; } } @media (min-width: 1024px) { .entities-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
              {entidades.map(e => (
                <button key={e.id} onClick={() => setSelected(e)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e0d8', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', fontFamily: "'Poppins', sans-serif" }}
                  onMouseEnter={el => { el.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.14)'; el.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={el => { el.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; el.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#f8f5f0', overflow: 'hidden' }}>
                    {e.fotoUrl
                      ? <img src={e.fotoUrl} alt={e.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={40} style={{ color: '#e5e0d8' }} />
                        </div>
                    }
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 10px', background: 'linear-gradient(transparent, rgba(44,44,62,0.88))' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{e.nome}</div>
                    </div>
                  </div>
                  {e.saudacao && (
                    <div style={{ padding: '8px 12px 10px' }}>
                      <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{e.saudacao}"</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <Link to="/aprenda"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 32px', borderRadius: 4, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', border: '2px solid #c8972b', color: '#c8972b', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#c8972b'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#c8972b' }}
              >
                Ver todas as entidades <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ───────────────── 8. FAQ ────────────────────────── */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <SectionHeader label="Dúvidas" title="Perguntas Frequentes" sub="Encontre respostas para as dúvidas mais comuns sobre a Umbanda e nosso terreiro." />
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── Entity modal ──────────────────────────────────── */}
      {selected && (
        <Modal isOpen title={selected.nome} onClose={() => setSelected(null)}>
          {selected.fotoUrl && <img src={selected.fotoUrl} alt={selected.nome} style={{ width: '100%', borderRadius: 4, marginBottom: 16, objectFit: 'cover', maxHeight: 220, display: 'block' }} />}
          {selected.saudacao && (
            <div style={{ padding: '10px 14px', borderRadius: 4, marginBottom: 14, fontStyle: 'italic', fontSize: 14, backgroundColor: 'rgba(200,151,43,0.08)', border: '1px solid rgba(200,151,43,0.2)', color: '#c8972b' }}>
              "{selected.saudacao}"
            </div>
          )}
          {selected.coresVelas && <p style={{ fontSize: 14, color: '#2c2c3e', marginBottom: 12 }}><strong>Cores das velas:</strong> {selected.coresVelas}</p>}
          {selected.historia && <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selected.historia}</p>}
        </Modal>
      )}
    </div>
  )
}
