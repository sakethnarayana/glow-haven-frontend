// // src/pages/Orders.jsx
// import React, { useEffect, useState } from "react";
// import api from "../config/api";
// import LoadingSpinner from "../components/LoadingSpinner";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import { Box, ShoppingBag, Check, XCircle } from "lucide-react"; // small icons (you can remove if not used)

// const STATUS_KEYS = ["all", "delivered", "pending", "cancelled", "other"];

// const formatINR = (val) => {
//   if (val == null) return "-";
//   const n = Number(val);
//   if (isNaN(n)) return val;
//   // Using currency formatting ensures grouping and decimal places
//   return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
// };

// const readableDate = (iso) => {
//   if (!iso) return "-";
//   try {
//     return new Date(iso).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return iso;
//   }
// };

// export default function Orders() {
//   const [orders, setOrders] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [searchText, setSearchText] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [orders, statusFilter, searchText]);

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await api.get("/orders/my-orders");
//       const list = res.data?.data?.orders || [];
//       // sort by updatedAt desc (newest first). fallback to createdAt if updatedAt missing
//       list.sort((a, b) => {
//         const ta = a?.updatedAt
//           ? new Date(a.updatedAt).getTime()
//           : a?.createdAt
//           ? new Date(a.createdAt).getTime()
//           : 0;
//         const tb = b?.updatedAt
//           ? new Date(b.updatedAt).getTime()
//           : b?.createdAt
//           ? new Date(b.createdAt).getTime()
//           : 0;
//         return tb - ta;
//       });
//       setOrders(list);
//     } catch (err) {
//       console.error("Failed to fetch orders", err);
//       setError("Failed to fetch your orders. Please try again later.");
//       toast.error("Failed to fetch your orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let result = [...orders];

//     // status filter
//     if (statusFilter && statusFilter !== "all") {
//       if (statusFilter === "other") {
//         result = result.filter((o) => {
//           const s = (o.status || "").toLowerCase();
//           return s && s !== "delivered" && s !== "pending" && s !== "cancelled";
//         });
//       } else {
//         result = result.filter(
//           (o) => (o.status || "").toLowerCase() === statusFilter
//         );
//       }
//     }

//     // simple search (order id, product name)
//     if (searchText && searchText.trim()) {
//       const q = searchText.trim().toLowerCase();
//       result = result.filter((o) => {
//         const idMatch = (o._id || "").toLowerCase().includes(q);
//         const anyItemMatch = (o.items || []).some((it) =>
//           (it.name || "").toLowerCase().includes(q)
//         );
//         return idMatch || anyItemMatch;
//       });
//     }

