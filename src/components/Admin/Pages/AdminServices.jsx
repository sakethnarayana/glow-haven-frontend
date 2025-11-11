import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, X, Loader, Clock, Sparkles } from 'lucide-react';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [errors, setErrors] = useState({});

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    category: 'facial',
    image: '',
    discount: '',       // percentage string or number
    featured: false,    // boolean
    videoUrl: '',       // optional video url
  });

  const categories = ['facial', 'haircare', 'massage', 'makeup', 'threading'];
  const durations = ['15', '30', '45', '60', '90', '120'];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services?page=1&limit=100');
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }


    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Service name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';

    const priceNum = parseFloat(formData.price);
    if (formData.price === '' || Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category || String(formData.category).trim() === '') newErrors.category = 'Category is required';
    if (!formData.duration || String(formData.duration).trim() === '') newErrors.duration = 'Duration is required';
    if (!formData.image?.trim()) newErrors.image = 'Image URL is required';

    const discountNum = formData.discount === '' ? 0 : parseFloat(formData.discount);
    if (formData.discount !== '' && (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = async (e) => {
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
        duration: formData.duration,
        category: formData.category,
        image: formData.image.trim(),
        discount: formData.discount === '' ? 0 : parseFloat(formData.discount),
        featured: !!formData.featured,
        videoUrl: formData.videoUrl?.trim() || '',
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
        toast.success('✅ Service updated successfully!');
      } else {
        await api.post('/services', payload);
        toast.success('✅ Service added successfully!');
      }

      resetForm();
      setShowModal(false);
      await fetchServices();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger the custom confirmation modal (instead of window.confirm)
  const handleDeleteService = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) {
      setShowDeleteModal(false);
      return;
    }
    setDeleting(true);
    setPageLoading(true);
    try {
      await api.delete(`/services/${deleteTargetId}`);
      toast.success('✅ Service deleted successfully!');
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      await fetchServices();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
      setPageLoading(false);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);

    // Normalize the incoming service object into the expected formData shape
    const normalized = {
      name: service.name ?? '',
      description: service.description ?? '',
      // convert price to string so the input stays controlled
      price: service.price !== undefined && service.price !== null ? String(service.price) : '',
      // ensure duration is string
      duration: service.duration !== undefined && service.duration !== null ? String(service.duration) : '30',
      // category could be string or object from API — normalize to string
      category:
        typeof service.category === 'object'
          ? (service.category.name ?? service.category._id ?? '')
          : (service.category ?? 'facial'),
      image: service.image ?? '',
      discount: service.discount !== undefined && service.discount !== null ? String(service.discount) : '',
      featured: !!service.featured,
      videoUrl: service.videoUrl ?? '',
    };

    setFormData(normalized);
    setImagePreview(service.image ?? '');
    setVideoPreview(service.videoUrl ?? '');
    setShowModal(true);
    setErrors({});
  };

  const handleImageUrlChange = (url) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
    if (errors.image) setErrors({ ...errors, image: '' });
  };

  const handleVideoUrlChange = (url) => {
    setFormData({ ...formData, videoUrl: url });
    setVideoPreview(url);
    if (errors.videoUrl) setErrors({ ...errors, videoUrl: '' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '30',
      category: 'facial',
      image: '',
      discount: '',
      featured: false,
      videoUrl: '',
    });
    setImagePreview('');
     setVideoPreview('');
    setEditingService(null);
    setErrors({});
  };

  const getCategoryColor = (category) => {
    const colors = {
      facial: 'from-pink-500 to-rose-500',
      haircare: 'from-amber-500 to-orange-500',
      massage: 'from-purple-500 to-violet-500',
      makeup: 'from-fuchsia-500 to-pink-500',
      threading: 'from-cyan-500 to-teal-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const stats = {
    total: services.length,
    avgPrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length) : 0,
    categories: new Set(services.map(s => (typeof s.category === 'object' ? (s.category.name ?? '') : (s.category ?? '')))).size,
    featuredCount: services.filter(s => s.featured).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-spin">
            <Loader className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
      {/* Make sure to render Toaster so your toast() calls show */}
      <Toaster position="top-right" />

      {pageLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
              <Loader className="w-10 h-10 text-gray-900 animate-spin" />
            </div>
            <p className="text-white text-lg font-medium">Please wait...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Services</h1>
            </div>
            <p className="text-gray-400">Manage your beauty services</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-pink-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-300 text-xs font-medium">Total</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <Sparkles className="w-10 h-10 text-pink-500/30" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-purple-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-xs font-medium">Avg Price</p>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.avgPrice}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-500/30" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-teal-900/40 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-cyan-500/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300 text-xs font-medium">Categories</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.categories}</p>
              </div>
              <Sparkles className="w-10 h-10 text-cyan-500/30" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-pink-400 transition-colors" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500 transition-all backdrop-blur-sm text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 text-white transition-all backdrop-blur-sm appearance-none cursor-pointer text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => {
            const normalizedCategory = typeof service.category === 'object' ? (service.category.name ?? '') : (service.category ?? '');
            return (
              <div
                key={service._id}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-gray-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 flex flex-col"
              >
                {/* Image Container */}
                <div className={`relative h-40 bg-gradient-to-br ${getCategoryColor(normalizedCategory)} overflow-hidden`}>
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {normalizedCategory}
                  </div>

                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded text-white font-bold text-sm border border-white/20">
                    ₹{service.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-pink-300 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{service.description}</p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                    <Clock className="w-3 h-3" />
                    {service.duration}m
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800/50 rounded p-2">
                      <p className="text-gray-400">Price</p>
                      <p className="text-rose-400 font-bold">₹{service.price}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <p className="text-gray-400">Time</p>
                      <p className="text-amber-400 font-bold">{service.duration}m</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 mt-auto">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded transition-all duration-300 hover:scale-105 active:scale-95 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded transition-all duration-300 hover:scale-105 active:scale-95 text-xs disabled:opacity-50"
                      disabled={deleting}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <Sparkles className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No services found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit (unchanged except validation/normalization handled above) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-xl shadow-2xl overflow-hidden backdrop-blur-xl my-8">
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">{editingService ? '✏️ Edit Service' : '➕ Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Service Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }}
                    placeholder="e.g., Hydrating Facial"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${errors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }); }}
                    placeholder="Service description..."
                    rows="2"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all resize-none text-sm ${errors.description ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: '' }); }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all text-sm ${errors.price ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Duration *</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => { setFormData({ ...formData, duration: e.target.value }); if (errors.duration) setErrors({ ...errors, duration: '' }); }}
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all appearance-none cursor-pointer text-sm ${errors.duration ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  >
                    {durations.map(dur => (<option key={dur} value={dur}>{dur} minutes</option>))}
                  </select>
                  {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => { setFormData({ ...formData, category: e.target.value }); if (errors.category) setErrors({ ...errors, category: '' }); }}
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition-all appearance-none cursor-pointer text-sm ${errors.category ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  >
                    {categories.map(cat => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}
                  </select>
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                </div>

                 {/* NEW: Discount next to Duration/Category (fits grid) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount}
                    onChange={(e) => { setFormData({ ...formData, discount: e.target.value }); if (errors.discount) setErrors({ ...errors, discount: '' }); }}
                    placeholder="e.g., 10"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${errors.discount ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  />
                  {errors.discount && <p className="text-red-400 text-xs mt-1">{errors.discount}</p>}
                </div>

                {/* Featured checkbox full-width */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-200">Mark as featured (show on home)</label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Image URL *</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${errors.image ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  />
                  {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Demo Video URL (optional)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all text-sm ${errors.videoUrl ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600/50 focus:border-pink-500/50 focus:ring-pink-500/20'}`}
                  />
                  {errors.videoUrl && <p className="text-red-400 text-xs mt-1">{errors.videoUrl}</p>}
                </div>

                {imagePreview && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-200 mb-2">Image Preview</label>
                    <div className="relative w-full h-32 bg-gray-700/50 rounded-lg border border-gray-600/50 overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Invalid+URL'; }}
                      />
                    </div>
                  </div>
                )}
                {videoPreview && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-200 mb-2">Video Preview</label>
                    <div className="relative w-full h-48 bg-gray-800/60 rounded-lg border border-gray-600/50 overflow-hidden">
                      {/* we show an iframe only for youtube links; fallback to link text */}
                      {videoPreview.includes('youtube') || videoPreview.includes('youtu.be') ? (
                        <iframe
                          title="video-preview"
                          src={videoPreview.includes('youtube') ? videoPreview.replace('watch?v=', 'embed/') : videoPreview}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-3 text-sm text-gray-300">Preview not available — <a className="text-blue-300 underline" href={videoPreview} target="_blank" rel="noreferrer">Open link</a></div>
                      )}
                    </div>
                  </div>
                )}


              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-700/50 sticky bottom-0 bg-gray-800/90">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-semibold text-white flex items-center justify-center gap-2 text-sm">
                  {submitting ? (<><Loader className="w-4 h-4 animate-spin" /><span>Saving...</span></>) : (<span>{editingService ? 'Update' : 'Add'}</span>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal (simple English) - responsive */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-gray-900 w-full max-w-md rounded-lg border border-gray-700 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete service?</h3>
            <p className="text-gray-300 text-sm mb-4">Are you sure you want to delete this service? This action cannot be undone.</p>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
