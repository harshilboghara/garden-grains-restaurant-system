import { useState, useEffect } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import axios from 'axios'

const ReviewsList = ({ itemId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const endpoint = itemId === "restaurant" 
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feedback/restaurant`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feedback/menu/${itemId}`;
            
        const response = await axios.get(endpoint)
        // Restaurant feedback endpoint returns { feedbacks: [...] } just like menu feedback
        setReviews(response.data.feedbacks || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews')
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    if (itemId) {
      fetchReviews()
    }
  }, [itemId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse glass-panel p-4 rounded-xl border border-dark-slate/5">
            <div className="w-1/4 h-4 mb-2 bg-dark-slate/10 rounded"></div>
            <div className="w-full h-3 mb-2 bg-dark-slate/5 rounded"></div>
            <div className="w-5/6 h-3 bg-dark-slate/5 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="py-4 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">{error}</div>
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center glass-panel rounded-xl border border-dark-slate/5">
        <p className="text-gray-400">No reviews yet.</p>
        <p className="text-sm text-warm-gold mt-1">Be the first to share your enhance!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-xl font-bold text-dark-slate font-heading">
            Customer Reviews <span className="text-gray-400 text-sm font-normal ml-2">({reviews.length})</span>
         </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="p-5 glass-panel rounded-xl border border-dark-slate/5 hover:border-warm-gold/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-gold/20 to-transparent flex items-center justify-center border border-dark-slate/10 text-warm-gold font-bold text-lg">
                    {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'A'}
                 </div>
                 <div>
                    <p className="font-bold text-dark-slate group-hover:text-warm-gold transition-colors">{review.user?.name || 'Anonymous Guest'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                 </div>
              </div>
              <div className="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded-lg border border-dark-slate/5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating ? 'text-warm-gold shadow-[0_0_5px_rgba(212,175,55,0.4)]' : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <div className="relative pl-4 border-l-2 border-dark-slate/10 group-hover:border-warm-gold/30 transition-colors">
                 <p className="text-sm text-gray-600 leading-relaxed italic">"{review.comment}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsList
