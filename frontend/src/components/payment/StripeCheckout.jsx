import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { CreditCardIcon } from '@heroicons/react/24/outline'

const StripeCheckout = ({ clientSecret, orderId, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required' // Handle redirect manually if needed, or let Stripe handle it
      })

      if (error) {
        setErrorMessage(error.message)
        onError(error)
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
        setIsProcessing(false)
      } else {
        // Handle other statuses if applicable
        setIsProcessing(false)
      }
    } catch (err) {
      setErrorMessage('Payment failed. Please try again.')
      onError(err)
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6 space-x-4">
        <div className="w-12 h-12 bg-pearl border border-warm-gold/20 rounded-xl flex items-center justify-center shadow-lg">
          <CreditCardIcon className="w-6 h-6 text-warm-gold animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-slate font-heading">Pay with Card</h2>
          <p className="text-sm text-gray-400">Secure payment via Stripe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stripe Element Container - The theme 'night' passed from parent handles the internal styling */}
        <div className="p-1 rounded-lg">
           <PaymentElement />
        </div>

        {errorMessage && (
          <div className="p-4 text-sm text-red-400 border border-red-500/30 rounded-xl bg-red-500/10 flex items-center">
            <span className="mr-2">⚠️</span>
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full btn-primary py-4 text-lg font-bold shadow-soft-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
             <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Processing...</span>
             </div>
          ) : 'Pay Now'}
        </button>
      </form>
    </div>
  )
}

export default StripeCheckout
