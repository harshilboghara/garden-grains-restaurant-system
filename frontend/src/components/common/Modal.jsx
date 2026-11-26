import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-deep-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-slate/5 bg-pearl/50 backdrop-blur-sm sticky top-0 z-10 text-dark-slate">
              <h3 className="text-xl font-bold font-heading">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-slate/5 rounded-full transition-colors group"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5 text-soft-gray group-hover:text-dark-slate" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar text-dark-slate">
              {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-pearl/30 border-t border-dark-slate/5 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-warm-gold text-deep-black font-bold rounded-xl hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-gold"
              >
                Accept & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
