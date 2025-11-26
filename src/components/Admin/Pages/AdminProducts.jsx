
import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import { Toaster, toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, Loader, TrendingUp, Package } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteTarget, setDeleteTarget] = useState(null);
const [deleting, setDeleting] = useState(false);


  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'skincare',
    stock: '',
    image: '',
    discount: '',    // new (percentage)
    featured: false, // new (boolean)
  });

  const categories = ['skincare', 'haircare', 'supplements', 'makeup'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?page=1&limit=100');
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';

    const priceNum = parseFloat(formData.price);
    if (formData.price === '' || Number.isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category) newErrors.category = 'Category is required';

    const stockNum = parseInt(formData.stock);
    if (formData.stock === '' || Number.isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Valid stock is required';
    }

    if (!formData.image?.trim()) newErrors.image = 'Image URL is required';

    const discountNum = formData.discount === '' ? 0 : parseFloat(formData.discount);
    if (formData.discount !== '' && (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image.trim(),
        discount: formData.discount === '' ? 0 : parseFloat(formData.discount),
        featured: !!formData.featured,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('✅ Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('✅ Product added successfully!');
      }

      resetForm();
      setShowModal(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = (product) => {
  setDeleteTarget(product);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!deleteTarget?._id) return;
  setDeleting(true);
  try {
    await api.delete(`/products/${deleteTarget._id}`);
    toast.success(`✅ "${deleteTarget.name}" deleted successfully!`);
    await fetchProducts();
  } catch (err) {
    toast.error("Failed to delete product");
  } finally {
    setDeleting(false);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }
};

  const handleEditProduct = (product) => {
    setEditingProduct(product);

    // ✅ Normalize values to avoid validation bug
    setFormData({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price !== undefined ? String(product.price) : '',
      category: product.category ?? 'skincare',
      stock: product.stock !== undefined ? String(product.stock) : '',
      image: product.image ?? '',
      discount:product.discount ?? 0,
      featured:product.featured 
    });

    setImagePreview(product.image ?? '');
    setShowModal(true);
    setErrors({});
  };


  const handleImageUrlChange = (url) => {
    setFormData({...formData, image: url});
    setImagePreview(url);
    if (errors.image) setErrors({...errors, image: ''});
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'skincare',
      stock: '',
      image: '',
      discount:0,
      featured:false
    });
    setImagePreview('');
    setEditingProduct(null);
    setErrors({});
  };

  const getCategoryColor = (category) => {
    const colors = {
      skincare: 'from-blue-500 to-cyan-500',
      haircare: 'from-pink-500 to-rose-500',
      supplements: 'from-purple-500 to-indigo-500',
      makeup: 'from-orange-500 to-red-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getStockColor = (stock) => {
    if (stock > 10) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (stock > 5) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (stock > 0) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock < 5).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin">
            <Loader className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
      <Toaster position="top-right" />
      {pageLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
              <Loader className="w-10 h-10 text-gray-900 animate-spin" />
            </div>
            <p className="text-white text-lg font-medium">Please wait...</p>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-sm rounded-lg border border-gray-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">
             { `Delete "${deleteTarget?.name}" ?`}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              This product will be permanently deleted. This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg text-white font-semibold disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Products</h1>
            </div>
            <p className="text-gray-400">Manage your beauty products inventory</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-blue-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-xs font-medium">Total</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500/30" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-orange-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-xs font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.lowStock}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500/30" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-green-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-xs font-medium">Total Value</p>
                <p className="text-xl font-bold text-white mt-1">₹{(stats.totalValue/100000).toFixed(1)}L</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all backdrop-blur-sm text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white transition-all backdrop-blur-sm appearance-none cursor-pointer text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Products Grid - NOW 4 COLUMNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-gray-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 flex flex-col"
            >
              {/* Image Container - IMPROVED */}
              <div className={`relative h-40 bg-gradient-to-br ${getCategoryColor(product.category)} overflow-hidden`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {product.category}
                </div>

                {/* Price Overlay */}
                <div className="absolute bottom-2 right-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded text-white font-bold text-sm border border-white/20">
                  ₹{product.price}
                </div>
              </div>

              {/* Content - SCROLLABLE */}
              <div className="p-3 space-y-2 flex-1 flex flex-col">
                {/* Title */}
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">
                    {product.description}
                  </p>
                </div>

                {/* Stock Badge */}
                <div className={`inline-flex px-2 py-1 rounded text-xs font-semibold border w-fit ${getStockColor(product.stock)}`}>
                  {product.stock} units
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-gray-400">Value</p>
                    <p className="text-emerald-400 font-bold">₹{(product.price * product.stock).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-gray-400">Per Unit</p>
                    <p className="text-blue-400 font-bold">₹{product.price}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 mt-auto">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded transition-all duration-300 hover:scale-105 active:scale-95 text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded transition-all duration-300 hover:scale-105 active:scale-95 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No products found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modal - SCROLLABLE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-xl shadow-2xl overflow-hidden backdrop-blur-xl my-8">
            {/* Modal Header - STICKY */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content - SCROLLABLE */}
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Form Fields */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      if (errors.name) setErrors({...errors, name: ''});
                    }}
                    placeholder="e.g., Hydrating Face Serum"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${
                      errors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({...formData, description: e.target.value});
                      if (errors.description) setErrors({...errors, description: ''});
                    }}
                    placeholder="Product description..."
                    rows="2"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all resize-none text-sm ${
                      errors.description ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({...formData, price: e.target.value});
                      if (errors.price) setErrors({...errors, price: ''});
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all text-sm ${
                      errors.price ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({...formData, category: e.target.value});
                      if (errors.category) setErrors({...errors, category: ''});
                    }}
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all appearance-none cursor-pointer text-sm ${
                      errors.category ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => {
                      setFormData({...formData, stock: e.target.value});
                      if (errors.stock) setErrors({...errors, stock: ''});
                    }}
                    placeholder="0"
                    min="0"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all text-sm ${
                      errors.stock ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                </div>

                {/* NEW Row: Discount & Stock side-by-side */}
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount}
                    onChange={(e) => {
                      setFormData({...formData, discount: e.target.value});
                      if (errors.discount) setErrors({...errors, discount: ''});
                    }}
                    placeholder="e.g., 10"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${
                      errors.discount ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.discount && <p className="text-red-400 text-xs mt-1">{errors.discount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => {
                      setFormData({...formData, stock: e.target.value});
                      if (errors.stock) setErrors({...errors, stock: ''});
                    }}
                    placeholder="0"
                    min="0"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all text-sm ${
                      errors.stock ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                </div>

                {/* Featured checkbox full-width row so it's clearly visible */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-200">Mark as featured (show on home)</label>
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Image URL *</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${
                      errors.image ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-200 mb-2">Image Preview</label>
                    <div className="relative w-full h-32 bg-gray-700/50 rounded-lg border border-gray-600/50 overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=Invalid+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions - STICKY BOTTOM */}
              <div className="flex gap-2 pt-4 border-t border-gray-700/50 sticky bottom-0 bg-gray-800/90">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-semibold text-white flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update' : 'Add'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;