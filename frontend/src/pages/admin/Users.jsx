import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const AdminUsers = () => {
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const queryClient = useQueryClient()

  // In a real app we would pass filters to the API
  const { data: usersData, isLoading } = useQuery(
    ['admin-users', filters],
    () => adminAPI.getUsers({ limit: 50, ...filters })
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

  const handleStatusUpdate = (userId, isActive) => {
    updateUserStatusMutation.mutate({ id: userId, isActive })
  }

  // Filter logic if API doesn't support it directly, or display logic
  const filteredUsers = usersData?.data?.users?.filter(user => {
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.role && user.role !== filters.role) return false;
    return true;
  });

  return (
    <div className="min-h-screen relative pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
                 <span className="text-xl">👥</span>
                 <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Access Control</span>
              </div>
              <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">User Management</h1>
              <p className="text-gray-400">Manage customer accounts and administrative access</p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                showFilters 
                  ? 'bg-warm-gold text-black border-warm-gold' 
                  : 'bg-dark-slate/5 text-gray-400 border-dark-slate/10 hover:border-warm-gold/30 hover:text-dark-slate'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="font-bold">{showFilters ? 'Hide Filters' : 'Filter List'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="input-field w-full appearance-none cursor-pointer"
                >
                  <option value="" className="bg-pearl">All Roles</option>
                  <option value="user" className="bg-pearl">User</option>
                  <option value="admin" className="bg-pearl">Admin</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="glass-panel rounded-2xl border border-dark-slate/10 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-dark-slate/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-transparent">
                    {filteredUsers?.map((user) => (
                      <tr key={user._id} className="hover:bg-dark-slate/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-600 font-bold border border-dark-slate/10 mr-3">
                                 {user.name.charAt(0)}
                              </div>
                              <div className="font-bold text-dark-slate group-hover:text-warm-gold transition-colors">{user.name}</div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                             user.role === 'admin' 
                               ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                               : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {user.role === 'admin' && <ShieldCheckIcon className="w-3 h-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                            user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {user.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusUpdate(user._id, !user.isActive)}
                            disabled={user.role === 'admin'}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              user.isActive 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
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
              <div className="md:hidden p-4 space-y-4">
                {filteredUsers?.map((user) => (
                   <div key={user._id} className="bg-dark-slate/5 rounded-xl border border-dark-slate/10 p-4">
                      <div className="flex justify-between items-start mb-3 border-b border-dark-slate/5 pb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-dark-slate/10 flex items-center justify-center font-bold">
                               {user.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-dark-slate text-sm">{user.name}</p>
                               <p className="text-xs text-warm-gold uppercase tracking-wider font-bold">{user.role}</p>
                            </div>
                         </div>
                         <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                            user.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                         }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                         </span>
                      </div>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Email</span>
                            <span className="text-gray-600">{user.email}</span>
                         </div>
                         
                         <button
                            onClick={() => handleStatusUpdate(user._id, !user.isActive)}
                            disabled={user.role === 'admin'}
                            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all border ${
                              user.isActive 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                            } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                          </button>
                      </div>
                   </div>
                ))}
              </div>
            </>
          )}

          {filteredUsers?.length === 0 && !isLoading && (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-dark-slate/20">
                  <UserIcon className="h-10 w-10 text-gray-400" />
               </div>
              <h3 className="text-xl font-bold text-dark-slate mb-2">No users found</h3>
              <p className="text-gray-400">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
