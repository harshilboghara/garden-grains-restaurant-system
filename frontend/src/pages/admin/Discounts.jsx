import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { discountsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { useScrollLock } from '../../hooks/useScrollLock'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'

const Discounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true
  })
  const queryClient = useQueryClient()

  const { data: discountsData, isLoading } = useQuery(
    'admin-discounts-all',
    () => discountsAPI.getAllDiscounts()
  )

  const createDiscountMutation = useMutation(
    (data) => discountsAPI.createDiscount(data),
    {
      onSuccess: () => {
        toast.success('Discount code created successfully! 🎉')
        setIsModalOpen(false)
        resetForm()
        queryClient.invalidateQueries('admin-discounts-all')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create discount code')
      }
    }
  )

  const updateDiscountMutation = useMutation(
    ({ id, data }) => discountsAPI.updateDiscount(id, data),
    {
      onSuccess: () => {
        toast.success('Discount code updated successfully! ✅')
        setIsModalOpen(false)
        resetForm()
        queryClient.invalidateQueries('admin-discounts-all')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update discount code')
      }
    }
  )

  const deleteDiscountMutation = useMutation(
    (id) => discountsAPI.deleteDiscount(id),
    {
      onSuccess: () => {
        toast.success('Discount code deleted successfully! 🗑️')
        queryClient.invalidateQueries('admin-discounts-all')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete discount code')
      }
    }
  )

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true
    })
    setEditingDiscount(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minOrderAmount: discount.minOrderAmount || '',
      maxDiscountAmount: discount.maxDiscountAmount || '',
      validFrom: discount.validFrom ? new Date(discount.validFrom).toISOString().slice(0, 16) : '',
      validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().slice(0, 16) : '',
      usageLimit: discount.usageLimit || '',
      isActive: discount.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id, code) => {
    if (window.confirm(`Are you sure you want to delete discount code "${code}"?`)) {
      deleteDiscountMutation.mutate(id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString()
    }

    if (editingDiscount) {
      updateDiscountMutation.mutate({ id: editingDiscount._id, data })
    } else {
      createDiscountMutation.mutate(data)
    }
  }

  const getStatus = (discount) => {
    const now = new Date()
    const validFrom = new Date(discount.validFrom)
    const validUntil = new Date(discount.validUntil)
    
    if (!discount.isActive) return { label: 'Inactive', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
    if (now < validFrom) return { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
    if (now > validUntil) return { label: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return { label: 'Limit Reached', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
    }
    return { label: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' }
  }

  const discounts = discountsData?.data?.discounts || []

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 text-center animate-slide-up">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
            <TagIcon className="h-5 w-5 text-warm-gold" />
             <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Promotions</span>
          </div>
          <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Discount Codes</h1>
          <p className="text-gray-400">Boost sales with targeted discount campaigns</p>
        </div>

        {/* Add Button */}
        <div className="mb-8 flex justify-end animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center space-x-2 shadow-soft-gold"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Discount Code</span>
          </button>
        </div>

        {/* Discounts List */}
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {discounts.map((discount) => {
              const status = getStatus(discount)
              return (
                <div key={discount._id} className="glass-panel p-6 rounded-2xl border border-dark-slate/10 hover:border-warm-gold/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl font-black text-dark-slate font-heading tracking-tight">{discount.code}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${status.color}`}>
                          {status.label}
                      </span>
                      <p className="text-sm text-gray-400 mt-3 line-clamp-2">{discount.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="text-gray-400 hover:text-dark-slate p-2 hover:bg-dark-slate/10 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(discount._id, discount.code)}
                        className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm border-t border-dark-slate/10 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="font-bold text-warm-gold text-lg">
                        {discount.discountType === 'percentage' 
                          ? `${discount.discountValue}%`
                          : `₹${discount.discountValue}`}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="bg-dark-slate/5 p-2 rounded border border-dark-slate/5">
                          <p className="text-gray-400 mb-1">Used</p>
                          <p className="font-bold text-dark-slate">{discount.usedCount || 0} / {discount.usageLimit || '∞'}</p>
                       </div>
                       <div className="bg-dark-slate/5 p-2 rounded border border-dark-slate/5">
                          <p className="text-gray-400 mb-1">Expires</p>
                          <p className="font-bold text-dark-slate">{new Date(discount.validUntil).toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {discounts.length === 0 && (
              <div className="col-span-full text-center py-16">
                 <div className="w-16 h-16 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-dark-slate/20">
                    <TagIcon className="h-8 w-8 text-gray-400" />
                 </div>
                <h3 className="text-xl font-bold text-dark-slate mb-2">No discount codes found</h3>
                <p className="text-gray-400">Create your first discount code to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <DiscountModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              resetForm()
            }}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isEditing={!!editingDiscount}
            loading={createDiscountMutation.isLoading || updateDiscountMutation.isLoading}
          />
        )}
      </div>
    </div>
  )
}

const DiscountModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing, loading }) => {
  useScrollLock(isOpen)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/90 backdrop-blur-md animate-fade-in">
      <div className="bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 w-full max-w-2xl p-8 relative glass-panel max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
           onClick={onClose}
           className="absolute top-6 right-6 text-gray-400 hover:text-dark-slate transition-colors"
        >
           <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-dark-slate mb-8 font-heading border-b border-dark-slate/10 pb-4">
          {isEditing ? 'Edit Discount Code' : 'Create Discount Code'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Code</label>
              <div className="relative">
                 <TagIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                 <input
                   type="text"
                   value={formData.code}
                   onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                   className="input-field pl-10 font-mono uppercase tracking-wider"
                   placeholder="WELCOME10"
                   required
                   disabled={isEditing}
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="input-field appearance-none cursor-pointer"
                required
              >
                <option value="percentage" className="bg-pearl">Percentage (%)</option>
                <option value="fixed" className="bg-pearl">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full"
              rows="2"
              placeholder="e.g. 10% off on all main courses"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Discount Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="input-field"
                placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.discountType === 'percentage' ? 'Enter percentage (e.g., 20)' : 'Enter amount in ₹'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Min Order (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Max Discount Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                className="input-field"
                placeholder="Optional limit"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Valid From</label>
              <input
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="input-field w-full [color-scheme:dark]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Valid Until</label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="input-field w-full [color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Usage Limit</label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className="input-field"
              placeholder="Unlimited if empty"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-dark-slate/5 rounded-xl border border-dark-slate/10 hover:border-warm-gold/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="hidden peer"
            />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isActive ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                {formData.isActive && <CheckCircleIcon className="w-4 h-4 text-black" />}
            </div>
            <span className="text-sm font-bold text-dark-slate">Activate Discount Code</span>
          </label>

          <div className="flex justify-end space-x-3 pt-6 border-t border-dark-slate/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-400 hover:text-dark-slate bg-dark-slate/5 hover:bg-dark-slate/10 rounded-xl transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-8 shadow-soft-gold disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Code' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Discounts
