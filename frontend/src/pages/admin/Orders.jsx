import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { ordersAPI, IMAGE_BASE_URL } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  FireIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../../components/common/ConfirmationModal'

const AdminOrders = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejectConfirm, setRejectConfirm] = useState({ isOpen: false, id: null })
  const queryClient = useQueryClient()

  const { data: ordersData, isLoading } = useQuery(
    ['admin-orders', filters],
    () => ordersAPI.getAllOrders(filters)
  )

  const pendingCount = useMemo(() => {
    return ordersData?.data?.orders?.filter((o) => o.status === 'pending')?.length || 0
  }, [ordersData])

  const updateOrderStatusMutation = useMutation(
    ({ orderId, status, notes }) => ordersAPI.updateOrderStatus(orderId, status, notes),
    {
      onSuccess: () => {
        toast.success('Order status updated successfully')
        queryClient.invalidateQueries('admin-orders')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order status')
      }
    }
  )

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus })
  }

  const confirmRejectOrder = () => {
    if (rejectConfirm.id) {
        handleStatusUpdate(rejectConfirm.id, 'cancelled');
        if (selectedOrder && selectedOrder._id === rejectConfirm.id) {
            setIsModalOpen(false)
        }
    }
    setRejectConfirm({ isOpen: false, id: null })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'confirmed': return <CheckCircleIcon className="w-4 h-4 text-blue-500" />
      case 'preparing': return <FireIcon className="w-4 h-4 text-purple-500" />
      case 'ready': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'served': return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'cancelled': return <XCircleIcon className="w-4 h-4 text-red-500" />
      default: return <ClockIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'preparing': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'ready': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'served': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'served', label: 'Served' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
                 <span className="text-xl">🛍️</span>
                 <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Kitchen & Sales</span>
              </div>
              <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Order Management</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-400">Track and manage customer orders in real-time</p>
                {pendingCount > 0 ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {pendingCount} Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full">
                    <CheckCircleIcon className="w-4 h-4" />
                    All Clear
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/orders/create')}
                className="flex items-center space-x-2 px-6 py-2.5 bg-warm-gold text-black rounded-xl font-bold hover:bg-warm-gold/90 transition-all shadow-soft-gold"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Order</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all ${
                  showFilters 
                    ? 'bg-dark-slate/10 text-dark-slate border-dark-slate/20' 
                    : 'bg-dark-slate/5 text-gray-400 border-dark-slate/10 hover:border-warm-gold/30 hover:text-dark-slate'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
                <span className="font-bold">{showFilters ? 'Hide' : 'Filter'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Order #, name..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field w-full appearance-none cursor-pointer"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-pearl">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="input-field w-full [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="input-field w-full [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="glass-panel rounded-2xl border border-dark-slate/10 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-dark-slate/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-400 uppercase">Order</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-400 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-400 uppercase">Items</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-400 uppercase">Total</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {ordersData?.data?.orders?.map((order) => (
                    <tr key={order._id} className="hover:bg-dark-slate/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-dark-slate group-hover:text-warm-gold transition-colors">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-gray-600 mr-3 border border-dark-slate/10 overflow-hidden">
                              {order.customer?.avatar ? (
                                <img 
                                  src={order.customer.avatar.startsWith('http') ? order.customer.avatar : `${IMAGE_BASE_URL}/${order.customer.avatar}`} 
                                  alt={order.customer.name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                order.customer.name.charAt(0)
                              )}
                           </div>
                           <div>
                              <div className="text-sm font-bold text-dark-slate">
                                 {order.customer.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                 {order.customer.email}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-600">
                              <span className="font-bold text-warm-gold mr-2 bg-warm-gold/10 px-1.5 py-0.5 rounded">{item.quantity}x</span>
                              <span className="truncate max-w-[150px]">{item.menuItem?.name || 'Unknown Item'}</span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                             <span className="text-[10px] text-gray-400 italic">+ {order.items.length - 2} more items...</span>
                          )}
                        </div>
                        <div className="mt-2">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight bg-dark-slate/5 px-2 py-0.5 rounded border border-dark-slate/5">
                             {order.orderType}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-warm-gold">₹{order.total.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-dark-slate bg-dark-slate/5 hover:bg-dark-slate/10 p-2 rounded-lg transition-all border border-dark-slate/5 hover:border-dark-slate/20"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                                className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-all border border-green-500/20"
                                title="Confirm Order"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setRejectConfirm({ isOpen: true, id: order._id })}
                                className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-all border border-red-500/20"
                                title="Reject Order"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'preparing')}
                              className="text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 p-2 rounded-lg transition-all border border-purple-500/20"
                              title="Start Preparing"
                            >
                              <FireIcon className="w-5 h-5" />
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'ready')}
                              className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg transition-all border border-blue-500/20"
                              title="Mark Ready"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'served')}
                              className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-all border border-green-500/20"
                              title="Mark Served"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ordersData?.data?.orders?.length === 0 && !isLoading && (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-dark-slate/20">
                  <ShoppingBagIcon className="h-10 w-10 text-gray-400" />
               </div>
              <h3 className="mb-2 text-xl font-bold text-dark-slate">No orders found</h3>
              <p className="text-gray-400">No orders match your current filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {ordersData?.data?.pagination && ordersData.data.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 animate-fade-in">
            <nav className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-bold text-gray-400 bg-dark-slate/5 border border-dark-slate/10 rounded-xl hover:bg-dark-slate/10 hover:text-dark-slate transition-colors">
                Previous
              </button>
              <div className="flex items-center space-x-2">
                 <button className="w-10 h-10 flex items-center justify-center text-sm font-bold text-black bg-warm-gold rounded-xl shadow-soft-gold">
                   1
                 </button>
                  {/* Add logic for more pages if needed */}
              </div>
              <button className="px-4 py-2 text-sm font-bold text-gray-400 bg-dark-slate/5 border border-dark-slate/10 rounded-xl hover:bg-dark-slate/10 hover:text-dark-slate transition-colors">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/90 backdrop-blur-md animate-fade-in">
          <div className="bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 w-full max-w-4xl p-0 relative glass-panel max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-dark-slate/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-dark-slate flex items-center gap-3 font-heading">
                   <span className="text-warm-gold">#{selectedOrder.orderNumber}</span>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                   </span>
                </h3>
                <p className="text-gray-400 text-xs mt-1 font-mono">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-dark-slate hover:bg-dark-slate/10 p-2 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Left Column: Details */}
                 <div className="lg:col-span-2 space-y-8">
                    {/* Items List */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                         <ShoppingBagIcon className="w-4 h-4 mr-2" /> Ordered Items ({selectedOrder.items.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col p-4 bg-dark-slate/5 border border-dark-slate/5 rounded-2xl hover:bg-dark-slate/10 hover:border-warm-gold/20 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center justify-center w-8 h-8 bg-warm-gold/20 text-warm-gold font-bold rounded-lg text-sm border border-warm-gold/30">
                                  {item.quantity}x
                                </span>
                                <div>
                                  <p className="text-base font-bold text-dark-slate group-hover:text-warm-gold transition-colors">{item.menuItem?.name || 'Unknown dish'}</p>
                                  <p className="text-xs text-gray-400 font-medium">₹{item.menuItem?.price?.toFixed(2)} each</p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-dark-slate">₹{(item.quantity * (item.menuItem?.price || 0)).toFixed(2)}</p>
                            </div>
                            
                            {/* Customizations / Spicy Levels */}
                            {item.customization && item.customization.length > 0 && (
                              <div className="mt-3 pl-12 flex flex-wrap gap-2">
                                {item.customization.map((custom, cIdx) => (
                                   <div key={cIdx} className="bg-black/40 text-gray-600 border border-dark-slate/10 px-2 py-1 rounded text-[10px] font-bold flex items-center">
                                      <span className="text-gray-400 mr-1 uppercase">{custom.name || custom.optionName}:</span>
                                      <span className="text-warm-gold uppercase">{custom.selectedChoices?.map(c => c.name).join(', ')}</span>
                                   </div>
                                ))}
                              </div>
                            )}
                            
                            {item.specialInstructions && (
                              <div className="mt-3 pl-12">
                                 <div className="p-2 bg-blue-500/10 text-blue-300 rounded-lg text-xs italic border border-blue-500/20 inline-block">
                                   " {item.specialInstructions} "
                                 </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>

                 {/* Right Column: Customer & Summary */}
                 <div className="space-y-6">
                    <div className="bg-dark-slate/5 p-6 rounded-2xl border border-dark-slate/10">
                       <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                          <UserIcon className="w-4 h-4 mr-2" /> Customer
                       </h4>
                       <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-gold to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                             {selectedOrder.customer.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-dark-slate font-bold">{selectedOrder.customer.name}</p>
                             <p className="text-xs text-gray-400">Loyal Customer</p>
                          </div>
                       </div>
                       <div className="space-y-2 text-sm text-gray-400 border-t border-dark-slate/10 pt-3">
                          <div className="flex justify-between">
                             <span>Email:</span>
                             <span className="text-dark-slate text-right truncate max-w-[150px]">{selectedOrder.customer.email}</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Phone:</span>
                             <span className="text-dark-slate">{selectedOrder.customer.phone || 'N/A'}</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-dark-slate/5 p-6 rounded-2xl border border-dark-slate/10">
                       <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                          <CurrencyRupeeIcon className="w-4 h-4 mr-2" /> Payment
                       </h4>
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-400">Method</span>
                          <span className="font-bold text-dark-slate uppercase">{selectedOrder.paymentMethod}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Status</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {selectedOrder.paymentStatus}
                          </span>
                       </div>
                    </div>

                    <div className="bg-warm-gold/5 p-6 rounded-2xl border border-warm-gold/20">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Subtotal</span>
                          <span className="text-dark-slate">₹{selectedOrder.subtotal?.toFixed(2) || (selectedOrder.total / 1.18).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Tax (18%)</span>
                          <span className="text-dark-slate">₹{selectedOrder.tax?.toFixed(2) || (selectedOrder.total - (selectedOrder.total / 1.18)).toFixed(2)}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-400">
                            <span>Discount ({selectedOrder.discountCode})</span>
                            <span className="font-bold">-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-4 border-t border-dark-slate/10 mt-1">
                          <span className="text-lg font-bold text-dark-slate uppercase">Total</span>
                          <span className="text-2xl font-black text-warm-gold">₹{selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-black/40 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 border-t border-dark-slate/10 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 text-gray-600 font-bold transition-colors"
              >
                Close Details
              </button>
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => setRejectConfirm({ isOpen: true, id: selectedOrder._id })}
                    className="py-3 px-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder._id, 'confirmed');
                      setIsModalOpen(false);
                    }}
                    className="btn-primary py-3 px-8 shadow-soft-gold-green bg-green-500 hover:bg-green-400 text-black border-none"
                  >
                    Confirm Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={rejectConfirm.isOpen}
        onClose={() => setRejectConfirm({ ...rejectConfirm, isOpen: false })}
        onConfirm={confirmRejectOrder}
        title="Reject Order"
        message="Are you sure you want to reject this order?"
        confirmText="Reject"
        confirmStyle="danger"
        isLoading={updateOrderStatusMutation.isLoading}
      />
    </div>
  )
}

export default AdminOrders
