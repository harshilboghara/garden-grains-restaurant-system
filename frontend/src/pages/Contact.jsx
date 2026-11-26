import { useState } from 'react'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { contactAPI } from '../services/api'
import toast from 'react-hot-toast'

const Contact = () => {
   const [formData, setFormData] = useState({
     name: '',
     email: '',
     subject: '',
     message: ''
   })
   const [loading, setLoading] = useState(false)
   const [success, setSuccess] = useState(false)

   const handleSubmit = async (e) => {
     e.preventDefault()
     setLoading(true)
     try {
       await contactAPI.sendMessage(formData)
       setSuccess(true)
       toast.success('Message sent! We will get back to you soon.')
       setFormData({ name: '', email: '', subject: '', message: '' })
     } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to send message. Please try again.')
       console.error('Contact form error:', error)
     } finally {
       setLoading(false)
     }
   }

   const contactMethods = [
     {
       icon: MapPinIcon,
       title: "Our Location",
       details: ["Garden Grains, City Center", "Ahmedabad, Gujarat 380001"],
       color: "text-organic-green" 
     },
     {
       icon: PhoneIcon,
       title: "Call Us",
       details: ["+91 98765 43210", "+91 98765 43211"],
       color: "text-warm-gold"
     },
     {
       icon: EnvelopeIcon,
       title: "Email Us",
       details: ["info@gardengrains.com", "support@gardengrains.com"],
       color: "text-blue-400"
     }
   ]

   return (
     <div className="min-h-screen relative pt-24 pb-20">
       {/* Background Ambience */}
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
         
         {/* Header */}
         <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
              <span className="text-xl">📞</span>
              <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">Get In Touch</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-bold text-dark-slate mb-6 font-heading">
             We'd Love to <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-orange-400">Hear From You</span>
           </h1>
           <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
             Have a question, feedback, or just want to say hello? 
             Our team is here to assist you with anything you need.
           </p>
         </div>

         {/* Contact Methods Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up">
            {contactMethods.map((method, idx) => (
               <div key={idx} className="glass-panel p-8 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 hover:-translate-y-2 group text-center">
                  <div className={`w-14 h-14 bg-dark-slate/5 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform ${method.color.replace('text-', 'bg-')}/20`}>
                     <method.icon className={`w-6 h-6 ${method.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-dark-slate mb-4">{method.title}</h3>
                  <div className="space-y-1">
                     {method.details.map((line, i) => (
                        <p key={i} className="text-gray-400">{line}</p>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* Form & Map Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Contact Form */}
            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-dark-slate/10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warm-gold to-organic-green" />
               
               <h2 className="text-2xl font-bold text-dark-slate mb-6 font-heading">Send us a Message</h2>
               
               {success ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                     <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 text-3xl">✓</div>
                     <h3 className="text-xl font-bold text-dark-slate mb-2">Message Sent!</h3>
                     <p className="text-gray-400">We'll get back to you shortly.</p>
                     <button 
                        onClick={() => setSuccess(false)}
                        className="mt-6 text-warm-gold hover:text-dark-slate underline"
                     >
                        Send another message
                     </button>
                  </div>
               ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                           <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="input-field"
                              placeholder="John Doe"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                           <input 
                              type="email" 
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="input-field"
                              placeholder="john@example.com"
                           />
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                        <input 
                           type="text" 
                           required
                           value={formData.subject}
                           onChange={(e) => setFormData({...formData, subject: e.target.value})}
                           className="input-field"
                           placeholder="How can we help?"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                        <textarea 
                           required
                           rows="5"
                           value={formData.message}
                           onChange={(e) => setFormData({...formData, message: e.target.value})}
                           className="input-field resize-none"
                           placeholder="Type your message here..."
                        ></textarea>
                     </div>
                     
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center space-x-2 shadow-soft-gold"
                     >
                        {loading ? (
                           <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                           <>
                              <span>Send Message</span>
                              <PaperAirplaneIcon className="w-5 h-5" />
                           </>
                        )}
                     </button>
                  </form>
               )}
            </div>

            {/* Map Placeholder */}
            <div className="glass-panel p-4 rounded-3xl border border-dark-slate/10 h-full min-h-[500px] flex flex-col relative group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
               
               <div className="flex-1 bg-pearl/50 rounded-2xl relative overflow-hidden">
                  {/* Actual Map Iframe would go here */}
                  <img 
                     src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                     alt="Map Location" 
                     className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-pearl/90 p-6 rounded-2xl border border-warm-gold/30 text-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                        <MapPinIcon className="w-8 h-8 text-warm-gold mx-auto mb-3 animate-bounce" />
                        <h3 className="text-xl font-bold text-dark-slate">Find Us Here</h3>
                        <p className="text-gray-400 text-sm mt-1">Garden Grains HQ</p>
                        <a 
                           href="https://maps.google.com" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="mt-4 inline-block text-warm-gold hover:text-dark-slate text-sm font-bold underline"
                        >
                           Get Directions
                        </a>
                     </div>
                  </div>
               </div>
            </div>

         </div>
       </div>
     </div>
   )
}

export default Contact
