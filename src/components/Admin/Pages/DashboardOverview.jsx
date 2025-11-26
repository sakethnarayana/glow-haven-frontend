
import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner1 from '../../../components/LoadingSpinner1';
import StatCard from '../Components/StatCard';
import RecentOrdersWidget from '../Components/RecentOrdersWidget';
import RecentBookingsWidget from '../Components/RecentBookingsWidget';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Users,
  Package,
  Activity,
  Zap,
  Award,
} from 'lucide-react';


const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  
  // Stats
  const [productStats, setProductStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  
  // Data
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topServices, setTopServices] = useState([]);


  useEffect(() => {
    fetchAllDashboardData();
  }, []);


  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);


      // Fetch all stats in parallel
      const [
        productRes,
        orderRes,
        bookingRes,
        ordersListRes,
        bookingsListRes,
        salesRes,
      ] = await Promise.all([
        api.get('/products/admin/stats'),
        api.get('/orders/admin/stats'),
        api.get('/bookings/admin/stats'),
        api.get('/orders?page=1&limit=5'),
        api.get('/bookings?page=1&limit=5'),
        api.get('/orders/admin/sales-report'),
      ]);


      setProductStats(productRes.data.data);
      setOrderStats(orderRes.data.data);
      setBookingStats(bookingRes.data.data);
      setOrders(ordersListRes.data.data?.orders || []);
      setBookings(bookingsListRes.data.data?.bookings || []);
      setSalesReport(salesRes.data.data);


      // Process top products
      if (productRes.data.data?.topProducts) {
        setTopProducts(productRes.data.data.topProducts);
      }


      // Process top services
      if (bookingRes.data.data?.byService) {
        setTopServices(bookingRes.data.data.byService.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAllDashboardData();
      toast.success('Dashboard refreshed!');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };


  // Format chart data for daily revenue
  const getDailyRevenueChart = () => {
    if (!salesReport?.dailyRevenue) return [];
    return salesReport.dailyRevenue.slice(-7).map(item => ({
      date: new Date(item._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: item.revenue,
      orders: item.orders,
    }));
  };


  // Format chart data for order status
  const getOrderStatusChart = () => {
    if (!orderStats?.byStatus) return [];
    return orderStats.byStatus.map(item => ({
      name: item._id,
      count: item.count,
      revenue: item.total,
    }));
  };


  // Format chart data for booking status
  const getBookingStatusChart = () => {
    if (!bookingStats?.byStatus) return [];
    return bookingStats.byStatus.map(item => ({
      name: item._id,
      count: item.count,
    }));
  };


  // Format product distribution
  const getProductCategoryChart = () => {
    if (!productStats?.byCategory) return [];
    return productStats.byCategory.slice(0, 5).map(item => ({
      name: item._id || 'Uncategorized',
      products: item.count,
      avgPrice: Math.round(item.avgPrice),
    }));
  };


  if (loading) {
    return <LoadingSpinner1 />;
  }


  const totalRevenue = orderStats?.totalRevenue?.[0]?.total || 0;
  const avgOrderValue = orderStats?.averageOrderValue?.[0]?.average || 0;
  const totalOrders = orderStats?.totalOrders?.[0]?.count || 0;
  const totalBookings = bookingStats?.totalBookings?.[0]?.count || 0;
  const totalProducts = productStats?.totalProducts?.[0]?.count || 0;
  const avgBookingValue = bookingStats?.averageBookingValue?.[0]?.average || 0;


  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];


  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6 space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-2">Welcome back! Here's your business overview.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2 font-semibold text-sm sm:text-base whitespace-nowrap ${
            refreshing ? 'animate-spin' : ''
          }`}
          title="Refresh dashboard"
        >
          <Zap size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">{refreshing ? 'Loading...' : 'Refresh'}</span>
          <span className="sm:hidden">{refreshing ? '...' : 'Refresh'}</span>
        </button>
      </div>


      {/* Top KPI Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />}
          trend="+12.5%"
          trendUp={true}
          color="from-green-500/20 to-emerald-500/20"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />}
          trend="+8.2%"
          trendUp={true}
          color="from-blue-500/20 to-cyan-500/20"
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />}
          trend="+5.3%"
          trendUp={true}
          color="from-pink-500/20 to-rose-500/20"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />}
          trend="+2.1%"
          trendUp={true}
          color="from-purple-500/20 to-pink-500/20"
        />
      </div>


      {/* Secondary KPI Stats - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Avg Order Value</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">₹{Math.round(avgOrderValue)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Avg Booking Value</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">₹{Math.round(avgBookingValue)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-pink-500/20 rounded-lg">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalProducts}</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>


      {/* Charts Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Revenue Trend */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm sm:text-lg font-semibold">Daily Revenue Trend</h3>
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={getDailyRevenueChart()}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>


        {/* Order Status Distribution */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm sm:text-lg font-semibold">Order Status</h3>
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getOrderStatusChart()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Product Category Distribution */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm sm:text-lg font-semibold">Products by Category</h3>
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={getProductCategoryChart()}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" style={{ fontSize: '10px' }} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="products" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* Booking Status Pie Chart */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm sm:text-lg font-semibold">Booking Status</h3>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 flex-shrink-0" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getBookingStatusChart()}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Top Performing Products & Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Products */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm sm:text-lg font-semibold">Top Products</h3>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-blue-400 flex-shrink-0">#{index + 1}</span>
                    <span className="text-white font-medium text-sm sm:text-base truncate">{product.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Stock: {product.stock} units</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-sm sm:text-lg font-bold text-green-400">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Top Services */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm sm:text-lg font-semibold">Top Services</h3>
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 flex-shrink-0" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topServices.slice(0, 5).map((service, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-pink-400 flex-shrink-0">#{index + 1}</span>
                    <span className="text-white font-medium text-sm sm:text-base truncate">{service._id}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{service.count} bookings</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-sm sm:text-lg font-bold text-pink-400">₹{Math.round(service.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Recent Orders and Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <RecentOrdersWidget orders={orders} />
        <RecentBookingsWidget bookings={bookings} />
      </div>


      {/* Payment Method & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Payment Methods */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm">
          <h3 className="text-white text-sm sm:text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-2">
            {orderStats?.byPaymentMethod?.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/30 rounded-lg">
                <span className="text-gray-300 text-xs sm:text-sm">{method._id === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-white font-semibold text-xs sm:text-sm">{method.count}</span>
                  <span className="text-green-400 font-bold text-xs sm:text-sm">₹{(method.total / 1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Quick Insights */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-3 sm:p-6 backdrop-blur-sm">
          <h3 className="text-white text-sm sm:text-lg font-semibold mb-4">Quick Insights</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="p-2 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-xs sm:text-sm font-medium">💡 Highest Revenue Day</p>
              <p className="text-white font-bold mt-1 text-sm sm:text-base">
                ₹{(salesReport?.dailyRevenue?.reduce((max, day) => day.revenue > max.revenue ? day : max, salesReport.dailyRevenue[0])?.revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-300 text-xs sm:text-sm font-medium">✅ Total Completed Orders</p>
              <p className="text-white font-bold mt-1 text-sm sm:text-base">
                {orderStats?.byStatus?.find(s => s._id === 'delivered')?.count || 0}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
              <p className="text-pink-300 text-xs sm:text-sm font-medium">📅 Total Completed Bookings</p>
              <p className="text-white font-bold mt-1 text-sm sm:text-base">
                {bookingStats?.byStatus?.find(s => s._id === 'completed')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Loading Overlay - Shows when refreshing */}
      {refreshing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-white font-semibold text-sm sm:text-base">Refreshing Dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};


export default DashboardOverview;