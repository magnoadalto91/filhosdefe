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
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ border: '1px solid #2D1B69', color: '#A78BFA', background: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#DC2626', color: '#fff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
          >
            Confirmar
          </button>
        </>
      }
    >
      <p style={{ color: '#F8F5FF' }}>{message || 'Tem certeza que deseja continuar?'}</p>
    </Modal>
  )
}