//     setFiltered(result);
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (error) {
//     return <div className="text-center text-red-500 py-12">{error}</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-serif">My Orders</h1>
//           <p className="text-gray-600 text-sm">
//             All your purchases — sorted by latest update
//           </p>
//         </div>

//         <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//           {/* Search input */}
//           <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white shadow-sm">
//             <input
//               type="search"
//               placeholder="Search order id / product..."
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               className="px-2 py-1 text-sm w-48 sm:w-64 focus:outline-none"
//             />
//             <button
//               onClick={() => {
//                 setSearchText("");
//               }}
//               className="text-xs text-gray-500 hover:text-gray-700"
//               title="Clear"
//             >
//               Clear
//             </button>
//           </div>

//           {/* Status filter - responsive */}
//           <div className="hidden md:flex items-center gap-2">
//             {STATUS_KEYS.map((k) => (
//               <button
//                 key={k}
//                 onClick={() => setStatusFilter(k)}
//                 className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
//                   statusFilter === k
//                     ? "bg-purple-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
//               </button>
//             ))}
//           </div>

//           {/* Mobile select */}
//           <div className="md:hidden">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-3 py-2 border rounded-md text-sm"
//             >
//               {STATUS_KEYS.map((k) => (
//                 <option value={k} key={k}>
//                   {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Orders list */}
//       {filtered.length === 0 ? (
//         <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
//           <p className="text-gray-700">No orders match your filters.</p>
//           <button
//             onClick={() => navigate("/products")}
//             className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg"
//           >
//             <ShoppingBag className="w-4 h-4" /> Shop products
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
//           {filtered.map((order, idx) => {
//             const status = (order.status || "unknown").toLowerCase();
//             const statusBadge =
//               status === "confirmed"
//                 ? "bg-green-50 text-green-700"
//                 : status === "in_transit"
//                 ? "bg-yellow-50 text-yellow-700"
//                 : status === "cancelled"
//                 ? "bg-red-50 text-red-700"
//                 : "bg-gray-50 text-gray-700";
//             const statusIcons = {
//               confirmed: "✅",
//               in_transit: "⏳",
//               cancelled: "❌",
//               other: "📦",
//               unknown: "❔",
//             };

//             const orderNumber = order.orderNumber || order._id || `#${idx + 1}`;
//             const created = readableDate(order.createdAt);
//             const updated = order.updatedAt
//               ? readableDate(order.updatedAt)
//               : null;

//             return (
//               <article
//                 key={order._id || idx}
//                 className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
//               >
//                 {/* header */}
//                 <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between">
//                   <div className="min-w-0">
//                     <div className="text-sm text-gray-600">Order</div>
//                     <div className="font-semibold text-gray-900 truncate">
//                       {orderNumber}
//                     </div>
//                   </div>

//                   <div
//                     className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge}`}
//                   >
//                     {statusIcons[status]}
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                   </div>
//                 </div>

//                 {/* items */}
//                 <div className="p-5 flex-1">
//                   {Array.isArray(order.items) && order.items.length ? (
//                     <div className="space-y-3">
//                       {order.items.map((it) => (
//                         <div
//                           key={
//                             it._id || it.productId || `${order._id}-${it.name}`
//                           }
//                           className="flex items-start justify-between gap-4"
//                         >
//                           <div className="min-w-0">
//                             <div className="font-semibold text-gray-900 truncate">
//                               {it.name}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               Qty: {it.quantity}
//                             </div>
//                           </div>
//                           <div className="text-right min-w-[90px]">
//                             <div className="font-semibold">
//                               {formatINR(
//                                 it.subtotal ??
//                                   (it.price && it.quantity
//                                     ? it.price * it.quantity
//                                     : 0)
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-sm text-gray-500">
//                       No items listed for this order
//                     </div>
//                   )}

//                   {/* totals */}
//                   <div className="mt-4 border-t pt-4 flex flex-row flex-wrap items-start justify-between gap-3">
//                     {/* Payment Section */}
//                     <div className="flex-1 min-w-[150px]">
//                       <div className="text-xs text-gray-500">Payment</div>
//                       <div className="text-sm text-gray-900">
//                         {order.paymentMethod === "cod"
//                           ? "Cash on Delivery"
//                           : (order.paymentMethod || "").toUpperCase()}
//                       </div>

//                       {updated ? (
//                         <div className="text-xs text-gray-500 mt-1">
//                           Updated: {updated}
//                         </div>
//                       ) : (
//                         <div className="text-xs text-gray-500 mt-1">
//                           Placed: {created}
//                         </div>
//                       )}
//                     </div>

//                     {/* Total Section */}
//                     <div className="text-right flex-1 min-w-[120px]">
//                       <div className="text-xs text-gray-500">Total</div>
//                       <div className="text-2xl font-bold text-gray-900">
//                         {formatINR(order.totalAmount ?? order.total ?? 0)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* footer / actions */}
//                 <div className="px-5 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                   <div className="text-xs text-gray-600">
//                     Order date: {created}
//                   </div>
//                 </div>
//               </article>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }









// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import api from "../config/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShoppingBag, Check, Clock, Truck, XCircle, Search, AlertCircle } from "lucide-react";

const STATUS_KEYS = ["all", "pending", "confirmed", "in_transit", "delivered", "cancelled"];

const formatINR = (val) => {
  if (val == null) return "-";
  const n = Number(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
};

const readableDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const readableTime = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const getStatusStyles = (status) => {
  const s = status?.toLowerCase?.() || "";
  switch (s) {
    case "pending":
      return {
        badge: "bg-slate-100 text-slate-800 border border-slate-300",
        icon: "⏳",
        accent: "from-slate-500 to-slate-600",
        dot: "bg-slate-500",
      };
    case "confirmed":
      return {
        badge: "bg-blue-100 text-blue-800 border border-blue-300",
        icon: "✅",
        accent: "from-blue-500 to-cyan-500",
        dot: "bg-blue-500",
      };
    case "in_transit":
      return {
        badge: "bg-purple-100 text-purple-800 border border-purple-300",
        icon: "🚚",
        accent: "from-purple-500 to-indigo-500",
        dot: "bg-purple-500",
      };
    case "delivered":
      return {
        badge: "bg-green-100 text-green-800 border border-green-300",
        icon: "🎉",
        accent: "from-green-500 to-emerald-500",
        dot: "bg-green-500",
      };
    case "cancelled":
      return {
        badge: "bg-red-100 text-red-800 border border-red-300",
        icon: "❌",
        accent: "from-red-500 to-rose-500",
        dot: "bg-red-500",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800 border border-gray-300",
        icon: "📦",
        accent: "from-gray-500 to-gray-600",
        dot: "bg-gray-500",
      };
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, searchText]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders/my-orders");
      const list = res.data?.data?.orders || [];

      list.sort((a, b) => {
        const ta = a?.updatedAt
          ? new Date(a.updatedAt).getTime()
          : a?.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const tb = b?.updatedAt
          ? new Date(b.updatedAt).getTime()
          : b?.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return tb - ta;
      });

      setOrders(list);
      if (list.length > 0) {
        toast.success(`Loaded ${list.length} order${list.length !== 1 ? "s" : ""} 📦`);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setError("Failed to fetch your orders. Please try again later.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((o) => (o.status || "").toLowerCase() === statusFilter);
    }

    if (searchText && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter((o) => {
        const idMatch = (o._id || "").toLowerCase().includes(q) || (o.orderNumber || "").toLowerCase().includes(q);
        const anyItemMatch = (o.items || []).some((it) => (it.name || "").toLowerCase().includes(q));
        return idMatch || anyItemMatch;
      });
    }

    setFiltered(result);
  };

  const handleRefresh = () => {
    
    fetchOrders();
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
            My Orders
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Track and manage all your purchases
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="search"
              placeholder="Search order ID or product name..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {searchText && (
              <button
                onClick={() => {
                  setSearchText("");
                  setIsSearching(false);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                title="Clear search"
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
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  statusFilter === k
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1).replace("_", " ")}
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
                  {k === "all" ? "All Orders" : k.charAt(0).toUpperCase() + k.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <p>
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{orders.length}</span> order{orders.length !== 1 ? "s" : ""}
          </p>
          {isSearching && (
            <p className="text-purple-600 font-medium">Search active</p>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Orders</h3>
            <p className="text-red-800 text-sm mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {searchText ? "No orders match your search." : "You haven't placed any orders yet."}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((order) => {
            const status = (order.status || "pending").toLowerCase();
            const styles = getStatusStyles(status);
            const orderNumber = order.orderNumber || order._id?.slice(-8) || "#000";
            const created = readableDate(order.createdAt);
            const createdTime = readableTime(order.createdAt);
            const updated = order.updatedAt ? readableDate(order.updatedAt) : null;
            const totalItems = (order.items || []).length;
            const totalQty = (order.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);

            return (
              <article
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${styles.accent} px-5 sm:px-6 py-4 sm:py-5 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 opacity-10 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs sm:text-sm opacity-90 font-medium uppercase tracking-wide">Order</p>
                        <p className="text-lg sm:text-xl font-bold font-mono">#{orderNumber}</p>
                      </div>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${styles.badge}`}>
                        {styles.icon} {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm opacity-90">
                      Placed on {created} at {createdTime}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col gap-5 flex-1">
                  {/* Order Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalItems}</p>
                      <p className="text-xs text-gray-600 mt-1">Product{totalItems !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalQty}</p>
                      <p className="text-xs text-gray-600 mt-1">Item{totalQty !== 1 ? "s" : ""}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${styles.accent} rounded-lg p-3 text-center text-white border border-transparent`}>
                      <p className="text-xl sm:text-2xl font-bold">{styles.icon}</p>
                      <p className="text-xs mt-1 opacity-90 font-medium">Status</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Order Items</p>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {Array.isArray(order.items) && order.items.length ? (
                        order.items.map((it) => (
                          <div
                            key={it._id || it.productId || it.name}
                            className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm truncate">{it.name}</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                <span className="font-medium">Qty:</span> {it.quantity}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900">
                                {formatINR(it.subtotal ?? (it.price && it.quantity ? it.price * it.quantity : 0))}
                              </p>
                              <p className="text-xs text-gray-600">per {it.quantity}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 py-4">No items in this order</p>
                      )}
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl p-4 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Payment Method</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {order.paymentMethod === "cod" ? "💳 Cash on Delivery" : (order.paymentMethod || "").toUpperCase()}
                      </span>
                    </div>

                    {updated && (
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-purple-200">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="text-gray-700 font-medium">{updated}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-lg pt-2 border-t border-purple-200">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatINR(order.totalAmount ?? order.total ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Address Info if available */}
                  {order.deliveryAddress && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Delivery Address</p>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                        <p className="font-medium text-gray-900">{order.deliveryAddress.recipientName || "—"}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{order.deliveryAddress.addressLine || "—"}</p>
                        <p className="text-xs text-gray-600">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t px-5 sm:px-6 py-4 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
                  <p>Order ID: <span className="font-mono font-semibold">{order._id?.slice(-12)}</span></p>
                  <span className={`w-3 h-3 rounded-full ${styles.dot} animate-pulse`} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}