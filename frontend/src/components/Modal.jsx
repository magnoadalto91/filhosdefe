import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(7,3,18,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-2xl"
        style={{
          backgroundColor: '#120C28',
          border: '1px solid #3D2B89',
          boxShadow: '0 0 80px rgba(124,58,237,0.2), 0 24px 80px rgba(0,0,0,0.6)',
          maxHeight: '92vh',
          animation: 'modalSlideIn 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Linha dourada no topo (indicador mobile) */}
        <div
          className="sm:hidden mx-auto mt-3 mb-1 rounded-full flex-shrink-0"
          style={{ width: 36, height: 4, backgroundColor: '#3D2B89' }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #2D1B69' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(to bottom, #c8972b, #7C3AED)' }}
            />
            <h2 className="text-base font-bold" style={{ color: '#F8F5FF' }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: '#7C5AAA' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F8F5FF'
              e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7C5AAA'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex gap-3 justify-end px-5 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid #2D1B69' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
