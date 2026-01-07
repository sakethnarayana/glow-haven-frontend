

// import React, { useEffect, useState } from 'react';
// import api from '../config/api';
// import { useAuth } from '../hooks/useAuth';
// import { toast } from 'react-hot-toast';
// import { Calendar, Clock, User, Phone, MapPin, AlertCircle, Plus, Trash2, ChevronDown } from 'lucide-react';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { useNavigate } from 'react-router-dom';

// const CancelConfirmModal = ({ open, onClose, onConfirm, booking, isCancelling }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
//         <div className="flex items-center gap-3 mb-4">
//           <AlertCircle className="w-6 h-6 text-red-600" />
//           <h3 className="text-lg font-bold text-gray-900">Cancel Booking?</h3>
//         </div>

//         <p className="text-sm text-gray-600">
//           Are you sure you want to cancel the booking for{' '}
//           <span className="font-semibold text-gray-900">{booking?.serviceName || 'this service'}</span> on{' '}
//           <span className="font-semibold text-gray-900">
//             {booking?.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
//           </span>{' '}
//           at <span className="font-semibold text-gray-900">{booking?.time || '—'}</span>?
//         </p>

//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <p className="text-xs text-red-700">
//             <span className="font-semibold">Note:</span> You can only cancel within 10 minutes of booking.
//           </p>
//         </div>

//         <div className="flex gap-3 pt-2">
//           <button
//             onClick={onClose}
//             disabled={isCancelling}
//             className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
//           >
//             Keep Booking
//           </button>

