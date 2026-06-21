import { useEffect, useState } from 'react'
import { Music, Leaf, Users, Calendar, Plus, Droplets } from 'lucide-react'
import { Link } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const STAT_CARDS = [
  { key:'musicas',   label:'Músicas',             Icon:Music,       color:'#7C3AED', to:'/admin/musicas' },
  { key:'ervas',     label:'Ervas',               Icon:Leaf,        color:'#059669', to:'/admin/ervas' },
  { key:'banhos',    label:'Banhos',              Icon:Droplets,    color:'#0369a1', to:'/admin/banhos' },
  { key:'entidades', label:'Orixás / Entidades',  Icon:Users,       color:'#c8972b', to:'/admin/entidades' },
  { key:'giras',     label:'Giras',               Icon:Calendar,    color:'#dc2626', to:'/admin/giras' },
]

const QUICK = [
  { label:'Nova Música',   to:'/admin/musicas',   Icon:Music },
  { label:'Nova Erva',     to:'/admin/ervas',     Icon:Leaf },
  { label:'Novo Banho',    to:'/admin/banhos',    Icon:Droplets },
  { label:'Nova Entidade', to:'/admin/entidades', Icon:Users },
  { label:'Nova Gira',     to:'/admin/giras',     Icon:Calendar },
]

const S = { fontFamily:"'Poppins',sans-serif" }

export default function Dashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/musicas'), api.get('/ervas'),
      api.get('/banhos'), api.get('/entidades'), api.get('/giras'),
    ]).then(([m, e, bh, en, g]) => {
      const n = res => res.status === 'rejected' ? 0 : (Array.isArray(res.value.data) ? res.value.data.length : (res.value.data.total || res.value.data.count || 0))
      setStats({ musicas:n(m), ervas:n(e), banhos:n(bh), entidades:n(en), giras:n(g) })
    }).finally(() => setLoading(false))
  }, [])

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  return (
    <div style={S}>

      {/* Welcome */}
      <div style={{ backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', padding:'28px 32px', marginBottom:28, backgroundImage:'linear-gradient(135deg,#fff 60%,rgba(200,151,43,0.06))' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#c8972b', marginBottom:10 }}>
          Painel Administrativo · Filhos de Fé
        </div>
        <h1 style={{ margin:'0 0 6px', fontSize:28, fontWeight:800, color:'#2c2c3e' }}>
          Olá, {user?.nome?.split(' ')[0] || 'Administrador'}
        </h1>
        <p style={{ margin:0, fontSize:14, color:'#6b7280', textTransform:'capitalize' }}>{hoje}</p>
      </div>

      {/* Stats */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#c8972b', marginBottom:16 }}>Visão Geral</div>
        {loading ? <LoadingSpinner /> : (
          <div className="dash-stats" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
            <style>{`@media(min-width:768px){.dash-stats{grid-template-columns:repeat(4,1fr)!important;}}@media(min-width:1280px){.dash-stats{grid-template-columns:repeat(8,1fr)!important;}}`}</style>
            {STAT_CARDS.map(({ key, label, Icon, color, to }) => (
              <Link
                key={key} to={to}
                style={{ display:'block', textDecoration:'none', backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.boxShadow=`0 6px 20px ${color}20`; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e0d8'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform='translateY(0)' }}
              >
                <div style={{ width:42, height:42, borderRadius:10, backgroundColor:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontSize:30, fontWeight:800, color:'#2c2c3e', lineHeight:1 }}>{stats[key] ?? '—'}</div>
                <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#c8972b', marginBottom:16 }}>Ações Rápidas</div>
        <div className="dash-actions" style={{ display:'grid', gridTemplateColumns:'repeat(1,1fr)', gap:12 }}>
          <style>{`@media(min-width:640px){.dash-actions{grid-template-columns:repeat(2,1fr)!important;}}@media(min-width:1024px){.dash-actions{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
          {QUICK.map(({ label, to, Icon }) => (
            <Link
              key={label} to={to}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', textDecoration:'none', backgroundColor:'#fff', borderRadius:8, border:'1px solid #e5e0d8', fontSize:14, fontWeight:600, color:'#2c2c3e', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#c8972b'; e.currentTarget.style.color='#c8972b'; e.currentTarget.style.backgroundColor='rgba(200,151,43,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e0d8'; e.currentTarget.style.color='#2c2c3e'; e.currentTarget.style.backgroundColor='#fff' }}
            >
              <Plus size={16} /><Icon size={16} /> {label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
