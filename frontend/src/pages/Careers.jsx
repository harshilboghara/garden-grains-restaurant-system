import { BriefcaseIcon, UserGroupIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const Careers = () => {
  const openings = [
    { 
      title: 'Head Chef', 
      type: 'Full-time', 
      location: 'Ahmedabad',
      description: 'Lead our culinary team in crafting innovative vegetarian masterpieces.'
    },
    { 
      title: 'Restaurant Manager', 
      type: 'Full-time', 
      location: 'Ahmedabad',
      description: 'Ensure seamless operations and deliver an exceptional guest experience.' 
    },
    { 
      title: 'Digital Marketing Specialist', 
      type: 'Part-time', 
      location: 'Remote',
      description: 'Amplify our brand story across digital platforms.'
    },
    { 
      title: 'Sous Chef', 
      type: 'Full-time', 
      location: 'Ahmedabad',
      description: 'Support the Head Chef in kitchen management and menu execution.' 
    }
  ]

  const benefits = [
    {
      icon: SparklesIcon,
      title: "Creative Freedom",
      description: "We encourage innovation. Your ideas for new dishes and improvements are always valued."
    },
    {
      icon: UserGroupIcon,
      title: "Inclusive Culture",
      description: "A supportive environment where every team member is treated with respect and dignity."
    },
    {
      icon: BriefcaseIcon,
      title: "Growth Opportunities",
      description: "Regular training, mentorship, and clear paths for career advancement."
    }
  ]

  return (
    <div className="min-h-screen relative pt-24 pb-20">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
           <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
             <span className="text-xl">🚀</span>
             <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Join Our Team</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark-slate mb-6 font-heading">
            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-organic-green">Legacy</span> With Us
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're looking for passionate individuals who want to redefine the future of vegetarian dining.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 animate-slide-up">
           {benefits.map((benefit, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 hover:-translate-y-2 group">
                 <div className="w-14 h-14 bg-dark-slate/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-warm-gold/20 transition-colors">
                    <benefit.icon className="w-8 h-8 text-gray-400 group-hover:text-warm-gold transition-colors" />
                 </div>
                 <h3 className="text-xl font-bold text-dark-slate mb-3 group-hover:text-warm-gold transition-colors">{benefit.title}</h3>
                 <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </div>
           ))}
        </div>

        {/* Open Positions */}
        <div>
           <h2 className="text-3xl font-bold text-dark-slate mb-10 font-heading">Open Positions</h2>
           <div className="grid grid-cols-1 gap-6">
              {openings.map((job, idx) => (
                 <div key={idx} className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 group flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                       <h3 className="text-2xl font-bold text-dark-slate mb-2 group-hover:text-warm-gold transition-colors">{job.title}</h3>
                       <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                          <span className="bg-dark-slate/5 px-3 py-1 rounded-full border border-dark-slate/10">{job.type}</span>
                          <span className="bg-dark-slate/5 px-3 py-1 rounded-full border border-dark-slate/10">{job.location}</span>
                       </div>
                       <p className="text-gray-400 max-w-2xl">{job.description}</p>
                    </div>
                    <a 
                      href={`mailto:careers@gardengrains.com?subject=Application for ${job.title}`}
                      className="btn-primary group/btn flex items-center space-x-2 whitespace-nowrap"
                    >
                       <span>Apply Now</span>
                       <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                 </div>
              ))}
           </div>
        </div>

        {/* No Openings Fallback */}
        <div className="mt-16 text-center glass-panel p-10 rounded-2xl border border-dark-slate/5">
           <h3 className="text-2xl font-bold text-dark-slate mb-4">Don't see the right role?</h3>
           <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              We are always on the lookout for talent. Send us your resume and tell us why you'd be a great fit for Garden Grains.
           </p>
           <a href="mailto:careers@gardengrains.com" className="btn-secondary">
              Email Your Resume
           </a>
        </div>

      </div>
    </div>
  )
}

export default Careers
