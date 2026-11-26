import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { reservationsAPI } from '../../services/api'
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
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../../components/common/ConfirmationModal'

const AdminReservations = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancellationConfirm, setCancellationConfirm] = useState({ isOpen: false, id: null })
  const queryClient = useQueryClient()

  const { data: reservationsData, isLoading } = useQuery(
    ['admin-reservations', filters],
    () => reservationsAPI.getAllReservations(filters)
  )

  const updateReservationStatusMutation = useMutation(
    ({ reservationId, status, notes }) => reservationsAPI.updateReservationStatus(reservationId, status, notes),
    {
      onSuccess: () => {
        toast.success('Reservation status updated successfully')
        queryClient.invalidateQueries('admin-reservations')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update reservation status')
      }
    }
  )

  const handleStatusUpdate = (reservationId, newStatus) => {
    updateReservationStatusMutation.mutate({ reservationId, status: newStatus })
  }

  const confirmReservationCancellation = () => {
    if (cancellationConfirm.id) {
        handleStatusUpdate(cancellationConfirm.id, 'cancelled');
        if (selectedReservation && selectedReservation._id === cancellationConfirm.id) {
             setIsModalOpen(false) 
        }
    }
    setCancellationConfirm({ isOpen: false, id: null })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4 text-blue-400" />
      case 'seated': return <UserIcon className="h-4 w-4 text-green-400" />
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircleIcon className="h-4 w-4 text-red-500" />
      case 'no-show': return <XCircleIcon className="h-4 w-4 text-red-600" />
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'seated': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'no-show': return 'bg-red-600/10 text-red-500 border-red-600/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'seated', label: 'Seated' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ]

  return (
    <div className="min-h-screen relative pb-12">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
                 <span className="text-xl">📅</span>
                 <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Bookings</span>
              </div>
              <h1 className="text-4xl font-bold text-dark-slate mb-2 font-heading">Reservation Management</h1>
              <p className="text-gray-400">Oversee table bookings and guest arrivals</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name, phone, code..."
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
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field w-full [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Reservations Table */}
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reservation</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Party Size</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-transparent">
                  {reservationsData?.data?.reservations?.map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-dark-slate/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-dark-slate group-hover:text-warm-gold transition-colors">
                            #{reservation.confirmationCode}
                          </div>
                          {reservation.tablePreference !== 'any' && (
                             <div className="text-xs text-gray-400 capitalize mt-1 border border-dark-slate/10 inline-block px-1.5 py-0.5 rounded">
                               {reservation.tablePreference}
                             </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-900/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 mr-3">
                              <UserIcon className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-sm font-bold text-dark-slate">
                                {reservation.customerName}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                {reservation.customerPhone}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-dark-slate">
                            {new Date(reservation.date).toLocaleDateString('en-IN', {
                              month: 'short', day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-warm-gold font-mono">
                            {reservation.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center space-x-2">
                            <UserGroupIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-600">{reservation.partySize} guests</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            <span className="ml-1">{reservation.status}</span>
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setIsModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-dark-slate bg-dark-slate/5 hover:bg-dark-slate/10 p-2 rounded-lg transition-all border border-dark-slate/5 hover:border-dark-slate/20"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(reservation._id, 'confirmed')}
                                className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-all border border-green-500/20"
                                title="Confirm Reservation"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setCancellationConfirm({ isOpen: true, id: reservation._id })}
                                className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-all border border-red-500/20"
                                title="Reject Reservation"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation._id, 'seated')}
                              className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg transition-all border border-blue-500/20"
                              title="Mark Seated"
                            >
                              <UserIcon className="h-4 w-4" />
                            </button>
                          )}
                          {reservation.status === 'seated' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation._id, 'completed')}
                              className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-all border border-green-500/20"
                              title="Complete"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
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

          {reservationsData?.data?.reservations?.length === 0 && !isLoading && (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-dark-slate/20">
                  <CalendarIcon className="h-10 w-10 text-gray-400" />
               </div>
              <h3 className="text-xl font-bold text-dark-slate mb-2">No reservations found</h3>
              <p className="text-gray-400">No bookings match your current filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {reservationsData?.data?.pagination && reservationsData.data.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center animate-fade-in">
            <nav className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-bold text-gray-400 bg-dark-slate/5 border border-dark-slate/10 rounded-xl hover:bg-dark-slate/10 hover:text-dark-slate transition-colors">
                Previous
              </button>
              <div className="flex items-center space-x-2">
                 <button className="w-10 h-10 flex items-center justify-center text-sm font-bold text-black bg-warm-gold rounded-xl shadow-soft-gold">
                   1
                 </button>
              </div>
              <button className="px-4 py-2 text-sm font-bold text-gray-400 bg-dark-slate/5 border border-dark-slate/10 rounded-xl hover:bg-dark-slate/10 hover:text-dark-slate transition-colors">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      {isModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pearl/90 backdrop-blur-md animate-fade-in">
          <div className="bg-pearl rounded-3xl shadow-2xl border border-dark-slate/10 w-full max-w-2xl p-0 relative glass-panel overflow-hidden">
             
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black px-6 py-4 border-b border-dark-slate/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-dark-slate flex items-center gap-3 font-heading">
                   <span className="text-warm-gold">#{selectedReservation.confirmationCode}</span>
                </h3>
                <p className="text-gray-400 text-[10px] mt-0.5 font-mono">
                  {new Date(selectedReservation.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-dark-slate hover:bg-dark-slate/10 p-1.5 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Status & Preference */}
              <div className="flex bg-dark-slate/5 rounded-xl p-4 border border-dark-slate/10 justify-between items-center">
                 <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusIcon(selectedReservation.status)}
                      <span className="ml-2 uppercase tracking-wide">{selectedReservation.status}</span>
                    </span>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Preference</p>
                    <p className="text-sm font-bold text-dark-slate capitalize">
                      {selectedReservation.tablePreference || 'Any Table'}
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Customer */}
                 <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-warm-gold uppercase tracking-wider text-[10px] font-bold">
                       <UserIcon className="w-3.5 h-3.5" /> <span>Guest Details</span>
                    </div>
                    <div className="bg-dark-slate/5 rounded-xl p-4 border border-dark-slate/10 hover:border-warm-gold/20 transition-colors">
                       <p className="text-base font-bold text-dark-slate mb-1">{selectedReservation.customerName}</p>
                       <div className="space-y-1.5 mt-2">
                          <div className="flex items-center text-xs text-gray-400 gap-2">
                             <PhoneIcon className="w-3.5 h-3.5 text-gray-600" />
                             {selectedReservation.customerPhone}
                          </div>
                          <div className="flex items-center text-xs text-gray-400 gap-2">
                             <span className="w-3.5 flex justify-center text-gray-600 font-bold">@</span>
                             {selectedReservation.customerEmail}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Visit Info */}
                 <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-blue-400 uppercase tracking-wider text-[10px] font-bold">
                       <CalendarIcon className="w-3.5 h-3.5" /> <span>Visit Info</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-dark-slate/5 rounded-xl p-3 border border-dark-slate/10 text-center">
                          <p className="text-lg font-bold text-dark-slate mb-0.5">
                             {new Date(selectedReservation.date).getDate()}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">
                             {new Date(selectedReservation.date).toLocaleString('default', { month: 'short' })}
                          </p>
                       </div>
                       <div className="bg-dark-slate/5 rounded-xl p-3 border border-dark-slate/10 text-center">
                          <p className="text-lg font-bold text-dark-slate mb-0.5">
                             {selectedReservation.time}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">
                             Time
                          </p>
                       </div>
                    </div>
                    <div className="bg-dark-slate/5 rounded-xl p-3 border border-dark-slate/10 flex items-center justify-between">
                       <span className="text-xs text-gray-400">Party Size</span>
                       <div className="flex items-center gap-1.5">
                          <UserGroupIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-base font-bold text-dark-slate">{selectedReservation.partySize}</span>
                       </div>
                    </div>
                 </div>
              </div>

               {/* Occasion & Notes */}
               {(selectedReservation.occasion || selectedReservation.specialRequests) && (
                  <div className="space-y-3 pt-3 border-t border-dark-slate/10">
                     {selectedReservation.occasion && selectedReservation.occasion !== 'regular' && (
                        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-3 rounded-xl border border-pink-500/20 flex items-center gap-2.5">
                           <SparklesIcon className="w-4 h-4 text-pink-400" />
                           <div>
                              <p className="text-[10px] font-bold text-pink-400 uppercase">Special Occasion</p>
                              <p className="text-dark-slate font-bold capitalize text-sm">{selectedReservation.occasion}</p>
                           </div>
                        </div>
                     )}
                     
                     {selectedReservation.specialRequests && (
                        <div className="bg-dark-slate/5 p-3 rounded-xl border border-dark-slate/10">
                           <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1.5">
                              <ClipboardDocumentListIcon className="w-3.5 h-3.5" /> Notes
                           </p>
                           <p className="text-gray-600 italic text-xs leading-relaxed">
                              " {selectedReservation.specialRequests} "
                           </p>
                        </div>
                     )}
                  </div>
               )}

            </div>

             {/* Footer */}
            <div className="bg-black/40 px-6 py-3 flex flex-col sm:flex-row-reverse gap-2 border-t border-dark-slate/10 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 text-gray-600 font-bold transition-colors border border-dark-slate/5 text-sm"
              >
                Close
              </button>
              {selectedReservation.status === 'pending' && (
                 <>
                  <button
                    onClick={() => setCancellationConfirm({ isOpen: true, id: selectedReservation._id })}
                    className="py-2 px-6 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition-all text-sm"
                  >
                    Reject Booking
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReservation._id, 'confirmed');
                      setIsModalOpen(false);
                    }}
                    className="btn-primary py-2 px-6 shadow-soft-gold-green bg-green-500 hover:bg-green-400 text-black border-none text-sm"
                  >
                    Confirm Booking
                  </button>
                </>
              )}
            </div>
             
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={cancellationConfirm.isOpen}
        onClose={() => setCancellationConfirm({ ...cancellationConfirm, isOpen: false })}
        onConfirm={confirmReservationCancellation}
        title="Reject Reservation"
        message="Are you sure you want to reject this reservation?"
        confirmText="Reject"
        confirmStyle="danger"
        isLoading={updateReservationStatusMutation.isLoading}
      />
    </div>
  )
}

export default AdminReservations
