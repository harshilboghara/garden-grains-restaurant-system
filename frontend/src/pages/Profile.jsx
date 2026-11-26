import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { usersAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import ConfirmationModal from '../components/common/ConfirmationModal'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  ClipboardDocumentCheckIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferences: {
      dietaryRestrictions: [],
      favoriteCategories: [],
      spiceLevel: 'medium'
    }
  })

  const queryClient = useQueryClient()

  const { data: profileData, isLoading } = useQuery(
    'user-profile',
    () => usersAPI.getProfile(),
    {
      onSuccess: (data) => {
        setFormData({
          name: data.data.user.name,
          phone: data.data.user.phone,
          address: data.data.user.address || { street: '', city: '', state: '', zipCode: '' },
          preferences: data.data.user.preferences || { dietaryRestrictions: [], favoriteCategories: [], spiceLevel: 'medium' }
        })
      }
    }
  )

  const updateProfileMutation = useMutation(
    (data) => usersAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.data.user)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
        queryClient.invalidateQueries('user-profile')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  const uploadAvatarMutation = useMutation(
    (formData) => usersAPI.uploadAvatar(formData),
    {
      onSuccess: (response) => {
        // Need to merge with existing user data to not lose other fields if backend only returns avatar
        // But backend users.js returns { message, avatar } only.
        // So we should update just the avatar field in context
        updateUser({ ...user, avatar: response.data.avatar })
        toast.success('Profile picture updated!')
        queryClient.invalidateQueries('user-profile')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload image')
      }
    }
  )

  const deleteAvatarMutation = useMutation(
    () => usersAPI.deleteAvatar(),
    {
      onSuccess: () => {
        updateUser({ ...user, avatar: null })
        toast.success('Profile picture removed!')
        queryClient.invalidateQueries('user-profile')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove image')
      }
    }
  )

  const handleRemoveAvatar = (e) => {
    e.preventDefault()
    e.stopPropagation() 
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteAvatar = () => {
    deleteAvatarMutation.mutate()
    setIsDeleteModalOpen(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }
        
        const formData = new FormData()
        formData.append('avatar', file)
        uploadAvatarMutation.mutate(formData)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }))
    } else if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [prefField]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profileData) {
      setFormData({
        name: profileData.data.user.name,
        phone: profileData.data.user.phone,
        address: profileData.data.user.address || { street: '', city: '', state: '', zipCode: '' },
        preferences: profileData.data.user.preferences || { dietaryRestrictions: [], favoriteCategories: [], spiceLevel: 'medium' }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="w-16 h-16 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-slide-up">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
            <UserIcon className="h-5 w-5 text-warm-gold" />
            <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">My Profile</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-2 font-heading">Manage Account</h1>
          <p className="text-gray-400">Update your personal details and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10 relative overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-warm-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-dark-slate font-heading">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-warm-gold hover:text-dark-slate transition-colors px-4 py-2 rounded-lg hover:bg-dark-slate/5 border border-transparent hover:border-dark-slate/10"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSubmit}
                      disabled={updateProfileMutation.isLoading}
                      className="flex items-center space-x-2 bg-organic-green/20 text-organic-green hover:bg-organic-green/30 px-4 py-2 rounded-lg transition-colors border border-organic-green/30"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field pl-10"
                        placeholder="Your Name"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="input-field pl-10 opacity-50 cursor-not-allowed bg-black/40"
                        />
                    </div>
                    {isEditing && <p className="text-xs text-gray-400 mt-1 ml-1">Email cannot be changed</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <div className="relative">
                     <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field pl-10"
                        placeholder="Your Phone Number"
                    />
                  </div>
                </div>

                <div className="h-px bg-dark-slate/10 my-6"></div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-bold text-dark-slate mb-4 flex items-center">
                     <MapPinIcon className="h-5 w-5 mr-2 text-warm-gold" />
                     Address Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field"
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-dark-slate/10 my-6"></div>

                {/* Preferences */}
                <div>
                  <h3 className="text-lg font-bold text-dark-slate mb-4 flex items-center">
                     <FireIcon className="h-5 w-5 mr-2 text-warm-gold" />
                     Preferences
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Spice Level</label>
                    <select
                      name="preferences.spiceLevel"
                      value={formData.preferences.spiceLevel}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="mild" className="bg-pearl text-dark-slate">Mild</option>
                      <option value="medium" className="bg-pearl text-dark-slate">Medium</option>
                      <option value="hot" className="bg-pearl text-dark-slate">Hot</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary Card */}
            <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative group/avatar inline-block mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-warm-gold to-yellow-600 rounded-full flex items-center justify-center shadow-soft-gold border-2 border-dark-slate/20 overflow-hidden relative">
                        {user?.avatar ? (
                            <img 
                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${user.avatar}`} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = 'https://ui-avatars.com/api/?name=' + user?.name + '&background=D4AF37&color=000';
                                }}
                            />
                        ) : (
                            <span className="text-4xl font-bold text-deep-black uppercase">{user?.name?.charAt(0) || 'U'}</span>
                        )}
                        
                        {/* Upload Overlay */}
                        <label className="absolute inset-0 w-full h-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer z-10">
                            <CameraIcon className="w-6 h-6 text-dark-slate mb-1" />
                            <span className="text-[10px] text-dark-slate font-medium">Change</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageChange}
                                disabled={uploadAvatarMutation.isLoading}
                            />
                        </label>

                        {(uploadAvatarMutation.isLoading || deleteAvatarMutation.isLoading) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                                <div className="w-6 h-6 border-2 border-dark-slate/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Remove Button - Now Outside */}
                    {user?.avatar && (
                        <button
                            onClick={handleRemoveAvatar}
                            disabled={deleteAvatarMutation.isLoading}
                            className="absolute -top-1 -right-1 p-1.5 bg-red-500 rounded-full text-dark-slate shadow-lg z-20 opacity-0 group-hover/avatar:opacity-100 hover:bg-red-600 transition-all transform hover:scale-110 border border-dark-slate/20"
                            title="Remove Profile Picture"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-dark-slate">{user?.name}</h3>
                  <p className="text-sm text-warm-gold">Premium Member</p>
               </div>
               
               <div className="space-y-3 pt-4 border-t border-dark-slate/10">
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                     <EnvelopeIcon className="h-4 w-4" />
                     <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                     <PhoneIcon className="h-4 w-4" />
                     <span>{user?.phone || 'No phone added'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                     <MapPinIcon className="h-4 w-4" />
                     <span className="truncate">{user?.address?.city ? `${user.address.city}, ${user.address.state}` : 'No address set'}</span>
                  </div>
               </div>
            </div>

            {/* Loyalty Points */}
            <div className="glass-panel p-6 rounded-2xl border border-warm-gold/30 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-warm-gold/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-warm-gold/20 transition-all duration-500"></div>
               
              <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-lg font-bold text-dark-slate font-heading">Loyalty Points</h3>
                <SparklesIcon className="h-5 w-5 text-warm-gold animate-pulse" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-warm-gold font-heading">{user?.loyaltyPoints || 0}</span>
                    <span className="text-sm text-gray-400 ml-2">pts</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Earn points with every order!</p>
                
                <div className="h-2 bg-dark-slate/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-warm-gold to-yellow-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((user?.loyaltyPoints || 0) / 1000 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-right">
                  {Math.max(0, 1000 - (user?.loyaltyPoints || 0))} pts to next reward
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10">
              <h3 className="text-lg font-bold text-dark-slate mb-4 font-heading">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 hover:border-warm-gold/30 transition-all group"
                >
                  <span className="text-sm text-gray-600 group-hover:text-dark-slate">Order History</span>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-400 group-hover:text-warm-gold" />
                </Link>
                <Link
                  to="/reservations"
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 hover:border-warm-gold/30 transition-all group"
                >
                  <span className="text-sm text-gray-600 group-hover:text-dark-slate">Reservations</span>
                  <CheckIcon className="h-4 w-4 text-gray-400 group-hover:text-warm-gold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteAvatar}
        title="Remove Profile Picture"
        message="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove"
        confirmStyle="danger"
        isLoading={deleteAvatarMutation.isLoading}
      />
    </div>
  )
}

export default Profile
