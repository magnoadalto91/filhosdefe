import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Users, Leaf, Music, Calendar, ChevronRight, Star,
  BookOpen, Flame, ArrowRight, Play, ChevronDown, ChevronUp
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

/* ─── Hero slides data ───────────────────────────────────── */
const HERO_SLIDES = [
  {
    gradient: 'linear-gradient(135deg, #1A0040 0%, #0D0818 50%, #1A1030 100%)',
    accent: '#D4AF37',
    tag: 'Bem-vindo ao Terreiro',
    title: 'Umbanda: uma religião\nde amor e fé',
    sub: 'Conecte-se às entidades, aprenda sobre ervas sagradas e acompanhe nossas giras.',
    cta: { label: 'Comece aqui', to: '/aprenda' },
  },
  {
    gradient: 'linear-gradient(135deg, #0D0818 0%, #12092B 50%, #1A0040 100%)',
    accent: '#7C3AED',
    tag: 'Próximas Giras',
    title: 'Orações para cada\nnecessidade',
    sub: 'Acompanhe o calendário de giras e fique por dentro das atividades do terreiro.',
    cta: { label: 'Ver calendário', to: '/calendario' },
  },
  {
    gradient: 'linear-gradient(135deg, #12092B 0%, #0D0818 50%, #1A1030 100%)',
    accent: '#059669',
    tag: 'Conhecimento Sagrado',
    title: 'Ervas, entidades\ne pontos cantados',
    sub: 'Um acervo completo de conhecimento sobre a tradição umbandista.',
    cta: { label: 'Explorar', to: '/aprenda' },
  },
]

/* ─── Participate cards ──────────────────────────────────── */
const PARTICIPATE = [
  {
    icon: Users,
    title: 'Entidades',
    desc: 'Conheça as entidades da Umbanda, suas histórias e saudações.',
    to: '/aprenda',
    color: '#7C3AED',
    bg: 'linear-gradient(160deg, #1A0040, #12092B)',
  },
  {
    icon: Leaf,
    title: 'Ervas Sagradas',
    desc: 'Descubra as propriedades das ervas e seus usos espirituais.',
    to: '/aprenda',
    color: '#059669',
    bg: 'linear-gradient(160deg, #052E16, #0D0818)',
  },
  {
    icon: Music,
    title: 'Pontos Cantados',
    desc: 'Acesse as letras e ouça os pontos das entidades no YouTube.',
    to: '/aprenda',
    color: '#D4AF37',
    bg: 'linear-gradient(160deg, #292202, #0D0818)',
  },
  {
    icon: Calendar,
    title: 'Giras',
    desc: 'Acompanhe as próximas giras e saiba o que esperar.',
    to: '/calendario',
    color: '#DC2626',
    bg: 'linear-gradient(160deg, #2A0A0A, #0D0818)',
  },
]

/* ─── Services cards ─────────────────────────────────────── */
const SERVICES = [
  {
    icon: BookOpen,
    title: 'Pontos Cantados',
    desc: 'Biblioteca completa com letras e links do YouTube para os principais pontos da Umbanda.',
    to: '/aprenda',
  },
  {
    icon: Calendar,
    title: 'Calendário de Giras',
    desc: 'Acompanhe todas as giras do terreiro, veja quais entidades serão chamadas e o que preparar.',
    to: '/calendario',
  },
  {
    icon: Leaf,
    title: 'Ervas do Terreiro',
    desc: 'Conheça as ervas medicinais e espirituais, incluindo as cultivadas no nosso quintal.',
    to: '/aprenda',
  },
]

/* ─── Stats ──────────────────────────────────────────────── */
const STATS = [
  { value: '40+', label: 'Entidades Cadastradas' },
  { value: '100+', label: 'Ervas Sagradas' },
  { value: '200+', label: 'Pontos Cantados' },
  { value: '12+', label: 'Anos de Tradição' },
]

