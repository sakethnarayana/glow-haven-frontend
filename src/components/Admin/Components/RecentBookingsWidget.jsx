
import React from 'react';
import { Calendar } from 'lucide-react';

const RecentBookingsWidget = ({ bookings }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold flex items-center space-x-2">
          <Calendar size={20} />
          <span>Recent Bookings</span>
        </h3>
        <a href="/admin/bookings" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View All
        </a>
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex-1">
                <p className="text-white font-medium">{booking.serviceName}</p>
                <p className="text-gray-400 text-sm">
                  {booking.date} at {booking.time}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentBookingsWidget;