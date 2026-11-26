import { Link } from 'react-router-dom'
import {
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  BookOpenIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const Help = () => {
  const helpCategories = [
    {
      icon: BookOpenIcon,
      title: "Getting Started",
      description: "New to Garden Grains? Learn how to place your first order.",
      link: "/faq"
    },
    {
      icon: LifebuoyIcon,
      title: "Order Issues",
      description: "Missing items, late delivery, or quality concerns? Let us fix it.",
      link: "/contact"
    },
    {
      icon: ShieldCheckIcon,
      title: "Account & Safety",
      description: "Manage your profile, password, and security settings.",
      link: "/profile"
    },
    {
      icon: DocumentTextIcon,
      title: "Billing & Refunds",
      description: "Understand our pricing, payment methods, and refund policies.",
      link: "/refunds"
    },
    {
        icon: QuestionMarkCircleIcon,
        title: "FAQs",
        description: "Quick answers to the most common questions.",
        link: "/faq"
    },
    {
        icon: ChatBubbleBottomCenterTextIcon,
        title: "Feedback",
        description: "Share your thoughts on our food and service.",
        link: "/feedback"
    }
  ]

  return (
    <div className="min-h-screen relative pt-24 pb-20">
       {/* Background Ambience */}
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
           <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
             <span className="text-xl">🆘</span>
             <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Help Center</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark-slate mb-6 font-heading">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-organic-green">help you?</span>
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
             <input 
                type="text" 
                placeholder="Search for answers (e.g., 'refund', 'delivery time')..." 
                className="w-full bg-pearl/50 border border-dark-slate/20 rounded-full py-4 pl-12 pr-6 text-dark-slate focus:outline-none focus:border-warm-gold focus:ring-1 focus:ring-warm-gold/50 transition-all shadow-lg backdrop-blur-md"
             />
             <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-warm-gold transition-colors" />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 animate-slide-up">
           {helpCategories.map((category, idx) => (
              <Link 
                key={idx} 
                to={category.link}
                className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 hover:-translate-y-2 group flex flex-col items-start"
              >
                 <div className="w-12 h-12 bg-dark-slate/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-warm-gold/20 transition-colors">
                    <category.icon className="w-6 h-6 text-gray-400 group-hover:text-warm-gold transition-colors" />
                 </div>
                 <h3 className="text-xl font-bold text-dark-slate mb-2 group-hover:text-warm-gold transition-colors">{category.title}</h3>
                 <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{category.description}</p>
                 
                 <div className="flex items-center text-warm-gold text-sm font-bold group-hover:translate-x-2 transition-transform">
                    <span>Explore</span>
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                 </div>
              </Link>
           ))}
        </div>

        {/* Quick Links / Support Footer */}
        <div className="glass-panel p-10 rounded-3xl border border-dark-slate/10 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-warm-gold/5 to-transparent pointer-events-none" />
           
           <h2 className="text-2xl font-bold text-dark-slate mb-4 relative z-10">Still need tailored support?</h2>
           <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
              Our support team is available 24/7 to assist you with any inquiries or issues.
           </p>
           
           <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/contact" className="btn-primary shadow-soft-gold">
                 Contact Support
              </Link>
              <Link to="/feedback" className="btn-secondary">
                 Give Feedback
              </Link>
           </div>
        </div>

      </div>
    </div>
  )
}

export default Help
