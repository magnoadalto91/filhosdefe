import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes modalUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @media (min-width:640px) {
          .modal-sheet  { border-radius:12px!important; max-width:560px!important; }
          .modal-handle { display:none!important; }
          .modal-wrap   { align-items:center!important; padding:16px!important; }
        }
      `}</style>
      <div
        className="modal-wrap"
        style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', backgroundColor:'rgba(28,28,46,0.48)', backdropFilter:'blur(3px)', fontFamily:"'Poppins',sans-serif" }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="modal-sheet"
          style={{ width:'100%', maxHeight:'92vh', display:'flex', flexDirection:'column', backgroundColor:'#ffffff', borderRadius:'12px 12px 0 0', boxShadow:'0 -8px 48px rgba(0,0,0,0.16)', animation:'modalUp 0.22s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Drag handle — mobile only */}
          <div className="modal-handle" style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
            <div style={{ width:40, height:4, borderRadius:2, backgroundColor:'#e5e0d8' }} />
          </div>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #e5e0d8' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:3, height:20, borderRadius:2, backgroundColor:'#c8972b', flexShrink:0 }} />
              <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#2c2c3e' }}>{title}</h2>
            </div>
            <button
              onClick={onClose}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:6, border:'1px solid #e5e0d8', background:'#fff', color:'#6b7280', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#2c2c3e'; e.currentTarget.style.color='#2c2c3e' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e0d8'; e.currentTarget.style.color='#6b7280' }}
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'16px 24px', borderTop:'1px solid #e5e0d8' }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
