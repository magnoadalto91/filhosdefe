import Modal from './Modal'

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
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: '1px solid #e5e0d8',
              color: '#6b7280',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2c2c3e'
              e.currentTarget.style.color = '#2c2c3e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e0d8'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626' }}
          >
            Confirmar
          </button>
        </>
      }
    >
      <p
        style={{
          fontSize: '15px',
          color: '#6b7280',
          lineHeight: 1.7,
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {message || 'Tem certeza que deseja continuar?'}
      </p>
    </Modal>
  )
}
