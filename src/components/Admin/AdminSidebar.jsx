
import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Scissors,
  ShoppingCart,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
} from 'lucide-react';

const AdminSidebar = ({ currentPage, onPageChange, isOpen, onToggle }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      color: 'text-green-400',
    },
    {
      id: 'services',
      label: 'Services',
      icon: Scissors,
      color: 'text-purple-400',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      color: 'text-orange-400',
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      color: 'text-pink-400',
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: Clock,
      color: 'text-cyan-400',
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      color: 'text-red-400',
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-16'
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
      >

        {/* Logo/Brand */}
        <div className="h-14 sm:h-16  flex items-center justify-between px-4 border-b border-gray-700">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="text-white font-serif text-lg font-semibold">GlowPrime</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={20}
              className={`text-gray-400 transition-transform ${!isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={20} className={isActive ? 'text-white' : item.color} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        {isOpen && (
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 space-y-2">
              <p>© 2025 GlowPrime Admin</p>
              <p>Version 1.0</p>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default AdminSidebar;













