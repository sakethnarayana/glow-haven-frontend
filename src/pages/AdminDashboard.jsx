
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../config/api';
import { toast } from 'react-hot-toast';

// Admin Components
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminHeader from '../components/Admin/AdminHeader';
import DashboardOverview from '../components/Admin/Pages/DashboardOverview';
import AdminProducts from '../components/Admin/Pages/AdminProducts';
import AdminServices from '../components/Admin/Pages/AdminServices';
import AdminOrders from '../components/Admin/Pages/AdminOrders';
import AdminBookings from '../components/Admin/Pages/AdminBookings';
import AdminAvailability from '../components/Admin/Pages/AdminAvailability';
import AdminUsers from '../components/Admin/Pages/AdminUsers';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized: Admin access required');
      navigate('/');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader 
          adminName={user?.name}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && <DashboardOverview />}
          {currentPage === 'products' && <AdminProducts />}
          {currentPage === 'services' && <AdminServices />}
          {currentPage === 'orders' && <AdminOrders />}
          {currentPage === 'bookings' && <AdminBookings />}
          {currentPage === 'availability' && <AdminAvailability />}
          {currentPage === 'users' && <AdminUsers />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;