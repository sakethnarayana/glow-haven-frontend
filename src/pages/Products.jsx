import React, { useState, useEffect } from 'react';
import api from '../config/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/AuthModal';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { useCart } from '../hooks/useCart';

const Products = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, addItem, updateQuantity, removeItem } = useCart();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const productRefs = useRef({});

  // Category Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addingToCartId, setAddingToCartId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?page=${page}&limit=9`);
      console.log('Products Response:', response.data);

      const productsList = response.data?.data?.products || [];
      setProducts(productsList);
      setTotalPages(response.data?.data?.pagination?.pages || 1);

      // Extract unique categories
      const uniqueCategories = [
        'all',
        ...new Set(productsList.map(p => p.category).filter(Boolean))
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  };

  // Get quantity for a product from cart context
  const getProductQuantity = (productId) => {
    const item = cartItems.find(c => c._id === productId || c.productId === productId);
    return item ? item.quantity || 0 : 0;
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      setAuthModalOpen(true);
      return;
    }

    try {
      setAddingToCartId(product._id);
      
      // Use context cart if available
      if (addItem) {
        addItem(product, 1);
        toast.success(`${product.name} added to cart! 🛒`, { duration: 2000 });
      } else {
        // Fallback to localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.productId === product._id);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            productId: product._id,
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
          });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success(`${product.name} added to cart! 🛒`, { duration: 2000 });
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity < 0) return;

      // Use context if available
      if (updateQuantity) {
        if (newQuantity === 0 && removeItem) {
          removeItem(productId);
          toast.success('Item removed from cart');
        } else {
          updateQuantity(productId, newQuantity);
        }
      } else {
        // Fallback to localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const itemIndex = cart.findIndex(item => item.productId === productId);
        
        if (itemIndex === -1) return;

        if (newQuantity === 0) {
          cart.splice(itemIndex, 1);
          toast.success('Item removed from cart');
        } else {
          cart[itemIndex].quantity = newQuantity;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Scroll to highlighted product if query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');

    if (highlightId && productRefs.current[highlightId]) {
      setTimeout(() => {
        productRefs.current[highlightId].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Optional: briefly highlight the product
        productRefs.current[highlightId].classList.add('ring-4', 'ring-pink-400');
        setTimeout(() => {
          productRefs.current[highlightId].classList.remove('ring-4', 'ring-pink-400');
        }, 2000);
      }, 500);
    }
  }, [filteredProducts, location.search]);

  return (
    <div className="space-y-8 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
          Our Premium Products
        </h1>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div className="h-1 w-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded"></div>
        </div>
        <p className="text-gray-600 text-sm md:text-base mt-3">
          Curated skincare essentials for radiant, healthy skin
        </p>
      </div>

      {/* Search, Category & Sort */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                ref={el => (productRefs.current[product._id] = el)}
              >
                <ProductCard
                  item={product}
                  clickable={true}
                  quantity={getProductQuantity(product._id)}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  isAddingToCart={addingToCartId === product._id}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
              >
                Previous
              </button>
              <div className="text-gray-600 font-semibold text-sm sm:text-base">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-600 py-16 bg-gray-50 rounded-xl">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold">No products found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Products;