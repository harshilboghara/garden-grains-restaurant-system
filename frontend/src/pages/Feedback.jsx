import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  StarIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { feedbackAPI } from '../services/api'

const Feedback = () => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [category, setCategory] = useState("general")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
       toast.error("Please select a rating first!")
       return
    }

    setIsSubmitting(true)

    try {
       // Using the generic feedback API from previous context
       await feedbackAPI.submitRestaurantFeedback(rating, comment, category)
       
       setSuccess(true)
       setRating(0)
       setComment("")
       setCategory("general")
       toast.success("Thank you for your valuable feedback!")
    } catch (error) {
       console.error(error)
       toast.error("Something went wrong. Please try again.")
    } finally {
       setIsSubmitting(false)
    }
  }

  if (success) {
     return (
        <div className="min-h-screen flex items-center justify-center p-4">
           <div className="glass-panel p-12 text-center max-w-lg w-full rounded-3xl border border-dark-slate/10 animate-slide-up">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <FaceSmileIcon className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-dark-slate mb-4 font-heading">Thank You!</h2>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                 Your feedback helps us grow and serve you better. We truly appreciate your time.
              </p>
              <div className="flex justify-center space-x-4">
                 <Link to="/" className="btn-primary">Back Home</Link>
                 <button 
                    onClick={() => setSuccess(false)}
                    className="btn-secondary"
                 >
                    Send Another
                 </button>
              </div>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen relative pt-24 pb-20 flex items-center justify-center">
       {/* Background Ambience */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
       
       <div className="max-w-xl w-full px-4 relative z-10 animate-fade-in">
          <div className="text-center mb-8">
             <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
               <span className="text-xl">💭</span>
               <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Your Voice Matters</span>
             </div>
             <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">
               Tell Us About Your Experience
             </h1>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-dark-slate/10 shadow-2xl relative overflow-hidden">
             
             <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                {/* Rating */}
                <div className="text-center">
                   <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">How was your visit?</label>
                   <div className="flex justify-center space-x-3 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                         <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="group transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                         >
                            {(hoveredRating || rating) >= star ? (
                               <StarSolid className="w-10 h-10 text-warm-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                            ) : (
                               <StarIcon className="w-10 h-10 text-dark-slate/20 group-hover:text-warm-gold/50" />
                            )}
                         </button>
                      ))}
                   </div>
                   <div className="h-6">
                      {(hoveredRating || rating) > 0 && (
                         <span className={`text-sm font-bold animate-fade-in ${(hoveredRating || rating) > 3 ? 'text-green-400' : (hoveredRating || rating) === 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {['Disappointing', 'Could be better', 'It was okay', 'Great!', 'Absolutely Amazing!'][(hoveredRating || rating) - 1]}
                         </span>
                      )}
                   </div>
                </div>

                {/* Category Selection */}
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-3">What is this regarding?</label>
                   <div className="grid grid-cols-2 gap-3">
                      {['Food Quality', 'Service', 'Ambiance', 'Online Order', 'Other'].map((cat) => (
                         <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                               category === cat 
                                  ? 'bg-warm-gold text-deep-black shadow-soft-gold font-bold scale-[1.02]' 
                                  : 'bg-dark-slate/5 text-gray-400 hover:bg-dark-slate/10 hover:text-dark-slate border border-dark-slate/5'
                            }`}
                         >
                            {cat}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Comment */}
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-3">Your Feedback</label>
                   <div className="relative">
                      <textarea 
                         rows="4"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                         className="input-field resize-none rounded-2xl"
                         placeholder="Start typing..."
                      ></textarea>
                      <div className="absolute right-3 bottom-3 text-gray-600 text-xs pointer-events-none">
                         {comment.length}/500
                      </div>
                   </div>
                </div>

                {/* Submit */}
                <button 
                   type="submit" 
                   disabled={isSubmitting || !rating}
                   className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg shadow-soft-gold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                   ) : (
                      <>
                         <span>Send Feedback</span>
                         <PaperAirplaneIcon className="w-5 h-5" />
                      </>
                   )}
                </button>
             </form>
          </div>
       </div>
    </div>
  )
}

export default Feedback
