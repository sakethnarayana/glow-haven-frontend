


// src/components/BookingModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { X, CalendarDays, Clock, Loader } from 'lucide-react';
import api from '../config/api';
import {toast,Toaster} from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';



const ALL_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const todayIso = () => new Date().toISOString().split('T')[0];

const getMonthDays = (year, monthIndex) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const arr = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, monthIndex, d);
    arr.push({ iso: dt.toISOString().split('T')[0], day: d });
  }
  return arr;
};

export default function BookingModal({ service, onClose }) {
  const { user } = useAuth();

  const [availabilities, setAvailabilities] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [loadingMorePages, setLoadingMorePages] = useState(false);

  const now = useMemo(() => new Date(), []);
  const [visibleYear, setVisibleYear] = useState(now.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(now.getMonth());

  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const [name, setName] = useState(
    user?.name ||
      (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null')?.name || ''; } catch { return ''; }
      })()
  );
  const [phone, setPhone] = useState(
    user?.phone ||
      (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null')?.phone || ''; } catch { return ''; }
      })()
  );

  const [booking, setBooking] = useState(false);

  // load availabilities (supports pagination)
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoadingAvail(true);
        const first = await api.get('/availability', { params: { page: 1, limit: 50 } }).catch(() => api.get('/availability'));
        if (cancelled) return;
        const dataRoot = first.data?.data || first.data || {};
        const firstAvail = dataRoot.availabilities || [];
        const pagination = dataRoot.pagination || null;
        let all = [...firstAvail];

        if (pagination && pagination.pages && pagination.pages > 1) {
          setLoadingMorePages(true);
          for (let p = 2; p <= pagination.pages; p++) {
            if (cancelled) break;
            try {
              const res = await api.get('/availability', { params: { page: p, limit: 50 } });
              const d = res.data?.data || res.data || {};
              all = all.concat(d.availabilities || []);
            } catch (err) {
              console.warn('Failed to fetch availability page', p, err);
            }
          }
          setLoadingMorePages(false);
        }
        if (!cancelled) setAvailabilities(all);
      } catch (err) {
        console.error('Availability load error', err);
        toast.error('Failed to load availability');
      } finally {
        if (!cancelled) setLoadingAvail(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const findAvailability = (isoDate) => availabilities.find(a => a.date === isoDate);
  const isPast = (isoDate) => new Date(isoDate) < new Date(todayIso());

  const monthDays = useMemo(() => getMonthDays(visibleYear, visibleMonth), [visibleYear, visibleMonth]);

  const goPrev = () => {
    const d = new Date(visibleYear, visibleMonth - 1, 1);
    setVisibleYear(d.getFullYear()); setVisibleMonth(d.getMonth());
    setSelectedDate(''); setSelectedTime(''); setAvailableSlots([]);
  };
  const goNext = () => {
    const d = new Date(visibleYear, visibleMonth + 1, 1);
    setVisibleYear(d.getFullYear()); setVisibleMonth(d.getMonth());
    setSelectedDate(''); setSelectedTime(''); setAvailableSlots([]);
  };

  const handleDateClick = async (isoDate) => {
    if (isPast(isoDate)) {
      toast.error('Cannot book past dates');
      return;
    }
    const rec = findAvailability(isoDate);
    if (rec && rec.isFullDayUnavailable) {
      // new message as requested
      toast.error('This date is unavailable by admin');
      return;
    }

    // normal selection -> fetch slots
    setSelectedDate(isoDate);
    setSelectedTime('');
    setAvailableSlots([]);
    setLoadingSlots(true);

    try {
      const res = await api.get(`/bookings/availability/slots/${isoDate}`).catch(() => null);
      if (res && res.data) {
        const slots = res.data?.data?.slots || [];
        setAvailableSlots(slots.map(s => s.time));
      } else {
        // fallback derive from availabilities array
        const serverRec = rec || null;
        if (!serverRec) setAvailableSlots(ALL_SLOTS.slice());
        else if (serverRec.isFullDayUnavailable) setAvailableSlots([]);
        else {
          const unavailable = (serverRec.unavailableSlots || []).map(u => u.time);
          setAvailableSlots(ALL_SLOTS.filter(t => !unavailable.includes(t)));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch slots for date', isoDate, err);
      toast.error('Failed to load slots for this date');
      const serverRec = rec || null;
      if (!serverRec) setAvailableSlots(ALL_SLOTS.slice());
      else {
        const unavailable = (serverRec.unavailableSlots || []).map(u => u.time);
        setAvailableSlots(ALL_SLOTS.filter(t => !unavailable.includes(t)));
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  // toggle slot selection on repeat click
  const handleSlotClick = (slot) => {
    const isAvail = availableSlots.includes(slot);
    if (!isAvail) {
      toast.error('This time slot is not available');
      return;
    }
    if (selectedTime === slot) {
      // unselect on second click
      setSelectedTime('');
      return;
    }
    setSelectedTime(slot);
  };

  const validateName = (n) => (n && n.trim().length >= 2);
  const validatePhone = (p) => {
    const digits = (p || '').toString().replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleConfirmBooking = async () => {
    
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedTime) {
      toast.error(`Please select a time slot for this ${selectedDate} date`);
      return;
    }
    if (!validateName(name)) {
      toast.error('Please enter your name (min 2 characters)');
      return;
    }
    if (!validatePhone(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setBooking(true);
      const localUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null') || {}; } catch { return {}; }
      })();

      await api.post('/bookings', {
        userId: localUser._id || user?._id,
        serviceId: service?._id,
        date: selectedDate,
        time: selectedTime,
        name: name.trim(),
        phone: phone.trim(),
      });

      toast.success('Booking confirmed!');
      // setTimeout(() => navigate("/bookings"), 1200);
      onClose?.();
    } catch (err) {
      console.error('Booking error', err);
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  const cellFlags = (isoDate) => {
    const rec = findAvailability(isoDate);
    const closed = rec?.isFullDayUnavailable === true;
    const partial = !closed && Array.isArray(rec?.unavailableSlots) && rec.unavailableSlots.length > 0;
    const past = isPast(isoDate);
    const today = isoDate === todayIso();
    return { closed, partial, past, today };
  };

  // format price Indian style
  const formatINR = (val) => {
    if (val == null || val === '') return '-';
    const num = Number(val);
    if (isNaN(num)) return val;
    return '₹' + num.toLocaleString('en-IN');
    
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center p-4" role="dialog" aria-modal="true">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-pink-600" />
            <div>
              <h3 className="text-lg font-semibold">Book — {service?.name}</h3>
              <p className="text-sm text-gray-600">Choose a date & time</p>
            </div>
          </div>
          <button onClick={() => onClose?.()} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[78vh]">
          {loadingAvail ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="animate-spin w-6 h-6 text-pink-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="flex items-center mb-3 gap-3">
                  <button onClick={goPrev} className="px-3 py-1 rounded-md border hover:bg-gray-50">‹</button>
                  <div className="font-medium">{new Date(visibleYear, visibleMonth, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
                  <button onClick={goNext} className="px-3 py-1 rounded-md border hover:bg-gray-50">›</button>

                  <div className="ml-auto flex items-center gap-3 text-xs text-gray-600">
                    <div className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600" /> Today</div>
                    <div className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-200 border border-orange-300" /> Partial</div>
                    <div className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Closed</div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-xs text-center mb-2 text-gray-600">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="font-semibold">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const firstDayWeekday = new Date(visibleYear, visibleMonth, 1).getDay();
                    const empties = Array.from({ length: firstDayWeekday }, (_, i) => <div key={`e-${i}`} className="p-2" />);
                    const dayCells = monthDays.map((d) => {
                      const { iso, day } = { iso: d.iso, day: d.day };
                      const { closed, partial, past, today } = cellFlags(iso);

                      let cls = 'text-sm p-2 rounded-md w-full flex items-center justify-center transition-all';
                      if (past) cls += ' bg-gray-100 text-gray-400 cursor-not-allowed';
                      else if (today) cls += ' bg-green-600 text-white font-semibold';
                      else if (closed) cls += ' bg-red-500 text-white';
                      else if (partial) cls += ' bg-orange-200 text-gray-800';
                      else cls += ' bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer';

                      if (selectedDate === iso) cls += ' ring-2 ring-pink-500';

                      return (
                        <div key={iso}>
                          <button
                            type="button"
                            onClick={() => handleDateClick(iso)}
                            className={cls}
                            aria-pressed={selectedDate === iso}
                            disabled={past || closed}
                          >
                            <span>{day}</span>
                          </button>
                        </div>
                      );
                    });

                    const totalCells = firstDayWeekday + monthDays.length;
                    const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                    const trailingEmpties = Array.from({ length: trailing }, (_, i) => <div key={`t-${i}`} className="p-2" />);

                    return [...empties, ...dayCells, ...trailingEmpties];
                  })()}
                </div>

                {loadingMorePages && <div className="text-xs text-gray-500 mt-2">Loading availability pages…</div>}
              </div>

              <div className="space-y-4">
                <div className="bg-white p-3 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Selected</div>
                    <div className="text-sm text-gray-500">{selectedDate || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Available times</div>

                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader className="animate-spin w-5 h-5 text-pink-600" />
                      </div>
                    ) : selectedDate ? (
                      (() => {
                        const availTimes = availableSlots.length ? availableSlots : (() => {
                          const rec = findAvailability(selectedDate);
                          if (!rec) return ALL_SLOTS.slice();
                          if (rec.isFullDayUnavailable) return [];
                          const unavailable = (rec.unavailableSlots || []).map(s => s.time);
                          return ALL_SLOTS.filter(t => !unavailable.includes(t));
                        })();

                        if (!availTimes.length) {
                          return <div className="mt-2 text-sm text-gray-600">No slots available</div>;
                        }

                        return (
                          <div className="grid grid-cols-3 gap-2">
                            {ALL_SLOTS.map((slot) => {
                              const isAvailable = availTimes.includes(slot);
                              const selected = selectedTime === slot;
                              const visualCls = selected
                                ? 'bg-pink-600 text-white'
                                : isAvailable
                                  ? 'bg-white hover:bg-pink-50 border border-transparent hover:border-pink-100'
                                  : 'bg-red-100 text-gray-500';
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => handleSlotClick(slot)}
                                  className={`p-2 rounded-md text-sm transition-all ${visualCls}`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="mt-2 text-sm text-gray-600">Select a date to view times</div>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={handleConfirmBooking}
                 
                      className={`w-full py-2 rounded-md text-white font-semibold ${booking ? 'bg-purple-400 cursor-wait' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'}`}
                    >
                      {booking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-md border">
                  <div className="text-sm text-gray-600">Service</div>
                  <div className="font-semibold">{service?.name || '-'}</div>
                  {service?.price != null && <div className="text-sm text-gray-600">{formatINR(service.price)}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatINR(val) {
  if (val == null || val === '') return '-';
  const num = Number(val);
  if (isNaN(num)) return val;
  return '₹' + num.toLocaleString('en-IN');
}























