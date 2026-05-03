import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, Music, ListChecks, FileText } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function girasByDay(giras, year, month) {
  const map = {}
  giras.forEach((g) => {
    const d = new Date(g.data)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!map[day]) map[day] = []
      map[day].push(g)
    }
  })
  return map
}

function GiraDetailModal({ gira, onClose }) {
  if (!gira) return null
  const date = new Date(gira.data)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Modal isOpen={!!gira} onClose={onClose} title={gira.titulo}>
      <div className="space-y-4">
        <div className="text-xs capitalize" style={{ color: '#F59E0B' }}>{dateStr}</div>

        {gira.descricao && (
          <p className="text-sm leading-relaxed" style={{ color: '#F8F5FF' }}>{gira.descricao}</p>
        )}

        {gira.instrucoes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} style={{ color: '#A78BFA' }} />
              <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Instrucoes</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#F8F5FF' }}>{gira.instrucoes}</p>
          </div>
        )}

        {gira.entidades?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} style={{ color: '#A78BFA' }} />
              <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Entidades</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {gira.entidades.map((e, i) => (
                <span
                  key={e._id || i}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid #2D1B69' }}
                >
                  {e.nome || e}
                </span>
              ))}
            </div>
          </div>
        )}

        {gira.musicas?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music size={14} style={{ color: '#A78BFA' }} />
              <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Musicas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {gira.musicas.map((m, i) => (
                <span
                  key={m._id || i}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid #2D1B69' }}
                >
                  {m.titulo || m}
                </span>
              ))}
            </div>
          </div>
        )}

        {gira.rotinas?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={14} style={{ color: '#A78BFA' }} />
              <span className="text-xs font-semibold uppercase" style={{ color: '#A78BFA' }}>Rotinas</span>
            </div>
            <ol className="space-y-1">
              {gira.rotinas.map((r, i) => (
                <li key={r._id || i} className="text-sm flex items-start gap-2" style={{ color: '#F8F5FF' }}>
                  <span className="flex-shrink-0 font-mono text-xs mt-0.5" style={{ color: '#A78BFA' }}>
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  {r.titulo || r}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function Calendario() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [giras, setGiras] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGira, setSelectedGira] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/giras?year=${year}&month=${month + 1}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.giras || []
        setGiras(list)
      })
      .catch(() => setGiras([]))
      .finally(() => setLoading(false))
  }, [year, month])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const days = buildCalendarDays(year, month)
  const giraMap = girasByDay(giras, year, month)

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#A78BFA' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <div className="font-bold text-lg" style={{ color: '#F8F5FF' }}>{MONTHS[month]}</div>
          <div className="text-sm" style={{ color: '#A78BFA' }}>{year}</div>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#A78BFA' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: '#A78BFA' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const hasGira = day && giraMap[day]?.length > 0
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

            return (
              <div key={i}>
                {day === null ? (
                  <div className="aspect-square" />
                ) : (
                  <button
                    onClick={() => hasGira && setSelectedGira(giraMap[day][0])}
                    disabled={!hasGira}
                    className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      backgroundColor: hasGira
                        ? 'rgba(245,158,11,0.15)'
                        : isToday
                          ? 'rgba(124,58,237,0.15)'
                          : 'transparent',
                      border: hasGira
                        ? '1px solid rgba(245,158,11,0.4)'
                        : isToday
                          ? '1px solid rgba(124,58,237,0.4)'
                          : '1px solid transparent',
                      color: hasGira ? '#F59E0B' : isToday ? '#7C3AED' : '#F8F5FF',
                      cursor: hasGira ? 'pointer' : 'default',
                    }}
                  >
                    <span className="text-sm font-semibold leading-none">{day}</span>
                    {hasGira && (
                      <Calendar size={10} style={{ color: '#F59E0B' }} />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: '#A78BFA' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.3)', border: '1px solid rgba(245,158,11,0.6)' }} />
          Gira programada
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.6)' }} />
          Hoje
        </div>
      </div>

      {/* Upcoming giras list */}
      {giras.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#A78BFA' }}>
            Giras neste mês
          </h3>
          <div className="space-y-2">
            {giras.map((g) => {
              const d = new Date(g.data)
              return (
                <button
                  key={g._id}
                  onClick={() => setSelectedGira(g)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ backgroundColor: '#1A1030', border: '1px solid #2D1B69' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F59E0B'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D1B69'}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                    style={{ backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
                  >
                    <span className="text-sm font-bold leading-none" style={{ color: '#F59E0B' }}>{d.getDate()}</span>
                    <span className="text-xs leading-none" style={{ color: '#F59E0B' }}>
                      {d.toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: '#F8F5FF' }}>{g.titulo}</div>
                    {g.entidades?.length > 0 && (
                      <div className="text-xs truncate mt-0.5" style={{ color: '#A78BFA' }}>
                        {g.entidades.map(e => e.nome || e).join(', ')}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <GiraDetailModal gira={selectedGira} onClose={() => setSelectedGira(null)} />
    </div>
  )
}