/* ─── FAQs ───────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'O que é a Umbanda?',
    a: 'A Umbanda é uma religião brasileira que integra influências do candomblé africano, do espiritismo kardecista, do catolicismo e das tradições indígenas. É uma religião de amor, caridade e fé.',
  },
  {
    q: 'O que é uma Gira?',
    a: 'Gira é a cerimônia religiosa da Umbanda onde os médiuns incorporam entidades espirituais (como Pretos-Velhos, Caboclos e Exus) para prestar assistência espiritual à comunidade.',
  },
  {
    q: 'Como participar das giras?',
    a: 'Qualquer pessoa pode participar como assistente (visitante). Basta se vestir com roupas brancas e chegar com respeito e abertura. Consulte o calendário para saber as datas.',
  },
  {
    q: 'O que são os pontos cantados?',
    a: 'Pontos cantados são músicas sagradas que invocam e saúdam as entidades espirituais durante as giras. Cada entidade possui seus próprios pontos característicos.',
  },
]

/* ─── Sub-components ─────────────────────────────────────── */

function SectionTitle({ tag, title, center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {tag && (
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          {tag}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: '#F8F5FF' }}>
        {title}
      </h2>
    </div>
  )
}

function GiraCard({ gira }) {
  if (!gira) return null
  const date = new Date(gira.data)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('pt-BR', { month: 'long' })

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
    >
      <div className="flex items-stretch">
        <div
          className="flex flex-col items-center justify-center px-5 py-4 flex-shrink-0"
          style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRight: '1px solid rgba(212,175,55,0.2)' }}
        >
          <span className="text-3xl font-bold leading-none" style={{ color: '#D4AF37' }}>{day}</span>
          <span className="text-xs uppercase mt-1 font-semibold" style={{ color: '#D4AF37' }}>{month}</span>
        </div>
        <div className="p-4 flex-1">
          <div className="font-bold text-base" style={{ color: '#F8F5FF' }}>{gira.titulo}</div>
          {gira.entidades?.length > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: '#A78BFA' }}>
              <Star size={12} />
              {gira.entidades.slice(0, 3).map(e => e.nome).join(', ')}
              {gira.entidades.length > 3 && ` +${gira.entidades.length - 3}`}
            </div>
          )}
          {gira.instrucoes && (
            <p className="mt-2 text-xs line-clamp-2 leading-relaxed" style={{ color: '#A78BFA' }}>
              {gira.instrucoes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #2D1B69' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        style={{ backgroundColor: open ? 'rgba(212,175,55,0.08)' : '#1A1030' }}
      >
        <span className="font-semibold text-sm" style={{ color: '#F8F5FF' }}>{q}</span>
        {open
          ? <ChevronUp size={18} style={{ color: '#D4AF37', flexShrink: 0 }} />
          : <ChevronDown size={18} style={{ color: '#A78BFA', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div className="px-5 pb-4" style={{ backgroundColor: 'rgba(212,175,55,0.05)' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#A78BFA' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export default function Home() {
  const [giras, setGiras] = useState([])
  const [entidades, setEntidades] = useState([])
  const [loadingGiras, setLoadingGiras] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState(null)

  useEffect(() => {
    api.get('/giras')
      .then(r => setGiras(Array.isArray(r.data) ? r.data.slice(0, 3) : []))
      .catch(() => {})
      .finally(() => setLoadingGiras(false))

    api.get('/entidades')
      .then(r => setEntidades(Array.isArray(r.data) ? r.data.slice(0, 8) : []))
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* ──────────────────────────────────────────────────── */}
      {/* 1. HERO SLIDER                                       */}
      {/* ──────────────────────────────────────────────────── */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full"
        style={{ '--swiper-navigation-color': '#D4AF37', '--swiper-pagination-color': '#D4AF37' }}
      >
        {HERO_SLIDES.map((slide, i) => (
          <SwiperSlide key={i}>
            <div
              className="relative flex items-center justify-center md:justify-start px-6 md:px-20"
              style={{
                background: slide.gradient,
                minHeight: 'clamp(380px, 60vh, 600px)',
              }}
            >
              {/* decorative orb */}
              <div
                className="absolute right-0 top-0 w-64 h-64 md:w-96 md:h-96 rounded-full opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)`, transform: 'translate(30%, -30%)' }}
              />

              <div className="relative z-10 max-w-xl py-16 md:py-24">
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{ backgroundColor: `${slide.accent}20`, color: slide.accent, border: `1px solid ${slide.accent}50` }}
                >
                  {slide.tag}
                </span>
                <h1
                  className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 whitespace-pre-line"
                  style={{ color: '#F8F5FF' }}
                >
                  {slide.title}
                </h1>
                <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: '#C4B5FD' }}>
                  {slide.sub}
                </p>
                <Link
                  to={slide.cta.to}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ backgroundColor: slide.accent, color: '#0D0818' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {slide.cta.label}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ──────────────────────────────────────────────────── */}
      {/* 2. PARTICIPATE CARDS (4 columns)                     */}
      {/* ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        {PARTICIPATE.map(({ icon: Icon, title, desc, to, color, bg }) => (
          <Link
            key={title}
            to={to}
            className="relative group flex flex-col items-center justify-center text-center p-6 md:p-8 transition-all overflow-hidden"
            style={{ background: bg, borderRight: '1px solid rgba(255,255,255,0.05)', minHeight: 200 }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
            >
              <Icon size={26} style={{ color }} />
            </div>
            <div className="font-bold text-base mb-1" style={{ color: '#F8F5FF' }}>{title}</div>
            <div className="text-xs leading-relaxed" style={{ color: '#A78BFA' }}>{desc}</div>
            <div
              className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color }}
            >
              Participar <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </section>

      {/* ──────────────────────────────────────────────────── */}
      {/* 3. SERVICES (3 columns)                             */}
      {/* ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#0D0818' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <SectionTitle tag="Nosso Conteúdo" title="Tudo que você precisa saber" center />
            <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: '#A78BFA' }}>
              Acesse o conhecimento ancestral da Umbanda organizado para facilitar seu aprendizado e devoção.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={title}
                to={to}
                className="group p-6 rounded-2xl transition-all"
                style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#D4AF37'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2D1B69'}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
                >
                  <Icon size={22} style={{ color: '#D4AF37' }} />
                </div>
                <div className="font-bold text-base mb-2" style={{ color: '#F8F5FF' }}>{title}</div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#A78BFA' }}>{desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#D4AF37' }}>
                  Saiba mais <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── */}
      {/* 4. STATS (dark section)                             */}
      {/* ──────────────────────────────────────────────────── */}
      <section
        className="py-14"
        style={{ background: 'linear-gradient(135deg, #12092B 0%, #1A1030 100%)', borderTop: '1px solid #2D1B69', borderBottom: '1px solid #2D1B69' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold mb-1" style={{ color: '#D4AF37' }}>{value}</div>
                <div className="text-sm font-medium" style={{ color: '#A78BFA' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── */}
      {/* 5. ABOUT / FAITH SECTION (two columns)              */}
      {/* ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#0D0818' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: decorative visual */}
          <div className="relative flex items-center justify-center">
            <div
              className="w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(124,58,237,0.15))', border: '2px solid rgba(212,175,55,0.2)' }}
            >
              <div
                className="w-48 h-48 md:w-60 md:h-60 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(212,175,55,0.1))', border: '2px solid rgba(124,58,237,0.3)' }}
              >
                <Flame size={72} style={{ color: '#D4AF37', opacity: 0.9 }} />
              </div>
            </div>
            {/* floating badge */}
            <div
              className="absolute bottom-4 right-4 md:bottom-0 md:right-0 px-5 py-3 rounded-xl text-center"
              style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              <div className="text-2xl font-bold" style={{ color: '#D4AF37' }}>12+</div>
              <div className="text-xs" style={{ color: '#A78BFA' }}>Anos de tradição</div>
            </div>
          </div>

          {/* Right: text */}
          <div>
            <SectionTitle tag="Nossa Missão" title="Compartilhando fé e amor com a comunidade" />
            <p className="text-sm leading-relaxed mt-4 mb-6" style={{ color: '#A78BFA' }}>
              O Terreiro Filhos de Fé é um espaço de acolhimento, aprendizado e conexão espiritual.
              Nossa missão é preservar as tradições da Umbanda, transmitir conhecimento às novas
              gerações e oferecer um ambiente de fé, caridade e amor.
            </p>
            <ul className="space-y-2 mb-8">
              {[
                'Preservação das tradições umbandistas',
                'Aprendizado das ervas sagradas e medicinais',
                'Conhecimento das entidades e seus ensinamentos',
                'Comunidade unida pela fé e pela caridade',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#F8F5FF' }}>
                  <Star size={14} style={{ color: '#D4AF37', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/aprenda"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: '#7C3AED', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5B21B6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7C3AED'}
            >
              Conhecer mais
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── */}
      {/* 6. UPCOMING GIRAS                                   */}
      {/* ──────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-20"
        style={{ backgroundColor: '#1A1030', borderTop: '1px solid #2D1B69', borderBottom: '1px solid #2D1B69' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <SectionTitle tag="Agenda" title="Próximas Giras" />
            <Link
              to="/calendario"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Ver calendário completo <ArrowRight size={16} />
            </Link>
          </div>

          {loadingGiras ? (
            <LoadingSpinner />
          ) : giras.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {giras.map(g => <GiraCard key={g.id} gira={g} />)}
            </div>
          ) : (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}
            >
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma gira programada em breve.</p>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── */}
      {/* 7. ENTITIES SHOWCASE (grid)                         */}
      {/* ──────────────────────────────────────────────────── */}
      {entidades.length > 0 && (
        <section className="py-16 md:py-20" style={{ backgroundColor: '#0D0818' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <SectionTitle tag="Entidades" title="Guias Espirituais do Terreiro" center />
              <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: '#A78BFA' }}>
                Conheça as entidades que trabalham em nosso terreiro, suas histórias e ensinamentos.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {entidades.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEntity(e)}
                  className="group text-left rounded-2xl overflow-hidden transition-all"
                  style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
                  onMouseEnter={el => el.currentTarget.style.borderColor = '#D4AF37'}
                  onMouseLeave={el => el.currentTarget.style.borderColor = '#2D1B69'}
                >
                  <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#12092B' }}>
                    {e.fotoUrl ? (
                      <img src={e.fotoUrl} alt={e.nome} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users size={40} style={{ color: '#2D1B69' }} />
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 p-3"
                      style={{ background: 'linear-gradient(transparent, rgba(13,8,24,0.95))' }}
                    >
                      <div className="text-sm font-bold" style={{ color: '#F8F5FF' }}>{e.nome}</div>
                    </div>
                  </div>
                  {e.saudacao && (
                    <div className="px-3 py-2">
                      <p className="text-xs italic line-clamp-1" style={{ color: '#A78BFA' }}>"{e.saudacao}"</p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/aprenda"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#0D0818' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#D4AF37' }}
              >
                Ver todas as entidades <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────── */}
      {/* 8. FAQ ACCORDION                                    */}
      {/* ──────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-20"
        style={{ backgroundColor: '#12092B', borderTop: '1px solid #2D1B69' }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <SectionTitle tag="Dúvidas" title="Perguntas Frequentes" center />
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── */}
      {/* Entity Detail Modal                                 */}
      {/* ──────────────────────────────────────────────────── */}
      {selectedEntity && (
        <Modal isOpen title={selectedEntity.nome} onClose={() => setSelectedEntity(null)}>
          {selectedEntity.fotoUrl && (
            <img
              src={selectedEntity.fotoUrl}
              alt={selectedEntity.nome}
              className="w-full rounded-xl mb-4 object-cover max-h-56"
            />
          )}
          {selectedEntity.saudacao && (
            <div
              className="p-3 rounded-lg mb-4 italic text-sm"
              style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}
            >
              "{selectedEntity.saudacao}"
            </div>
          )}
          {selectedEntity.coresVelas && (
            <div className="mb-3 text-sm" style={{ color: '#F8F5FF' }}>
              <span style={{ color: '#A78BFA' }}>Cores das velas: </span>
              {selectedEntity.coresVelas}
            </div>
          )}
          {selectedEntity.historia && (
            <div>
              <div className="text-xs font-semibold uppercase mb-2" style={{ color: '#A78BFA' }}>História</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#F8F5FF' }}>{selectedEntity.historia}</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
