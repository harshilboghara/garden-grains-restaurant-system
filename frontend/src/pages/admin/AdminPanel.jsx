import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { menuAPI, adminAPI, ordersAPI, reservationsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { useScrollLock } from '../../hooks/useScrollLock'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../../components/common/ConfirmationModal'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('menu')
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main-course',
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    imageUrl: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, name: '' })
  const queryClient = useQueryClient()

  // Menu Queries
  const { data: menuData, isLoading: menuLoading } = useQuery(
    'admin-menu-all',
    () => menuAPI.getMenu({ limit: 100 })
  )

  // Orders Query
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'admin-orders-all',
    () => ordersAPI.getAllOrders()
  )

  // Reservations Query  
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery(
    'admin-reservations-all',
    () => reservationsAPI.getAllReservations()
  )

  // Mutations
  const createMenuItemMutation = useMutation(
    (data) => menuAPI.createMenuItem(data),
    {
      onSuccess: () => {
        toast.success('Menu item created successfully')
        setIsMenuModalOpen(false)
        resetMenuForm()
        queryClient.invalidateQueries('admin-menu-all')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create menu item')
      }
    }
  )

  const updateMenuItemMutation = useMutation(
    ({ id, data }) => menuAPI.updateMenuItem(id, data),
    {
      onSuccess: () => {
        toast.success('Menu item updated successfully')
        setIsMenuModalOpen(false)
        resetMenuForm()
        queryClient.invalidateQueries('admin-menu-all')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update menu item')
      }
    }
  )

  const deleteMenuItemMutation = useMutation(
    (id) => menuAPI.deleteMenuItem(id),
    {
      onSuccess: () => {
        toast.success('Menu item deleted successfully')
        queryClient.invalidateQueries('admin-menu-all')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete menu item')
      }
    }
  )

  const updateUserStatusMutation = useMutation(
    ({ id, isActive }) => adminAPI.updateUserStatus(id, isActive),
    {
      onSuccess: () => {
        toast.success('User status updated successfully')
        queryClient.invalidateQueries('admin-users')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user status')
      }
    }
  )

  const handleUserStatusUpdate = (id, isActive) => {
    updateUserStatusMutation.mutate({ id, isActive })
  }

  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      description: '',
      price: '',
      category: 'main-course',
      isAvailable: true,
      isPopular: false,
      isFeatured: false,
      imageUrl: ''
    })
    setEditingMenuItem(null)
    setImageFile(null)
    setImagePreview('')
  }

  const handleAddMenuItem = () => {
    setEditingMenuItem(null)
    resetMenuForm()
    setIsMenuModalOpen(true)
  }

  const handleEditMenuItem = (item) => {
    setEditingMenuItem(item)
    setMenuFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.availability?.isAvailable ?? true,
      isPopular: item.isPopular,
      isFeatured: item.isFeatured,
      imageUrl: item.images?.[0]?.url || ''
    })
    setImagePreview(item.images?.[0]?.url || '')
    setImageFile(null)
    setIsMenuModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteMenuItem = (id, name) => {
    setDeleteConfirmation({ isOpen: true, id, name })
  }

  const confirmDeleteMenuItem = () => {
    if (deleteConfirmation.id) {
      deleteMenuItemMutation.mutate(deleteConfirmation.id)
    }
    setDeleteConfirmation({ isOpen: false, id: null, name: '' })
  }

  const handleMenuSubmit = (e) => {
    e.preventDefault()
    
    // Handle image upload
    let imageUrl = menuFormData.imageUrl
    if (imageFile) {
      imageUrl = imagePreview || imageUrl
    }
    
    const data = {
      ...menuFormData,
      price: parseFloat(menuFormData.price),
      images: imageUrl ? [{ url: imageUrl, alt: menuFormData.name, isPrimary: true }] : [],
      availability: {
        isAvailable: menuFormData.isAvailable
      }
    }

    if (editingMenuItem) {
      updateMenuItemMutation.mutate({ id: editingMenuItem._id, data })
    } else {
      createMenuItemMutation.mutate(data)
    }
  }

  const tabs = [
    { id: 'menu', name: 'Menu Items', icon: ClipboardDocumentListIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'reservations', name: 'Reservations', icon: CalendarDaysIcon },
    { id: 'discounts', name: 'Discount Codes', icon: TagIcon },
    { id: 'users', name: 'Users', icon: UsersIcon }
  ]

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
          <div>
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
              <span className="text-xl">🛠️</span>
              <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Admin Panel</h1>
            <p className="text-gray-400">Manage your restaurant operations efficiently</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const playSound = (id) => {
                  const audio = new Audio(id === 'new' ? '/notification.mp3' : '/cancel.mp3');
                  audio.play()
                    .then(() => toast.success(`${id === 'new' ? 'New Order' : 'Cancel'} sound played!`))
                    .catch(err => toast.error(`Sound blocked! Click anywhere first. ${err.message}`));
                };
                playSound('new');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-warm-gold text-deep-black rounded-xl font-bold text-sm transition-all hover:bg-yellow-500 shadow-soft-gold border border-yellow-400/50"
            >
              <span className="text-lg">🔊</span>
              Test Sound
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-panel rounded-xl border border-dark-slate/10 mb-8 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="border-b border-dark-slate/10 overflow-x-auto">
            <nav className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-300
                      ${activeTab === tab.id
                        ? 'border-warm-gold text-warm-gold bg-dark-slate/5'
                        : 'border-transparent text-gray-400 hover:text-dark-slate hover:bg-dark-slate/5'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="glass-panel rounded-2xl border border-dark-slate/10 min-h-[500px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'menu' && (
            <MenuManagement 
              menuData={menuData}
              loading={menuLoading}
              onAdd={handleAddMenuItem}
              onEdit={handleEditMenuItem}
              onDelete={handleDeleteMenuItem}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersManagement 
              ordersData={ordersData}
              loading={ordersLoading}
            />
          )}
          {activeTab === 'reservations' && (
            <ReservationsManagement 
              reservationsData={reservationsData}
              loading={reservationsLoading}
            />
          )}
          {activeTab === 'discounts' && (
            <div className="p-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-slate/10">
                 <TagIcon className="h-10 w-10 text-warm-gold" />
              </div>
              <h3 className="text-2xl font-bold text-dark-slate mb-2 font-heading">Discount Codes</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Manage promotional campaigns and discounts from the dedicated management page.</p>
              <a href="/admin/discounts" className="btn-primary inline-flex items-center space-x-2 px-8">
                <TagIcon className="h-5 w-5" />
                <span>Go to Discounts Manager</span>
              </a>
            </div>
          )}
          {activeTab === 'users' && (
            <UsersManagement 
              onStatusUpdate={handleUserStatusUpdate}
            />
          )}
        </div>

        {/* Add/Edit Menu Item Modal */}
        {isMenuModalOpen && (
          <MenuModal
            isOpen={isMenuModalOpen}
            onClose={() => {
              setIsMenuModalOpen(false)
              resetMenuForm()
            }}
            formData={menuFormData}
            setFormData={setMenuFormData}
            onSubmit={handleMenuSubmit}
            isEditing={!!editingMenuItem}
            loading={createMenuItemMutation.isLoading || updateMenuItemMutation.isLoading}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
          onConfirm={confirmDeleteMenuItem}
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.`}
          confirmText="Delete Item"
          confirmStyle="danger"
          isLoading={deleteMenuItemMutation.isLoading}
        />
      </div>
    </div>
  )
}

const MenuManagement = ({ menuData, loading, onAdd, onEdit, onDelete }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-dark-slate font-heading">Menu Items</h2>
      <button
        onClick={onAdd}
        className="btn-primary flex items-center space-x-2 py-2 px-4 text-sm shadow-soft-gold"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Add Item</span>
      </button>
    </div>

    {loading ? (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
      </div>
    ) : (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-xl border border-dark-slate/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-dark-slate/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {menuData?.data?.menuItems?.map((item) => (
                <tr key={item._id} className="hover:bg-dark-slate/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={item.images?.[0]?.url || 'https://placehold.co/50x50'}
                        alt={item.name}
                        className="h-12 w-12 object-cover rounded-lg mr-4 border border-dark-slate/10"
                      />
                      <div>
                        <div className="text-sm font-bold text-dark-slate">{item.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border border-dark-slate/10 bg-dark-slate/5 text-gray-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-warm-gold">
                    ₹{item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                      item.availability.isAvailable 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {item.availability.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item._id, item.name)}
                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 h-[600px] overflow-y-auto custom-scrollbar pr-2">
           {menuData?.data?.menuItems?.map((item) => (
              <div key={item._id} className="glass-panel p-4 rounded-xl border border-dark-slate/5 flex gap-4">
                 <img
                    src={item.images?.[0]?.url || 'https://placehold.co/100x100'}
                    alt={item.name}
                    className="h-24 w-24 object-cover rounded-lg border border-dark-slate/10 flex-shrink-0"
                 />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                       <h3 className="text-dark-slate font-bold truncate pr-2">{item.name}</h3>
                       <span className="text-warm-gold font-bold">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                       <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                          item.availability.isAvailable 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                       }`}>
                          {item.availability.isAvailable ? 'Available' : 'Unavailable'}
                       </span>
                       
                       <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="bg-blue-500/10 text-blue-400 p-1.5 rounded-lg border border-blue-500/20"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item._id, item.name)}
                            className="bg-red-500/10 text-red-400 p-1.5 rounded-lg border border-red-500/20"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {menuData?.data?.menuItems?.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No menu items found</p>
          </div>
        )}
      </>
    )}
  </div>
)

