import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  ShoppingBagIcon,
  PrinterIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import logoImg from '../assets/logo.png'
import toast from 'react-hot-toast'

const Cart = () => {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      toast.success("Item removed from cart")
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleCheckout = () => {
    setIsLoading(true);
    navigate('/checkout');
  };

  const handlePrintBill = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Garden Grains - Bill</title>
          <style>
            @media print {
              @page { margin: 20mm; }
            }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #D4AF37;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #101820;
              margin-bottom: 5px;
              letter-spacing: 1px;
            }
            .logo span {
               color: #D4AF37;
            }
            .sub-header {
                font-size: 12px;
                color: #7ED957;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 15px;
            }
            .meta {
                font-size: 14px;
                color: #666;
            }
            .items {
              margin: 20px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px dashed #ddd;
            }
            .item-row:last-child {
                border-bottom: none;
            }
            .total-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #101820;
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              margin-bottom: 8px;
              color: #666;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 20px;
              font-weight: bold;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              color: #101820;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="${logoImg}" alt="Logo" style="width:40px;height:40px;object-fit:contain;vertical-align:middle;margin-right:8px;" />
              Garden<span>Grains</span>
            </div>
            <div class="sub-header">Pure Veg • Organic</div>
            <div class="meta">Date: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="items">
            ${items.map((item) => {
                const itemTotal = ((item.menuItem.price + (item.customization?.reduce((sum, custom) => 
                  sum + custom.selectedChoices.reduce((choiceSum, choice) => 
                    choiceSum + (choice.price || 0), 0), 0) || 0)) * item.quantity).toFixed(2);
                
                return `
              <div class="item-row">
                <div style="flex: 1;">
                  <div style="font-weight: bold;">${item.menuItem.name}</div>
                  ${item.customization && item.customization.length > 0 ? `
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                      ${item.customization.map(custom => 
                        `${custom.optionName}: ${custom.selectedChoices.map(c => c.name).join(', ')}`
                      ).join('<br>')}
                    </div>
                  ` : ''}
                  <div style="font-size: 12px; color: #888; margin-top: 4px;">Qty: ${item.quantity} x ₹${item.menuItem.price}</div>
                </div>
                <div style="font-weight: bold;">₹${itemTotal}</div>
              </div>
            `}).join('')}
          </div>
          
          <div class="total-section">
            <div class="summary-row">
              <span>Subtotal (${itemCount} items)</span>
              <span>₹${total.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (18% GST)</span>
              <span>₹${(total * 0.18).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Grand Total</span>
              <span>₹${(total + total * 0.18).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for dining with Garden Grains!</p>
            <p>123 Green Street, Garden City, GC 12345</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen relative flex items-center justify-center pt-20">
         <div className="text-center p-8 animate-fade-in">
          <div className="w-24 h-24 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-slate/10 animate-bounce">
             <ShoppingBagIcon className="h-12 w-12 text-warm-gold" />
          </div>
          <h2 className="text-3xl font-bold text-dark-slate mb-4 font-heading">Your cart is empty</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. 
            Explore our menu to find some delicious organic meals!
          </p>
          <div className="flex justify-center">
            <Link
                to="/menu"
                className="btn-primary inline-flex items-center space-x-2"
            >
                <span>Browse Menu</span>
                <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-8 font-heading animate-slide-up">
           Your <span className="text-warm-gold">Order</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
               <div key={item.id} className="glass-panel p-4 md:p-6 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                   {/* Image */}
                   <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-pearl/50 border border-dark-slate/5">
                      <img 
                        src={item.menuItem.images?.[0]?.url || '/api/placeholder/100/100'} 
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                   </div>

                   {/* Content */}
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-bold text-dark-slate font-heading">{item.menuItem.name}</h3>
                         <span className="text-xl font-bold text-organic-green">
                            ₹{((item.menuItem.price + (item.customization?.reduce((sum, custom) => 
                              sum + custom.selectedChoices.reduce((choiceSum, choice) => 
                                choiceSum + (choice.price || 0), 0), 0) || 0)) * item.quantity).toFixed(2)}
                         </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-1">{item.menuItem.description}</p>
                      
                      {/* Customizations */}
                      {item.customization && item.customization.length > 0 && (
                        <div className="mb-3 bg-dark-slate/5 rounded-lg p-2 text-xs">
                          {item.customization.map((custom, index) => (
                            <div key={index} className="text-gray-600">
                              <span className="text-warm-gold font-medium">{custom.optionName}:</span>{' '}
                              {custom.selectedChoices.map(c => c.name).join(', ')}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                         {/* Qty */}
                         <div className="flex items-center space-x-3 bg-pearl/50 rounded-lg p-1 border border-dark-slate/10">
                            <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1 hover:text-warm-gold text-gray-400 transition-colors"
                            >
                               <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="text-dark-slate font-medium px-2">{item.quantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 hover:text-warm-gold text-gray-400 transition-colors"
                            >
                               <PlusIcon className="h-4 w-4" />
                            </button>
                         </div>

                         {/* Remove */}
                         <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg flex items-center space-x-1 text-sm font-medium"
                         >
                            <TrashIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Remove</span>
                         </button>
                      </div>
                   </div>
                </div>
               </div>
            ))}
            
            <div className="flex justify-end pt-4">
                <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 text-sm font-medium hover:underline decoration-dotted transition-all flex items-center gap-2"
                >
                <TrashIcon className="h-4 w-4" />
                Clear Shopping Cart
                </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
             <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 sticky top-24">
                <h2 className="text-2xl font-bold text-dark-slate mb-6 font-heading">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>₹{total.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Tax (18% GST)</span>
                      <span>₹{(total * 0.18).toFixed(2)}</span>
                   </div>
                   <div className="h-px bg-dark-slate/10 my-4"></div>
                   <div className="flex justify-between text-xl font-bold text-dark-slate">
                      <span>Total</span>
                      <span className="text-warm-gold">₹{(total + total * 0.18).toFixed(2)}</span>
                   </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full btn-primary py-4 text-lg font-bold shadow-soft-gold mb-4 disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center"
                    >
                        {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                        {!isLoading && <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <button
                        onClick={handlePrintBill}
                        className="w-full py-3 border border-dark-slate/20 rounded-xl text-gray-600 hover:text-dark-slate hover:bg-dark-slate/10 hover:border-warm-gold/50 transition-all flex items-center justify-center space-x-2"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print Bill</span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/menu" className="text-sm text-gray-400 hover:text-warm-gold transition-colors">
                       Continue Shopping
                    </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
