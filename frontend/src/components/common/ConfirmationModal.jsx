import { XMarkIcon } from '@heroicons/react/24/outline'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmStyle = 'danger', isLoading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 max-w-md w-full p-6 glass-panel relative animate-scale-up">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-dark-slate transition-colors p-1 hover:bg-dark-slate/10 rounded-full"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold text-dark-slate mb-2 font-heading pr-8">{title}</h3>
        <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-dark-slate/5 border border-transparent hover:border-dark-slate/10 transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              // Automatically close handled by parent usually, but good to be clear
            }}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-dark-slate font-bold text-sm transition-all flex items-center transform hover:scale-105 ${
              confirmStyle === 'danger' 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 border border-red-400/20' 
                : 'bg-warm-gold text-deep-black hover:bg-yellow-500 shadow-lg shadow-yellow-500/20 border border-yellow-400/20'
            }`}
          >
            {isLoading ? (
               <div className="w-4 h-4 border-2 border-dark-slate/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
