import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { menuAPI, ordersAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  XMarkIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  CurrencyRupeeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const CreateOrder = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [orderType, setOrderType] = useState('dine-in')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: menuData, isLoading: menuLoading } = useQuery(
    ['admin-menu-items', searchTerm],
    () => menuAPI.getMenu({ name: searchTerm, limit: 50 })
  )

  const menuItems = menuData?.data?.menuItems || []

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItem === item._id)
      if (existing) {
        return prev.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { 
        menuItem: item._id, 
        name: item.name, 
        price: item.price, 
        quantity: 1,
        image: item.images?.[0]?.url
      }]
    })
    toast.success(`Added ${item.name}`)
  }

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.menuItem === itemId) {
        const newQty = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }))
  }

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.menuItem !== itemId))
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [cartItems])

  const tax = subtotal * 0.18
  const total = subtotal + tax

  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.createOrder(orderData),
    {
      onSuccess: () => {
        toast.success('Order created successfully and bill mailed!')
        navigate('/admin/orders')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create order')
        setIsSubmitting(false)
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cartItems.length === 0) {
      toast.error('Please add at least one item')
      return
    }
    if (!customerDetails.email || !customerDetails.name) {
      toast.error('Customer name and email are required')
      return
    }

    setIsSubmitting(true)
    const orderData = {
      items: cartItems.map(i => ({
        menuItem: i.menuItem,
        quantity: i.quantity
      })),
      orderType,
      customerDetails,
      paymentMethod,
      paymentStatus,
      notes: 'Admin created order'
    }
    createOrderMutation.mutate(orderData)
  }

  return (
    <div className="h-screen flex flex-col bg-[#080B0F] overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-warm-gold/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      
      {/* Header Section (Minimized) */}
      <div className="shrink-0 pt-4 px-6 pb-2 border-b border-dark-slate/5 bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
               <button 
                 onClick={() => navigate('/admin/orders')}
                 className="p-1.5 bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/10 rounded-lg text-gray-400 hover:text-dark-slate transition-all group"
               >
                 <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
               </button>
               <div className="flex items-baseline gap-2">
                 <h1 className="text-xl font-bold text-dark-slate font-heading tracking-tight text-glow-gold">POS Terminal</h1>
                 <span className="text-[9px] font-black text-warm-gold/50 uppercase tracking-[0.2em] border-l border-dark-slate/10 pl-2">Station 01-Admin</span>
               </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-green-500 uppercase">System Ready</span>
             </div>
             <p className="text-gray-600 text-[10px] font-bold font-mono">ID: GG-POS-{(Math.random() * 1000).toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 px-4 py-4 overflow-hidden flex flex-col lg:flex-row gap-4">
        
        {/* Left: Menu Explorer */}
        <div className="flex-1 flex flex-col overflow-hidden glass-panel rounded-3xl border border-dark-slate/10 bg-white/[0.01]">
          {/* Search Header (Compact) */}
          <div className="shrink-0 p-4 border-b border-dark-slate/5 bg-white/[0.01]">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-warm-gold transition-colors" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-pearl/30 border border-dark-slate/10 rounded-xl py-2.5 pl-11 pr-4 text-dark-slate focus:border-warm-gold/50 outline-none transition-all text-sm placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Scrollable Menu Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {menuLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-8 h-8 border-2 border-warm-gold/20 border-t-warm-gold rounded-full animate-spin"></div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {menuItems.map(item => (
                  <div 
                    key={item._id} 
                    className="p-3 glass-panel border border-dark-slate/5 rounded-2xl hover:border-warm-gold/30 transition-all flex items-center gap-3 group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-dark-slate/5 border border-dark-slate/5">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-700 font-bold uppercase">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-dark-slate text-xs group-hover:text-warm-gold transition-colors line-clamp-1 truncate">{item.name}</h4>
                      <p className="text-warm-gold font-mono font-black text-xs">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-2 bg-warm-gold text-black rounded-lg hover:bg-white transition-all shadow-lg active:scale-90 shrink-0"
                    >
                      <PlusIcon className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                  </div>
                ))}
                {menuItems.length === 0 && (
                  <div className="col-span-full py-10 text-center opacity-20">
                     <p className="text-xs font-bold uppercase tracking-widest">Inventory Empty</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Section */}
        <div className="w-full lg:w-[360px] xl:w-[400px] flex flex-col gap-4 overflow-hidden h-full">
          
          {/* Top: Customer Box */}
          <div className="shrink-0 glass-panel p-4 rounded-3xl border border-dark-slate/10 bg-white/[0.01]">
             <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
               <UserIcon className="w-3 h-3 text-warm-gold" />
               Client Profile
             </h3>
             <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  className="bg-pearl/30 border border-dark-slate/10 rounded-lg py-1.5 px-3 text-xs text-dark-slate focus:border-warm-gold/50 outline-none transition-all placeholder:text-gray-700"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                  className="bg-pearl/30 border border-dark-slate/10 rounded-lg py-1.5 px-3 text-xs text-dark-slate focus:border-warm-gold/50 outline-none transition-all placeholder:text-gray-700"
                />
             </div>
             
             <div className="flex gap-2">
                <select 
                   value={orderType}
                   onChange={(e) => setOrderType(e.target.value)}
                   className="flex-1 bg-dark-slate/5 border border-dark-slate/10 rounded-lg text-[9px] font-black uppercase py-1.5 cursor-pointer text-center text-gray-400 outline-none focus:border-warm-gold/50 focus:text-dark-slate"
                >
                   <option value="dine-in" className="bg-pearl">Dine In</option>
                   <option value="takeaway" className="bg-pearl">Takeaway</option>
                   <option value="delivery" className="bg-pearl">Delivery</option>
                </select>
                <select 
                   value={paymentMethod}
                   onChange={(e) => setPaymentMethod(e.target.value)}
                   className="flex-1 bg-dark-slate/5 border border-dark-slate/10 rounded-lg text-[9px] font-black uppercase py-1.5 cursor-pointer text-center text-gray-400 outline-none focus:border-warm-gold/50 focus:text-dark-slate"
                >
                   <option value="cash" className="bg-pearl">CASH</option>
                   <option value="upi" className="bg-pearl">UPI</option>
                   <option value="card" className="bg-pearl">CARD</option>
                </select>
             </div>
          </div>

          {/* Bottom: Basket */}
          <div className="flex-1 flex flex-col overflow-hidden glass-panel rounded-3xl border border-dark-slate/10 bg-white/[0.01]">
            <div className="shrink-0 p-4 border-b border-dark-slate/5 flex items-center justify-between">
              <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <ShoppingBagIcon className="w-3 h-3 text-warm-gold" /> 
                Terminal Cart
              </h3>
              {cartItems.length > 0 && (
                <span className="bg-warm-gold/10 text-warm-gold text-[9px] px-2 py-0.5 rounded-md font-black">
                  {cartItems.length} ITM
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-6 opacity-10 border border-dashed border-dark-slate/10 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest">Cart Empty</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.menuItem} className="px-3 py-2 bg-dark-slate/5 border border-dark-slate/5 rounded-xl flex items-center gap-3 animate-fade-in">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-dark-slate truncate">{item.name}</h4>
                      <p className="text-[10px] text-warm-gold/70 font-mono">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-1.5 py-0.5 rounded-md border border-dark-slate/5">
                      <button onClick={() => updateQuantity(item.menuItem, -1)} className="p-0.5 text-gray-600 hover:text-dark-slate transition-colors"><MinusIcon className="w-2.5 h-2.5 stroke-[3px]" /></button>
                      <span className="text-[10px] font-bold text-dark-slate w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItem, 1)} className="p-0.5 text-gray-600 hover:text-dark-slate transition-colors"><PlusIcon className="w-2.5 h-2.5 stroke-[3px]" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.menuItem)} className="text-red-500/30 hover:text-red-500 transition-colors"><XMarkIcon className="w-3.5 h-3.5 stroke-[3px]" /></button>
                  </div>
                ))
              )}
            </div>

            {/* Compact Finalizer */}
            <div className="shrink-0 p-4 bg-white/[0.01] border-t border-dark-slate/5 space-y-3">
               <div className="space-y-1 px-1">
                  <div className="flex justify-between text-[9px] text-gray-600 font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-gray-400">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600 font-black uppercase tracking-widest">
                    <span>Tax (18%)</span>
                    <span className="text-gray-400">₹{tax.toFixed(2)}</span>
                  </div>
               </div>
               
               <div className="flex justify-between items-center p-3 bg-warm-gold/[0.03] rounded-xl border border-warm-gold/10">
                  <div className="space-y-0">
                     <p className="text-[8px] text-warm-gold/40 font-black uppercase tracking-[0.2em]">Payable</p>
                     <p className="text-xl font-black text-warm-gold font-heading leading-none">₹{total.toFixed(2)}</p>
                  </div>
                  <select 
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className={`text-[8px] font-black uppercase tracking-widest py-1 px-2 rounded-md transition-all cursor-pointer border ${
                       paymentStatus === 'paid' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
                    }`}
                  >
                    <option value="pending" className="bg-pearl">Pending</option>
                    <option value="paid" className="bg-pearl">PAID</option>
                  </select>
               </div>

               <button
                 onClick={handleSubmit}
                 disabled={isSubmitting || cartItems.length === 0}
                 className="w-full bg-warm-gold text-black py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] disabled:opacity-20 active:scale-[0.98]"
               >
                 {isSubmitting ? (
                   <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                 ) : (
                   <>
                     <CurrencyRupeeIcon className="w-4 h-4" />
                     Process Order
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrder
