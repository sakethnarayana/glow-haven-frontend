import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Bell, Settings, Package, Calendar, AlertTriangle } from 'lucide-react';

import api from '../../config/api';

const AdminHeader = ({ adminName, onLogout, onMenuToggle }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showNotifications]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setNotifications([]);
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const newNotifications = [];

      // Fetch all bookings to count by status
      try {
        const allBookingsRes = await api.get('/bookings?limit=100', config);
        const allBookings = allBookingsRes.data.data?.bookings || [];

        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
        const inProgressBookings = allBookings.filter(b => b.status === 'in_progress').length;
        const completedBookings = allBookings.filter(b => b.status === 'completed').length;

        if (pendingBookings > 0) {
          newNotifications.push({
            id: 'pending-bookings',
            type: 'booking',
            icon: Calendar,
            message: `${pendingBookings} booking${pendingBookings > 1 ? 's' : ''} pending`,
            time: 'Needs Action',
            priority: 'high',
            link: '/admin/bookings'
          });
        }

        if (inProgressBookings > 0) {
          newNotifications.push({
            id: 'inprogress-bookings',
            type: 'booking',
            icon: Calendar,
            message: `${inProgressBookings} service${inProgressBookings > 1 ? 's' : ''} in progress`,
            time: 'Today',
            priority: 'medium',
            link: '/admin/bookings'
          });
        }

        if (completedBookings > 0) {
          newNotifications.push({
            id: 'completed-bookings',
            type: 'booking',
            icon: Calendar,
            message: `${completedBookings} booking${completedBookings > 1 ? 's' : ''} completed`,
            time: 'Recent',
            priority: 'low',
            link: '/admin/bookings'
          });
        }
      } catch (err) {
        console.error('Error fetching bookings:', err.message);
      }

      // Fetch all orders to count by status and payment
      try {
        const allOrdersRes = await api.get('/orders?limit=100', config);
        const allOrders = allOrdersRes.data.data?.orders || [];

        const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
        const inTransitOrders = allOrders.filter(o => o.status === 'in_transit').length;
        const unpaidOrders = allOrders.filter(o => o.paymentStatus === 'unpaid').length;
        const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;

        if (pendingOrders > 0) {
          newNotifications.push({
            id: 'pending-orders',
            type: 'order',
            icon: Package,
            message: `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} pending`,
            time: 'Needs Action',
            priority: 'high',
            link: '/admin/orders'
          });
        }

        if (unpaidOrders > 0) {
          newNotifications.push({
            id: 'unpaid-orders',
            type: 'payment',
            icon: AlertTriangle,
            message: `${unpaidOrders} order${unpaidOrders > 1 ? 's' : ''} unpaid`,
            time: 'Payment Due',
            priority: 'high',
            link: '/admin/orders'
          });
        }

        if (inTransitOrders > 0) {
          newNotifications.push({
            id: 'transit-orders',
            type: 'order',
            icon: Package,
            message: `${inTransitOrders} order${inTransitOrders > 1 ? 's' : ''} in transit`,
            time: 'Today',
            priority: 'medium',
            link: '/admin/orders'
          });
        }

        if (deliveredOrders > 0) {
          newNotifications.push({
            id: 'delivered-orders',
            type: 'order',
            icon: Package,
            message: `${deliveredOrders} order${deliveredOrders > 1 ? 's' : ''} delivered`,
            time: 'Recent',
            priority: 'low',
            link: '/admin/orders'
          });
        }
      } catch (err) {
        console.error('Error fetching orders:', err.message);
      }

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => n.priority === 'high').length);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    window.location.href = notification.link;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-lg gap-2 sm:gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-1 sm:gap-3 md:gap-4 flex-shrink-0">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} className="sm:w-5 sm:h-5 text-gray-300" />
        </button>
        <h1 className="text-sm sm:text-lg md:text-xl font-serif font-semibold text-white hidden sm:block">
          Admin Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="sm:w-5 sm:h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[9px] sm:text-[10px] font-bold px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            // <div className="fixed right-2 left-2 sm:absolute sm:right-0 sm:left-auto mt-2 w-auto sm:w-80 md:w-96 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-[70vh] sm:max-h-96">
            <div className="fixed left-4 right-4 sm:absolute sm:right-0 sm:left-auto mt-2 w-auto sm:w-80 md:w-96 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-[70vh] sm:max-h-96 p-2 sm:p-0">
              <div className="p-2 sm:p-3 md:p-4 border-b border-gray-600 flex items-center justify-between sticky top-0 bg-gray-700 rounded-t-lg">
                <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <span className="text-xs text-gray-400">{notifications.length}</span>
                )}
              </div>

              <div className="divide-y divide-gray-600 overflow-y-auto max-h-[calc(70vh-50px)] sm:max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 sm:p-6 md:p-8 text-center">
                    <Bell size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                      {loading ? 'Loading...' : 'No notifications'}
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const IconComponent = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="p-2 sm:p-3 md:p-4 hover:bg-gray-600 cursor-pointer transition-colors flex items-start gap-2 sm:gap-3 active:bg-gray-500"
                      >
                        <div className={`mt-0.5 flex-shrink-0 ${getPriorityColor(notif.priority)}`}>
                          <IconComponent size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-200 break-words">
                            {notif.message}
                          </p>
                          <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 mt-0.5">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        {/* <button
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings size={18} className="sm:w-5 sm:h-5 text-gray-300" />
        </button> */}

        {/* Admin Profile - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-700">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {adminName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-sm hidden md:block">
            <p className="text-white font-medium text-sm">{adminName || 'Admin'}</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          aria-label="Logout"
        >
          <LogOut size={16} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;







