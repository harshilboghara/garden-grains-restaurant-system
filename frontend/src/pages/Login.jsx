import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import BrandLogo from '../components/common/BrandLogo'
import { motion, AnimatePresence } from 'framer-motion'
import BackgroundParticles from '../components/ui/BackgroundParticles'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { login, isAuthenticated, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

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
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      } else {
        if (result.notVerified) {
          toast.error('Email not verified. Redirecting to verification...')
          setTimeout(() => {
            navigate('/register', { state: { email: result.email, showOTP: true } })
          }, 2000)
          return
        }
        if (result.error?.includes('429')) setRateLimitCountdown(60)
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Login failed')
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
    <div className="relative min-h-screen overflow-hidden bg-deep-black font-sans selection:bg-warm-gold selection:text-deep-black">
      <BackgroundParticles />
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: mousePosition.x * 0.05,
            y: mousePosition.y * 0.05
          }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-warm-gold/10 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ 
            x: -mousePosition.x * 0.03,
            y: -mousePosition.y * 0.03
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-warm-gold/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left Side: Cinematic Brand Experience */}
        <div className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
          {/* Animated Background Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             {[...Array(5)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ height: 0, top: "50%" }}
                 animate={{ height: "100%", top: "0%" }}
                 transition={{ duration: 2, delay: i * 0.2, ease: "circOut" }}
                 className="absolute w-[1px] bg-gradient-to-b from-transparent via-warm-gold/40 to-transparent"
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
              <BrandLogo className="w-24 h-24 mb-14 filter drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
            </motion.div>
            
            <h1 className="text-8xl font-black font-heading tracking-tighter mb-8 leading-[0.9] text-white">
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="block"
              >Premium</motion.span>
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-warm-gold italic mix-blend-lighten block ml-4"
              >Dining</motion.span>
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="block"
              >Experience.</motion.span>
            </h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 1, duration: 1 }}
              className="h-1 bg-warm-gold mb-12"
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.2 }}
              className="text-xl text-soft-gray leading-relaxed max-w-sm"
            >
              Sign in to continue your journey with Garden Grains and access exclusive culinary features.
            </motion.p>
          </motion.div>

          {/* Interactive Mouse Blob */}
          <motion.div 
            animate={{ 
              x: mousePosition.x * 0.1 - 200,
              y: mousePosition.y * 0.1 - 200,
            }}
            transition={{ type: 'spring', damping: 30 }}
            className="absolute z-[-1] w-80 h-80 bg-warm-gold/10 rounded-full blur-[100px] pointer-events-none"
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
              <h2 className="text-4xl font-bold text-white font-heading mb-2">Welcome Back!</h2>
              <p className="text-soft-gray">
                Sign in to continue your premium dining experience. Or{' '}
                <Link
                  to="/register"
                  className="font-medium text-warm-gold hover:text-white transition-colors"
                >
                  create a new account
                </Link>
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-soft-gray mb-2 ml-1">
                  Email address
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-warm-gold/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-soft-gray/30"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-sm font-medium text-soft-gray">
                    Password
                  </label>
                  <Link to="/forgot-password" size="sm" className="text-sm text-warm-gold hover:text-white transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-warm-gold/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-soft-gray/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-soft-gray/40 hover:text-warm-gold transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-3 ml-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-warm-gold focus:ring-warm-gold focus:ring-offset-deep-black"
                />
                <label htmlFor="remember" className="text-sm text-soft-gray/60 select-none">Remember me</label>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || rateLimitCountdown > 0}
                  className="w-full bg-warm-gold text-deep-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-2 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 group shadow-lg shadow-warm-gold/10"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-deep-black/30 border-t-deep-black rounded-full animate-spin"></div>
                  ) : rateLimitCountdown > 0 ? (
                    `Try again in ${rateLimitCountdown}s`
                  ) : (
                    'Sign in'
                  )}
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center pt-8 border-t border-white/5">
                <p className="text-soft-gray/60">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-warm-gold font-semibold hover:text-white transition-colors">
                    Sign up here
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
