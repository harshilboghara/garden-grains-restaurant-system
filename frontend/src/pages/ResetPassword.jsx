import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import BrandLogo from '../components/common/BrandLogo'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowRightIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import BackgroundParticles from '../components/ui/BackgroundParticles'

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setIsLoading(true)
    try {
      await authAPI.resetPassword(formData.token, formData.newPassword)
      setIsSuccess(true)
      toast.success('Access keys updated successfully.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired protocol token.')
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
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-warm-gold/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center p-20 relative">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
            <BrandLogo className="w-20 h-20 mb-10" />
            <h1 className="text-6xl font-black font-heading text-dark-slate leading-tight mb-8">
              Set New <br />
              <span className="text-warm-gold">Password.</span>
            </h1>
            <p className="text-soft-gray/60 max-w-sm text-lg">
              Enter the reset code from your email and your new secure password below.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col justify-center items-center lg:items-start p-8 lg:p-20 lg:bg-white/[0.01] border-l border-dark-slate/5 backdrop-blur-3xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
            <div className="lg:hidden mb-12 flex justify-center"><BrandLogo /></div>
            
            <motion.div variants={itemVariants} className="mb-10">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-warm-gold bg-warm-gold/10 px-4 py-2 rounded-full border border-warm-gold/20 mb-4">
                <span>Security Verification</span>
              </div>
              <h2 className="text-4xl font-bold text-dark-slate font-heading">{isSuccess ? 'Password Reset!' : 'Set New Password'}</h2>
            </motion.div>

            {isSuccess ? (
              <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start space-y-8">
                <div className="p-1 w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                   <CheckCircleIcon className="w-10 h-10 text-green-500 animate-pulse" />
                </div>
                <p className="text-soft-gray leading-relaxed p-4 bg-white/[0.02] border border-dark-slate/5 rounded-2xl w-full">
                  Your password has been successfully updated. You'll be redirected to the login page shortly.
                </p>
                <Link to="/login" className="w-full bg-warm-gold text-deep-black font-bold py-4 rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300">
                  Log In Now
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Reset Code</label>
                  <input
                    name="token"
                    type="text"
                    required
                    value={formData.token}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-2xl px-6 py-4 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all text-center tracking-[0.2em] font-mono uppercase text-xl"
                    placeholder="EX: A1B2C3D4"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">New Password</label>
                  <div className="relative group">
                    <input
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-2xl px-6 py-4 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-soft-gray/30 hover:text-warm-gold transition-colors">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="text-sm font-medium text-soft-gray mb-2 block ml-1">Confirm New Password</label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full bg-white/[0.03] border border-dark-slate/10 rounded-2xl px-6 py-4 text-dark-slate focus:outline-none focus:border-warm-gold/50 transition-all placeholder:text-soft-gray/20"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-warm-gold text-deep-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white transition-all duration-500 group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-deep-black/30 border-t-deep-black rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <LockClosedIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
