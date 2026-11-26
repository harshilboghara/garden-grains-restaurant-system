import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import BrandLogo from '../components/common/BrandLogo'
import { ArrowLeftIcon, PaperAirplaneIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import BackgroundParticles from '../components/ui/BackgroundParticles'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setIsSent(true)
      toast.success('Recovery protocol initiated.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Protocol failure.')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-pearl font-sans selection:bg-warm-gold selection:text-deep-black">
      <BackgroundParticles />
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-warm-gold/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center p-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
            <BrandLogo className="w-20 h-20 mb-10" />
            <h1 className="text-6xl font-black font-heading text-dark-slate leading-tight mb-8">
              Forgot Your <br />
              <span className="text-warm-gold">Password?</span>
            </h1>
            <p className="text-soft-gray/60 max-w-sm text-lg">
              No worries! Enter the email address associated with your account and we'll send you a recovery code.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col justify-center items-center lg:items-start p-8 lg:p-20 lg:bg-white/[0.01] border-l border-dark-slate/5">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
            <div className="lg:hidden mb-12 flex justify-center"><BrandLogo /></div>
            
            <motion.div variants={itemVariants} className="mb-10">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-warm-gold bg-warm-gold/10 px-4 py-2 rounded-full border border-warm-gold/20 mb-4">
                <span>Password Recovery</span>
              </div>
              <h2 className="text-4xl font-bold text-dark-slate font-heading">{isSent ? 'Check Your Email' : 'Forgot Password?'}</h2>
            </motion.div>

            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div variants={itemVariants}>
                  <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Email address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-2xl px-6 py-4 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                    />
                    <div className="absolute inset-0 rounded-2xl border border-warm-gold/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-all blur-sm scale-[1.01]"></div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-warm-gold text-deep-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white transition-all duration-500 group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-deep-black/30 border-t-deep-black rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Send Reset Code</span>
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            ) : (
              <motion.div variants={itemVariants} className="space-y-6">
                <p className="text-soft-gray leading-relaxed p-4 bg-white/[0.02] border border-dark-slate/5 rounded-2xl">
                  We've sent a password reset code to <b>{email}</b>. Please check your inbox and spam folder.
                </p>
                <Link to="/reset-password" class="w-full bg-white text-deep-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-warm-gold transition-all duration-300">
                  <span>Continue to Reset Page</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <button onClick={() => setIsSent(false)} class="w-full text-xs text-soft-gray/40 uppercase tracking-widest hover:text-warm-gold transition-colors">Didn't receive the email? Try again</button>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="pt-10 mt-10 border-t border-dark-slate/5">
              <Link to="/login" className="inline-flex items-center space-x-2 text-sm font-medium text-warm-gold hover:text-dark-slate transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

