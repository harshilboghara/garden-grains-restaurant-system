import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PencilIcon, 
  SparklesIcon, 
  HeartIcon, 
  GlobeAsiaAustraliaIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import RatingModal from '../components/orders/RatingModal'
import ReviewsList from '../components/reviews/ReviewsList'
import toast from 'react-hot-toast'
import { feedbackAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from 'react-query'

const About = () => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Fetch reviews to check if user already submitted one
  const { data: reviewsData, refetch: refetchReviews } = useQuery(
    'restaurant-feedbacks',
    () => feedbackAPI.getRestaurantFeedback(),
    {
      select: (data) => data.data.feedbacks
    }
  )

  const hasReviewed = reviewsData?.some(review => review.user?._id === user?._id)

  const handleReviewSubmit = async (reviewData) => {
    try {
      await feedbackAPI.submitRestaurantFeedback(reviewData.rating, reviewData.comment)
      toast.success('Thank you for your review! 🌟')
      setReviewModalOpen(false)
      refetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
      console.error(error)
    }
  }

  const values = [
    {
      icon: SparklesIcon,
      title: "Chef-Crafted Excellence",
      description: "Every dish is a masterpiece, meticulously designed by our expert chefs to delight your senses."
    },
    {
      icon: GlobeAsiaAustraliaIcon,
      title: "Sustainable Sourcing",
      description: "We partner with local organic farms to ensure our ingredients are fresh, ethical, and eco-friendly."
    },
    {
      icon: HeartIcon,
      title: "Pure Vegetarian",
      description: "Celebrating the power of plants with 100% vegetarian recipes that nourish both body and soul."
    },
    {
      icon: UserGroupIcon,
      title: "Community First",
      description: "More than a restaurant, we are a gathering place for those who appreciate mindful eating."
    }
  ]

  return (
    <div className="min-h-screen relative pt-20">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-warm-gold/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
             <span className="text-xl">✨</span>
             <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark-slate mb-6 font-heading">
            Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-orange-400">Culinary Magic</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            Welcome to Garden Grains, where we redefine vegetarian dining. 
            We believe that plant-based food should be an indulgent, artistic, and flavor-forward experience.
          </p>
        </div>

        {/* Image & Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 animate-slide-up">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-warm-gold to-organic-green rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative rounded-2xl overflow-hidden h-[400px] border border-dark-slate/10">
                <img 
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Restaurant Interior" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              </div>
           </div>
           
           <div className="space-y-6">
              <h2 className="text-3xl font-bold text-dark-slate font-heading">A Symphony of Flavors</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                Founded in 2024, Garden Grains emerged from a simple desire: to elevate vegetarian cuisine to a fine-dining standard. 
                Our kitchen is a laboratory of taste, where traditional recipes meet modern gastronomy.
              </p>
              <p className="text-gray-400 leading-relaxed text-lg">
                We believe that food is not just fuel, but a conversation. Every plate tells a story of the soil it came from, 
                the hands that harvested it, and the passion with which it was prepared.
              </p>
              
              <div className="pt-4 flex flex-wrap gap-4">
                 <div className="glass-panel px-6 py-4 rounded-xl border-l-4 border-warm-gold">
                    <p className="text-3xl font-bold text-dark-slate">15+</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Years Experience</p>
                 </div>
                 <div className="glass-panel px-6 py-4 rounded-xl border-l-4 border-organic-green">
                    <p className="text-3xl font-bold text-dark-slate">50k+</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Happy Guests</p>
                 </div>
                 <div className="glass-panel px-6 py-4 rounded-xl border-l-4 border-orange-500">
                    <p className="text-3xl font-bold text-dark-slate">100%</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Organic Sourced</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Values Grid */}
        <div className="mb-24">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-dark-slate mb-4 font-heading">Our Philosophy</h2>
              <div className="w-20 h-1 bg-warm-gold mx-auto rounded-full" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, idx) => (
                 <div key={idx} className="glass-panel p-8 rounded-2xl border border-dark-slate/5 hover:border-warm-gold/40 transition-all duration-300 hover:-translate-y-2 group">
                    <div className="w-14 h-14 bg-dark-slate/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-warm-gold/20 transition-colors">
                       <val.icon className="w-8 h-8 text-gray-400 group-hover:text-warm-gold transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-dark-slate mb-3 group-hover:text-warm-gold transition-colors">{val.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{val.description}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           <div className="glass-panel rounded-3xl overflow-hidden border border-dark-slate/10 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-organic-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="p-8 md:p-12 relative z-10">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                       <h2 className="text-3xl font-bold text-dark-slate font-heading mb-2">Guest Experiences</h2>
                       <p className="text-gray-400">Hear what our cherished patrons have to say</p>
                    </div>
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      disabled={hasReviewed}
                      className={`btn-primary group flex items-center space-x-2 shadow-soft-gold transition-all duration-300 ${
                        hasReviewed ? 'opacity-50 cursor-not-allowed grayscale' : ''
                      }`}
                      title={hasReviewed ? 'You have already submitted a review' : 'Share your experience'}
                    >
                      <PencilIcon className="h-5 w-5" />
                      <span>{hasReviewed ? 'Already Reviewed' : 'Write a Review'}</span>
                    </button>
                 </div>
                 
                 <div className="bg-black/20 rounded-2xl p-6 border border-dark-slate/5">
                    <ReviewsList itemId="restaurant" />
                 </div>
              </div>
           </div>
        </div>

        {/* Location & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-colors text-center">
              <h3 className="text-lg font-bold text-dark-slate mb-2 uppercase tracking-wide">Visit Us</h3>
              <p className="text-gray-400">Garden Grains, City Center</p>
              <p className="text-gray-400">Ahmedabad, Gujarat</p>
           </div>
           
           <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-colors text-center">
              <h3 className="text-lg font-bold text-dark-slate mb-2 uppercase tracking-wide">Opening Hours</h3>
              <p className="text-gray-400">Mon - Sun</p>
              <p className="text-warm-gold font-bold">11:00 AM – 11:00 PM</p>
           </div>
           
           <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-colors text-center">
              <h3 className="text-lg font-bold text-dark-slate mb-2 uppercase tracking-wide">Contact</h3>
              <p className="text-gray-400">support@gardengrains.com</p>
              <p className="text-gray-400">+91 98765 43210</p>
           </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12">
           <Link to="/menu" className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-deep-black bg-white rounded-full hover:bg-warm-gold hover:shadow-soft-gold transition-all duration-300 transform hover:scale-105">
              Explore Our Menu
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
           </Link>
        </div>

      </div>

      {/* Review Modal */}
      <RatingModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        menuItem={{ name: 'Garden Grains Restaurant' }}
      />
    </div>
  )
}

export default About
