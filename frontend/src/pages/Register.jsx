import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import BrandLogo from '../components/common/BrandLogo'
import { motion } from 'framer-motion'
import BackgroundParticles from '../components/ui/BackgroundParticles'
import Modal from '../components/common/Modal'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOTP] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(0)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { register, verifyOTP, resendOTP, isAuthenticated, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.showOTP && location.state?.email) {
      setShowOTP(true)
      setFormData(prev => ({ ...prev, email: location.state.email }))
      setTimer(60)
    }
  }, [location.state])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOTP(newOTP)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const { confirmPassword, ...userData } = formData
      const result = await register(userData)
      if (result.success) {
        toast.success(result.message || 'OTP sent to your email')
        setShowOTP(true)
        setTimer(60)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setIsLoading(true)
    try {
      const result = await verifyOTP(formData.email, otpString)
      if (result.success) {
        toast.success('Registration successful! Welcome to the collective.')
        navigate('/', { replace: true })
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (timer > 0) return
    
    setIsLoading(true)
    try {
      const result = await resendOTP(formData.email)
      if (result.success) {
        toast.success('OTP resent successfully')
        setTimer(60)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2
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
    <div className="relative min-h-screen overflow-hidden bg-pearl font-sans selection:bg-warm-gold selection:text-deep-black">
      <BackgroundParticles />
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: mousePosition.x * 0.04,
            y: mousePosition.y * 0.04
          }}
          className="absolute top-[-15%] left-[10%] w-[50%] h-[50%] bg-warm-gold/10 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ 
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02
          }}
          className="absolute bottom-[5%] right-[-10%] w-[60%] h-[60%] bg-warm-gold/5 rounded-full blur-[160px]"
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden bg-gradient-to-tr from-white/[0.02] to-transparent">
          {/* Animated Background Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             {[...Array(6)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ height: 0, bottom: "0%" }}
                 animate={{ height: "100%" }}
                 transition={{ duration: 2.5, delay: i * 0.15, ease: "circInOut" }}
                 className="absolute w-[1px] bg-gradient-to-t from-warm-gold/50 via-warm-gold/20 to-transparent"
                 style={{ left: `${15 * (i + 1)}%` }}
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
              whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
              className="inline-block"
            >
              <BrandLogo className="w-24 h-24 mb-14 filter drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]" />
            </motion.div>
            
            <h1 className="text-8xl font-black font-heading tracking-tighter mb-8 leading-[0.9] text-dark-slate">
              <motion.span 
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="block"
              >Join the</motion.span>
              <motion.span 
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-warm-gold italic block ml-6"
              >Elite</motion.span>
              <motion.span 
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="block"
              >Experience.</motion.span>
            </h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ delay: 0.9, duration: 1.2 }}
              className="h-1 bg-warm-gold mb-12 shadow-[0_0_15px_rgba(212,175,55,0.5)]"
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.1 }}
              className="text-xl text-soft-gray leading-relaxed max-w-sm"
            >
              Start your culinary journey. Create an account to access exclusive dining features and bespoke services.
            </motion.p>
          </motion.div>

          {/* Floating Accents */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-12 h-12 border border-warm-gold/20 rounded-lg blur-sm"
          />
        </div>

        {/* Right Side: Registration Form (Scrollable) */}
        <div className="flex flex-col justify-start lg:justify-center items-center py-12 px-6 lg:p-12 overflow-y-auto max-h-screen custom-scrollbar relative lg:bg-pearl/60 lg:backdrop-blur-3xl border-l border-dark-slate/5">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-12 flex flex-col items-center">
              <BrandLogo />
              <h2 className="text-3xl font-bold text-dark-slate mt-6">Create Account</h2>
            </div>
            
            <motion.div variants={itemVariants} className="hidden lg:block mb-6.5">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-warm-gold bg-warm-gold/10 px-4 py-2 rounded-full border border-warm-gold/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-warm-gold animate-pulse-slow" />
                <span>Join the Elite</span>
              </div>
              <h2 className="text-4xl font-bold text-dark-slate font-heading">Create Your Account</h2>
              <p className="mt-2 text-sm text-soft-gray">
                Start your culinary journey. Or{' '}
                <Link
                  to="/login"
                  className="font-medium text-warm-gold hover:text-dark-slate transition-colors"
                >
                  sign in to your existing account
                </Link>
              </p>
            </motion.div>

            {!showOTP ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Primary Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Full Name</label>
                    <div className="relative group">
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-xl px-4 py-2.5 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                      />
                      <div className="absolute inset-0 rounded-xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-all blur-sm scale-[1.02]"></div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Email address</label>
                    <div className="relative group">
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-xl px-4 py-2.5 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                      />
                      <div className="absolute inset-0 rounded-xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-all blur-sm scale-[1.02]"></div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Phone Number</label>
                    <div className="relative group">
                      <input
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-xl px-4 py-2.5 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                      />
                      <div className="absolute inset-0 rounded-xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-all blur-sm scale-[1.02]"></div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Password</label>
                    <div className="relative group">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-xl px-4 py-2.5 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-gray/30 hover:text-warm-gold transition-colors">
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-all blur-sm scale-[1.02]"></div>
                    </div>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Confirm Password</label>
                  <div className="relative group">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-xl px-4 py-2.5 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-gray/30 hover:text-warm-gold transition-colors">
                      {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-all blur-sm scale-[1.02]"></div>
                  </div>
                </motion.div>


                <motion.div variants={itemVariants} className="pt-6 flex flex-col space-y-4">
                  <div className="flex items-start space-x-3 text-sm text-soft-gray/60 leading-relaxed">
                    <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-dark-slate/10 bg-dark-slate/5 text-warm-gold focus:ring-warm-gold" />
                    <span>
                      I agree to the {' '}
                      <button 
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-warm-gold hover:text-dark-slate transition-colors font-semibold underline underline-offset-4"
                      >
                        Terms of Service
                      </button>
                      {' '} and {' '}
                      <button 
                        type="button"
                        onClick={() => setShowPrivacy(true)}
                        className="text-warm-gold hover:text-dark-slate transition-colors font-semibold underline underline-offset-4"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-warm-gold text-deep-black font-bold py-3.5 rounded-xl flex items-center justify-center space-x-3 hover:bg-white transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-deep-black/20 border-t-deep-black rounded-full animate-spin"></div>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <p className="text-center text-sm text-soft-gray/60">
                    Already have an account?{' '}
                    <Link to="/login" className="text-warm-gold font-bold hover:text-dark-slate transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </motion.div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 py-10"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-dark-slate">Verify Your Email</h3>
                  <p className="text-sm text-soft-gray mt-2">
                    We've sent a 6-digit verification code to <span className="text-warm-gold font-semibold">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex justify-between items-center space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 bg-white border border-dark-slate/10 rounded-xl text-center text-2xl font-bold text-dark-slate focus:outline-none focus:border-warm-gold transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-warm-gold text-deep-black font-bold py-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-white transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] group shadow-gold"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-deep-black/20 border-t-deep-black rounded-full animate-spin"></div>
                    ) : (
                      'Verify & Complete Registration'
                    )}
                  </button>

                  <div className="text-center mt-8">
                    <span className="text-sm text-soft-gray mr-2">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={timer > 0 || isLoading}
                      className={`text-sm font-bold transition-all ${timer > 0 ? 'text-soft-gray/40 cursor-not-allowed' : 'text-warm-gold hover:text-dark-slate hover:underline underline-offset-4'}`}
                    >
                      {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="w-full text-sm text-soft-gray/60 hover:text-dark-slate transition-colors pt-4 flex items-center justify-center space-x-2"
                  >
                    <span>← Back to registration</span>
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <Modal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms of Service"
      >
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">1. Acceptance of Terms</h4>
            <p>By using Garden Grains, you agree to our ordering, payment, and cancellation policies. These terms apply to all visitors, users, and others who access or use the Service.</p>
          </section>
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">2. Orders & Preparation</h4>
            <p>Orders may be cancelled before preparation begins. Once our chefs start preparing your fresh ingredients, cancellations may not be eligible for a full refund.</p>
          </section>
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">3. Payments & Refunds</h4>
            <p>All payments are processed securely. Refunds follow our standard Refund Policy and are typically processed within 5-7 business days.</p>
          </section>
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">4. Updates</h4>
            <p>We may update these terms; continued use constitutes acceptance of changes. We recommend checking these terms periodically for updates.</p>
          </section>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        title="Privacy Policy"
      >
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">1. Information Collection</h4>
            <p>We collect only necessary data to operate your account and orders: name, contact details (email, phone), and order history to provide a personalized dining experience.</p>
          </section>
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">2. Data Usage</h4>
            <p>We never sell your data. We share it only with providers essential to fulfill your order (encrypted payment processors, delivery partners).</p>
          </section>
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">3. Your Rights</h4>
            <p>You have the right to access, update, or delete your personal information at any time. You can request data export or account deletion by contacting our privacy officer.</p>
          </section>
          <section>
            <h4 className="text-lg font-bold text-dark-slate mb-2">4. Support</h4>
            <p>For any privacy-related concerns, please contact us at privacy@gardengrains.com or through our support channel.</p>
          </section>
        </div>
      </Modal>
    </div>
  )
}

export default Register
