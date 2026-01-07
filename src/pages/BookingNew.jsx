// // src/pages/BookingNew.jsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import api from '../config/api';
// import { useAuth } from '../hooks/useAuth';
// import { toast } from 'react-hot-toast';
// import { Calendar, Clock, User, Phone, ArrowLeft } from 'lucide-react';
// import LoadingSpinner from '../components/LoadingSpinner';

// // small helpers
// const todayStr = () => new Date().toISOString().split('T')[0];
// const iso = (d) => d.toISOString().split('T')[0];
// const pad = (n) => String(n).padStart(2, '0');

// // returns grid of 42 day objects for a month (keeps layout stable)
// const getMonthGrid = (year, monthIndex) => {
//   const first = new Date(year, monthIndex, 1);
//   const last = new Date(year, monthIndex + 1, 0);
//   const daysInMonth = last.getDate();
//   const startWeekday = first.getDay(); // 0 Sun .. 6 Sat

//   const result = [];

//   // previous month tail
//   const prevLast = new Date(year, monthIndex, 0).getDate();
//   for (let i = startWeekday - 1; i >= 0; i--) {
//     const d = new Date(year, monthIndex - 1, prevLast - i);
//     result.push({ date: iso(d), inMonth: false });
//   }

//   // current month
//   for (let d = 1; d <= daysInMonth; d++) {
//     const date = new Date(year, monthIndex, d);
//     result.push({ date: iso(date), inMonth: true });
//   }

//   // next month filler
//   let day = 1;
//   while (result.length < 42) {
//     const date = new Date(year, monthIndex + 1, day++);
//     result.push({ date: iso(date), inMonth: false });
//   }
//   return result;
// };

// export default function BookingNew() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   // form
//   const [formData, setFormData] = useState({
//     name: user?.name || '',
//     phone: user?.phone || '',
//     serviceId: location.state?.serviceId || '',
//     date: '',
//     time: '',
//   });

//   const [services, setServices] = useState([]);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   // calendar state
//   const now = useMemo(() => new Date(), []);
//   const [vYear, setVYear] = useState(now.getFullYear());
//   const [vMonth, setVMonth] = useState(now.getMonth()); // 0-indexed
//   const [availCache, setAvailCache] = useState({}); // { '2025-11-07': { slots: [...], fetched: true } }
//   const [calLoading, setCalLoading] = useState(false);

//   // Preload services (one-time)
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await api.get('/services?page=1&limit=100'); // keep same backend route
//         const list = res.data?.data?.services || res.data?.services || [];
//         setServices(list);
//       } catch (err) {
//         console.error('services fetch', err);
//         toast.error('Failed to load services');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // reset slots/service when service changes
//   useEffect(() => {
//     setAvailableSlots([]);
//     setFormData(prev => ({ ...prev, date: '', time: '' }));
//   }, [formData.serviceId]);

//   // prefetch availability for visible month (only for today+future days)
//   useEffect(() => {
//     let cancelled = false;
//     const grid = getMonthGrid(vYear, vMonth);
//     const toCheck = grid
//       .map(c => c.date)
//       .filter(d => new Date(d) >= new Date(todayStr())); // only today or future

//     // filter out already cached dates
//     const toFetch = toCheck.filter(d => !availCache[d]);

//     if (toFetch.length === 0) return;

//     setCalLoading(true);
//     console.log('Prefetching availability for:', toFetch.slice(0, 50)); // debug; appears in console

//     // Batch requests in small groups to avoid spike
//     const batchSize = 8;
//     (async () => {
//       try {
//         for (let i = 0; i < toFetch.length; i += batchSize) {
//           const batch = toFetch.slice(i, i + batchSize);
//           const promises = batch.map(dateStr =>
//             api
//               .get(`/bookings/availability/slots/${dateStr}`)
//               .then(r => ({ dateStr, slots: r.data?.data?.slots || [], ok: true }))
//               .catch(e => {
//                 console.warn('slot-check failed', dateStr, e);
//                 return { dateStr, slots: [], ok: false };
//               })
//           );
//           const results = await Promise.all(promises);
//           if (cancelled) return;
//           setAvailCache(prev => {
//             const copy = { ...prev };
//             results.forEach(r => {
//               copy[r.dateStr] = { slots: r.slots || [], fetched: true };
//             });
//             return copy;
//           });
//         }
//       } finally {
//         if (!cancelled) setCalLoading(false);
//       }
//     })();

//     return () => { cancelled = true; };
//   }, [vYear, vMonth, availCache]);

//   // on selecting a date (click)
//   const onDateSelect = async (dateStr) => {
//     // past -> blocked
//     if (new Date(dateStr) < new Date(todayStr())) {
//       toast.error('Cannot book past dates');
//       return;
//     }

//     const cached = availCache[dateStr];
//     if (cached && cached.fetched && Array.isArray(cached.slots) && cached.slots.length === 0) {
//       toast.error('Shop is not available on this date');
//       return;
//     }

//     setFormData(prev => ({ ...prev, date: dateStr, time: '' }));
//     setAvailableSlots([]);

//     try {
//       const r = await api.get(`/bookings/availability/slots/${dateStr}`);
//       const slots = r.data?.data?.slots || [];
//       setAvailableSlots(slots);
//       setAvailCache(prev => ({ ...prev, [dateStr]: { slots, fetched: true } }));
//       if (!slots.length) toast.info('No slots available for this date');
//     } catch (err) {
//       console.error('fetch slots fail', err);
//       toast.error('Failed to fetch slots');
//     }
//   };

//   const validate = () => {
//     if (!formData.name.trim()) { toast.error('Please enter your name'); return false; }
//     if (!formData.phone.trim()) { toast.error('Please enter your phone'); return false; }
//     if (!formData.serviceId) { toast.error('Please select a service'); return false; }
//     if (!formData.date) { toast.error('Please select a date'); return false; }
//     if (!formData.time) { toast.error('Please select a time'); return false; }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     try {
//       setSubmitting(true);
//       await api.post('/bookings', {
//         userId: user._id,
//         serviceId: formData.serviceId,
//         date: formData.date,
//         time: formData.time,
//         name: formData.name,
//         phone: formData.phone,
//       });
//       toast.success('Booking confirmed! 🎉');
//       setTimeout(() => navigate('/bookings'), 1200);
//     } catch (err) {
//       console.error('booking error', err);
//       toast.error(err.response?.data?.message || 'Failed to create booking');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // calendar helpers
//   const grid = useMemo(() => getMonthGrid(vYear, vMonth), [vYear, vMonth]);
//   const monthLabel = useMemo(() => new Date(vYear, vMonth, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' }), [vYear, vMonth]);

//   const prevMonth = () => {
//     const d = new Date(vYear, vMonth - 1, 1);
//     setVYear(d.getFullYear()); setVMonth(d.getMonth());
//   };
//   const nextMonth = () => {
//     const d = new Date(vYear, vMonth + 1, 1);
//     setVYear(d.getFullYear()); setVMonth(d.getMonth());
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="px-4 sm:px-6 md:px-10 pb-8">
//       <div className="flex items-center gap-3 mb-6">
//         <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <ArrowLeft className="w-6 h-6 text-gray-700" />
//         </button>
//         <div>
//           <h1 className="text-2xl md:text-3xl font-serif">Book a Service</h1>
//           <p className="text-gray-600 text-sm md:text-base">Schedule your appointment at GlowHaven</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Form column */}
//         <div className="lg:col-span-2">
//           <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-4 md:p-6 border border-gray-200">
//             {/* Personal */}
//             <div>
//               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <input className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600" placeholder="Full name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
//                 <input className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600" placeholder="Phone number" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
//               </div>
//             </div>

//             {/* Service selection */}
//             <div>
//               <h3 className="text-lg font-semibold mb-3">Select Service</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {services.map(svc => (
//                   <button
//                     key={svc._id}
//                     type="button"
//                     onClick={() => setFormData(p => ({ ...p, serviceId: svc._id }))}
//                     className={`p-3 border rounded-lg text-left ${formData.serviceId === svc._id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
//                   >
//                     <div className="font-semibold">{svc.name}</div>
//                     <div className="text-xs text-gray-600">₹{svc.price} • {svc.duration}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Calendar */}
//             <div>
//               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Select Date</h3>

//               <div className="flex items-center gap-3 mb-3">
//                 <button type="button" onClick={prevMonth} className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">‹</button>
//                 <div className="font-medium">{monthLabel}</div>
//                 <button type="button" onClick={nextMonth} className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">›</button>
//                 <div className="ml-auto text-xs text-gray-500">
//                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-white" style={{ background: '#16A34A' }}>Today</span>
//                 </div>
//               </div>

//               <div className="overflow-auto">
//                 <div className="grid grid-cols-7 gap-2 text-xs text-center mb-2">
//                   {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="font-medium text-gray-600">{d}</div>)}
//                 </div>

//                 <div className="grid grid-cols-7 gap-2">
//                   {grid.map(cell => {
//                     const d = new Date(cell.date);
//                     const dateStr = cell.date;
//                     const isToday = dateStr === todayStr();
//                     const inMonth = cell.inMonth;
//                     const isPast = new Date(dateStr) < new Date(todayStr());
//                     const cache = availCache[dateStr];
//                     const fetched = cache?.fetched;
//                     const slots = cache?.slots;
//                     const noSlots = fetched && Array.isArray(slots) && slots.length === 0;

//                     // classes
//                     let classes = 'text-sm p-2 rounded-lg flex items-center justify-center';
//                     if (!inMonth) classes += ' text-gray-400';
//                     if (isPast) classes += ' bg-gray-100 text-gray-400 cursor-not-allowed';
//                     if (isToday) classes += ' bg-green-600 text-white font-semibold';
//                     if (noSlots) classes += ' bg-red-100 text-red-700 cursor-not-allowed';
//                     if (!isPast && !noSlots && inMonth && !isToday) classes += ' hover:bg-gray-50 border border-transparent hover:border-gray-200';

//                     return (
//                       <div key={dateStr}>
//                         <button
//                           type="button"
//                           disabled={isPast || noSlots}
//                           className={classes}
//                           onClick={() => {
//                             // if clicked outside visible month, navigate month then select
//                             if (new Date(cell.date).getMonth() !== vMonth) {
//                               setVMonth(new Date(cell.date).getMonth());
//                               setVYear(new Date(cell.date).getFullYear());
//                               setTimeout(() => onDateSelect(dateStr), 100);
//                               return;
//                             }
//                             if (isPast) { toast.error('Cannot book past dates'); return; }
//                             if (noSlots) { toast.error('Shop is not available on this date'); return; }
//                             onDateSelect(dateStr);
//                           }}
//                         >
//                           <div>{d.getDate()}</div>
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {calLoading && <div className="text-xs text-gray-500 mt-2">Loading availability…</div>}
//               </div>
//             </div>

//             {/* Time slots */}
//             {formData.date && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Select Time Slot</h3>

//                 {availableSlots.length === 0 ? (
//                   <p className="text-sm text-gray-600">Choose a date to show available slots.</p>
//                 ) : (
//                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                     {availableSlots.map(slot => (
//                       <button
//                         key={slot.time}
//                         type="button"
//                         onClick={() => setFormData(p => ({ ...p, time: slot.time }))}
//                         className={`p-2 rounded-lg border-2 ${formData.time === slot.time ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
//                       >
//                         {slot.time}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg">
//               {submitting ? 'Confirming Booking...' : 'Confirm Booking'}
//             </button>
//           </form>
//         </div>

//         {/* Summary column */}
//         <div>
//           <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
//             <div className="bg-white rounded-lg p-4">
//               <h3 className="font-semibold mb-3">Booking Summary</h3>

//               <div className="space-y-3">
//                 <div>
//                   <p className="text-xs text-gray-500">Name</p>
//                   <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Phone</p>
//                   <input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Service</p>
//                   <div className="mt-1 text-sm font-semibold">{services.find(s=>s._id===formData.serviceId)?.name || '—'}</div>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Date</p>
//                   <div className="mt-1 text-sm font-semibold">{formData.date ? new Date(formData.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</div>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Time</p>
//                   <div className="mt-1 text-sm font-semibold">{formData.time || '—'}</div>
//                 </div>
//               </div>
//             </div>

//             <p className="text-xs text-gray-500 mt-3">Tip: green = today, red = shop closed / no slots, gray = past date.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
