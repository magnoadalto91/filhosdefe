import { useEffect, useState } from 'react'
import { Users, Leaf, Music, Image, FileText, Play } from 'lucide-react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'

const TABS = [
  { id: 'entidades', label: 'Entidades', Icon: Users },
  { id: 'ervas', label: 'Ervas', Icon: Leaf },
  { id: 'musicas', label: 'Músicas', Icon: Music },
]

function EntityCard({ entity, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden transition-all"
      style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
    >
      <div className="aspect-square relative" style={{ backgroundColor: '#0D0818' }}>
        {entity.fotoUrl ? (
          <img src={entity.fotoUrl} alt={entity.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users size={40} style={{ color: '#2D1B69' }} />
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 px-2 py-1.5"
          style={{ background: 'linear-gradient(transparent, rgba(13,8,24,0.9))' }}
        >
          <div className="text-xs font-semibold truncate" style={{ color: '#F8F5FF' }}>{entity.nome}</div>
        </div>
      </div>
      {entity.saudacao && (
        <div className="px-3 py-2">
          <div className="text-xs italic" style={{ color: '#A78BFA' }}>"{entity.saudacao}"</div>
        </div>
      )}
    </button>
  )
}

function HerbCard({ herb }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
    >
      <div className="aspect-video relative" style={{ backgroundColor: '#0D0818' }}>
        {herb.fotoUrl ? (
          <img src={herb.fotoUrl} alt={herb.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf size={32} style={{ color: '#2D1B69' }} />
          </div>
        )}
        {herb.noQuintal && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(245,158,11,0.9)', color: '#0D0818' }}
          >
            No quintal
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-semibold text-sm" style={{ color: '#F8F5FF' }}>{herb.nome}</div>
        {herb.descricao && (
          <div className="text-xs mt-1 line-clamp-2" style={{ color: '#A78BFA' }}>{herb.descricao}</div>
        )}
      </div>
    </div>
  )
}

function MusicCard({ music, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all"
      style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(124,58,237,0.2)' }}
      >
        <Music size={18} style={{ color: '#7C3AED' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: '#F8F5FF' }}>{music.titulo}</div>
        {music.letra && (
          <div className="text-xs mt-0.5 line-clamp-2 whitespace-pre-wrap" style={{ color: '#A78BFA' }}>
            {music.letra.slice(0, 100)}...
          </div>
        )}
      </div>
      {music.youtubeUrl && (
        <Play size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
      )}
    </button>
  )
}

function EntityModal({ entity, onClose }) {
  if (!entity) return null
  return (
    <Modal isOpen={!!entity} onClose={onClose} title={entity.nome}>
      {entity.fotoUrl && (
        <img src={entity.fotoUrl} alt={entity.nome} className="w-full rounded-lg mb-4 object-cover max-h-48" />
      )}
      {entity.saudacao && (
        <div className="p-3 rounded-lg mb-4 italic text-sm" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
          "{entity.saudacao}"
        </div>
      )}
      {entity.coresVelas && (
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Cores das velas: </span>
          <span className="text-sm" style={{ color: '#F8F5FF' }}>{entity.coresVelas}</span>
        </div>
      )}
      {entity.historia && (
        <div>
          <div className="text-xs font-semibold uppercase mb-2" style={{ color: '#A78BFA' }}>Historia</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#F8F5FF' }}>{entity.historia}</p>
        </div>
      )}
    </Modal>
  )
}

function MusicModal({ music, onClose }) {
  if (!music) return null
  return (
    <Modal isOpen={!!music} onClose={onClose} title={music.titulo}>
      {music.youtubeUrl && (
        <a
          href={music.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4 text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}
        >
          <Play size={16} />
          Ouvir no YouTube
        </a>
      )}
      {music.letra ? (
        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans" style={{ color: '#F8F5FF' }}>
          {music.letra}
        </pre>
      ) : (
        <p className="text-sm" style={{ color: '#A78BFA' }}>Letra não disponível.</p>
      )}
    </Modal>
  )
}

export default function Aprenda() {
  const [tab, setTab] = useState('entidades')
  const [data, setData] = useState({ entidades: [], ervas: [], musicas: [] })
  const [loading, setLoading] = useState({ entidades: false, ervas: false, musicas: false })
  const [loaded, setLoaded] = useState({ entidades: false, ervas: false, musicas: false })
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedMusic, setSelectedMusic] = useState(null)

  const fetchTab = async (tabId) => {
    if (loaded[tabId]) return
    setLoading((l) => ({ ...l, [tabId]: true }))
    try {
      const endpoints = { entidades: '/entidades', ervas: '/ervas', musicas: '/musicas' }
      const res = await api.get(endpoints[tabId])
      const list = Array.isArray(res.data) ? res.data : res.data[tabId] || []
      setData((d) => ({ ...d, [tabId]: list }))
      setLoaded((l) => ({ ...l, [tabId]: true }))
    } catch {
      // ignore
    } finally {
      setLoading((l) => ({ ...l, [tabId]: false }))
    }
  }

  useEffect(() => { fetchTab(tab) }, [tab])

  return (
    <div className="flex flex-col min-h-full">
      {/* Tabs */}
      <div
        className="sticky top-0 z-20 flex"
        style={{ backgroundColor: '#0D0818', borderBottom: '1px solid #2D1B69' }}
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors"
            style={{
              color: tab === id ? '#F8F5FF' : '#A78BFA',
              borderBottom: tab === id ? '2px solid #7C3AED' : '2px solid transparent',
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {loading[tab] ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'entidades' && (
              <>
                {data.entidades.length === 0 ? (
                  <EmptyState icon={Users} message="Nenhuma entidade cadastrada." />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {data.entidades.map((e) => (
                      <EntityCard key={e.id} entity={e} onClick={() => setSelectedEntity(e)} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'ervas' && (
              <>
                {data.ervas.length === 0 ? (
                  <EmptyState icon={Leaf} message="Nenhuma erva cadastrada." />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {data.ervas.map((e) => (
                      <HerbCard key={e.id} herb={e} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'musicas' && (
              <>
                {data.musicas.length === 0 ? (
                  <EmptyState icon={Music} message="Nenhuma música cadastrada." />
                ) : (
                  <div className="space-y-2">
                    {data.musicas.map((m) => (
                      <MusicCard key={m.id} music={m} onClick={() => setSelectedMusic(m)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <EntityModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      <MusicModal music={selectedMusic} onClose={() => setSelectedMusic(null)} />
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Icon size={40} style={{ color: '#2D1B69' }} />
      <p className="text-sm" style={{ color: '#A78BFA' }}>{message}</p>
    </div>
  )
}
