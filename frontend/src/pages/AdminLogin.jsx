import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import BrandLogo from '../components/common/BrandLogo'
import { motion, AnimatePresence } from 'framer-motion'
import BackgroundParticles from '../components/ui/BackgroundParticles'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { login, logout, isAuthenticated, user, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin'

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate(from, { replace: true })
      } else {
        // If a non-admin happens to be authenticated and visits this page, log them out
        logout()
        toast.error('Unauthorized access. Admin privileges required.')
      }
    }
  }, [isAuthenticated, user, navigate, from, logout])

  useEffect(() => {
    if (error && error.trim() !== '') {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rateLimitCountdown > 0) return
    
    setIsLoading(true)
    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        if (result.user?.role === 'admin') {
          toast.success('Welcome back, Admin!')
          navigate(from, { replace: true })
        } else {
          logout()
          toast.error('Unauthorized access. Admin privileges required.')
        }
      } else {
        if (result.notVerified) {
          toast.error('Admin email not verified. Please verify your email.')
          return
        }
        if (result.error?.includes('429')) setRateLimitCountdown(60)
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Admin Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => setRateLimitCountdown(v => v - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [rateLimitCountdown])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070A] font-sans selection:bg-red-500/30 selection:text-white">
      <BackgroundParticles />
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: mousePosition.x * 0.05,
            y: mousePosition.y * 0.05
          }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ 
            x: -mousePosition.x * 0.03,
            y: -mousePosition.y * 0.03
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left Side: Cinematic Brand Experience */}
        <div className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
          {/* Animated Background Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             {[...Array(5)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ height: 0, top: "50%" }}
                 animate={{ height: "100%", top: "0%" }}
                 transition={{ duration: 2, delay: i * 0.2, ease: "circOut" }}
                 className="absolute w-[1px] bg-gradient-to-b from-transparent via-red-500/40 to-transparent"
                 style={{ left: `${20 * (i + 1)}%` }}
               />
             ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl relative"
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <BrandLogo className="w-24 h-24 mb-14 filter drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]" />
            </motion.div>
            
            <h1 className="text-8xl font-black font-heading tracking-tighter mb-8 leading-[0.9] text-white">
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="block"
              >Admin</motion.span>
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-red-500 italic mix-blend-lighten block ml-4"
              >Control</motion.span>
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="block"
              >Center.</motion.span>
            </h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 1, duration: 1 }}
              className="h-1 bg-red-600 mb-12"
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.2 }}
              className="text-xl text-soft-gray leading-relaxed max-w-sm"
            >
              Authorized personnel only. Access system configuration, analytics and operational controls.
            </motion.p>
          </motion.div>

          {/* Interactive Mouse Blob */}
          <motion.div 
            animate={{ 
              x: mousePosition.x * 0.1 - 200,
              y: mousePosition.y * 0.1 - 200,
            }}
            transition={{ type: 'spring', damping: 30 }}
            className="absolute z-[-1] w-80 h-80 bg-red-900/10 rounded-full blur-[100px] pointer-events-none"
          />
        </div>

        {/* Right Side: Immersive Form Section */}
        <div className="flex flex-col justify-center items-center lg:items-start p-8 lg:p-24 relative lg:bg-deep-black/40 lg:backdrop-blur-3xl border-l border-white/5">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-12 flex flex-col items-center">
              <BrandLogo />
            </div>

            <motion.div variants={itemVariants} className="mb-10">
              <h2 className="text-4xl font-bold text-white font-heading mb-2">System Login</h2>
              <p className="text-soft-gray">
                Please enter your core credentials.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-soft-gray mb-2 ml-1">
                  Administrator Email
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@gardengrains.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-soft-gray/30"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-red-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-sm font-medium text-soft-gray">
                    Security Key
                  </label>
                </div>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your security key"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-soft-gray/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-soft-gray/40 hover:text-red-500 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl border border-red-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || rateLimitCountdown > 0}
                  className="w-full bg-red-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center space-x-2 hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 group shadow-lg shadow-red-600/20"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : rateLimitCountdown > 0 ? (
                    `Connection locked. Retry in ${rateLimitCountdown}s`
                  ) : (
                    <span className="flex gap-2 items-center">Engage Session <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"/></span>
                  )}
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center pt-8 border-t border-white/5">
                <p className="text-soft-gray/40 text-xs text-center max-w-xs mx-auto">
                  By logging in, you agree to the organization's security policy. All activities are monitored.
                </p>
                <div className="mt-4">
                   <Link to="/" className="text-red-500 hover:text-red-400 text-sm transition-colors">
                     Back to User Site
                   </Link>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
