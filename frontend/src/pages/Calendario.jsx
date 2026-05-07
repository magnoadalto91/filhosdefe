import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, Music, ListChecks, FileText } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
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

/* ── Gira Detail Modal ───────────────────────────────────── */
function GiraDetailModal({ gira, onClose }) {
  if (!gira) return null
  const date = new Date(gira.data)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const sectionLabel = (text) => (
    <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '8px' }}>
      {text}
    </div>
  )

  return (
    <Modal isOpen={!!gira} onClose={onClose} title={gira.titulo}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Poppins', sans-serif" }}>

        {/* Date badge */}
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#c8972b', textTransform: 'capitalize' }}>{dateStr}</div>

        {gira.descricao && (
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#2c2c3e', margin: 0 }}>{gira.descricao}</p>
        )}

        {gira.instrucoes && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FileText size={14} style={{ color: '#c8972b' }} />
              {sectionLabel('Instrucoes')}
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#2c2c3e', whiteSpace: 'pre-wrap', margin: 0 }}>{gira.instrucoes}</p>
          </div>
        )}

        {gira.entidades?.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Users size={14} style={{ color: '#c8972b' }} />
              {sectionLabel('Entidades')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {gira.entidades.map((e, i) => (
                <span
                  key={e._id || i}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(200,151,43,0.10)',
                    color: '#c8972b',
                    border: '1px solid rgba(200,151,43,0.25)',
                  }}
                >
                  {e.nome || e}
                </span>
              ))}
            </div>
          </div>
        )}

        {gira.musicas?.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Music size={14} style={{ color: '#c8972b' }} />
              {sectionLabel('Musicas')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {gira.musicas.map((m, i) => (
                <span
                  key={m._id || i}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(200,151,43,0.10)',
                    color: '#c8972b',
                    border: '1px solid rgba(200,151,43,0.25)',
                  }}
                >
                  {m.titulo || m}
                </span>
              ))}
            </div>
          </div>
        )}

        {gira.rotinas?.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ListChecks size={14} style={{ color: '#c8972b' }} />
              {sectionLabel('Rotinas')}
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gira.rotinas.map((r, i) => (
                <li key={r._id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#2c2c3e' }}>
                  <span style={{ flexShrink: 0, fontFamily: 'monospace', fontSize: '12px', marginTop: '2px', color: '#c8972b', minWidth: '20px' }}>
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

/* ── Day Cell ────────────────────────────────────────────── */
function DayCell({ day, hasGira, isToday, onClick }) {
  const [hovered, setHovered] = useState(false)

  let bg = 'transparent'
  let color = '#2c2c3e'
  let border = '1px solid #e5e0d8'

  if (hasGira) {
    bg = hovered ? '#a67a20' : '#c8972b'
    color = '#ffffff'
    border = '1px solid #c8972b'
  } else if (isToday) {
    bg = 'rgba(200,151,43,0.10)'
    color = '#c8972b'
    border = '1px solid rgba(200,151,43,0.35)'
  }

  return (
    <button
      onClick={onClick}
      disabled={!hasGira}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        backgroundColor: bg,
        border,
        color,
        cursor: hasGira ? 'pointer' : 'default',
        transition: 'background-color 0.15s',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1 }}>{day}</span>
      {hasGira && <Calendar size={9} style={{ color: '#ffffff' }} />}
    </button>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
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

  const navBtnBase = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    color: '#c8972b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s',
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#ffffff', minHeight: '100%', fontFamily: "'Poppins', sans-serif" }}>

      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#2c2c3e', margin: '0 0 4px' }}>Calendario</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Acompanhe as giras do mes</p>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={prevMonth}
          style={navBtnBase}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(200,151,43,0.10)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={22} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#2c2c3e' }}>{MONTHS[month]}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>{year}</div>
        </div>

        <button
          onClick={nextMonth}
          style={navBtnBase}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(200,151,43,0.10)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          aria-label="Proximo mes"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Days of week header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: '6px',
          backgroundColor: '#f8f5f0',
          borderRadius: '4px',
          padding: '4px 0',
        }}
      >
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '4px 0',
              color: '#6b7280',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, i) => {
            const hasGira = day !== null && giraMap[day]?.length > 0
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()

            return (
              <div key={i}>
                {day === null ? (
                  <div style={{ aspectRatio: '1/1' }} />
                ) : (
                  <DayCell
                    day={day}
                    hasGira={hasGira}
                    isToday={isToday}
                    onClick={() => hasGira && setSelectedGira(giraMap[day][0])}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', fontSize: '12px', color: '#6b7280' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#c8972b' }} />
          Gira programada
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(200,151,43,0.15)', border: '1px solid rgba(200,151,43,0.35)' }} />
          Hoje
        </div>
      </div>

      {/* Upcoming giras list */}
      {giras.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#6b7280',
              marginBottom: '12px',
            }}
          >
            Giras neste mes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {giras.map((g) => {
              const d = new Date(g.data)
              return (
                <GiraListCard
                  key={g._id}
                  gira={g}
                  date={d}
                  onClick={() => setSelectedGira(g)}
                />
              )
            })}
          </div>
        </div>
      )}

      <GiraDetailModal gira={selectedGira} onClose={() => setSelectedGira(null)} />
    </div>
  )
}

function GiraListCard({ gira, date, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e0d8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.10)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Date badge */}
      <div
        style={{
          flexShrink: 0,
          width: '44px',
          height: '44px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#c8972b',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1, color: '#ffffff' }}>{date.getDate()}</span>
        <span style={{ fontSize: '10px', lineHeight: 1.2, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
          {date.toLocaleString('pt-BR', { month: 'short' })}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#2c2c3e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {gira.titulo}
        </div>
        {gira.entidades?.length > 0 && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {gira.entidades.map(e => e.nome || e).join(', ')}
          </div>
        )}
      </div>
    </button>
  )
}
