import { useState } from 'react'
import { useQuery } from 'react-query'
import { adminAPI, IMAGE_BASE_URL } from '../../services/api'
import { 
  FunnelIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const AdminFeedback = () => {
  const [filters, setFilters] = useState({
    type: '',
    rating: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [imageError, setImageError] = useState({})

  const { data: feedbackData, isLoading } = useQuery(
    ['admin-feedback', filters],
    () => adminAPI.getFeedback({ limit: 50, ...filters })
  )

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      index < rating ? (
        <StarIconSolid key={index} className="w-4 h-4 text-warm-gold" />
      ) : (
        <StarIcon key={index} className="w-4 h-4 text-gray-600" />
      )
    ));
  };

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
                 <span className="text-xl">💬</span>
                 <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Customer Voice</span>
              </div>
              <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Feedback & Reviews</h1>
              <p className="text-gray-400">Monitor customer satisfaction and reviews</p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                showFilters 
                  ? 'bg-warm-gold text-black border-warm-gold' 
                  : 'bg-dark-slate/5 text-gray-400 border-dark-slate/10 hover:border-warm-gold/30 hover:text-dark-slate'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="font-bold">{showFilters ? 'Hide Filters' : 'Filter List'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="input-field w-full appearance-none cursor-pointer"
                >
                  <option value="" className="bg-pearl">All Types</option>
                  <option value="restaurant" className="bg-pearl">Restaurant Review</option>
                  <option value="menu_item" className="bg-pearl">Menu Item Review</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="input-field w-full appearance-none cursor-pointer"
                >
                  <option value="" className="bg-pearl">All Ratings</option>
                  <option value="5" className="bg-pearl">5 Stars</option>
                  <option value="4" className="bg-pearl">4 Stars</option>
                  <option value="3" className="bg-pearl">3 Stars</option>
                  <option value="2" className="bg-pearl">2 Stars</option>
                  <option value="1" className="bg-pearl">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="glass-panel rounded-2xl border border-dark-slate/10 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {feedbackData?.data?.feedback?.map((item) => (
                <div key={item._id} className="p-6 hover:bg-dark-slate/5 transition-colors group">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* User Info */}
                    <div className="flex items-start gap-4 min-w-[200px]">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-600 font-bold border border-dark-slate/10 overflow-hidden shrink-0">
                        {item.user?.avatar && !imageError[item._id] ? (
                          <img 
                            src={item.user.avatar.startsWith('http') ? item.user.avatar : `${IMAGE_BASE_URL}/${item.user.avatar}`} 
                            alt={item.user.name} 
                            className="w-full h-full object-cover" 
                            onError={() => setImageError(prev => ({ ...prev, [item._id]: true }))}
                          />
                        ) : (
                          <span className="text-lg">{item.user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-dark-slate group-hover:text-warm-gold transition-colors">
                          {item.user?.name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border bg-dark-slate/5 border-dark-slate/10 text-gray-400">
                           {item.type === 'menu_item' ? 'Item Review' : 'General Feedback'}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-1">
                            {renderStars(item.rating)}
                         </div>
                         {item.menuItem && (
                            <span className="text-xs font-bold text-warm-gold bg-warm-gold/10 px-2 py-1 rounded border border-warm-gold/20">
                               Target: {item.menuItem.name}
                            </span>
                         )}
                      </div>
                      
                      <div className="bg-black/20 p-4 rounded-xl border border-dark-slate/5">
                        <p className="text-gray-600 italic text-sm leading-relaxed">"{item.comment}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {feedbackData?.data?.feedback?.length === 0 && (
                <div className="py-20 text-center">
                   <div className="w-20 h-20 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-dark-slate/20">
                      <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-400" />
                   </div>
                  <h3 className="text-xl font-bold text-dark-slate mb-2">No feedback found</h3>
                  <p className="text-gray-400">No reviews match your current filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminFeedback
