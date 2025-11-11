// import React, { useEffect, useState } from 'react';
// import api from '../config/api';
// import { useAuth } from '../hooks/useAuth';
// import { toast } from 'react-hot-toast';
// import { Calendar, Clock, User, Phone, MapPin, AlertCircle, Plus } from 'lucide-react';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { useNavigate } from 'react-router-dom';

// const CancelConfirmModal = ({ open, onClose, onConfirm, booking }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5">
//         <h3 className="text-lg font-semibold mb-2">Cancel booking?</h3>
//         <p className="text-sm text-gray-600 mb-4">
//           Are you sure you want to cancel the booking for <span className="font-semibold">{booking?.serviceName || 'the service'}</span> on{' '}
//           <span className="font-semibold">
//             {booking?.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
//           </span>{' '}
//           at <span className="font-semibold">{booking?.time || '—'}</span>?
//         </p>

//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
//           >
//             Keep booking
//           </button>

//           <button
//             onClick={onConfirm}
//             className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-pink-700 hover:to-purple-700 transition-colors"
//           >
//             Yes, cancel it
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

// // Returns true if booking was created within last `minutesLimit` minutes
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
// const [searchText, setSearchText] = useState('');
// const [filtered, setFiltered] = useState([]);


//   // Cancel modal state
//   const [cancelModalOpen, setCancelModalOpen] = useState(false);
//   const [bookingToCancel, setBookingToCancel] = useState(null);
//   const [isCancelling, setIsCancelling] = useState(false);

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const applyFilters = () => {
//   let result = [...bookings];

//   // status filter
//   if (statusFilter && statusFilter !== 'all') {
//     result = result.filter(
//       (b) => (b.status || '').toLowerCase() === statusFilter
//     );
//   }

//   // search by service name or booking id
//   if (searchText && searchText.trim()) {
//     const q = searchText.trim().toLowerCase();
//     result = result.filter(
//       (b) =>
//         (b._id || '').toLowerCase().includes(q) ||
//         (b.serviceName || '').toLowerCase().includes(q)
//     );
//   }

//   setFiltered(result);
// };

//     useEffect(() => {
//   applyFilters();
// }, [bookings, statusFilter, searchText]);

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/bookings/my-bookings?limit=200'); // larger limit to be safe
//       const bookingsList = response.data?.data?.bookings || [];

//       // Sort by updatedAt DESC (newest updated first)
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
//     // allow cancel only for up to 10 minutes after booking created time
//     if (!booking.createdAt) return false;
//     return isWithinMinutes(booking.createdAt, 10);
//   };

//   const statusLabel = (status) => {
//     if (!status) return 'Unknown';
//     return status.charAt(0).toUpperCase() + status.slice(1);
//   };


//   if (loading) {
//     return <LoadingSpinner />;
//   }



//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-4xl font-serif mb-2">My Bookings</h1>
//           <p className="text-gray-600">View and manage your service appointments</p>
//         </div>



//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/services')}
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm"
//           >
//             <Plus className="w-4 h-4" />
//             New Booking
//           </button>
//         </div>
//       </div>
// <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//   {/* Search */}
//   <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white shadow-sm">
//     <input
//       type="search"
//       placeholder="Search booking id / service..."
//       value={searchText}
//       onChange={(e) => setSearchText(e.target.value)}
//       className="px-2 py-1 text-sm w-48 sm:w-64 focus:outline-none"
//     />
//     <button
//       onClick={() => setSearchText('')}
//       className="text-xs text-gray-500 hover:text-gray-700"
//     >
//       Clear
//     </button>
//   </div>

//   {/* Status filter buttons */}
//   <div className="hidden md:flex items-center gap-2">
//     {STATUS_KEYS.map((k) => (
//       <button
//         key={k}
//         onClick={() => setStatusFilter(k)}
//         className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
//           statusFilter === k
//             ? 'bg-purple-600 text-white'
//             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//         }`}
//       >
//         {k === 'all' ? 'All' : k.charAt(0).toUpperCase() + k.slice(1)}
//       </button>
//     ))}
//   </div>

//   {/* Mobile dropdown */}
//   <div className="md:hidden">
//     <select
//       value={statusFilter}
//       onChange={(e) => setStatusFilter(e.target.value)}
//       className="px-3 py-2 border rounded-md text-sm"
//     >
//       {STATUS_KEYS.map((k) => (
//         <option value={k} key={k}>
//           {k === 'all' ? 'All' : k.charAt(0).toUpperCase() + k.slice(1)}
//         </option>
//       ))}
//     </select>
//   </div>
// </div>
//       {filtered.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {filtered.map((booking) => {
//             const status = booking.status?.toLowerCase?.() || 'pending';
//             const canBeCancelled = canCancel(booking);
//             const statusColors = {
//               pending: 'bg-yellow-100 text-yellow-800',
//               confirmed: 'bg-green-100 text-green-800',
//               completed: 'bg-blue-100 text-blue-800',
//               cancelled: 'bg-red-100 text-red-800',
//             };
//             const statusIcon = {
//               pending: '⏳',
//               confirmed: '✅',
//               completed: '🎉',
//               cancelled: '❌',
//             };

//             return (
//               <div
//                 key={booking._id}
//                 className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
//               >
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
//                   <h3 className="text-lg font-serif font-bold text-gray-900 truncate">
//                     {booking.serviceName || 'Service Booking'}
//                   </h3>

//                   <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
//                     {statusIcon[status] || '📅'} {statusLabel(status)}
//                   </span>
//                 </div>

//                 {/* Content */}
//                 <div className="p-5 flex flex-col gap-4 flex-1">
//                   {/* Date & Time row */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="flex items-center gap-3">
//                       <Calendar className="w-5 h-5 text-purple-600" />
//                       <div>
//                         <p className="text-xs text-gray-600">Date</p>
//                         <p className="font-semibold text-gray-900">
//                           {booking.date
//                             ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
//                             : '-'}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <Clock className="w-5 h-5 text-pink-600" />
//                       <div>
//                         <p className="text-xs text-gray-600">Time</p>
//                         <p className="font-semibold text-gray-900">{booking.time || '-'}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Customer details side-by-side */}
//                 <div className="grid grid-cols-2 gap-4 border-t pt-4">
  
//               <div className="flex items-center gap-3">
//                 <User className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                 <div>
//                   <p className="text-xs text-gray-600">Customer</p>
//                   <p className="font-semibold text-gray-900 truncate">{booking.name}</p>
//                 </div>
//               </div>

//               {/* Phone */}
//               <div className="flex items-center gap-3">
//                 <Phone className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                 <div>
//                   <p className="text-xs text-gray-600">Phone</p>
//                   <p className="font-semibold text-gray-900 truncate">{booking.phone}</p>
//                 </div>
//               </div>
//             </div>


//                   {/* Service details */}
//                   <div className="border-t pt-4 bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <p className="text-sm text-gray-600">Service Price</p>
//                       <p className="text-xl font-bold text-purple-600">{formatINR(booking.servicePrice)}</p>
//                     </div>
//                     {booking.serviceDuration && <p className="text-sm text-gray-600">Duration: {booking.serviceDuration}</p>}
//                   </div>

//                   <p className="text-xs text-gray-500">
//                     Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : '-'}
//                     {booking.updatedAt && ` • Updated ${new Date(booking.updatedAt).toLocaleString('en-IN')}`}
//                   </p>
//                 </div>

//                 {/* Actions */}
//                 <div className="border-t px-5 py-4 bg-gray-50 flex items-center gap-3">
//                   {canBeCancelled ? (
//                     <button
//                       onClick={() => handleOpenCancel(booking)}
//                       className="flex-1 px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm"
//                     >
//                       Cancel
//                     </button>
//                   ) : (
//                     <button
//                       disabled
//                       className="flex-1 px-4 py-2 border border-gray-200 text-gray-500 bg-gray-100 rounded-lg text-sm"
//                       title={booking?.status === 'cancelled' ? 'Already cancelled' : 'Cancellation window expired'}
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-12 text-center">
//           <div className="flex justify-center mb-4">
//             <Calendar className="w-16 h-16 text-gray-400" />
//           </div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
//           <p className="text-gray-600 mb-6">You haven't made any service bookings yet. Book a service to get started!</p>
//           <button
//             onClick={() => navigate('/services')}
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
//           >
//             <Plus className="w-5 h-5" />
//             Browse Services
//           </button>
//         </div>
//       )}

//       <CancelConfirmModal
//         open={cancelModalOpen}
//         onClose={() => { if (!isCancelling) { setCancelModalOpen(false); setBookingToCancel(null); } }}
//         onConfirm={handleConfirmCancel}
//         booking={bookingToCancel}
//       />
//     </div>
//   );
// };

// export default Bookings;








import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, Phone, MapPin, AlertCircle, Plus, Trash2, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const CancelConfirmModal = ({ open, onClose, onConfirm, booking, isCancelling }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-bold text-gray-900">Cancel Booking?</h3>
        </div>

        <p className="text-sm text-gray-600">
          Are you sure you want to cancel the booking for{' '}
          <span className="font-semibold text-gray-900">{booking?.serviceName || 'this service'}</span> on{' '}
          <span className="font-semibold text-gray-900">
            {booking?.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>{' '}
          at <span className="font-semibold text-gray-900">{booking?.time || '—'}</span>?
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700">
            <span className="font-semibold">Note:</span> You can only cancel within 10 minutes of booking.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep Booking
          </button>

          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Yes, Cancel It
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const formatINR = (val) => {
  if (val == null) return '-';
  const n = Number(val);
  if (isNaN(n)) return val;
  return '₹' + n.toLocaleString('en-IN');
};

const isWithinMinutes = (createdAt, minutesLimit = 10) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMin = (now - created) / (1000 * 60);
  return diffMin <= minutesLimit;
};

const STATUS_KEYS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filtered, setFiltered] = useState([]);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const applyFilters = () => {
    let result = [...bookings];

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(
        (b) => (b.status || '').toLowerCase() === statusFilter
      );
    }

    if (searchText && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (b) =>
          (b._id || '').toLowerCase().includes(q) ||
          (b.serviceName || '').toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, searchText]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings?limit=200');
      const bookingsList = response.data?.data?.bookings || [];

      bookingsList.sort((a, b) => {
        const ta = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tb - ta;
      });

      setBookings(bookingsList);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancel = (booking) => {
    setBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) {
      setCancelModalOpen(false);
      return;
    }
    setIsCancelling(true);
    try {
      await api.put(`/bookings/${bookingToCancel._id}/cancel`);
      toast.success('Booking cancelled successfully');
      setCancelModalOpen(false);
      setBookingToCancel(null);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      const msg = error?.response?.data?.message || 'Failed to cancel booking';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = (booking) => {
    if (!booking) return false;
    const status = booking.status?.toLowerCase?.() || '';
    if (status === 'cancelled' || status === 'completed') return false;
    if (!booking.createdAt) return false;
    return isWithinMinutes(booking.createdAt, 10);
  };

  const statusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyles = (status) => {
    const statusLower = status?.toLowerCase?.() || '';
    switch (statusLower) {
      case 'pending':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
          icon: '⏳',
          accent: 'from-yellow-500 to-orange-500',
        };
      case 'confirmed':
        return {
          badge: 'bg-green-100 text-green-800 border border-green-300',
          icon: '✅',
          accent: 'from-green-500 to-emerald-500',
        };
      case 'completed':
        return {
          badge: 'bg-blue-100 text-blue-800 border border-blue-300',
          icon: '🎉',
          accent: 'from-blue-500 to-cyan-500',
        };
      case 'cancelled':
        return {
          badge: 'bg-red-100 text-red-800 border border-red-300',
          icon: '❌',
          accent: 'from-red-500 to-pink-500',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border border-gray-300',
          icon: '📅',
          accent: 'from-gray-500 to-gray-600',
        };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:px-6 md:px-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            View and manage your service appointments
          </p>
        </div>

        <button
          onClick={() => navigate('/services')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          New Booking
        </button>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search booking ID or service name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter - Desktop */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {STATUS_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === k
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {k === 'all' ? 'All' : statusLabel(k)}
              </button>
            ))}
          </div>

          {/* Status Filter - Mobile */}
          <div className="md:hidden">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {STATUS_KEYS.map((k) => (
                <option value={k} key={k}>
                  {k === 'all' ? 'All Bookings' : statusLabel(k)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs sm:text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> booking{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Bookings Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((booking) => {
            const status = booking.status?.toLowerCase?.() || 'pending';
            const canBeCancelled = canCancel(booking);
            const styles = getStatusStyles(status);

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Header with gradient background */}
                <div className={`bg-gradient-to-r ${styles.accent} px-5 sm:px-6 py-4 sm:py-5 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 opacity-10 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-serif font-bold truncate flex-1">
                        {booking.serviceName || 'Service Booking'}
                      </h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${styles.badge}`}>
                        {styles.icon} {statusLabel(status)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm opacity-95">
                      Booking ID: <span className="font-mono">{booking._id?.slice(-8)}</span>
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-5 sm:p-6 flex flex-col gap-5 flex-1">
                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Date</p>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                          {booking.date
                            ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                            : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                      <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Time</p>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">{booking.time || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Customer Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900 truncate text-sm">{booking.name || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900 truncate text-sm">{booking.phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Summary Card */}
                  <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Service Price</span>
                        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatINR(booking.servicePrice)}
                        </span>
                      </div>

                      {booking.serviceDuration && (
                        <div className="pt-3 border-t border-purple-200">
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Duration:</span> {booking.serviceDuration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Metadata */}
                  <div className="text-xs text-gray-500 space-y-1 py-3 border-t border-gray-100">
                    <p>
                      <span className="font-semibold">Booked:</span>{' '}
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                    {booking.updatedAt && (
                      <p>
                        <span className="font-semibold">Updated:</span>{' '}
                        {new Date(booking.updatedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="border-t border-gray-100 px-5 sm:px-6 py-4 bg-gray-50">
                  {canBeCancelled ? (
                    <button
                      onClick={() => handleOpenCancel(booking)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        {status === 'cancelled' ? 'Booking Cancelled' : 'Cancellation window closed'}
                      </span>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            You haven't made any service bookings yet. Browse our services and book an appointment to get started!
          </p>
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Browse Services
          </button>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      <CancelConfirmModal
        open={cancelModalOpen}
        onClose={() => {
          if (!isCancelling) {
            setCancelModalOpen(false);
            setBookingToCancel(null);
          }
        }}
        onConfirm={handleConfirmCancel}
        booking={bookingToCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
};

export default Bookings;





