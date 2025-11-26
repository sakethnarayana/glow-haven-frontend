// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Services from './pages/Services';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Bookings from './pages/Bookings';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import ServiceDetail from './pages/ServiceDetail';
import ProductDetail from './pages/ProductDetail';

function AppContent() {
  return (
    <Routes>
      <Route path="/*" element={
        <div className="min-h-screen bg-[#fbfbf9]">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />   {/* <-- NEW ROUTE */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="*" element={<div className="text-center py-20">Page not found</div>} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      } />
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}



















