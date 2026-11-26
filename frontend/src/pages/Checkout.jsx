import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useMutation, useQuery } from "react-query";
import { ordersAPI, paymentsAPI, discountsAPI } from "../services/api";
import StripeCheckout from "../components/payment/StripeCheckout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import {
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  TagIcon,
  SparklesIcon,
  ArrowPathIcon,
  BanknotesIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline";

// Initialize Stripe - with fallback
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise =
  stripeKey && stripeKey.trim() ? loadStripe(stripeKey) : Promise.resolve(null);

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    instructions: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });
  const [cardErrors, setCardErrors] = useState({});
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [showAvailableDiscounts, setShowAvailableDiscounts] = useState(false);

  // Fetch available discount codes
  const { 
    data: discountsData, 
    isLoading: discountsLoading,
    error: discountsError,
    refetch: refetchDiscounts 
  } = useQuery(
    "available-discounts",
    () => discountsAPI.getDiscounts(),
    {
      refetchOnWindowFocus: true,
      refetchInterval: 30000,
      retry: 2,
      onError: (error) => {
        console.error("Could not fetch discount codes:", error);
      }
    }
  );

  const availableDiscounts = discountsData?.data?.discounts || discountsData?.discounts || [];

  // Refetch discounts when total changes
  useEffect(() => {
    refetchDiscounts();
  }, [total, refetchDiscounts]);

  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.createOrder(orderData),
    {
      onSuccess: (response) => {
        if (paymentMethod === "cash") {
          toast.success("Order placed successfully!");
          clearCart();
          navigate("/orders");
        }
        return response;
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to place order");
        setIsProcessing(false);
      },
    },
  );

  const createPaymentMutation = useMutation(
    ({ orderId, amount }) => paymentsAPI.createPaymentIntent(orderId, amount),
    {
      onSuccess: (response) => {
        setClientSecret(response.data.clientSecret);
        setShowStripeForm(true);
        setIsProcessing(false);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Payment initialization failed",
        );
        setIsProcessing(false);
      },
    },
  );

  const confirmPaymentMutation = useMutation(
    ({ orderId, paymentIntentId }) =>
      paymentsAPI.confirmPayment(orderId, paymentIntentId),
    {
      onSuccess: () => {
        toast.success("Payment confirmed! Order placed successfully!");
        clearCart();
        navigate("/orders");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Payment confirmation failed",
        );
        setIsProcessing(false);
      },
    },
  );

  const handleStripeSuccess = async (paymentIntent) => {
    if (paymentIntent.status === "succeeded" && currentOrderId) {
      try {
        await confirmPaymentMutation.mutateAsync({
          orderId: currentOrderId,
          paymentIntentId: paymentIntent.id,
        });
      } catch (error) {
        console.error("Payment confirmation error:", error);
      }
    }
  };

  const handleStripeError = (error) => {
    toast.error(error.message || "Payment failed. Please try again.");
    setIsProcessing(false);
    setShowStripeForm(false);
    setClientSecret(null);
  };

  const validateCard = () => {
    const errors = {};
    const strippedNumber = cardDetails.number.replace(/\s/g, "");
    
    if (strippedNumber !== "4242424242424242") {
      errors.number = "Invalid card number. Use 4242 4242 4242 4242";
    }
    if (cardDetails.expiry !== "12/28") {
      errors.expiry = "Invalid expiry. Use 12/28";
    }
    if (cardDetails.cvv !== "123") {
      errors.cvv = "Invalid CVV. Use 123";
    }
    if (cardDetails.holder.toLowerCase() !== "john doe") {
      errors.holder = "Invalid holder name. Use John Doe";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpi = () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      setUpiError("Please enter a valid UPI ID (e.g., username@bank)");
      return false;
    }
    setUpiError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showStripeForm) return;

    setIsProcessing(true);

    try {
      if (!items || items.length === 0) {
        toast.error("Your cart is empty");
        setIsProcessing(false);
        return;
      }

      const orderData = {
        items: items
          .filter((item) => item && item.menuItem && item.menuItem._id)
          .map((item) => ({
            menuItem: item.menuItem._id,
            quantity: item.quantity || 1,
            customization: item.customization || [],
            specialInstructions: item.specialInstructions || "",
          })),
        orderType,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        notes: "",
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "card" ? "paid" : "pending",
        discountCode: appliedDiscount ? appliedDiscount.code : undefined,
        discountAmount: discountAmount,
      };

      if (paymentMethod === "card") {
        if (!validateCard()) {
          setIsProcessing(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success("Payment processed successfully!");
      }

      if (paymentMethod === "upi") {
        if (!validateUpi()) {
          setIsProcessing(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success("UPI payment verified!");
      }

      if (orderData.items.length === 0) {
        toast.error("Invalid items in cart. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      await createOrderMutation.mutateAsync(orderData);
      
      if (paymentMethod === "card" || paymentMethod === "upi") {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/orders");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error?.response?.data?.message || "Failed to place order");
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const response = await discountsAPI.validateDiscount(promoCode.toUpperCase(), total);
      
      if (response.data.valid) {
        setAppliedDiscount(response.data.discount);
        toast.success("Promo code applied successfully! 🎉");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid promo code");
    }
  };

  const handleSelectDiscount = async (code) => {
    setPromoCode(code);
    
    try {
      const response = await discountsAPI.validateDiscount(code, total);
      
      if (response.data.valid) {
        setAppliedDiscount(response.data.discount);
        toast.success("Promo code applied successfully! 🎉");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid promo code");
    }
  };

  const isDiscountEligible = (discount) => {
    if (!discount || discount.isActive === false) return false;
    
    const now = new Date();
    const validFrom = discount.validFrom ? new Date(discount.validFrom) : null;
    const validUntil = discount.validUntil ? new Date(discount.validUntil) : null;
    
    if (validFrom && now < validFrom) return false;
    if (validUntil && now > validUntil) return false;
    
    // Ensure numeric comparison
    const minAmount = Number(discount.minOrderAmount || 0);
    const cartTotal = Number(total || 0);
    
    if (cartTotal < minAmount) return false;
    
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return false;
    
    return true;
  };

  const subtotal = total;
  
  // Dynamic Discount Calculation
  let currentDiscountAmount = 0;
  if (appliedDiscount) {
    const type = appliedDiscount.discountType || appliedDiscount.type;
    const val = appliedDiscount.discountValue || appliedDiscount.discountAmount;
    
    if (type === 'percentage') {
      currentDiscountAmount = (subtotal * val) / 100;
      if (appliedDiscount.maxDiscountAmount) {
        currentDiscountAmount = Math.min(currentDiscountAmount, appliedDiscount.maxDiscountAmount);
      }
    } else {
      currentDiscountAmount = val;
    }
  }

  const discountAmount = Math.round(currentDiscountAmount * 100) / 100;
  const priceAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round((priceAfterDiscount * 0.18) * 100) / 100;
  const deliveryFee = 0;
  const finalTotal = Math.round((priceAfterDiscount + tax + deliveryFee) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen relative pt-20">
         <div className="text-center p-12 glass-panel rounded-3xl animate-fade-in border border-dark-slate/5 mx-4">
          <h2 className="mb-4 text-3xl font-bold text-dark-slate font-heading">
            Your cart is empty
          </h2>
          <p className="mb-8 text-gray-400">
            Add some items to your cart before checkout.
          </p>
          <button onClick={() => navigate("/menu")} className="btn-primary">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      <div className="max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-slide-up">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
            <span className="text-xl animate-pulse">🔒</span>
            <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Secure Checkout</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-2 font-heading">Complete Your Order</h1>
          <p className="text-gray-400">You're just one step away from deliciousness</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-warm-gold text-deep-black rounded-full flex items-center justify-center font-bold shadow-soft-gold">1</div>
              <span className="ml-3 text-sm font-medium text-warm-gold">Cart</span>
            </div>
            <div className="w-20 h-0.5 bg-dark-slate/10 rounded"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-warm-gold text-deep-black rounded-full flex items-center justify-center font-bold shadow-soft-gold">2</div>
              <span className="ml-3 text-sm font-medium text-warm-gold">Payment</span>
            </div>
            <div className="w-20 h-0.5 bg-dark-slate/10 rounded"></div>
            <div className="flex items-center">
               {isProcessing ? (
                 <div className="w-10 h-10 border-2 border-dark-slate/20 border-t-warm-gold rounded-full animate-spin"></div>
               ) : (
                 <div className="w-10 h-10 bg-pearl border border-dark-slate/20 text-gray-400 rounded-full flex items-center justify-center font-bold">3</div>
               )}
               <span className="ml-3 text-sm font-medium text-gray-400">Done</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="lg:col-span-2 space-y-8">
            {/* Order Type */}
            <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10">
              <h2 className="mb-6 text-xl font-bold text-dark-slate font-heading flex items-center">
                <ClockIcon className="w-6 h-6 mr-3 text-warm-gold" />
                Order Type
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="relative group cursor-pointer">
                   <input
                    type="radio"
                    name="orderType"
                    value="dine-in"
                    checked={orderType === "dine-in"}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-6 border rounded-xl transition-all duration-300 ${
                     orderType === "dine-in"
                      ? "border-warm-gold bg-warm-gold/10 shadow-soft-gold"
                      : "border-dark-slate/10 hover:border-dark-slate/30 bg-dark-slate/5"
                  }`}>
                     <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                           orderType === "dine-in" ? "bg-warm-gold text-deep-black" : "bg-dark-slate/10 text-gray-400"
                        }`}>
                           <ClockIcon className="w-6 h-6" />
                        </div>
                        <h3 className={`font-bold mb-1 ${orderType === "dine-in" ? "text-dark-slate" : "text-gray-600"}`}>Dine In</h3>
                        <p className="text-xs text-gray-400">Enjoy at our restaurant</p>
                     </div>
                  </div>
                </label>

                <label className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="orderType"
                    value="takeaway"
                    checked={orderType === "takeaway"}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-6 border rounded-xl transition-all duration-300 ${
                     orderType === "takeaway"
                      ? "border-warm-gold bg-warm-gold/10 shadow-soft-gold"
                      : "border-dark-slate/10 hover:border-dark-slate/30 bg-dark-slate/5"
                  }`}>
                     <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                           orderType === "takeaway" ? "bg-warm-gold text-deep-black" : "bg-dark-slate/10 text-gray-400"
                        }`}>
                           <CheckCircleIcon className="w-6 h-6" />
                        </div>
                        <h3 className={`font-bold mb-1 ${orderType === "takeaway" ? "text-dark-slate" : "text-gray-600"}`}>Takeaway</h3>
                        <p className="text-xs text-gray-400">Pick up your order</p>
                     </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            {!showStripeForm && (
              <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10">
                <h2 className="mb-6 text-xl font-bold text-dark-slate font-heading flex items-center">
                  <CreditCardIcon className="w-6 h-6 mr-3 text-warm-gold" />
                  Payment Method
                </h2>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
                  {[
                    { id: 'cash', icon: BanknotesIcon, label: 'Cash / COD', sub: 'Pay at counter' },
                    { id: 'card', icon: CreditCardIcon, label: 'Card', sub: 'Secure Stripe' },
                    { id: 'upi', icon: QrCodeIcon, label: 'UPI', sub: 'GPay / PhonePe' }
                  ].map((method) => (
                    <label key={method.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-4 border rounded-xl transition-all duration-300 h-full ${
                          paymentMethod === method.id
                            ? "border-warm-gold bg-warm-gold/10 shadow-soft-gold"
                            : "border-dark-slate/10 hover:border-dark-slate/30 bg-dark-slate/5"
                        }`}>
                          <div className="flex items-center space-x-3">
                             <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? "text-warm-gold" : "text-gray-400"}`} />
                             <div>
                                <div className={`font-bold text-sm ${paymentMethod === method.id ? "text-dark-slate" : "text-gray-600"}`}>{method.label}</div>
                                <div className="text-xs text-gray-400">{method.sub}</div>
                             </div>
                          </div>
                        </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "card" && (
                   <div className="p-6 bg-black/30 border border-dark-slate/10 rounded-xl space-y-4 animate-fade-in">
                      {/* Card Instructions */}
                      <div className="flex items-start space-x-3 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                         <div className="bg-blue-500/20 p-1.5 rounded-lg">
                            <CreditCardIcon className="w-5 h-5 text-blue-400" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">Payment Instructions</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                               To complete your card payment, please enter your card details below. 
                               Since we are in <span className="text-warm-gold font-bold">Safe-Test Mode</span>, you must use our authorized test credentials to proceed.
                            </p>
                         </div>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-gray-400 mb-1">Card Holder Name</label>
                         <input 
                            type="text" 
                            className="input-field w-full bg-pearl/50 border-dark-slate/10 focus:border-warm-gold/50 text-dark-slate" 
                            placeholder="AS SHOWN ON CARD"
                            value={cardDetails.holder}
                            onChange={(e) => setCardDetails({...cardDetails, holder: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                         <input 
                            type="text" 
                            className="input-field w-full bg-pearl/50 border-dark-slate/10 focus:border-warm-gold/50 text-dark-slate" 
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                val = val.match(/.{1,4}/g)?.join(' ') || val;
                                setCardDetails({...cardDetails, number: val});
                            }}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Expiry</label>
                            <input 
                                type="text" 
                                className="input-field w-full bg-pearl/50 border-dark-slate/10 focus:border-warm-gold/50 text-dark-slate" 
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                    if(val.length > 2) val = val.substring(0,2) + '/' + val.substring(2);
                                    setCardDetails({...cardDetails, expiry: val})
                                }}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">CVV</label>
                            <input 
                                type="password" 
                                className="input-field w-full bg-pearl/50 border-dark-slate/10 focus:border-warm-gold/50 text-dark-slate" 
                                placeholder="***"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.substring(0, 3)})}
                            />
                         </div>
                      </div>
                      
                      {/* Test Card Hint */}
                      <div className="mt-4 p-4 bg-warm-gold/10 border border-warm-gold/30 rounded-xl relative overflow-hidden group/hint">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/hint:opacity-20 transition-opacity">
                             <SparklesIcon className="w-12 h-12 text-warm-gold" />
                         </div>
                         <p className="text-[10px] text-warm-gold/60 uppercase font-black mb-2 tracking-[0.2em] relative z-10">Authorized Test Credentials</p>
                         <div className="flex flex-wrap gap-4 text-xs font-mono relative z-10">
                            <div>
                               <span className="text-gray-400 mr-2">Number:</span>
                               <span className="text-dark-slate font-bold select-all">4242 4242 4242 4242</span>
                            </div>
                            <div>
                               <span className="text-gray-400 mr-2">Expiry:</span>
                               <span className="text-dark-slate font-bold">12/28</span>
                            </div>
                            <div>
                               <span className="text-gray-400 mr-2">CVV:</span>
                               <span className="text-dark-slate font-bold">123</span>
                            </div>
                             <div>
                               <span className="text-gray-400 mr-2">Holder:</span>
                               <span className="text-dark-slate font-bold italic">John Doe</span>
                            </div>
                         </div>
                      </div>
                   </div>
                )}
                
                {paymentMethod === "upi" && (
                    <div className="p-6 bg-black/30 border border-dark-slate/10 rounded-xl animate-fade-in space-y-6">
                        {/* UPI Instructions */}
                        <div className="flex items-start space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                           <div className="bg-purple-500/20 p-1.5 rounded-lg">
                              <QrCodeIcon className="w-5 h-5 text-purple-400" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-0.5">UPI Payment Information</p>
                              <p className="text-[11px] text-gray-400 leading-relaxed">
                                 Please enter your registered UPI ID (e.g., <span className="text-dark-slate">yourname@okaxis</span>). 
                                 A payment request will be sent to your mobile app. Do not close this window until verification is complete.
                              </p>
                           </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">VPA / UPI ID</label>
                            <input 
                                type="text" 
                                className="input-field w-full bg-pearl/50 border-dark-slate/10 focus:border-warm-gold/50 text-dark-slate" 
                                placeholder="username@bankprefix"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                            />
                            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">
                               <span>Secure Verification</span>
                               <div className="flex space-x-2">
                                  <span className="text-purple-400/60">GPay</span>
                                  <span className="text-blue-400/60">PhonePe</span>
                                  <span className="text-cyan-400/60">Paytm</span>
                               </div>
                            </div>
                        </div>
                    </div>
                )}

              </div>
            )}
            
            {showStripeForm && (
                <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-dark-slate font-heading">Complete Payment</h2>
                        <button 
                            type="button" 
                            onClick={() => setShowStripeForm(false)}
                            className="text-sm text-gray-400 hover:text-dark-slate"
                        >
                            Change Method
                        </button>
                    </div>
                    {clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                            <StripeCheckout
                                clientSecret={clientSecret}
                                orderId={currentOrderId}
                                onSuccess={handleStripeSuccess}
                                onError={handleStripeError}
                            />
                        </Elements>
                    )}
                </div>
            )}
          </div>

          <div className="lg:col-span-1">
             <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 sticky top-24">
                <h2 className="text-xl font-bold text-dark-slate mb-6 font-heading">Order Summary</h2>
                
                <div className="space-y-4 mb-8 bg-black/20 p-4 rounded-xl border border-dark-slate/5 max-h-60 overflow-y-auto custom-scrollbar">
                   {items.filter(item => item?.menuItem).map((item) => {
                       const base = item.menuItem.price || 0;
                       const custom = (item.customization || []).reduce((s, c) => s + c.selectedChoices.reduce((cs, ch) => cs + (ch.price||0), 0), 0);
                       const lineTotal = (base + custom) * (item.quantity || 1);
                       
                       return (
                           <div key={item.id} className="flex items-start space-x-4 py-3 border-b border-dark-slate/5 last:border-0 group/item">
                               <div className="relative">
                                  <img src={item.menuItem.images?.[0]?.url || 'https://placehold.co/50x50'} className="w-12 h-12 rounded-xl object-cover border border-dark-slate/10 group-hover/item:border-warm-gold/50 transition-colors" alt="" />
                                  <span className="absolute -top-2 -right-2 bg-warm-gold text-deep-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-deep-black shadow-soft-gold">
                                    {item.quantity}
                                  </span>
                               </div>
                               <div className="flex-1 min-w-0 pr-2">
                                   <div className="text-sm font-bold text-dark-slate mb-0.5 group-hover/item:text-warm-gold transition-colors truncate">{item.menuItem.name}</div>
                                   <div className="text-[10px] text-gray-400 uppercase tracking-wider flex flex-wrap gap-1">
                                      {item.customization?.[0]?.selectedChoices?.[0]?.name || 'Standard'}
                                   </div>
                               </div>
                               <div className="text-sm font-mono font-bold text-dark-slate">₹{lineTotal.toFixed(2)}</div>
                           </div>
                       )
                   })}
                </div>
                
                {/* Promo Code Toggle */}
                <div className="mb-6">
                    {!appliedDiscount && (
                        <button
                           type="button" 
                           onClick={() => setShowAvailableDiscounts(!showAvailableDiscounts)}
                           className="w-full py-3 px-4 bg-dark-slate/5 border border-dark-slate/10 rounded-xl text-sm text-gray-600 hover:bg-dark-slate/10 hover:text-warm-gold transition-all flex justify-between items-center group/promo"
                        >
                            <span className="flex items-center"><TagIcon className="w-4 h-4 mr-3 text-warm-gold group-hover/promo:scale-110 transition-transform" /> Have a promo code?</span>
                            <span className="text-xs opacity-50">{showAvailableDiscounts ? 'Close' : 'View Offers'}</span>
                        </button>
                    )}
                    
                    {showAvailableDiscounts && !appliedDiscount && (
                        <div className="mt-4 space-y-3 animate-slide-up bg-black/40 p-4 rounded-xl border border-dark-slate/10 backdrop-blur-md">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 ml-1">Available Coupons</p>
                            {!discountsLoading && availableDiscounts.length > 0 ? (
                                availableDiscounts.map(d => (
                                    <button
                                       key={d.code}
                                       type="button"
                                       onClick={() => {
                                           if(isDiscountEligible(d)) handleSelectDiscount(d.code)
                                       }}
                                       disabled={!isDiscountEligible(d)}
                                       className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group/coupon ${
                                           isDiscountEligible(d) 
                                           ? 'border-warm-gold/30 bg-warm-gold/5 hover:bg-warm-gold/10 text-dark-slate' 
                                           : 'border-dark-slate/5 bg-dark-slate/5 text-gray-400 cursor-not-allowed grayscale'
                                       }`}
                                    >
                                        <div className="flex justify-between font-bold mb-1 relative z-10">
                                            <span className="font-mono text-warm-gold bg-warm-gold/10 px-2 py-0.5 rounded border border-warm-gold/20 tracking-wider uppercase text-[10px]">{d.code}</span>
                                            <span className="text-dark-slate text-[11px]">{d.discountType === 'percentage' ? `${d.discountValue}%` : `₹${d.discountValue}`} OFF</span>
                                        </div>
                                        <div className="text-[10px] opacity-70 relative z-10 mt-1">{d.description}</div>
                                        {!isDiscountEligible(d) && (
                                           <div className="text-[9px] text-red-400/60 mt-2 font-medium">₹{d.minOrderAmount} min. required</div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="text-gray-400 text-center py-4 text-xs font-medium italic">No active coupons found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Billing Details - Digital Receipt Style */}
                <div className="bg-black/40 rounded-2xl p-6 border border-dark-slate/10 space-y-4 relative overflow-hidden mb-8">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-warm-gold/30 to-transparent"></div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-dark-slate font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {appliedDiscount && (
                        <div className="flex justify-between text-sm text-green-400 items-center animate-fade-in">
                            <div className="flex items-center">
                               <TagIcon className="w-3.5 h-3.5 mr-2" />
                               <span>Discount ({appliedDiscount.code})</span>
                            </div>
                            <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Taxes & Fees (18%)</span>
                        <span className="text-dark-slate font-mono">₹{tax.toFixed(2)}</span>
                    </div>

                    <div className="pt-4 mt-2 border-t border-dashed border-dark-slate/20">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Final Bill</p>
                                <h3 className="text-3xl font-bold text-dark-slate font-heading">Amount Due</h3>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-warm-gold font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                                    ₹{finalTotal.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {appliedDiscount && (
                        <button 
                           type="button"
                           onClick={() => setAppliedDiscount(null)}
                           className="w-full mt-4 py-2 border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] uppercase font-bold tracking-widest rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                           Discard Promo Code
                        </button>
                    )}
                </div>

                {/* Final Button */}
                {!showStripeForm && (
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full btn-primary py-5 text-xl font-bold shadow-soft-gold group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-warm-gold/0 via-white/20 to-warm-gold/0 -translate-x-full group-hover:animate-shimmer"></div>
                        <span className="flex items-center justify-center relative z-10">
                          {isProcessing ? (
                            <ArrowPathIcon className="w-6 h-6 mr-3 animate-spin" />
                          ) : (
                            <SparklesIcon className="w-6 h-6 mr-3 text-deep-black group-hover:rotate-12 transition-transform" />
                          )}
                          {isProcessing ? 'Verifying...' : `Pay • ₹${finalTotal.toFixed(2)}`}
                        </span>
                    </button>
                )}
                

                    
                 <div className="mt-8 pt-6 border-t border-dashed border-dark-slate/20 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Thank you for choosing</p>
                    <p className="text-sm font-heading font-bold text-warm-gold">GARDEN GRAINS</p>
                    <div className="flex justify-center space-x-2 mt-4">
                       <CreditCardIcon className="w-4 h-4 text-gray-600" />
                       <BanknotesIcon className="w-4 h-4 text-gray-600" />
                       <QrCodeIcon className="w-4 h-4 text-gray-600" />
                    </div>
                 </div>
              </div>
           </div>
        </form>
        
        {/* Loading Overlay */}
        {isProcessing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-slate font-bold text-lg animate-pulse">Processing your order...</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
