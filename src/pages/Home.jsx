// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import api from '../config/api';
import { toast ,Toaster} from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../hooks/useCart';

import { useNavigate,Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import useIsMobile from '../hooks/useIsMobile';

const Home = () => {
  const { addItem, updateQuantity } = useCart();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-section loading states (so spinners match component design)
  const [productsLoading, setProductsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  const productRef = useRef(null);
  const serviceRef = useRef(null);


  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [bookingModalService, setBookingModalService] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setProductsLoading(true);
        setServicesLoading(true);

        const [p, s] = await Promise.all([
          api.get('/products?featured=true&page=1&limit=10'),
          api.get('/services?featured=true&page=1&limit=10'),
        ]);
        setProducts(p.data?.data?.products || p.data?.products || []);
        setServices(s.data?.data?.services || s.data?.services || []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load products and services');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBookService = (service) => {
    if (!isAuthenticated) {
      // save pending and open auth modal
      setPendingBooking(service);
      (onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent('openAuth'))); // use whichever flow you have
      return;
    }

    if (isMobile) {
      // go to booking page with preselected service
      navigate('/bookings/new', { state: { serviceId: service._id } });
    } else {
      setBookingModalService(service);
    }
  };

  const resumePendingBooking = () => {
    if (!pendingBooking) return;
    if (isMobile) {
      navigate('/bookings/new', { state: { serviceId: pendingBooking._id } });
    } else {
      setBookingModalService(pendingBooking);
    }
    setPendingBooking(null);
  };

  React.useEffect(() => {
    const handler = (e) => {
      // Example: AuthModal dispatches 'authSuccess' on login
      if (e?.detail === 'authSuccess') resumePendingBooking();
    };
    window.addEventListener('authSuccess', handler);
    return () => window.removeEventListener('authSuccess', handler);
  }, [pendingBooking, isMobile]);

  const scrollLeft = (ref) => ref.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = (ref) => ref.current?.scrollBy({ left: 300, behavior: 'smooth' });

  return (
    <>
    <section className="relative rounded-2xl overflow-hidden mb-12 shadow-sm">
         <img
           src="/hero1.jpeg"
           className="w-full h-[24rem] md:h-[30rem] object-cover"
           alt="GlowHaven"
           onError={(e)=>{ e.currentTarget.src='https://via.placeholder.com/1200x500?text=GlowHaven'; }}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10"></div>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
           <h1 className="text-4xl md:text-6xl font-serif mb-3">Embrace Your Natural Glow</h1>
           <p className="max-w-xl text-sm md:text-lg opacity-90 mb-6">Simple, modern care for everyday people.</p>
           <div className="flex gap-3">
             <a href="/services" className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-100">Book a Service</a>
             <a href="/products" className="border border-white text-white px-5 py-2 rounded-full hover:bg-white/20">Shop Products</a>
           </div>
         </div>
       </section>
      {/* Hero omitted for brevity — keep as you had */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Featured Products</h2>
            <p className="text-gray-600 text-sm">Curated essentials for everyone</p>
          </div>
          <a href="/products" className="text-sm text-gray-700 hover:text-black underline underline-offset-4">View all &gt;</a>
        </div>

        {loading ? <LoadingSpinner /> : products.length ? (
          <div className="relative">
            <button onClick={() => scrollLeft(productRef)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow justify-center items-center z-10 hover:bg-gray-100">&#10094;</button>

            <div ref={productRef} className="flex gap-4 overflow-x-auto px-1 md:px-2 scrollbar-hide snap-x snap-mandatory">
              {/* {products.map(p => (
                <div key={p._id} className="snap-start flex-shrink-0 w-[270px] md:w-[300px]">
                  <ProductCard item={p} clickable />
                </div>
              ))} */}
              {products.map(p => (
                <div
                  key={p._id}
                  className="snap-start flex-shrink-0 w-[270px] md:w-[300px]"
                  onClick={() => {
                    toast.loading('Opening product...', { id: 'open-product' });
                    navigate(`/products/${p._id}`);
                    setTimeout(() => toast.remove('open-product'), 1000);
                  }}
                >
                  <ProductCard item={p} clickable />
                </div>
              ))}

            </div>

            <button onClick={() => scrollRight(productRef)} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow justify-center items-center z-10 hover:bg-gray-100">&#10095;</button>
          </div>
        ) : <p className="text-center text-gray-600">No products available</p>}
      </section>

      {/* Services section similar — see previous code or use ServiceCard */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Our Services</h2>
            <p className="text-gray-600 text-sm">Professional treatments, simple booking</p>
          </div>
          <a href="/services" className="text-sm text-gray-700 hover:text-black underline underline-offset-4">View all &gt;</a>
        </div>

        {loading ? <LoadingSpinner /> : services.length ? (
          <div className="relative">
            <div ref={serviceRef} className="flex gap-4 overflow-x-auto px-1 md:px-2 scrollbar-hide snap-x snap-mandatory">
              {/* {services.map(s => (
                <div key={s._id} className="snap-start flex-shrink-0 w-[270px] md:w-[300px]">
                  <ServiceCard item={s} clickable onBook={() => navigate(`/services?highlight=${s._id}`) } />
                </div>
              ))} */}

              {services.map((s) => (
                <div
                  key={s._id}
                  className="snap-start flex-shrink-0 w-[270px] md:w-[300px]"
                >
                  <Link
                    to={`/services/${s._id}`}
                    className="block no-underline"
                    onClick={(e) => {
                      // Only prevent default if clicking the Book button
                      if (!e.target.closest('button')) {
                        // Allow link navigation
                      }
                    }}
                  >
                    <ServiceCard
                      item={s}
                      clickable={true}
                      onBook={(service, e) => handleBookService(service, e)}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-center text-gray-600">No services available</p>}
      </section>

      {bookingModalService && (
        <BookingModal
          service={bookingModalService}
          onClose={() => setBookingModalService(null)}
        />
      )}
     {/* why us */}
       <section className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
         <h2 className="text-2xl md:text-3xl font-serif text-center mb-8 text-gray-900">Why Choose GlowHaven</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             {icon:'✨', title:'Quality Products', text:'Natural, gentle and effective.'},
             {icon:'🧖', title:'Expert Care', text:'Experienced professionals guided by you.'},
             {icon:'📱', title:'Easy on Mobile', text:'Fast, responsive and friendly.'},
           ].map((b)=>(
             <div key={b.title} className="p-6 bg-[#fafafa] rounded-xl border border-gray-200 text-center">
               <div className="text-4xl mb-3">{b.icon}</div>
               <h3 className="font-semibold mb-1">{b.title}</h3>
               <p className="text-gray-600 text-sm">{b.text}</p>
             </div>
         ))}
        </div>
       </section>
    </>
  );
};

export default Home;
