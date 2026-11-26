import { useState } from 'react'
import { PlusSmallIcon, MinusSmallIcon } from '@heroicons/react/24/outline'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: "Ordering & Menu",
      items: [
         { q: 'Is everything on the menu vegetarian?', a: 'Yes! Garden Grains is a 100% vegetarian kitchen. We also offer extensive vegan and gluten-free options, all clearly labeled on our menu.' },
         { q: 'Can I customize my order?', a: 'Absolutely. Most of our dishes can be customized with add-ons, spice levels, and dietary adjustments. Look for the "Customize" button when selecting an item.' },
         { q: 'Do you use organic ingredients?', a: 'We prioritize organic, locally sourced produce whenever possible. We partner with over 15 local farms to ensure freshness and sustainability.' }
      ]
    },
    {
      category: "Delivery & Pickup",
      items: [
         { q: 'What are your delivery areas?', a: 'We currently deliver to all neighborhoods within a 10-mile radius of downtown Garden City. You can check if we deliver to your address at checkout.' },
         { q: 'How long does delivery take?', a: 'Create an account to track your order in real-time. Typical delivery times are 30-45 minutes depending on traffic and kitchen volume.' },
         { q: 'Is there a minimum order value?', a: 'There is no minimum order for pickup. For delivery, we require a minimum order of $20 to ensure efficiency.' }
      ]
    },
    {
      category: "Account & Payments",
      items: [
         { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, Apple Pay, Google Pay, and Garden Grains Gift Cards. Cash on delivery is also available for select areas.' },
         { q: 'How do I reset my password?', a: 'Go to the Login page and click "Forgot Password". We will send you a secure link to reset your credentials.' },
         { q: 'Where can I see my order history?', a: 'Log in to your account and visit the "Orders" section in your profile to view past orders and reorder your favorites.' }
      ]
    }
  ]

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen relative pt-24 pb-20">
       {/* Background Ambience */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
           <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
              <span className="text-xl">🤔</span>
              <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Common Questions</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-6 font-heading">
             Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-organic-green">Questions</span>
           </h1>
           <p className="text-lg text-gray-400 max-w-2xl mx-auto">
             Find quick answers to your questions about our food, service, and policies.
           </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12 animate-slide-up">
           {faqs.map((section, catIndex) => (
              <div key={catIndex}>
                 <h2 className="text-2xl font-bold text-dark-slate mb-6 pl-2 border-l-4 border-warm-gold">{section.category}</h2>
                 <div className="space-y-4">
                    {section.items.map((faq, index) => {
                       const globalIndex = `${catIndex}-${index}`;
                       const isOpen = openIndex === globalIndex;
                       
                       return (
                          <div 
                             key={index} 
                             className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-warm-gold/50 bg-dark-slate/5' : 'border-dark-slate/10 hover:border-warm-gold/30'}`}
                          >
                             <button
                                onClick={() => toggleAccordion(globalIndex)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                             >
                                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-warm-gold' : 'text-dark-slate'}`}>
                                   {faq.q}
                                </span>
                                <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-warm-gold/20 text-warm-gold' : 'bg-dark-slate/5 text-gray-400'}`}>
                                   {isOpen ? <MinusSmallIcon className="w-5 h-5" /> : <PlusSmallIcon className="w-5 h-5" />}
                                </div>
                             </button>
                             
                             <div 
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                   isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                             >
                                <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-dark-slate/5 mx-6 mt-2">
                                   {faq.a}
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>
           ))}
        </div>
        
        {/* Still have questions? */}
        <div className="mt-20 text-center glass-panel p-10 rounded-3xl border border-dark-slate/10">
           <h3 className="text-2xl font-bold text-dark-slate mb-4">Still have questions?</h3>
           <p className="text-gray-400 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
           <a href="/contact" className="btn-primary">Get in Touch</a>
        </div>

      </div>
    </div>
  )
}

export default FAQ
