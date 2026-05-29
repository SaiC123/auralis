'use client'

import { useEffect, useRef } from 'react'

/**
 * Reusable Modal component.
 *
 * Usage:
 *   <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project">
 *     <form>...</form>
 *   </Modal>
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="modal-overlay"
    >
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-[var(--muted)] hover:text-[var(--foreground)]
                       hover:bg-[var(--border)] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        {children}
      </div>
    </div>
  )
}
