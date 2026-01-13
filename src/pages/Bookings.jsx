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
