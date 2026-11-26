# 💳 Payments - Setup Guide

Checkout offers three methods: **Cash / COD**, **Card** (Stripe) and **UPI**. Cash and UPI need no setup; UPI records the customer's UPI ID and leaves the order as payment *pending* (there is no UPI gateway). Card payments need Stripe test keys.

## ✅ What's Already Done

Your system already has:
- ✅ Stripe backend routes (`backend/routes/payments.js`)
- ✅ Payment API endpoints
- ✅ Stripe SDK installed (`stripe` package)
- ✅ Frontend payment UI with card option
- ✅ Cash on Delivery working perfectly

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Stripe Test Keys

1. Go to https://stripe.com → Sign up (free)
2. Navigate to: **Developers → API Keys**
3. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### Step 2: Add to Backend

Edit `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Step 3: Add to Frontend

Edit `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Step 4: Restart Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 💳 Test Payment

### Test Card (Always Works):
- **Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

## 🎯 Current Status

### ✅ Working Right Now:
- **Cash on Delivery** - Works perfectly!
- Add items → Checkout → Place Order → Done!

### ⏳ Ready to Activate:
- **Card Payments** - Just needs API keys!
- UI is ready, backend is ready
- Add keys → Restart → Works!

## 📝 What Happens Now

### Without Stripe Keys (Default):
- All three options are shown
- **Cash** and **UPI** orders work
- Choosing **Card** returns "Card payments are not configured. Please use Cash on Delivery."

### With Stripe Keys (Full Integration):
- Card payments are processed through Stripe Elements
- Automatic payment processing
- Order confirmation after payment

## 🎨 UI Features

Your checkout page now has:
- ✅ Cash on Delivery option
- ✅ Card payment option (works once keys are added)
- ✅ UPI option (records the UPI ID)
- ✅ Promo code field
- ✅ Discount calculation
- ✅ Order summary
- ✅ Tax calculation
- ✅ Delivery fee

## 🔒 Security

- ✅ PCI compliant (Stripe handles card data)
- ✅ Your server never sees card numbers
- ✅ Secure token-based payments
- ✅ 3D Secure support
- ✅ Fraud detection

## 📞 Using It

1. **Customer adds items to cart**
2. **Goes to checkout**
3. **Selects payment method:**
   - Cash → Place order immediately
   - UPI → Enter UPI ID → Place order (payment pending)
   - Card → Enter card details → Pay
4. **Order is created**
5. **Customer receives confirmation**

## 🐛 Troubleshooting

### "Payment failed"
- Check Stripe keys are correct
- Verify backend is running
- Check card details are right
- Use test card: 4242 4242 4242 4242

### "Card payments are not configured"
- Add `STRIPE_SECRET_KEY` to backend/.env and `VITE_STRIPE_PUBLISHABLE_KEY` to frontend/.env
- Restart both servers

### "Internal Server Error"
- Check backend logs
- Verify MongoDB is running
- Check API keys in .env

## 📊 Payment Methods

### Current Options:
1. **Cash on Delivery** ✅ Working
   - No setup required
   - Safe and simple
   - Customers pay on delivery

2. **Card Payment** ⏳ Ready
   - Requires Stripe keys
   - Secure online payment
   - Instant confirmation

3. **UPI** ✅ Working
   - No setup required
   - Stores the customer's UPI ID; payment stays pending until confirmed

### To Activate Card Payments:
```bash
# 1. Add to backend/.env:
STRIPE_SECRET_KEY=sk_test_...

# 2. Add to frontend/.env:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 3. Restart servers
```

## 🎉 Summary

**Right Now:**
- ✅ Cash on Delivery works perfectly
- ✅ Complete checkout flow working
- ✅ Orders are being placed
- ✅ Everything functions great

**Add Stripe:**
- Get free test keys
- Add to .env files
- Restart servers
- Card payments work!

## 💡 Pro Tip

Start with **Cash on Delivery** to test everything. When ready for card payments, just add the Stripe keys - everything else is already set up!

---

**Your payment system is 100% ready - just add Stripe keys when you want card payments!**

