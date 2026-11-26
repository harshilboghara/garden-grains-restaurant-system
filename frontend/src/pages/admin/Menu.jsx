import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { menuAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const AdminMenu = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizers',
    imageUrl: '',
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    addOns: []
  })
  const [selectedFileName, setSelectedFileName] = useState('')
  const queryClient = useQueryClient()

  const { data: menuData, isLoading } = useQuery(
    ['admin-menu', searchTerm, selectedCategory],
    () => menuAPI.getMenu({ search: searchTerm, category: selectedCategory, limit: 50 })
  )

  const deleteMenuItemMutation = useMutation(
    (id) => menuAPI.deleteMenuItem(id),
    {
      onSuccess: () => {
        toast.success('Menu item deleted successfully')
        queryClient.invalidateQueries('admin-menu')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete menu item')
      }
    }
  )

  const createMenuItemMutation = useMutation(
    (payload) => menuAPI.createMenuItem(payload),
    {
      onSuccess: () => {
        toast.success('Menu item created successfully')
        queryClient.invalidateQueries('admin-menu')
        setIsModalOpen(false)
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
        queryClient.invalidateQueries('admin-menu')
        setIsModalOpen(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update menu item')
      }
    }
  )

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'salads', label: 'Salads' },
    { value: 'soups', label: 'Soups' },
    { value: 'specials', label: 'Specials' }
  ]

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMenuItemMutation.mutate(id)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || 'appetizers',
      imageUrl: item.images?.[0]?.url || '',
      isAvailable: item.availability?.isAvailable ?? true,
      isPopular: item.isPopular || false,
      isFeatured: item.isFeatured || false,
      addOns: item.addOns || []
    })
    setSelectedFileName('')
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'appetizers',
      imageUrl: '',
      isAvailable: true,
      isPopular: false,
      isFeatured: false,
      addOns: []
    })
    setSelectedFileName('')
    setIsModalOpen(true)
  }

  const isSubmitting = useMemo(
    () => createMenuItemMutation.isLoading || updateMenuItemMutation.isLoading,
    [createMenuItemMutation.isLoading, updateMenuItemMutation.isLoading]
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return toast.error('Name must be at least 2 characters')
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      return toast.error('Description must be at least 10 characters')
    }
    if (!formData.price || Number(formData.price) <= 0) {
      return toast.error('Price must be a positive number')
    }

    if (formData.addOns && formData.addOns.length > 0) {
      for (const addon of formData.addOns) {
        if (!addon.name.trim()) {
          return toast.error('Add-on name is required')
        }
        if (addon.price === '' || Number(addon.price) < 0) {
          return toast.error('Add-on price cannot be negative')
        }
      }
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      availability: { isAvailable: formData.isAvailable },
      isPopular: formData.isPopular,
      isFeatured: formData.isFeatured,
      addOns: formData.addOns
    }

    if (formData.imageUrl.trim()) {
      payload.images = [{ url: formData.imageUrl.trim(), isPrimary: true }]
    }

    if (editingItem?._id) {
      updateMenuItemMutation.mutate({ id: editingItem._id, data: payload })
    } else {
      createMenuItemMutation.mutate(payload)
    }
  }

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
           <div>
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
                 <span className="text-xl">📋</span>
                 <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Catalog</span>
              </div>
              <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Menu Management</h1>
              <p className="text-gray-400">Create, edit, and organize your restaurant offerings</p>
           </div>
           <button
             onClick={handleAddNew}
             className="btn-primary py-3 px-6 flex items-center space-x-2 shadow-soft-gold"
           >
             <PlusIcon className="h-5 w-5" />
             <span>Add New Item</span>
           </button>
        </div>

        {/* Filters */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.value || 'all'}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedCategory === category.value 
                        ? 'bg-warm-gold text-black border-warm-gold' 
                        : 'bg-dark-slate/5 text-gray-400 border-dark-slate/10 hover:border-dark-slate/30 hover:text-dark-slate'
                    }`}
                    type="button"
                  >
                    {category.label === 'All Categories' ? 'All' : category.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="w-full px-4 py-2.5 text-gray-400 bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/10 rounded-xl transition-colors text-sm font-bold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="glass-panel rounded-2xl border border-dark-slate/10 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-dark-slate/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {menuData?.data?.menuItems?.map((item) => (
                    <tr key={item._id} className="hover:bg-dark-slate/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-lg overflow-hidden mr-4 border border-dark-slate/10 group-hover:border-warm-gold/50 transition-colors">
                             <img
                               src={item.images?.[0]?.url || '/api/placeholder/50/50'}
                               alt={item.name}
                               className="h-full w-full object-cover"
                             />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-dark-slate">{item.name}</div>
                            <div className="text-xs text-gray-400 line-clamp-1 max-w-[150px]">{item.description}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          <span className="font-bold">{item.ratings.average.toFixed(1)}</span>
                          <span className="text-gray-600 ml-1 text-xs">({item.ratings.count})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-dark-slate hover:text-warm-gold transition-colors p-1.5 hover:bg-dark-slate/10 rounded-lg"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                            title="Delete"
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
          )}

          {menuData?.data?.menuItems?.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-dark-slate/20">
                 <PlusIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-dark-slate mb-2">No menu items found</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">Try adjusting your search or filters, or add a new item to get started.</p>
              <button
                onClick={handleAddNew}
                className="btn-primary"
              >
                Add First Item
              </button>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 w-full max-w-2xl p-8 relative glass-panel max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-dark-slate transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-dark-slate mb-6 font-heading border-b border-dark-slate/10 pb-4">
                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-dark-slate/5 p-4 rounded-xl border border-dark-slate/10">
                    <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center">
                       <PhotoIcon className="w-4 h-4 mr-2 text-warm-gold" /> Item Image
                    </label>
                    <div className="flex flex-col md:flex-row gap-4">
                       <input
                         type="text"
                         value={formData.imageUrl}
                         onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                         placeholder="Image URL (start with https://)"
                         className="flex-1 input-field"
                       />
                       <label className="flex items-center justify-center px-4 py-2 bg-dark-slate/10 hover:bg-dark-slate/20 border border-dark-slate/10 rounded-xl cursor-pointer text-sm font-bold transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setSelectedFileName(file.name)
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  const base64 = reader.result?.toString() || ''
                                  setFormData((prev) => ({ ...prev, imageUrl: base64 }))
                                }
                                reader.readAsDataURL(file)
                            }}
                          />
                          Upload File
                       </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full"
                      placeholder="Dish Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field w-full"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                   <select
                     value={formData.category}
                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                     className="input-field w-full appearance-none cursor-pointer"
                   >
                     {categories.filter(c => c.value !== '').map((c) => (
                       <option key={c.value} value={c.value} className="bg-pearl">{c.label}</option>
                     ))}
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full"
                    placeholder="Short description of ingredients and taste..."
                    required
                  />
                </div>

                {/* Add-ons Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-400">Add-ons / Extras</label>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        addOns: [...(formData.addOns || []), { name: '', price: '' }]
                      })}
                      className="text-warm-gold text-xs font-bold uppercase tracking-wider hover:text-dark-slate transition-colors flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                  
                  {formData.addOns?.map((addon, index) => (
                    <div key={index} className="flex gap-4 items-start animate-fade-in">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={addon.name}
                          onChange={(e) => {
                            const newAddOns = [...formData.addOns]
                            newAddOns[index].name = e.target.value
                            setFormData({ ...formData, addOns: newAddOns })
                          }}
                          className="input-field w-full text-sm"
                          placeholder="Item Name (e.g. Extra Cheese)"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={addon.price}
                          onChange={(e) => {
                            const newAddOns = [...formData.addOns]
                            newAddOns[index].price = e.target.value
                            setFormData({ ...formData, addOns: newAddOns })
                          }}
                          className="input-field w-full text-sm"
                          placeholder="Price"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newAddOns = formData.addOns.filter((_, i) => i !== index)
                          setFormData({ ...formData, addOns: newAddOns })
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {(!formData.addOns || formData.addOns.length === 0) && (
                    <div className="text-center py-4 border border-dashed border-dark-slate/10 rounded-xl">
                      <p className="text-xs text-gray-400">No add-ons configured</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center peer-checked:bg-warm-gold peer-checked:border-warm-gold peer-checked:text-black transition-colors">
                       {formData.isAvailable && <CheckIcon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-bold text-gray-600">Available</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center peer-checked:bg-red-500 peer-checked:border-red-500 peer-checked:text-dark-slate transition-colors">
                       {formData.isPopular && <CheckIcon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-bold text-gray-600">Popular</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center peer-checked:bg-yellow-500 peer-checked:border-yellow-500 peer-checked:text-black transition-colors">
                       {formData.isFeatured && <CheckIcon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-bold text-gray-600">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-dark-slate/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-gray-400 hover:text-dark-slate bg-dark-slate/5 hover:bg-dark-slate/10 rounded-xl transition-colors font-bold"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-8 shadow-soft-gold disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMenu
