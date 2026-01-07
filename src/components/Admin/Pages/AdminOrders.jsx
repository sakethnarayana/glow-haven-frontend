
// import React, { useState, useEffect } from 'react';
// import api from '../../../config/api';
// import { toast ,Toaster} from 'react-hot-toast';
// import { Search, X, Loader, Package, Truck, CheckCircle, Clock, Eye, MoreVertical } from 'lucide-react';

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pageLoading, setPageLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [newStatus, setNewStatus] = useState('');

//   const statuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     filterOrders();
//   }, [orders, searchTerm, statusFilter]);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/orders?page=1&limit=100');
//       setOrders(response.data.data.orders || []);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       toast.error('Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterOrders = () => {
//     let filtered = orders;

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(o => o.status === statusFilter);
//     }

//     if (searchTerm) {
//       filtered = filtered.filter(o =>
//         o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         o.order_id?.includes(searchTerm) ||
//         o.phone?.includes(searchTerm)
//       );
//     }

//     setFilteredOrders(filtered);
//   };




//   const handleStatusChange = async (orderId, status) => {
//       if (pageLoading) return; // prevent double clicks
//       try {
//         setPageLoading(true);
//         // hit the correct backend route
//         await api.put(`/orders/${orderId}/status`, { status });
//         toast.success(`✅ Order status updated to ${status}`);
//         // reflect immediately without full reload
//         setOrders(prev =>
//           prev.map(o => (o._id === orderId ? { ...o, status } : o))
//         );
//         setShowStatusModal(false);
//       } catch (error) {
//           console.error("Status update failed:", error);
//           const backendMessage =
//             error.response?.data?.message ||
//             error.response?.data?.error ||
//             "Something went wrong while updating the order";
//           toast.error(backendMessage);
//         } finally {
//         setPageLoading(false);
//       }
//     };


//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
//       confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
//       in_transit: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
//       delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
//       cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
//     };
//     return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       pending: <Clock size={16} />,
//       confirmed: <CheckCircle size={16} />,
//       in_transit: <Truck size={16} />,
//       delivered: <CheckCircle size={16} />,
//       cancelled: <X size={16} />
//     };
//     return icons[status] || null;
//   };

//   const stats = {
//     total: orders.length,
//     pending: orders.filter(o => o.status === 'pending').length,
//     delivered: orders.filter(o => o.status === 'delivered').length,
//     totalRevenue: orders
//       .filter(o => o.status === 'delivered')
//       .reduce((sum, o) => sum + o.total, 0)
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-spin">
//             <Loader className="w-8 h-8 text-gray-900 animate-spin" />
//           </div>
//           <p className="text-gray-300 text-lg font-medium">Loading orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
//         <Toaster position="top-right" />

//       {pageLoading && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
//               <Loader className="w-10 h-10 text-gray-900 animate-spin" />
//             </div>
//             <p className="text-white text-lg font-medium">Updating...</p>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
//                 <Package className="w-5 h-5 text-white" />
//               </div>
//               <h1 className="text-3xl md:text-4xl font-bold text-white">Orders</h1>
//             </div>
//             <p className="text-gray-400">Manage customer orders & shipments</p>
//           </div>
//           <button
//             onClick={fetchOrders}
//             className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
//           >
//             Refresh
//           </button>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
//           <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-indigo-500/60 transition-all">
//             <p className="text-indigo-300 text-xs font-medium">Total Orders</p>
//             <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
//           </div>
//           <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
//             <p className="text-yellow-300 text-xs font-medium">Pending</p>
//             <p className="text-2xl font-bold text-white mt-2">{stats.pending}</p>
//           </div>
//           <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-emerald-500/60 transition-all">
//             <p className="text-emerald-300 text-xs font-medium">Delivered</p>
//             <p className="text-2xl font-bold text-white mt-2">{stats.delivered}</p>
//           </div>
//           <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-violet-500/60 transition-all">
//             <p className="text-violet-300 text-xs font-medium">Revenue</p>
//             <p className="text-xl font-bold text-white mt-2">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
//           </div>
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="mb-6 flex flex-col sm:flex-row gap-3">
//         <div className="flex-1 relative group">
//           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
//           <input
//             type="text"
//             placeholder="Search by name, order ID, or phone..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500 transition-all backdrop-blur-sm text-sm"
//           />
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white transition-all backdrop-blur-sm appearance-none cursor-pointer text-sm"
//         >
//           <option value="all">All Status</option>
//           {statuses.map(status => (
//             <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</option>
//           ))}
//         </select>
//       </div>

