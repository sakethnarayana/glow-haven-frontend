import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation,Link } from 'react-router-dom';
import api from '../config/api';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/AuthModal';
import { Sparkles, Calendar, Search } from 'lucide-react';
import BookingModal from '../components/BookingModal';

const Services = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const [redirectPending, setRedirectPending] = useState(false);
  const [selectedService, setSelectedService] = useState(null);


  const serviceRefs = useRef({});

  // 🧭 Fetch services
  useEffect(() => {
    fetchServices();
  }, [page]);

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchTerm, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services?page=${page}&limit=9`);
      const servicesList = response.data?.data?.services || response.data?.services || [];
      setServices(servicesList);
      setTotalPages(response.data?.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // 🧹 Fixed filter + sort (no mutation)
  const filterAndSortServices = () => {
    let filtered = [...services];

    // 🔍 Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(lower) ||
          s.description?.toLowerCase().includes(lower)
      );
    }

    // 🔢 Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const aDuration = parseInt(a.duration) || 0;
          const bDuration = parseInt(b.duration) || 0;
          return aDuration - bDuration;
        });
        break;
      default:
        break;
    }

    setFilteredServices(filtered);
  };


  const handleBookService = (service) => {
  if (!isAuthenticated) {
    toast.error('Please login to book a service');
    setAuthModalOpen(true);
    return;
  }

  // open booking modal
  setSelectedService(service);
};


  // 🌸 Scroll & highlight when coming from Home
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');

    if (highlightId && serviceRefs.current[highlightId]) {
      setTimeout(() => {
        const target = serviceRefs.current[highlightId];
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ring-4', 'ring-pink-400');
        setTimeout(() => {
          target.classList.remove('ring-4', 'ring-pink-400');
        }, 2000);
      }, 600);
    }
  }, [filteredServices, location.search]);




  return (
    <div className="space-y-8">
      {/* 🏷️ Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
          Our Premium Services
        </h1>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-1 w-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded"></div>
          <Sparkles className="w-5 h-5 text-pink-600" />
          <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
        </div>
        <p className="text-gray-600 text-sm md:text-base mt-3">
          Professional beauty treatments tailored for you
        </p>
      </div>

      {/* 🔍 Search & Sort */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration">Duration: Short to Long</option>
          </select>
        </div>
      </div>

      {/* 💆 Services Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredServices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* {filteredServices.map((service) => (
              <div
                key={service._id}
                ref={(el) => (serviceRefs.current[service._id] = el)}
              >
                <ServiceCard
                  item={service}
                  onBook={handleBookService}
                  isBooking={bookingServiceId === service._id}
                />
              </div>
            ))} */}

            {/* {filteredServices.map((service) => (
              <div
                key={service._id}
                ref={(el) => (serviceRefs.current[service._id] = el)}
                onClick={() => navigate(`/services/${service._id}`)} // 👈 navigate to detail page
                className="cursor-pointer"
              >
                <ServiceCard
                  item={service}
                  onBook={(s, e) => { 
                    e?.stopPropagation?.(); // stop click bubbling so Book button doesn't trigger navigation
                    handleBookService(service); 
                  }}
                  isBooking={bookingServiceId === service._id}
                />
              </div>
            ))} */}

            {filteredServices.map((service) => (
  <div key={service._id} ref={(el) => (serviceRefs.current[service._id] = el)}>
    <Link to={`/services/${service._id}`} className="block cursor-pointer">
      <ServiceCard
        item={service}
        onBook={(s, e) => {
          e?.stopPropagation?.(); // ensure Book action doesn't follow link
          handleBookService(service);
        }}
        isBooking={bookingServiceId === service._id}
      />
    </Link>
  </div>
))}

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                Previous
              </button>
              <div className="text-gray-600 font-semibold">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-600 py-16 bg-gray-50 rounded-xl">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold">No services found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* 🔐 Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
          {selectedService && (
  <BookingModal
    service={selectedService}
    onClose={() => setSelectedService(null)}
  />
)}
    </div>
  );
};

export default Services;
