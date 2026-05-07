import Modal from './Modal'

const btn = { padding:'10px 20px', borderRadius:6, fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer', fontFamily:"'Poppins',sans-serif", transition:'all 0.15s', border:'none' }

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirmar ação'}
      footer={
        <>
          <button
            onClick={onClose}
            style={{ ...btn, background:'transparent', border:'1px solid #e5e0d8', color:'#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#2c2c3e'; e.currentTarget.style.color='#2c2c3e' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e0d8'; e.currentTarget.style.color='#6b7280' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            style={{ ...btn, backgroundColor:'#dc2626', color:'#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor='#b91c1c'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor='#dc2626'}
          >
            Confirmar
          </button>
        </>
      }
    >
      <p style={{ margin:0, fontSize:14, color:'#6b7280', lineHeight:1.7 }}>
        {message || 'Tem certeza que deseja continuar?'}
      </p>
    </Modal>
  )
}
