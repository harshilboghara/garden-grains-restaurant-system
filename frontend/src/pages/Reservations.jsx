import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { reservationsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const Reservations = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    partySize: 2,
    tablePreference: "any",
    specialRequests: "",
    occasion: "other",
  });
  const queryClient = useQueryClient();

  const { data: reservationsData, isLoading } = useQuery(
    "user-reservations",
    () => reservationsAPI.getReservations(),
    { enabled: !!user && !!user._id }
  );

  const createReservationMutation = useMutation(
    (reservationData) => reservationsAPI.createReservation(reservationData),
    {
      onSuccess: (response) => {
        toast.success("Reservation created successfully!");
        setIsCreating(false);
        setFormData({
          date: "",
          time: "",
          partySize: 2,
          tablePreference: "any",
          specialRequests: "",
          occasion: "other",
        });
        queryClient.invalidateQueries("user-reservations");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to create reservation");
      },
    }
  );

  const cancelReservationMutation = useMutation(
    (reservationId) => reservationsAPI.cancelReservation(reservationId),
    {
      onSuccess: () => {
        toast.success("Reservation cancelled successfully");
        queryClient.invalidateQueries("user-reservations");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to cancel reservation");
      },
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      toast.error("Please select date and time");
      return;
    }
    const reservationData = {
      ...formData,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
    };
    createReservationMutation.mutate(reservationData);
  };

  const handleCancel = (reservationId) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      cancelReservationMutation.mutate(reservationId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "confirmed": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "seated": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "completed": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "no-show": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
  ];

  const occasions = [
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
    { value: "business", label: "Business Meeting" },
    { value: "date", label: "Date Night" },
    { value: "family", label: "Family Gathering" },
    { value: "other", label: "Other" },
  ];

  const tablePreferences = [
    { value: "any", label: "Any Table" },
    { value: "window", label: "Window Seat" },
    { value: "corner", label: "Corner Table" },
    { value: "private", label: "Private Booth" },
    { value: "outdoor", label: "Outdoor Seating" },
  ];

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-slide-up">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
            <CalendarDaysIcon className="h-5 w-5 text-warm-gold" />
            <span className="text-sm font-medium text-warm-gold uppercase tracking-wider">Book a Table</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-2 font-heading">Reservations</h1>
          <p className="text-gray-400">Secure your spot at Garden Grains</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Reservation Hub */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-8 rounded-2xl border border-dark-slate/10 relative overflow-hidden">
               {/* Decorative Bubble */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-organic-green/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-dark-slate font-heading">Make a Reservation</h2>
                {!isCreating ? (
                   <button
                     onClick={() => setIsCreating(true)}
                     className="btn-primary py-2 px-6 text-sm"
                   >
                     New Request
                   </button>
                ) : (
                   <button
                     onClick={() => setIsCreating(false)}
                     className="text-gray-400 hover:text-dark-slate flex items-center transition-colors"
                   >
                     <XMarkIcon className="w-5 h-5 mr-1" /> Cancel
                   </button>
                )}
              </div>

              {isCreating ? (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="input-field w-full [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                      <div className="relative">
                         <ClockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                         <select
                           name="time"
                           value={formData.time}
                           onChange={handleInputChange}
                           className="input-field w-full pl-10 appearance-none cursor-pointer"
                           required
                         >
                           <option value="" className="bg-pearl">Select time</option>
                           {timeSlots.map((time) => (
                             <option key={time} value={time} className="bg-pearl">{time}</option>
                           ))}
                         </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Party Size</label>
                      <div className="relative">
                         <UserGroupIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                         <select
                           name="partySize"
                           value={formData.partySize}
                           onChange={handleInputChange}
                           className="input-field w-full pl-10 appearance-none cursor-pointer"
                         >
                           {[...Array(20)].map((_, i) => (
                             <option key={i + 1} value={i + 1} className="bg-pearl">
                               {i + 1} {i === 0 ? "person" : "people"}
                             </option>
                           ))}
                         </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Table Preference</label>
                      <div className="relative">
                         <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                         <select
                           name="tablePreference"
                           value={formData.tablePreference}
                           onChange={handleInputChange}
                           className="input-field w-full pl-10 appearance-none cursor-pointer"
                         >
                           {tablePreferences.map((pref) => (
                             <option key={pref.value} value={pref.value} className="bg-pearl">
                               {pref.label}
                             </option>
                           ))}
                         </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Occasion</label>
                    <select
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleInputChange}
                      className="input-field w-full appearance-none cursor-pointer"
                    >
                      {occasions.map((occasion) => (
                        <option key={occasion.value} value={occasion.value} className="bg-pearl">
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Special Requests (Optional)</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field w-full"
                      placeholder="Any dietary needs or special arrangements..."
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-dark-slate/10">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 rounded-lg hover:bg-dark-slate/10 text-gray-400 hover:text-dark-slate transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createReservationMutation.isLoading}
                      className="btn-primary py-2 px-8 font-bold shadow-soft-gold"
                    >
                      {createReservationMutation.isLoading ? (
                         <span className="flex items-center"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></span>Book Now</span>
                      ) : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 bg-dark-slate/5 rounded-xl border border-dashed border-dark-slate/10 relative z-10">
                  <div className="w-16 h-16 bg-pearl/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-warm-gold/20">
                     <CalendarDaysIcon className="h-8 w-8 text-warm-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-slate mb-2">Ready to dine with us?</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Experience our premium ambiance and delicious menu. Book a table for your next visit.
                  </p>
                  
                </div>
              )}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-dark-slate/10 min-h-[400px]">
              <h3 className="text-lg font-bold text-dark-slate mb-6 font-heading border-b border-dark-slate/10 pb-4">
                Your Reservations
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-10">
                   <div className="w-8 h-8 border-2 border-warm-gold/30 border-t-warm-gold rounded-full animate-spin"></div>
                </div>
              ) : reservationsData?.data?.reservations?.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-dark-slate/5 rounded-full flex items-center justify-center mx-auto mb-3">
                     <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm">No reservations found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservationsData?.data?.reservations?.slice(0, 5).map((reservation) => (
                    <div
                      key={reservation._id}
                      className="p-4 rounded-xl bg-dark-slate/5 border border-dark-slate/5 hover:border-warm-gold/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono text-gray-400">#{reservation.confirmationCode}</span>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <CalendarDaysIcon className="h-4 w-4 mr-2 text-warm-gold" />
                          {new Date(reservation.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2 text-warm-gold" />
                          {reservation.time}
                        </div>
                        <div className="flex items-center text-gray-600">
                           <UserGroupIcon className="h-4 w-4 mr-2 text-warm-gold" />
                           {reservation.partySize} {reservation.partySize === 1 ? 'Guest' : 'Guests'}
                        </div>
                         {reservation.tablePreference !== "any" && (
                           <div className="flex items-center text-gray-400 text-xs mt-1 bg-black/20 p-1.5 rounded">
                              <MapPinIcon className="h-3 w-3 mr-1.5" />
                              <span className="capitalize">{reservation.tablePreference}</span>
                           </div>
                         )}
                      </div>
                      
                      {reservation.status === "pending" && (
                        <button
                          onClick={() => handleCancel(reservation._id)}
                          className="mt-3 w-full py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
