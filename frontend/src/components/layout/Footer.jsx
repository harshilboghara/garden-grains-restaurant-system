import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import BrandLogo from '../common/BrandLogo'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    services: [
      { name: 'Online Ordering', href: '/menu' },
      { name: 'Reservations', href: '/reservations' },
      { name: 'Catering', href: '/catering' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Track Order', href: '/orders' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { name: 'Refund Policy', href: '/refunds' },
      { name: 'Accessibility', href: '/accessibility' },
    ]
  }

  return (
    <footer className="relative bg-pearl text-gray-600 border-t border-dark-slate/10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-organic-green/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <BrandLogo />
            </Link>
            <p className="text-gray-400 max-w-md leading-relaxed">
              Experience fresh, healthy, and delicious vegetarian meals made with the finest organic ingredients. 
              From farm to table, we bring you the best of nature's bounty. <span className="animate-pulse">🌱</span>
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4 group">
                <div className="p-2 glass-panel rounded-lg border border-dark-slate/5 group-hover:border-warm-gold/30 transition-colors">
                  <MapPinIcon className="h-5 w-5 text-warm-gold" />
                </div>
                <span className="text-sm group-hover:text-dark-slate transition-colors">123 Green Street, Garden City, GC 12345</span>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="p-2 glass-panel rounded-lg border border-dark-slate/5 group-hover:border-warm-gold/30 transition-colors">
                  <PhoneIcon className="h-5 w-5 text-warm-gold" />
                </div>
                <span className="text-sm group-hover:text-dark-slate transition-colors">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="p-2 glass-panel rounded-lg border border-dark-slate/5 group-hover:border-warm-gold/30 transition-colors">
                   <EnvelopeIcon className="h-5 w-5 text-warm-gold" />
                </div>
                <span className="text-sm group-hover:text-dark-slate transition-colors">info@gardengrains.com</span>
              </div>
              <div className="flex items-center space-x-4 group">
                 <div className="p-2 glass-panel rounded-lg border border-dark-slate/5 group-hover:border-warm-gold/30 transition-colors">
                    <ClockIcon className="h-5 w-5 text-warm-gold" />
                 </div>
                 <span className="text-sm group-hover:text-dark-slate transition-colors">Mon-Sun: 11:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {[
            { title: 'Company', items: footerLinks.company },
            { title: 'Services', items: footerLinks.services },
            { title: 'Support', items: footerLinks.support }
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-heading font-bold text-dark-slate mb-6 relative inline-block">
                {section.title}
                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-warm-gold"></span>
              </h3>
              <ul className="space-y-3">
                {section.items.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-warm-gold hover:translate-x-1 transition-all duration-300 inline-block text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dark-slate/10 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm flex items-center space-x-2">
              <span>© {currentYear} <span className="text-dark-slate font-medium">Garden Grains</span> Restaurant.</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">All rights reserved.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-400 hover:text-warm-gold text-xs transition-colors duration-200 uppercase tracking-wider"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
