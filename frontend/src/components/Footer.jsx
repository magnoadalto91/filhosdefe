import { Link } from 'react-router'
import { Youtube, Instagram, Facebook, MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#08041A', borderTop: '1px solid #2D1B69' }}>
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#D4AF37' }}>Filhos de Fé</h2>
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#A78BFA' }}>
            Um espaço sagrado de aprendizado, fé e conexão com as entidades da Umbanda.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="YouTube"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#A78BFA' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#0D0818' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#A78BFA' }}>
              <Youtube size={16} />
            </a>
            <a href="#" aria-label="Instagram"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#A78BFA' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#0D0818' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#A78BFA' }}>
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="Facebook"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#A78BFA' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#0D0818' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#A78BFA' }}>
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
            Navegação
          </h3>
          <ul className="space-y-2">
            {[
              { to: '/', label: 'Início' },
              { to: '/aprenda', label: 'Aprenda' },
              { to: '/calendario', label: 'Calendário' },
              { to: '/login', label: 'Entrar' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm transition-colors"
                  style={{ color: '#A78BFA' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A78BFA'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
            Conteúdo
          </h3>
          <ul className="space-y-2">
            {[
              'Entidades',
              'Ervas Sagradas',
              'Pontos Cantados',
              'Próximas Giras',
              'Ervas do Quintal',
            ].map(label => (
              <li key={label}>
                <span className="text-sm" style={{ color: '#A78BFA' }}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
            Contato
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm" style={{ color: '#A78BFA' }}>
              <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
              Terreiro Filhos de Fé
            </li>
            <li className="flex items-center gap-2 text-sm" style={{ color: '#A78BFA' }}>
              <Phone size={15} style={{ color: '#D4AF37' }} />
              Giras: Domingos às 19h
            </li>
            <li className="flex items-center gap-2 text-sm" style={{ color: '#A78BFA' }}>
              <Mail size={15} style={{ color: '#D4AF37' }} />
              contato@filhosdefe.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #2D1B69' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#A78BFA' }}>
            &copy; {new Date().getFullYear()} Filhos de Fé. Todos os direitos reservados.
          </p>
          <p className="text-xs" style={{ color: '#A78BFA' }}>
            Salve a Umbanda
          </p>
        </div>
      </div>
    </footer>
  )
}
