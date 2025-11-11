// src/components/ServiceCard.jsx
import React from 'react';
import { Calendar, Clock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ServiceCard = ({ item, onBook, isBooking = false, clickable = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // const onCardClick = () => clickable && navigate(`/services?highlight=${item._id}`);

  const onCardClick = () => {
    if (!clickable) return;
    navigate(`/services/${item._id}`);
  };
  const openAuth = () => window.dispatchEvent(new Event('app:openAuth'));

  const handleBook = (e) => {
    e?.stopPropagation();
    if (!isAuthenticated) return openAuth();
    if (typeof onBook === 'function') onBook(item);
  };

  return (
    <div onClick={onCardClick} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col h-[360px] md:h-[420px] cursor-pointer">
      <div className="relative h-44 md:h-56 overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
        <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e)=>e.currentTarget.src='https://via.placeholder.com/400x300?text=Service+Image'} />
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 rounded-full shadow"><p className="text-sm font-bold">₹{item.price}</p></div>
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description || 'Professional beauty treatment by expert stylists'}</p>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>{item.duration+' mins' || '60 mins'}</span>
          </div>

          <div className="w-36">
            <button onClick={handleBook} disabled={isBooking} className={`w-full font-semibold py-2 rounded-lg ${isBooking ? 'bg-purple-400 text-white cursor-wait' : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-md'}`}>
              {isBooking ? (<><Loader className="w-4 h-4 animate-spin" /> Booking...</>) : (<><Calendar className="w-4 h-4 inline-block mr-2" /> Book</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;