//       {/* Orders Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {filteredOrders.length > 0 ? (
//           filteredOrders.map((order) => (
//             <div
//               key={order._id}
//               className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-gray-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20"
//             >
//               {/* Header */}
//               <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-700/50">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-lg font-bold text-white">Order #{order._id?.slice(0, 8)}</h3>
//                   <button
//                     onClick={() => {
//                       setSelectedOrder(order);
//                       setNewStatus(order.status);
//                       setShowStatusModal(true);
//                     }}
//                     className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
//                   >
//                     <MoreVertical size={18} className="text-gray-400" />
//                   </button>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
//                     {getStatusIcon(order.status)}
//                     {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
//                   </span>
//                   <p className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleDateString()}</p>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-4 space-y-3">
//                 {/* Customer Info */}
//                 {console.log(order.userId)}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <p className="text-xs text-gray-400">Customer</p>
//                     <p className="font-semibold text-white">{order.userId?.name}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-400">Phone</p>
//                     <p className="font-semibold text-white">{order.userId?.phone}</p>
//                   </div>
//                 </div>

//                 {/* Order Details */}
//                 <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-400">Items:</span>
//                     <span className="font-semibold text-white">{order.items?.length || 0} items</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-400">Amount:</span>
//                     <span className="font-bold text-emerald-400">
//                                             ₹{(
//                         order.items?.reduce(
//                           (sum, item) => sum + (item.subtotal || item.price * item.quantity || 0),
//                           0
//                         ) ?? 0
//                       ).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-400">Delivery:</span>
//                     <span className="text-white">  {`${order.addressId?.city}, ${order.addressId?.state}`}...</span>
//                   </div>
//                 </div>

//                 {/* Action Button */}
//                 <button
//                   onClick={() => {
//                     setSelectedOrder(order);
//                     setShowDetailModal(true);
//                   }}
//                   className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm flex items-center justify-center gap-2"
//                 >
//                   <Eye size={16} />
//                   <span>View Details</span>
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="col-span-full flex flex-col items-center justify-center py-20">
//             <Package className="w-16 h-16 text-gray-600 mb-4" />
//             <p className="text-gray-400 text-lg">No orders found</p>
//             <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
//           </div>
//         )}
//       </div>

//       {/* Detail Modal */}
//       {showDetailModal && selectedOrder && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
//           <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-2xl shadow-2xl overflow-hidden backdrop-blur-xl my-8">
//             {/* Modal Header */}
//             <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
//               <h2 className="text-xl font-bold text-white">Order #{selectedOrder._id?.slice(0, 8)}</h2>
//               <button
//                 onClick={() => setShowDetailModal(false)}
//                 className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5 text-white" />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
//               {/* Customer Info */}
//               <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
//                 <h3 className="font-semibold text-white mb-3">Customer Information</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-400">Name</p>
//                     <p className="font-semibold text-white">{selectedOrder.userId?.name}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-400">Phone</p>
//                     <p className="font-semibold text-white">{selectedOrder.userId?.phone}</p>
//                   </div>
//                   <div className="col-span-2">
//                     <p className="text-xs text-gray-400">Address</p>
//                               <p className="font-semibold text-white">{selectedOrder.addressId
//                   ? `${selectedOrder.addressId.addressLine}, ${selectedOrder.addressId.city}, ${selectedOrder.addressId.state} - ${selectedOrder.addressId.pincode}`
//                   : "Address not available"}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="bg-gray-800/50 rounded-lg p-4">
//                 <h3 className="font-semibold text-white mb-3">Items</h3>
//                 <div className="space-y-2">
//                   {selectedOrder.items?.map((item, idx) => (
//                     <div key={idx} className="flex justify-between text-sm p-2 bg-gray-900/50 rounded">
//                       <div>
//                         <p className="text-white font-medium">{item.name}</p>
//                         <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
//                       </div>
//                       <p className="font-semibold text-emerald-400">₹{item.price * item.quantity}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Order Summary */}
//               <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-400">Subtotal:</span>
//                   <span className="text-white">₹{(selectedOrder.items?.reduce(
//                       (sum, item) => sum + (item.subtotal || item.price * item.quantity || 0),
//                       0
//                     ) ?? 0
//                   ).toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
//                   <span className="font-semibold text-white">Total:</span>
//                   <span className="font-bold text-emerald-400 text-lg">₹{(selectedOrder.items?.reduce(
//                       (sum, item) => sum + (item.subtotal || item.price * item.quantity || 0),
//                       0
//                     ) ?? 0
//                   ).toLocaleString("en-IN")}</span>
//                 </div>
//               </div>

//               {/* Status Update */}
//               <div className="flex gap-2 pt-4">
//                 <button
//                   onClick={() => setShowDetailModal(false)}
//                   className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-sm"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowDetailModal(false);
//                     setNewStatus(selectedOrder.status);
//                     setShowStatusModal(true);
//                   }}
//                   className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all font-semibold text-white text-sm"
//                 >
//                   Update Status
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Modal */}
//       {showStatusModal && selectedOrder && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-sm shadow-2xl backdrop-blur-xl">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-lg font-bold text-white">Update Order Status</h2>
//               <button
//                 onClick={() => setShowStatusModal(false)}
//                 className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5 text-white" />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 space-y-4">
//               <p className="text-sm text-gray-300 mb-4">Select new status for order #{selectedOrder.order_id?.slice(0, 8)}</p>
              
//               <div className="grid grid-cols-1 gap-2">
//                 {/* {statuses.map(status => (
//                   <button
//                     key={status}
//                     onClick={() => handleStatusChange(selectedOrder._id, status)}
//                     className={`p-3 rounded-lg transition-all text-left font-semibold ${
//                       newStatus === status
//                         ? 'bg-indigo-600 text-white'
//                         : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
//                     }`}
//                   >
//                     <div className="flex items-center gap-2">
//                       {getStatusIcon(status)}
//                       <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
//                     </div>
//                   </button>
//                 ))} */}

//                 {statuses.map(status => {
//                   const isActive = newStatus === status;
//                   const isUpdating = pageLoading && selectedOrder?.status !== status;
//                   return (
//                     <button
//                       key={status}
//                       onClick={() => !pageLoading && handleStatusChange(selectedOrder._id, status)}
//                       disabled={pageLoading}
//                       className={`p-3 rounded-lg transition-all text-left font-semibold flex items-center justify-between ${
//                         isActive
//                           ? 'bg-indigo-600 text-white'
//                           : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
//                       } ${pageLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                     >
//                       <div className="flex items-center gap-2">
//                         {getStatusIcon(status)}
//                         <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
//                       </div>
//                       {isUpdating && <Loader className="w-4 h-4 animate-spin text-indigo-300" />}
//                     </button>
//                   );
//                 })}
//               </div>

//               <button
//                 onClick={() => setShowStatusModal(false)}
//                 className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-sm mt-4"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminOrders;
































// src/components/AdminOrders.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../config/api';
import { toast ,Toaster} from 'react-hot-toast';
import {
  Search, X, Loader, Package, Truck, CheckCircle, Clock, Eye, MoreVertical
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminOrders = () => {
  // data
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // loading / UI
  const [loading, setLoading] = useState(true);         // initial data load
  const [pageLoading, setPageLoading] = useState(false); // server filter/apply / status updates
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  // NEW: advanced filters
  const [startDate, setStartDate] = useState(''); // format: YYYY-MM-DD
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [multiItemOnly, setMultiItemOnly] = useState(false);

  // UI modals / details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const statuses = ['all','pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

  // read query param productId for deep link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('productId');
    if (pid) setProductFilter(pid);
    // load products + orders
    fetchProducts();
    fetchOrders(); // initial fetch (no filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // client-side filtering that is instant and non-blocking
  useEffect(() => {
    applyClientSideFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, searchTerm, statusFilter, productFilter, multiItemOnly]);

  // ----------------------
  // Fetch functions
  // ----------------------
  const fetchOrders = async (serverFilters = {}) => {
    try {
      setLoading(true);
      // Build query string
      const params = new URLSearchParams();
      params.set('page', 1);
      params.set('limit', 200);

      if (serverFilters.status || (statusFilter && statusFilter !== 'all')) {
        params.set('status', serverFilters.status || statusFilter);
      }
      if (serverFilters.productId || (productFilter && productFilter !== 'all')) {
        params.set('productId', serverFilters.productId || productFilter);
      }

      // date filters
      if (serverFilters.startDate || startDate) {
        params.set('startDate', serverFilters.startDate || startDate);
      }
      if (serverFilters.endDate || endDate) {
        params.set('endDate', serverFilters.endDate || endDate);
      }

      // amount filters
      if (serverFilters.minAmount || minAmount) {
        params.set('minAmount', serverFilters.minAmount || minAmount);
      }
      if (serverFilters.maxAmount || maxAmount) {
        params.set('maxAmount', serverFilters.maxAmount || maxAmount);
      }

      const url = `/orders?${params.toString()}`;
      const res = await api.get(url);
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?page=1&limit=200');
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error('Failed to load products for filter', err);
    }
  };

  // ----------------------
  // Client-side filtering (fast, non-blocking)
  // ----------------------
  const applyClientSideFilters = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (productFilter !== 'all') {
      filtered = filtered.filter(o =>
        o.items?.some(item => {
          const pid = (item.productId && (item.productId._id || item.productId)) || item.productId;
          return String(pid) === String(productFilter);
        })
      );
    }

    if (multiItemOnly) {
      filtered = filtered.filter(o => (o.items?.length || 0) > 1);
    }

    if (searchTerm) {
      const q = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(o =>
        (o.userId?.name || '').toLowerCase().includes(q) ||
        (o.userId?.phone || '').includes(q) ||
        (o._id || '').toString().includes(q) ||
        (o.items || []).some(i => (i.name || '').toLowerCase().includes(q))
      );
    }

    // Amount and date client-side narrowing (helps instant UI), but server fetch should be used for big accuracy
    if (minAmount !== '') {
      const min = Number(minAmount) || 0;
      filtered = filtered.filter(o => (o.totalAmount || o.total || 0) >= min);
    }
    if (maxAmount !== '') {
      const max = Number(maxAmount) || 0;
      filtered = filtered.filter(o => (o.totalAmount || o.total || 0) <= max);
    }
    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter(o => new Date(o.createdAt) >= s);
    }
    if (endDate) {
      // include entire end date day by adding 1 day minus tiny epsilon
      const e = new Date(endDate);
      e.setHours(23,59,59,999);
      filtered = filtered.filter(o => new Date(o.createdAt) <= e);
    }

    setFilteredOrders(filtered);
  };

  // ----------------------
  // Apply Filters (server call) — invoked when admin clicks "Apply filters"
  // This reduces payload on server and ensures accurate date/amount filtering
  // ----------------------
  const handleApplyFilters = async () => {
    try {
      setPageLoading(true);
      await fetchOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        productId: productFilter !== 'all' ? productFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
      });
      toast.success('Filters applied');
    } catch (err) {
      console.error('Apply filters failed', err);
      toast.error('Failed to apply filters');
    } finally {
      setPageLoading(false);
    }
  };

  // ----------------------
  // Reset filters
  // ----------------------
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProductFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setMultiItemOnly(false);
    // fetch full dataset again
    fetchOrders();
    toast.success('Filters reset');
  };

  // ----------------------
  // Quick chips handlers
  // ----------------------
  const applyQuickDate = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1); // last N days inclusive
    setStartDate(start.toISOString().slice(0,10));
    setEndDate(end.toISOString().slice(0,10));
  };

  // ----------------------
  // Status update (unchanged)
  // ----------------------
  const handleStatusChange = async (orderId, status) => {
    if (pageLoading) return;
    try {
      setPageLoading(true);
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`✅ Order status updated to ${status}`);
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status } : o)));
      setShowStatusModal(false);
    } catch (error) {
      console.error("Status update failed:", error);
      const backendMessage = error.response?.data?.message || "Something went wrong while updating the order";
      toast.error(backendMessage);
    } finally {
      setPageLoading(false);
    }
  };

  // ----------------------
  // Small helpers
  // ----------------------
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      in_transit: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };
  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={16} />,
      confirmed: <CheckCircle size={16} />,
      in_transit: <Truck size={16} />,
      delivered: <CheckCircle size={16} />,
      cancelled: <X size={16} />
    };
    return icons[status] || null;
  };

  // derived stats (memoized)
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    return { total, pending, delivered, totalRevenue };
  }, [orders]);

  // ----------------------
  // Render
  // ----------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-spin">
            <Loader className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
      <Toaster position="top-right" />
      {pageLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
              <Loader className="w-10 h-10 text-gray-900 animate-spin" />
            </div>
            <p className="text-white text-lg font-medium">Working…</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Orders</h1>
            </div>
            <p className="text-gray-400">Manage customer orders & shipments — use filters to narrow results quickly</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => fetchOrders()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">Refresh</button>
            <button onClick={() => navigate('/admin/orders')} className="px-4 py-2 bg-gray-800 text-white rounded-lg">All Orders</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-lg p-4">
            <p className="text-indigo-300 text-xs font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-300 text-xs font-medium">Pending</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-lg p-4">
            <p className="text-emerald-300 text-xs font-medium">Delivered</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.delivered}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/30 rounded-lg p-4">
            <p className="text-violet-300 text-xs font-medium">Revenue</p>
            <p className="text-xl font-bold text-white mt-2">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
          </div>
        </div>

        {/* Filters: responsive grid */}
        <div className="mb-6 bg-gray-800/30 border border-gray-700/40 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search */}
            <div>
            <label className="text-xs text-gray-300 mb-1 block">Search</label>
            <div className="relative">
               
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, order ID, phone or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white placeholder-gray-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Type to quickly find by name, phone or product</p>
            </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-gray-300 mb-1 block">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white text-sm">
                {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1).replace('_',' ')}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Filter by delivery status</p>
            </div>

            {/* Product filter */}
            <div>
              <label className="text-xs text-gray-300 mb-1 block">Product</label>
              <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white text-sm">
                <option value="all">All Products</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Narrow to orders that include a specific product</p>
            </div>

            {/* Multi-item toggle */}
            <div className="flex flex-col justify-between">
              <label className="text-xs text-gray-300 mb-1 block">Multi-item orders</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={multiItemOnly} onChange={() => setMultiItemOnly(prev => !prev)} className="form-checkbox h-5 w-5" />
                  <span className="ml-2 text-sm text-white">Only show orders with &gt;1 item</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Useful to find bundles or large orders</p>
            </div>
          </div>

          {/* Date + Amount row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-300 mb-1 block">Start date</label>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-300 mb-1 block">End date</label>
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-300 mb-1 block">Min amount (₹)</label>
                <input type="number" min="0" placeholder="0" value={minAmount} onChange={(e)=>setMinAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-300 mb-1 block">Max amount (₹)</label>
                <input type="number" min="0" placeholder="No limit" value={maxAmount} onChange={(e)=>setMaxAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-white text-sm" />
              </div>
            </div>
          </div>

          {/* Quick chips + actions */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>applyQuickDate(7)} className="px-3 py-1 text-sm rounded bg-gray-700/50 hover:bg-gray-700 text-white">Last 7 days</button>
              <button onClick={()=>applyQuickDate(30)} className="px-3 py-1 text-sm rounded bg-gray-700/50 hover:bg-gray-700 text-white">Last 30 days</button>
              <button onClick={()=>{setStartDate(''); setEndDate('');}} className="px-3 py-1 text-sm rounded bg-gray-700/40 hover:bg-gray-700 text-gray-300">Clear dates</button>
            </div>

            <div className="flex gap-2">
              <button onClick={resetFilters} className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded text-white text-sm">Reset</button>
              <button onClick={handleApplyFilters} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm">Apply filters</button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.length > 0 ? filteredOrders.map(order => (
          <div key={order._id} className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Order #{order._id?.slice(0,8)}</h3>
                <button onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setShowStatusModal(true); }} className="p-1 hover:bg-gray-700/50 rounded-lg">
                  <MoreVertical size={18} className="text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_',' ')}
                </span>
                <p className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-semibold text-white">{order.userId?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-semibold text-white">{order.userId?.phone}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Items:</span>
                  <span className="font-semibold text-white">{order.items?.length || 0} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{(order.items?.reduce((sum,item) => sum + (item.subtotal || item.price * item.quantity || 0), 0) ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
               <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Delivery:</span>
                  <span className="text-white">
                    {`${order.addressId?.city || ''}${order.addressId?.state ? ', ' + order.addressId?.state : ''}`}
                  </span>
                </div>

              </div>

              <button onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                <Eye size={16} />
                <span>View Details</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <Package className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No orders found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Order #{selectedOrder._id?.slice(0,8)}</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="w-5 h-5 text-white" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-semibold text-white">{selectedOrder.userId?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-semibold text-white">{selectedOrder.userId?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="font-semibold text-white">{selectedOrder.addressId
                      ? `${selectedOrder.addressId.addressLine}, ${selectedOrder.addressId.city}, ${selectedOrder.addressId.state} - ${selectedOrder.addressId.pincode}`
                      : "Address not available"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 bg-gray-900/50 rounded">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-emerald-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">₹{(selectedOrder.items?.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity || 0), 0) ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="font-bold text-emerald-400 text-lg">₹{(selectedOrder.items?.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity || 0), 0) ?? 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowDetailModal(false)} className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-white">Close</button>
                <button onClick={() => { setShowDetailModal(false); setNewStatus(selectedOrder.status); setShowStatusModal(true); }} className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white">Update Status</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-sm shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Update Order Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="w-5 h-5 text-white" /></button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300 mb-4">Select new status for order #{selectedOrder._id?.slice(0,8)}</p>

              <div className="grid grid-cols-1 gap-2">
                {["pending","confirmed","in_transit","delivered","cancelled"].map(status => {
                  const isActive = newStatus === status;
                  const isUpdating = pageLoading && selectedOrder?.status !== status;
                  return (
                    <button key={status} onClick={() => !pageLoading && handleStatusChange(selectedOrder._id, status)} disabled={pageLoading}
                      className={`p-3 rounded-lg transition-all text-left font-semibold flex items-center justify-between ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'} ${pageLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('_',' ')}</span>
                      </div>
                      {isUpdating && <Loader className="w-4 h-4 animate-spin text-indigo-300" />}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setShowStatusModal(false)} className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
