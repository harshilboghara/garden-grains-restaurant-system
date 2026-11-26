import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useScrollLock } from '../../hooks/useScrollLock'

const RatingModal = ({ isOpen, onClose, onSubmit, menuItem }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  useScrollLock(isOpen)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    onSubmit({ rating, comment })
    setRating(0)
    setComment('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-dark-slate/10 relative animate-slide-up">
        <button
           onClick={onClose}
           className="absolute top-4 right-4 text-gray-400 hover:text-dark-slate transition-colors"
        >
           <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-8">
           <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-dark-slate font-heading mb-2">
                Rate your experience
              </h2>
              <p className="text-warm-gold font-medium">
                 {menuItem?.name || 'Garden Grains'}
              </p>
           </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
                Tap to Rate
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    {(star <= (hoveredRating || rating)) ? (
                      <StarIcon className="h-10 w-10 text-warm-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
                    ) : (
                      <StarOutlineIcon className="h-10 w-10 text-dark-slate/20 hover:text-dark-slate/50" />
                    )}
                  </button>
                ))}
              </div>
              <div className="h-6 mt-2">
                 {(hoveredRating || rating) > 0 && (
                    <span className="text-warm-gold font-bold text-sm animate-fade-in">
                       {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][(hoveredRating || rating) - 1]}
                    </span>
                 )}
              </div>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                Your Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-black/40 border border-dark-slate/10 rounded-xl px-4 py-3 text-dark-slate placeholder-gray-600 focus:outline-none focus:border-warm-gold/50 focus:ring-1 focus:ring-warm-gold/20 transition-all resize-none"
                rows="4"
                placeholder="Tell us what you loved..."
              />
            </div>
  
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-gray-400 hover:text-dark-slate hover:bg-dark-slate/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary shadow-soft-gold"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RatingModal

