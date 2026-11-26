import { Link } from 'react-router-dom'
import { ClockIcon, UserGroupIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline'

const Story = () => {
  const milestones = [
    {
      year: '2018',
      title: 'The Spark',
      description: 'We started as a weekend pop-up in a small garage with just five signature bowls and a dream to redefine vegetarian food.',
      icon: SparklesIcon
    },
    {
      year: '2020',
      title: 'Our First Kitchen',
      description: 'Despite global challenges, we opened our first brick-and-mortar kitchen, partnering with 12 local organic farms.',
      icon: FireIcon
    },
    {
      year: '2022',
      title: 'Community Growth',
      description: 'Expanded our menu to include vegan and gluten-free options, serving over 10,000 happy guests.',
      icon: UserGroupIcon
    },
    {
      year: '2024',
      title: 'The Future',
      description: 'Launching our premium dining experience with a focus on sustainable, tech-enabled gastronomy.',
      icon: ClockIcon
    },
  ]

  return (
    <div className="min-h-screen relative pt-24 pb-20">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-organic-green/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
             <span className="text-xl">📖</span>
             <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Our Journey</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-dark-slate mb-8 font-heading">
            From <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-orange-400">Passion</span> to Plate
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            Garden Grains wasn't built in a boardroom. It was born in a kitchen, fueled by the belief that 
            vegetarian food should be celebrated, not just tolerated.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-3xl overflow-hidden h-[500px] mb-24 border border-dark-slate/10 group animate-slide-up">
           <div className="absolute inset-0 bg-gradient-to-t from-pearl via-transparent to-transparent opacity-60 z-10" />
           <img 
             src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
             alt="Chefs cooking" 
             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
           />
           <div className="absolute bottom-10 left-10 z-20 max-w-2xl">
              <h2 className="text-3xl font-bold text-dark-slate mb-4 font-heading">The Art of Cooking</h2>
              <p className="text-gray-600 text-lg">
                Every dish tells a story of tradition, innovation, and an obsessive attention to detail.
              </p>
           </div>
        </div>

        {/* Timeline */}
        <div className="relative mb-24">
           {/* Center Line */}
           <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-warm-gold/0 via-warm-gold/50 to-warm-gold/0 hidden md:block" />
           
           <div className="space-y-12">
              {milestones.map((milestone, idx) => (
                 <div key={idx} className={`flex flex-col md:flex-row items-center justify-between gap-8 group ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Content */}
                    <div className="w-full md:w-[45%] glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 hover:-translate-y-2">
                       <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-dark-slate/5 rounded-xl text-warm-gold group-hover:bg-warm-gold group-hover:text-deep-black transition-colors">
                             <milestone.icon className="h-6 w-6" />
                          </div>
                          <span className="text-2xl font-bold text-warm-gold font-heading">{milestone.year}</span>
                       </div>
                       <h3 className="text-xl font-bold text-dark-slate mb-3">{milestone.title}</h3>
                       <p className="text-gray-400 leading-relaxed">{milestone.description}</p>
                    </div>

                    {/* Circle on Line */}
                    <div className="relative hidden md:flex items-center justify-center w-10">
                       <div className="w-4 h-4 bg-pearl border-2 border-warm-gold rounded-full z-10 group-hover:scale-150 transition-transform duration-300 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    </div>

                    {/* Spacer for alternate side */}
                    <div className="w-full md:w-[45%] hidden md:block" />
                 </div>
              ))}
           </div>
        </div>

        {/* Mission Statement */}
        <div className="glass-panel p-10 md:p-16 rounded-3xl border border-dark-slate/10 text-center relative overflow-hidden animate-slide-up">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-warm-gold/5 to-transparent opacity-50" />
           <div className="relative z-10">
              <h2 className="text-4xl font-bold text-dark-slate mb-8 font-heading">Our Mission</h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light italic">
                "To prove that plant-based food is not a limitation, but a liberation. 
                We strive to make wholesome eating accessible, joyful, and an uncompromisingly delicious choice for everyone."
              </p>
              
              <div className="mt-12 flex justify-center gap-6">
                 <Link to="/menu" className="btn-primary shadow-soft-gold">
                    Taste Our Mission
                 </Link>
                 <Link to="/contact" className="btn-secondary">
                    Join Our Team
                 </Link>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}

export default Story
