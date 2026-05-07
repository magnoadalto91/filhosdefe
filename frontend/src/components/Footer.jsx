import { Link } from 'react-router'
import { Youtube, Instagram, Facebook, MapPin, Mail, Phone, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1c1c2e', color: '#9ca3af', fontFamily: "'Poppins', sans-serif" }}>
      {/* Main footer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px', display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 40 }} className="footer-grid">
        <style>{`
          @media (min-width: 640px) { .footer-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (min-width: 1024px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; } }
        `}</style>

        {/* Brand */}
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#c8972b', marginBottom: 12, letterSpacing: '-0.5px' }}>Filhos de Fé</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 280 }}>
            Um espaço sagrado de aprendizado, fé e conexão com as entidades da Umbanda. Que Oxalá ilumine seu caminho.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { Icon: Youtube, label: 'YouTube' },
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Facebook, label: 'Facebook' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label}
                style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#c8972b'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#c8972b' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff', marginBottom: 20 }}>Navegação</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/', label: 'Início' },
              { to: '/aprenda', label: 'Aprenda' },
              { to: '/calendario', label: 'Calendário' },
              { to: '/login', label: 'Entrar' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c8972b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <ArrowRight size={13} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff', marginBottom: 20 }}>Conteúdo</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Orixás / Entidades', 'Ervas Sagradas', 'Pontos Cantados', 'Próximas Giras', 'Ervas do Quintal'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#9ca3af' }}>
                <ArrowRight size={13} style={{ color: '#c8972b', flexShrink: 0 }} /> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff', marginBottom: 20 }}>Contato</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
              <MapPin size={15} style={{ color: '#c8972b', marginTop: 2, flexShrink: 0 }} />
              Terreiro Filhos de Fé
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <Phone size={15} style={{ color: '#c8972b', flexShrink: 0 }} />
              Domingos às 19h
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <Mail size={15} style={{ color: '#c8972b', flexShrink: 0 }} />
              contato@filhosdefe.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }} className="footer-bottom">
          <style>{`@media (min-width: 640px) { .footer-bottom { flex-direction: row !important; justify-content: space-between; text-align: left; } }`}</style>
          <p style={{ fontSize: 13 }}>&copy; {new Date().getFullYear()} Filhos de Fé. Todos os direitos reservados.</p>
          <p style={{ fontSize: 13, color: '#c8972b', fontWeight: 600 }}>Salve a Umbanda</p>
        </div>
      </div>
    </footer>
  )
}