const OrdersManagement = ({ ordersData, loading }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-dark-slate mb-6 font-heading">Orders Overview</h2>
    {loading ? (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
      </div>
    ) : (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-xl border border-dark-slate/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-dark-slate/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {ordersData?.data?.orders?.slice(0, 10).map((order) => (
                <tr key={order._id} className="hover:bg-dark-slate/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-dark-slate">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {order.customer?.name || 'Guest'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-warm-gold">
                    ₹{order.total?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                      order.status === 'completed' || order.status === 'served' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      order.status === 'preparing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
           {ordersData?.data?.orders?.slice(0, 10).map((order) => (
              <div key={order._id} className="glass-panel p-4 rounded-xl border border-dark-slate/5">
                 <div className="flex justify-between items-center mb-3 border-b border-dark-slate/5 pb-2">
                    <span className="text-dark-slate font-bold text-lg">{order.orderNumber}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                      order.status === 'completed' || order.status === 'served' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-dark-slate/10 text-gray-400 border-dark-slate/20'
                    }`}>
                      {order.status}
                    </span>
                 </div>
                 <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-400">Customer</div>
                    <div className="text-gray-600 text-right">{order.customer?.name || 'Guest'}</div>
                    
                    <div className="text-gray-400">Date</div>
                    <div className="text-gray-600 text-right">{new Date(order.createdAt).toLocaleDateString()}</div>
                    
                    <div className="text-gray-400 font-medium pt-2">Total Amount</div>
                    <div className="text-warm-gold font-bold text-lg text-right pt-2">₹{order.total?.toFixed(2)}</div>
                 </div>
              </div>
           ))}
        </div>
      </>
    )}
  </div>
)

const ReservationsManagement = ({ reservationsData, loading }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-dark-slate mb-6 font-heading">Reservations</h2>
    {loading ? (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
      </div>
    ) : (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-xl border border-dark-slate/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-dark-slate/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Party</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {reservationsData?.data?.reservations?.slice(0, 10).map((reservation) => (
                <tr key={reservation._id} className="hover:bg-dark-slate/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="font-bold text-dark-slate">{new Date(reservation.date).toLocaleDateString()}</div>
                    <div className="text-xs text-warm-gold">{reservation.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {reservation.partySize} Guests
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {reservation.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                      reservation.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
           {reservationsData?.data?.reservations?.slice(0, 10).map((reservation) => (
              <div key={reservation._id} className="glass-panel p-4 rounded-xl border border-dark-slate/5 flex flex-col gap-2">
                 <div className="flex justify-between items-center border-b border-dark-slate/5 pb-2 mb-1">
                    <div className="flex items-center space-x-2">
                       <span className="text-xl">📅</span>
                       <span className="text-dark-slate font-bold">{new Date(reservation.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-warm-gold font-bold bg-warm-gold/10 px-2 py-1 rounded-lg text-xs">{reservation.time}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-400">Customer</div>
                    <div className="text-gray-600 text-right">{reservation.customerName}</div>
                    
                    <div className="text-gray-400">Party Size</div>
                    <div className="text-gray-600 text-right">{reservation.partySize} Guests</div>
                    
                    <div className="text-gray-400 pt-1">Status</div>
                    <div className="text-right pt-1">
                       <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                          reservation.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                       }`}>
                          {reservation.status}
                       </span>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </>
    )}
  </div>
)

const UsersManagement = ({ onStatusUpdate }) => {
  const { data: usersData, isLoading } = useQuery(
    'admin-users',
    () => adminAPI.getUsers({ limit: 50 })
  )

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-dark-slate mb-6 font-heading">User Management</h2>
      {isLoading ? (
        <div className="p-20 text-center">
          <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-xl border border-dark-slate/10">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-dark-slate/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {usersData?.data?.users?.slice(0, 10).map((user) => (
                  <tr key={user._id} className="hover:bg-dark-slate/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-slate">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                        user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onStatusUpdate(user._id, !user.isActive)}
                        disabled={user.role === 'admin'}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          user.isActive 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                        } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {usersData?.data?.users?.slice(0, 10).map((user) => (
               <div key={user._id} className="glass-panel p-4 rounded-xl border border-dark-slate/5">
                  <div className="flex justify-between items-center mb-2 border-b border-dark-slate/5 pb-2">
                     <span className="text-dark-slate font-bold">{user.name}</span>
                     <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                        user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                     }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                     </span>
                  </div>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span className="text-gray-400">Email</span>
                        <span className="text-gray-600 truncate max-w-[150px]">{user.email}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400">Role</span>
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/20 bg-blue-500/10 text-blue-400">
                          {user.role}
                        </span>
                     </div>
                     <button
                        onClick={() => onStatusUpdate(user._id, !user.isActive)}
                        disabled={user.role === 'admin'}
                        className={`w-full mt-2 py-2 rounded text-xs font-bold transition-all border ${
                          user.isActive 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                  </div>
               </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const MenuModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing, loading, imagePreview, onImageChange }) => {
  useScrollLock(isOpen)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto custom-scrollbar glass-panel">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-dark-slate font-heading">
             {isEditing ? 'Edit Menu Item' : 'New Menu Item'}
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-dark-slate p-2 hover:bg-dark-slate/10 rounded-full transition-colors">
              <XMarkIcon className="w-6 h-6" />
           </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-dark-slate/5 p-4 rounded-xl border border-dark-slate/10">
            <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center">
               <PhotoIcon className="w-4 h-4 mr-2 text-warm-gold" /> Item Image
            </label>
            <div className="flex items-start space-x-6">
              {imagePreview ? (
                <div className="relative group">
                   <img
                     src={imagePreview}
                     alt="Preview"
                     className="h-32 w-32 object-cover rounded-xl border border-dark-slate/20 shadow-lg"
                   />
                   <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs text-dark-slate bg-black/60 px-2 py-1 rounded">Preview</span>
                   </div>
                </div>
              ) : (
                <div className="h-32 w-32 bg-dark-slate/5 rounded-xl border border-dashed border-dark-slate/20 flex flex-col items-center justify-center text-gray-400">
                   <PhotoIcon className="w-8 h-8 mb-2 opacity-50" />
                   <span className="text-xs">No Image</span>
                </div>
              )}
              
              <div className="flex-1 space-y-4">
                <div className="relative">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={onImageChange}
                     className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-dark-slate/10 file:text-dark-slate hover:file:bg-dark-slate/20 cursor-pointer"
                   />
                </div>
                <div className="relative">
                   <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-xs">URL</span>
                   <input
                     type="text"
                     placeholder="https://example.com/image.jpg"
                     value={formData.imageUrl}
                     onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                     className="w-full bg-black/40 border border-dark-slate/10 rounded-lg py-2 pl-10 pr-3 text-sm text-dark-slate focus:border-warm-gold/50 focus:outline-none placeholder-gray-600"
                   />
                </div>
                <p className="text-xs text-gray-400">
                  Upload a file or paste a direct image URL.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-400 mb-2">Item Name</label>
               <input
                 type="text"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 className="input-field"
                 placeholder="e.g. Truffle Pasta"
                 required
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
               <select
                 value={formData.category}
                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                 className="input-field appearance-none cursor-pointer"
                 required
               >
                 <option value="main-course" className="bg-pearl">Main Course</option>
                 <option value="appetizers" className="bg-pearl">Appetizers</option>
                 <option value="desserts" className="bg-pearl">Desserts</option>
                 <option value="beverages" className="bg-pearl">Beverages</option>
                 <option value="salads" className="bg-pearl">Salads</option>
                 <option value="soups" className="bg-pearl">Soups</option>
                 <option value="specials" className="bg-pearl">Specials</option>
               </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="Describe the dish..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Price (₹)</label>
              <div className="relative">
                 <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                 <input
                   type="number"
                   step="0.01"
                   value={formData.price}
                   onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                   className="input-field pl-8"
                   placeholder="0.00"
                   required
                 />
              </div>
            </div>
            
            <div className="flex flex-col justify-end space-y-3">
               <label className="flex items-center space-x-3 cursor-pointer group">
                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isAvailable ? 'bg-warm-gold border-warm-gold' : 'border-gray-500 bg-transparent'}`}>
                    {formData.isAvailable && <CheckIcon className="w-4 h-4 text-black" />}
                 </div>
                 <input
                   type="checkbox"
                   checked={formData.isAvailable}
                   onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                   className="hidden"
                 />
                 <span className="text-sm font-medium text-gray-600 group-hover:text-dark-slate transition-colors">Available</span>
               </label>

               <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500 bg-transparent'}`}>
                     {formData.isFeatured && <CheckIcon className="w-4 h-4 text-black" />}
                  </div>
                 <input
                   type="checkbox"
                   checked={formData.isFeatured}
                   onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                   className="hidden"
                 />
                 <span className="text-sm font-medium text-gray-600 group-hover:text-dark-slate transition-colors">Featured</span>
               </label>
               
               <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isPopular ? 'bg-red-500 border-red-500' : 'border-gray-500 bg-transparent'}`}>
                     {formData.isPopular && <CheckIcon className="w-4 h-4 text-dark-slate" />}
                  </div>
                 <input
                   type="checkbox"
                   checked={formData.isPopular}
                   onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                   className="hidden"
                 />
                 <span className="text-sm font-medium text-gray-600 group-hover:text-dark-slate transition-colors">Popular</span>
               </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-dark-slate/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 text-gray-400 hover:text-dark-slate border border-dark-slate/5 hover:border-dark-slate/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 rounded-xl bg-warm-gold hover:bg-yellow-500 text-black font-bold shadow-soft-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <div className="flex items-center">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></span>
                    Saving...
                 </div>
              ) : (isEditing ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper icon component since it was missing in imports
function CheckIcon({ className }) {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
   )
}

export default AdminPanel