//           <button
//             onClick={onConfirm}
//             disabled={isCancelling}
//             className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             {isCancelling ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Cancelling...
//               </>
//             ) : (
//               <>
//                 <Trash2 className="w-4 h-4" />
//                 Yes, Cancel It
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const formatINR = (val) => {
//   if (val == null) return '-';
//   const n = Number(val);
//   if (isNaN(n)) return val;
//   return '₹' + n.toLocaleString('en-IN');
// };

// const isWithinMinutes = (createdAt, minutesLimit = 10) => {
//   if (!createdAt) return false;
//   const created = new Date(createdAt).getTime();
//   const now = Date.now();
//   const diffMin = (now - created) / (1000 * 60);
//   return diffMin <= minutesLimit;
// };

// const STATUS_KEYS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

// const Bookings = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [searchText, setSearchText] = useState('');
//   const [filtered, setFiltered] = useState([]);

//   const [cancelModalOpen, setCancelModalOpen] = useState(false);
//   const [bookingToCancel, setBookingToCancel] = useState(null);
//   const [isCancelling, setIsCancelling] = useState(false);

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const applyFilters = () => {
//     let result = [...bookings];

//     if (statusFilter && statusFilter !== 'all') {
//       result = result.filter(
//         (b) => (b.status || '').toLowerCase() === statusFilter
//       );
//     }

//     if (searchText && searchText.trim()) {
//       const q = searchText.trim().toLowerCase();
//       result = result.filter(
//         (b) =>
//           (b._id || '').toLowerCase().includes(q) ||
//           (b.serviceName || '').toLowerCase().includes(q)
//       );
//     }

//     setFiltered(result);
//   };

//   useEffect(() => {
//     applyFilters();
//   }, [bookings, statusFilter, searchText]);

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/bookings/my-bookings?limit=200');
//       const bookingsList = response.data?.data?.bookings || [];

//       bookingsList.sort((a, b) => {
//         const ta = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
//         const tb = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
//         return tb - ta;
//       });

//       setBookings(bookingsList);
//     } catch (error) {
//       console.error('Failed to fetch bookings:', error);
//       toast.error('Failed to load bookings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenCancel = (booking) => {
//     setBookingToCancel(booking);
//     setCancelModalOpen(true);
//   };

//   const handleConfirmCancel = async () => {
//     if (!bookingToCancel) {
//       setCancelModalOpen(false);
//       return;
//     }
//     setIsCancelling(true);
//     try {
//       await api.put(`/bookings/${bookingToCancel._id}/cancel`);
//       toast.success('Booking cancelled successfully');
//       setCancelModalOpen(false);
//       setBookingToCancel(null);
//       fetchBookings();
//     } catch (error) {
//       console.error('Failed to cancel booking:', error);
//       const msg = error?.response?.data?.message || 'Failed to cancel booking';
//       toast.error(msg);
//     } finally {
//       setIsCancelling(false);
//     }
//   };

//   const canCancel = (booking) => {
//     if (!booking) return false;
//     const status = booking.status?.toLowerCase?.() || '';
//     if (status === 'cancelled' || status === 'completed') return false;
//     if (!booking.createdAt) return false;
//     return isWithinMinutes(booking.createdAt, 10);
//   };

//   const statusLabel = (status) => {
//     if (!status) return 'Unknown';
//     return status.charAt(0).toUpperCase() + status.slice(1);
//   };

//   const getStatusStyles = (status) => {
//     const statusLower = status?.toLowerCase?.() || '';
//     switch (statusLower) {
//       case 'pending':
//         return {
//           badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
//           icon: '⏳',
//           accent: 'from-yellow-500 to-orange-500',
//         };
//       case 'confirmed':
//         return {
//           badge: 'bg-green-100 text-green-800 border border-green-300',
//           icon: '✅',
//           accent: 'from-green-500 to-emerald-500',
//         };
//       case 'completed':
//         return {
//           badge: 'bg-blue-100 text-blue-800 border border-blue-300',
//           icon: '🎉',
//           accent: 'from-blue-500 to-cyan-500',
//         };
//       case 'cancelled':
//         return {
//           badge: 'bg-red-100 text-red-800 border border-red-300',
//           icon: '❌',
//           accent: 'from-red-500 to-pink-500',
//         };
//       default:
//         return {
//           badge: 'bg-gray-100 text-gray-800 border border-gray-300',
//           icon: '📅',
//           accent: 'from-gray-500 to-gray-600',
//         };
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:px-6 md:px-8 space-y-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
//             My Bookings
//           </h1>
//           <p className="text-gray-600 text-sm md:text-base">
//             View and manage your service appointments
//           </p>
//         </div>

//         <button
//           onClick={() => navigate('/services')}
//           className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
//         >
//           <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//           New Booking
//         </button>
//       </div>

//       {/* Filter & Search Section */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
//         <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
//           {/* Search Bar */}
//           <div className="relative flex-1">
//             <input
//               type="search"
//               placeholder="Search booking ID or service name..."
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               className="w-full px-4 py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
//             />
//             {searchText && (
//               <button
//                 onClick={() => setSearchText('')}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
//               >
//                 ✕
//               </button>
//             )}
//           </div>

//           {/* Status Filter - Desktop */}
//           <div className="hidden md:flex items-center gap-2 flex-wrap">
//             {STATUS_KEYS.map((k) => (
//               <button
//                 key={k}
//                 onClick={() => setStatusFilter(k)}
//                 className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
//                   statusFilter === k
//                     ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 {k === 'all' ? 'All' : statusLabel(k)}
//               </button>
//             ))}
//           </div>

//           {/* Status Filter - Mobile */}
//           <div className="md:hidden">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {STATUS_KEYS.map((k) => (
//                 <option value={k} key={k}>
//                   {k === 'all' ? 'All Bookings' : statusLabel(k)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Results count */}
//         <div className="text-xs sm:text-sm text-gray-600">
//           Showing <span className="font-semibold text-gray-900">{filtered.length}</span> booking{filtered.length !== 1 ? 's' : ''}
//         </div>
//       </div>

//       {/* Bookings Grid */}
//       {filtered.length > 0 ? (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
//           {filtered.map((booking) => {
//             const status = booking.status?.toLowerCase?.() || 'pending';
//             const canBeCancelled = canCancel(booking);
//             const styles = getStatusStyles(status);

//             return (
//               <div
//                 key={booking._id}
//                 className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
//               >
//                 {/* Header with gradient background */}
//                 <div className={`bg-gradient-to-r ${styles.accent} px-5 sm:px-6 py-4 sm:py-5 text-white relative overflow-hidden`}>
//                   <div className="absolute top-0 right-0 opacity-10 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white" />
//                   <div className="relative z-10">
//                     <div className="flex items-start justify-between gap-3 mb-3">
//                       <h3 className="text-lg sm:text-xl font-serif font-bold truncate flex-1">
//                         {booking.serviceName || 'Service Booking'}
//                       </h3>
//                       <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${styles.badge}`}>
//                         {styles.icon} {statusLabel(status)}
//                       </span>
//                     </div>
//                     <p className="text-xs sm:text-sm opacity-95">
//                       Booking ID: <span className="font-mono">{booking._id?.slice(-8)}</span>
//                     </p>
//                   </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="p-5 sm:p-6 flex flex-col gap-5 flex-1">
//                   {/* Date & Time Grid */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
//                       <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Date</p>
//                         <p className="font-bold text-gray-900 text-sm sm:text-base">
//                           {booking.date
//                             ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
//                             : '-'}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
//                       <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Time</p>
//                         <p className="font-bold text-gray-900 text-sm sm:text-base">{booking.time || '-'}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Customer Details */}
//                   <div className="border-t border-gray-100 pt-4">
//                     <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Customer Details</p>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="flex items-start gap-3">
//                         <User className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-gray-600">Name</p>
//                           <p className="font-semibold text-gray-900 truncate text-sm">{booking.name || '-'}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-start gap-3">
//                         <Phone className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-gray-600">Phone</p>
//                           <p className="font-semibold text-gray-900 truncate text-sm">{booking.phone || '-'}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Service Summary Card */}
//                   <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl p-4 border border-purple-200">
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Service Price</span>
//                         <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                           {formatINR(booking.servicePrice)}
//                         </span>
//                       </div>

//                       {booking.serviceDuration && (
//                         <div className="pt-3 border-t border-purple-200">
//                           <p className="text-xs text-gray-600">
//                             <span className="font-semibold">Duration:</span> {booking.serviceDuration}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Booking Metadata */}
//                   <div className="text-xs text-gray-500 space-y-1 py-3 border-t border-gray-100">
//                     <p>
//                       <span className="font-semibold">Booked:</span>{' '}
//                       {booking.createdAt
//                         ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
//                             day: '2-digit',
//                             month: 'short',
//                             year: 'numeric',
//                           })
//                         : '-'}
//                     </p>
//                     {booking.updatedAt && (
//                       <p>
//                         <span className="font-semibold">Updated:</span>{' '}
//                         {new Date(booking.updatedAt).toLocaleString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: '2-digit',
//                           hour: '2-digit',
//                           minute: '2-digit',
//                         })}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Action Footer */}
//                 <div className="border-t border-gray-100 px-5 sm:px-6 py-4 bg-gray-50">
//                   {canBeCancelled ? (
//                     <button
//                       onClick={() => handleOpenCancel(booking)}
//                       className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       Cancel Booking
//                     </button>
//                   ) : (
//                     <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
//                       <span className="text-xs sm:text-sm text-gray-600 font-medium">
//                         {status === 'cancelled' ? 'Booking Cancelled' : 'Cancellation window closed'}
//                       </span>
//                       <AlertCircle className="w-4 h-4 text-gray-400" />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
//           <div className="flex justify-center mb-4">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
//               <Calendar className="w-10 h-10 text-purple-600" />
//             </div>
//           </div>
//           <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">No bookings yet</h3>
//           <p className="text-gray-600 mb-6 text-sm sm:text-base">
//             You haven't made any service bookings yet. Browse our services and book an appointment to get started!
//           </p>
//           <button
//             onClick={() => navigate('/services')}
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
//           >
//             <Plus className="w-5 h-5" />
//             Browse Services
//           </button>
//         </div>
//       )}

//       {/* Cancel Confirm Modal */}
//       <CancelConfirmModal
//         open={cancelModalOpen}
//         onClose={() => {
//           if (!isCancelling) {
//             setCancelModalOpen(false);
//             setBookingToCancel(null);
//           }
//         }}
//         onConfirm={handleConfirmCancel}
//         booking={bookingToCancel}
//         isCancelling={isCancelling}
//       />
//     </div>
//   );
// };

// export default Bookings;



import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  Phone,
  AlertCircle,
  Plus,
  Search,
  MessageSquare,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

/* ================= MODAL ================= */
const CancelConfirmModal = ({ open, onClose, onConfirm, booking, isCancelling }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Cancel Booking?</h3>
          <p className="text-sm text-slate-500 mt-2">
            Cancel <b>{booking?.serviceName}</b>? This action cannot be undone.
          </p>
        </div>

        <div className="flex border-t">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 border-r"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            {isCancelling ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */
const formatINR = (v) => '₹' + Number(v || 0).toLocaleString('en-IN');

const isWithinMinutes = (createdAt, minutes = 10) =>
  createdAt && (Date.now() - new Date(createdAt)) / 60000 <= minutes;

const STATUS_KEYS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const getStatusStyles = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'completed':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case 'cancelled':
      return 'bg-slate-50 text-slate-500 border-slate-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

/* ================= PAGE ================= */
const Bookings = () => {
  const navigate = useNavigate();

  /* ✅ ALL HOOKS ARE HERE (FIXED) */
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  /* ================= SCROLL HIDE FILTER BAR ================= */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowStatusBar(y <= lastScrollY || y < 60);
      setLastScrollY(y);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  /* ================= FETCH BOOKINGS ================= */
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings?limit=200');
      const list = res.data?.data?.bookings || [];
      setBookings(list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  useEffect(() => {
    let list = [...bookings];

    if (statusFilter !== 'all') {
      list = list.filter((b) => b.status?.toLowerCase() === statusFilter);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (b) =>
          b.serviceName?.toLowerCase().includes(q) ||
          b._id?.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  }, [bookings, statusFilter, searchText]);

  /* ================= ACTIONS ================= */
  const canCancel = (b) =>
    b.status !== 'cancelled' &&
    b.status !== 'completed' &&
    isWithinMinutes(b.createdAt, 10);

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      await api.put(`/bookings/${bookingToCancel._id}/cancel`);
      toast.success('Booking cancelled');
      setCancelModalOpen(false);
      fetchBookings();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Cancel failed');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShareFeedback = async (bookingId) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/feedback-context`);
      const serviceId = res.data?.data?.serviceId;
      if (!serviceId) return toast.error('Unable to open feedback');
      navigate(`/services/${serviceId}?feedback=true&bookingId=${bookingId}`);
    } catch {
      toast.error('Unable to load feedback');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-xs text-slate-500 uppercase">History & Status</p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="p-2 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search booking or service..."
            className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* STATUS BAR */}
        <div
          className={`transition-all duration-300 ${
            showStatusBar ? 'opacity-100' : 'opacity-0 -translate-y-3 pointer-events-none'
          }`}
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUS_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  statusFilter === k
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        {filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((b) => {
              const highlight = isWithinMinutes(b.createdAt, 10);
              return (
                <div
                  key={b._id}
                  className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${
                    highlight && 'ring-2 ring-indigo-100 border-indigo-300'
                  }`}
                >
                  <div className="px-5 py-4 flex justify-between bg-slate-50 border-b">
                    <span className="text-xs font-bold text-slate-400">
                      ID: {b._id.slice(-6)}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-md border ${getStatusStyles(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-bold">{b.serviceName}</h3>
                      <span className="font-bold">{formatINR(b.servicePrice)}</span>
                    </div>

                    <div className="grid grid-cols-2 text-sm text-slate-600">
                      <span className="flex gap-2">
                        <Calendar className="w-4 h-4" /> {b.date}
                      </span>
                      <span className="flex gap-2">
                        <Clock className="w-4 h-4" /> {b.time}
                      </span>
                    </div>

                    <div className="pt-3 border-t flex justify-between text-sm">
                      <span className="flex gap-2">
                        <User className="w-4 h-4" /> {b.name}
                      </span>
                      <span className="flex gap-2">
                        <Phone className="w-4 h-4" /> {b.phone}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50">
                    {b.status === 'completed' ? (
                      <button
                        onClick={() => handleShareFeedback(b._id)}
                        className="w-full py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-600 font-bold"
                      >
                        <MessageSquare className="inline w-4 h-4 mr-2" />
                        Share Feedback
                      </button>
                    ) : (
                      <button
                        disabled={!canCancel(b)}
                        onClick={() => {
                          setBookingToCancel(b);
                          setCancelModalOpen(true);
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold ${
                          canCancel(b)
                            ? 'bg-white border border-red-200 text-red-500'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <X className="inline w-4 h-4 mr-2" />
                        {canCancel(b) ? 'Cancel Booking' : 'Cancellation window closed'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-900">No bookings found</h3>
            <p className="text-sm text-slate-500 mt-2">Try changing filters</p>
          </div>
        )}
      </div>

      <CancelConfirmModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        booking={bookingToCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
};

export default Bookings;
