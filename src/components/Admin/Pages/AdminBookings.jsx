
import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';
import { Search, X, Loader, Calendar, Clock, User, CheckCircle, Eye, MoreVertical } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings?page=1&limit=100');
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b._id?.includes(searchTerm) ||
        b.phone?.includes(searchTerm) ||
        b.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      setPageLoading(true);
      await api.put(`/bookings/${bookingId}`, { status });
      setBookings(prev =>
          prev.map(o => (o._id === bookingId ? { ...o, status } : o))
        );

      // toast.success(`✅ Booking status updated to ${status}!`);
      // await fetchBookings();
      setShowStatusModal(false);
    } catch (error) {
              console.error("Booking update failed:", error);
              const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Something went wrong while updating the order";
              toast.error(backendMessage);
            } finally {
            setPageLoading(false);
          }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      in_progress: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={16} />,
      confirmed: <CheckCircle size={16} />,
      in_progress: <Calendar size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <X size={16} />
    };
    return icons[status] || null;
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.service_price || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-spin">
            <Loader className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
      {pageLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
              <Loader className="w-10 h-10 text-gray-900 animate-spin" />
            </div>
            <p className="text-white text-lg font-medium">Updating...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Bookings</h1>
            </div>
            <p className="text-gray-400">Manage service bookings & appointments</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-pink-500/60 transition-all">
            <p className="text-pink-300 text-xs font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
            <p className="text-yellow-300 text-xs font-medium">Pending</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-emerald-500/60 transition-all">
            <p className="text-emerald-300 text-xs font-medium">Completed</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.completed}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-violet-500/60 transition-all">
            <p className="text-violet-300 text-xs font-medium">Revenue</p>
            <p className="text-xl font-bold text-white mt-2">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-pink-400 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, service, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500 transition-all backdrop-blur-sm text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 text-white transition-all backdrop-blur-sm appearance-none cursor-pointer text-sm"
        >
          <option value="all">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-gray-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">📅 {booking.serviceName}</h3>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setNewStatus(booking.status);
                      setShowStatusModal(true);
                    }}
                    className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="font-semibold text-white">{booking.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-semibold text-white">{booking.phone}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">📅 Date:</span>
                    <span className="font-semibold text-white">{new Date(booking.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">⏰ Time:</span>
                    <span className="font-semibold text-white">{booking.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">⌛ Duration:</span>
                    <span className="font-semibold text-white">{booking.serviceDuration} mins</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                    <span className="text-gray-400">💰 Price:</span>
                    <span className="font-bold text-emerald-400">₹{booking.servicePrice}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetailModal(true);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <Calendar className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No bookings found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-2xl shadow-2xl overflow-hidden backdrop-blur-xl my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Customer Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-semibold text-white">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-semibold text-white">{selectedBooking.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-semibold text-white">{selectedBooking.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white mb-3">Service Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Service:</span>
                    <span className="font-semibold text-white">{selectedBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-semibold text-white">{new Date(selectedBooking.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-semibold text-white">{selectedBooking.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-white">{selectedBooking.serviceDuration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-bold text-emerald-400 text-base">₹{selectedBooking.servicePrice}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Notes</h3>
                  <p className="text-sm text-gray-300">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setNewStatus(selectedBooking.status);
                    setShowStatusModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-lg transition-all font-semibold text-white text-sm"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-sm shadow-2xl backdrop-blur-xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Update Booking Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300 mb-4">Select new status for {selectedBooking.service_name}</p>
              
              <div className="grid grid-cols-1 gap-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedBooking._id, status)}
                    className={`p-3 rounded-lg transition-all text-left font-semibold ${
                      newStatus === status
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-sm mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;




























