import { useEffect, useState } from 'react'
import { Users, Leaf, Music, Calendar, Save, BookOpen, FileText, Bell, BellOff, AlertTriangle, HelpCircle } from 'lucide-react'
import api from '../../api/axios'
import LoadingSpinner from '../../components/LoadingSpinner'

const S = {
  page:  { fontFamily:"'Poppins',sans-serif" },
  card:  { backgroundColor:'#fff', borderRadius:10, border:'1px solid #e5e0d8', padding:'20px 24px', marginBottom:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  label: { fontSize:13, fontWeight:600, color:'#2c2c3e' },
  sub:   { fontSize:12, color:'#9ca3af', marginTop:2 },
  input: { padding:'9px 14px', border:'1px solid #e5e0d8', borderRadius:6, fontSize:14, fontFamily:"'Poppins',sans-serif", color:'#2c2c3e', outline:'none', transition:'border-color 0.2s', backgroundColor:'#fff', width:130 },
  btnPrimary: { display:'flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:6, fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', backgroundColor:'#c8972b', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'background 0.15s' },
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{ position:'relative', width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', backgroundColor: value ? '#c8972b' : '#e5e0d8', transition:'background 0.2s', flexShrink:0, padding:0 }}
    >
      <span style={{ position:'absolute', top:3, left: value ? 23 : 3, width:18, height:18, borderRadius:'50%', backgroundColor:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.18)' }}/>
    </button>
  )
}

function Row({ Icon, label, sub, field, cfg, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid #f0ece5' }}>
      <div style={{ width:36, height:36, borderRadius:8, backgroundColor:'rgba(200,151,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={16} color="#c8972b"/>
      </div>
      <div style={{ flex:1 }}>
        <div style={S.label}>{label}</div>
        {sub && <div style={S.sub}>{sub}</div>}
      </div>
      <Toggle value={!!cfg[field]} onChange={v => onChange(field, v)}/>
    </div>
  )
}

function pushEstado(u) {
  if (u.pushAtivo) return {
    label: 'Ativo', Icon: Bell,
    bg: 'rgba(22,163,74,0.04)', border: 'rgba(22,163,74,0.18)',
    iconBg: 'rgba(22,163,74,0.1)', iconColor: '#16a34a',
    badgeBg: 'rgba(22,163,74,0.1)', badgeColor: '#16a34a',
  }
  if (u.pushPermissao === 'denied') return {
    label: 'Bloqueado', Icon: BellOff,
    bg: 'rgba(220,38,38,0.03)', border: 'rgba(220,38,38,0.15)',
    iconBg: 'rgba(220,38,38,0.08)', iconColor: '#dc2626',
    badgeBg: 'rgba(220,38,38,0.08)', badgeColor: '#dc2626',
  }
  if (u.pushPermissao === 'revogada') return {
    label: 'Revogada', Icon: AlertTriangle,
    bg: 'rgba(217,119,6,0.04)', border: 'rgba(217,119,6,0.2)',
    iconBg: 'rgba(217,119,6,0.1)', iconColor: '#d97706',
    badgeBg: 'rgba(217,119,6,0.1)', badgeColor: '#d97706',
  }
  if (u.pushPermissao === 'default') return {
    label: 'Nunca ativou', Icon: BellOff,
    bg: '#fafafa', border: '#f0ece5',
    iconBg: 'rgba(200,151,43,0.07)', iconColor: '#d1cdc8',
    badgeBg: 'rgba(200,185,170,0.15)', badgeColor: '#b0a89e',
  }
  // null ou 'granted' sem subscrição (expirou)
  if (u.pushPermissao === 'granted') return {
    label: 'Expirada', Icon: AlertTriangle,
    bg: 'rgba(217,119,6,0.04)', border: 'rgba(217,119,6,0.15)',
    iconBg: 'rgba(217,119,6,0.1)', iconColor: '#d97706',
    badgeBg: 'rgba(217,119,6,0.1)', badgeColor: '#d97706',
  }
  return {
    label: 'Sem info', Icon: HelpCircle,
    bg: '#fafafa', border: '#f0ece5',
    iconBg: '#f0ece5', iconColor: '#d1cdc8',
    badgeBg: '#f0ece5', badgeColor: '#b0a89e',
  }
}

export default function AdminNotificacoes() {
  const [cfg,       setCfg]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [usuarios,  setUsuarios]  = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/notificacoes/config'),
      api.get('/notificacoes/usuarios-push'),
    ]).then(([cfgRes, usersRes]) => {
      setCfg(cfgRes.data)
      setUsuarios(Array.isArray(usersRes.data) ? usersRes.data : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const set = (field, value) => setCfg(c => ({ ...c, [field]: value }))

  const handleSave = async () => {
    setSaving(true); setSaved(false)
    try {
      const r = await api.put('/notificacoes/config', cfg)
      setCfg(r.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner/>

  return (
    <div style={S.page}>

      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#2c2c3e' }}>Notificações Push</h1>
        <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Configure quais eventos enviam push para todos os usuários</p>
      </div>

      {/* Novos conteúdos */}
      <div style={S.card}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b', marginBottom:4 }}>Novos conteúdos</div>
        <p style={{ margin:'0 0 4px', fontSize:12, color:'#9ca3af' }}>Notifica todos ao cadastrar um novo item</p>

        <Row Icon={Users}    label="Novo Orixá / Entidade"  field="novaEntidade" cfg={cfg} onChange={set}/>
        <Row Icon={Leaf}     label="Nova Erva Sagrada"       field="novaErva"     cfg={cfg} onChange={set}/>
        <Row Icon={Music}    label="Novo Ponto Cantado"      field="novaMusica"   cfg={cfg} onChange={set}/>
        <Row Icon={Calendar} label="Nova Gira cadastrada"    field="novaGira"     cfg={cfg} onChange={set}
          sub="Enviado assim que a gira for criada no admin"/>
        <Row Icon={BookOpen} label="Nova publicação (Estudos)" field="novaPublicacao" cfg={cfg} onChange={set}
          sub="Criação ou atualização de publicação"/>
        <Row Icon={FileText} label="Novo documento (Estudos)"  field="novoDocumento"  cfg={cfg} onChange={set}
          sub="Enviado ao fazer upload de um novo documento"/>
      </div>

      {/* Lembretes de gira */}
      <div style={S.card}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b', marginBottom:4 }}>Lembretes de Gira</div>
        <p style={{ margin:'0 0 4px', fontSize:12, color:'#9ca3af' }}>Enviados automaticamente às 08h (horário de Brasília)</p>

        <Row Icon={Calendar} label="1 semana antes" sub="7 dias antes da data da gira" field="gira1Semana" cfg={cfg} onChange={set}/>
        <Row Icon={Calendar} label="1 dia antes"    sub="Na véspera da gira"            field="gira1Dia"   cfg={cfg} onChange={set}/>
        <Row Icon={Calendar} label="No dia"         sub="Na manhã do dia da gira"       field="giraNoDia"  cfg={cfg} onChange={set}/>
      </div>

      {/* Salvar */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button style={{...S.btnPrimary, opacity: saving ? 0.7 : 1}} onClick={handleSave} disabled={saving}
          onMouseEnter={e=>{if(!saving)e.currentTarget.style.backgroundColor='#a67a20'}}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='#c8972b'}>
          <Save size={15}/>{saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
        {saved && <span style={{ fontSize:13, color:'#16a34a', fontWeight:600 }}>Configurações salvas!</span>}
      </div>

      {/* Usuários e status push */}
      <div style={S.card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#c8972b' }}>
            Usuários — notificações push
          </div>
          <span style={{ fontSize:12, color:'#9ca3af' }}>
            {usuarios.filter(u => u.pushAtivo).length} de {usuarios.length} ativaram
          </span>
        </div>
        <p style={{ margin:'0 0 12px', fontSize:12, color:'#9ca3af' }}>
          Usuários que instalaram o app e concederam permissão de notificação
        </p>

        {usuarios.length === 0 ? (
          <p style={{ margin:0, fontSize:13, color:'#9ca3af' }}>Nenhum usuário cadastrado.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {usuarios.map(u => {
              const estado = pushEstado(u)
              return (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:8, backgroundColor: estado.bg, border:`1px solid ${estado.border}` }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', backgroundColor: estado.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <estado.Icon size={14} color={estado.iconColor}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#2c2c3e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {u.nome || u.email}
                    </div>
                    {u.nome && <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{u.email}</div>}
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, flexShrink:0, backgroundColor: estado.badgeBg, color: estado.badgeColor }}>
                    {estado.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
