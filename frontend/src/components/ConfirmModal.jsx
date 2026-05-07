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
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ border: '1px solid #2D1B69', color: '#A78BFA', background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7C3AED'
              e.currentTarget.style.color = '#F8F5FF'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2D1B69'
              e.currentTarget.style.color = '#A78BFA'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#dc2626', color: '#fff', border: '1px solid transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626' }}
          >
            Confirmar
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed" style={{ color: '#A78BFA' }}>
        {message || 'Tem certeza que deseja continuar?'}
      </p>
    </Modal>
  )
}
