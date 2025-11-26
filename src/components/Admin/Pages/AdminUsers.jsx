

import React, { useState, useEffect, useRef } from 'react';
import api from '../../../config/api';
import { Toaster, toast } from 'react-hot-toast';
import {
  Search, X, Loader, Users, Phone, Calendar, Eye,
  MoreVertical, ShoppingCart, Clock, User as UserIcon,
  Lock, Trash2
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);        // full page loading
  const [pageLoading, setPageLoading] = useState(false); // overlay for page actions

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // debounce to smooth UI
  const [roleFilter, setRoleFilter] = useState('all');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userSummaries, setUserSummaries] = useState({});      // { [userId]: { orderCount, bookingCount } }
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({}); // { [userId]: boolean }
  const [cardActionLoading, setCardActionLoading] = useState({}); // per-card action loader e.g., view

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortFetchRef = useRef(null);
  const roles = ['all', 'user', 'admin'];

  // Helper: better toast message extraction
  const extractMessage = (error, fallback = 'Something went wrong') =>
    error?.response?.data?.message || error?.message || fallback;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch users with pagination
  const fetchUsers = async (signal) => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: { page, limit: 12 },
        signal,
      });

      const respUsers = response.data.users || [];
      setUsers(respUsers);
      setTotalPages(response.data?.pagination?.pages ?? 1);

      // Prefetch summaries (non-blocking)
      respUsers.forEach((u) => fetchUserSummary(u._id));
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        // ignore aborted requests
      } else {
        console.error('Error fetching users:', error);
        toast.error(extractMessage(error, 'Failed to load users'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users whenever page changes
  useEffect(() => {
    if (abortFetchRef.current) abortFetchRef.current.abort();
    const controller = new AbortController();
    abortFetchRef.current = controller;
    fetchUsers(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Client-side filter (using debounced search)
  useEffect(() => {
    let filtered = users;

    if (roleFilter !== 'all') filtered = filtered.filter(u => u.role === roleFilter);

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase?.().includes(term) ||
        String(u.phone || '').includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [users, debouncedSearch, roleFilter]);

  // Fetch a minimal summary for a card (orders/bookings counts). Cache results.
  const fetchUserSummary = async (userId) => {
    if (userSummaries[userId] || summaryLoadingMap[userId]) return;
    setSummaryLoadingMap(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await api.get(`/users/${userId}/summary`);
      const data = res.data?.data || res.data;
      if (data) {
        setUserSummaries(prev => ({ ...prev, [userId]: data }));
      }
    } catch (error) {
      console.warn('Failed to fetch summary for', userId, extractMessage(error));
    } finally {
      setSummaryLoadingMap(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Open details without re-fetching /users/:id (we already have user object).
  // Only (lazily) fetch summary if needed.
  const handleUserClick = (user) => {
    if (cardActionLoading[user._id]) return;
    setCardActionLoading(prev => ({ ...prev, [user._id]: true }));

    setSelectedUser(user);
    setShowDetailModal(true);

    // Ensure summary exists (non-blocking)
    fetchUserSummary(user._id)
      .finally(() => setCardActionLoading(prev => ({ ...prev, [user._id]: false })));
  };

  // Trigger delete confirmation modal
  const handleAskDeleteUser = (user) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setPageLoading(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success(`✅ User "${deleteTarget.name}" deleted successfully!`);
      setShowDetailModal(false);
      setSelectedUser(null);
      setDeleteTarget(null);

      // Refresh list
      if (abortFetchRef.current) abortFetchRef.current.abort();
      const ctrl = new AbortController();
      abortFetchRef.current = ctrl;
      await fetchUsers(ctrl.signal);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(extractMessage(error, 'Failed to delete user'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setPageLoading(false);
    }
  };

  // Small inline spinner
  const SmallLoader = ({ className }) => (
    <Loader className={`w-4 h-4 animate-spin ${className || 'text-blue-400'}`} />
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-900 p-3 sm:p-6">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 sm:p-6 text-white">
            <div className="flex items-center gap-2 sm:gap-3 justify-between flex-col sm:flex-row">
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                <div className="flex-1 sm:flex-none">
                  <div className="h-5 sm:h-6 w-32 sm:w-48 bg-blue-400/30 rounded-md animate-pulse" />
                  <div className="h-3 w-40 sm:w-80 bg-blue-400/20 rounded-md mt-2 animate-pulse hidden sm:block" />
                </div>
              </div>
              <div className="h-10 w-24 bg-white/20 rounded-md animate-pulse flex-shrink-0" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <div className="h-4 sm:h-6 bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-6 sm:h-8 bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden p-3 sm:p-4 animate-pulse">
                <div className="h-5 sm:h-6 bg-gray-700 rounded w-2/3 mb-2 sm:mb-3" />
                <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2 mb-1" />
                <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/3 mt-2" />
                <div className="h-8 sm:h-10 bg-gray-700 rounded mt-3 sm:mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.active !== false).length,
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-3 sm:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 justify-between flex-col sm:flex-row">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 hidden sm:block">
                  Monitor and manage user accounts
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPage(1);
                if (abortFetchRef.current) abortFetchRef.current.abort();
                const ctrl = new AbortController();
                abortFetchRef.current = ctrl;
                fetchUsers(ctrl.signal);
              }}
              className="px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all font-semibold text-sm sm:text-base whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm hover:border-blue-500/60 transition-all">
            <p className="text-blue-300 text-xs sm:text-sm font-medium">Total Users</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm hover:border-purple-500/60 transition-all">
            <p className="text-purple-300 text-xs sm:text-sm font-medium">Administrators</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">{stats.admins}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border border-cyan-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm hover:border-cyan-500/60 transition-all">
            <p className="text-cyan-300 text-xs sm:text-sm font-medium">Regular Users</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">{stats.regularUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 border border-emerald-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm hover:border-emerald-500/60 transition-all">
            <p className="text-emerald-300 text-xs sm:text-sm font-medium">Active Users</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">{stats.active}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all backdrop-blur-sm text-sm"
            />
          </div>
          {/* <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => { setRoleFilter(role); setPage(1); }}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm whitespace-nowrap flex-1 sm:flex-none ${
                  roleFilter === role
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:border-gray-600/80'
                }`}
              >
                {role === 'all' ? 'All' : role === 'admin' ? 'Admin' : 'User'}
              </button>
            ))}
          </div> */}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const roleBadge = (role) => {
                const badges = {
                  admin: { bg: 'bg-gradient-to-r from-purple-600/20 to-pink-600/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: <Lock size={12} /> },
                  user: { bg: 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: <UserIcon size={12} /> }
                };
                return badges[role] || badges.user;
              };
              const rb = roleBadge(user.role);
              const summary = userSummaries[user._id];

              return (
                <div
                  key={user._id}
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-gray-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  {/* Header */}
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">{user.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 mt-1 truncate">
                          <Phone size={12} className="flex-shrink-0" />
                          {user.phone}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUserClick(user); }}
                        className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          Joined:
                        </span>
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <UserIcon size={12} />
                          Role:
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${rb.bg} ${rb.text} ${rb.border}`}>
                          {rb.icon}
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2 border border-gray-700/30">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <ShoppingCart size={12} />
                          Orders:
                        </span>
                        <span className="font-bold text-cyan-400 text-xs sm:text-sm">
                          {summary ? summary.orderCount ?? 0 : (summaryLoadingMap[user._id] ? <SmallLoader/> : '—')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm pt-1 sm:pt-2 border-t border-gray-700">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          Bookings:
                        </span>
                        <span className="font-bold text-blue-400 text-xs sm:text-sm">
                          {summary ? summary.bookingCount ?? 0 : (summaryLoadingMap[user._id] ? <SmallLoader/> : '—')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleUserClick(user); }}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-2"
                      disabled={!!cardActionLoading[user._id]}
                    >
                      {cardActionLoading[user._id] ? (
                        <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <Eye size={14} />
                          <span>View Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-20">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mb-3 sm:mb-4" />
              <p className="text-gray-400 text-base sm:text-lg">No users found</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 flex-wrap">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 bg-gray-800/50 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-all border border-gray-700/50 text-xs sm:text-sm"
            >
              Prev
            </button>
            <div className="text-gray-400 text-xs sm:text-sm">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 sm:px-4 py-2 bg-gray-800/50 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-all border border-gray-700/50 text-xs sm:text-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 w-full max-w-2xl sm:max-w-3xl shadow-2xl overflow-hidden backdrop-blur-xl my-6 sm:my-8">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{selectedUser.name}</h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1 truncate">{selectedUser.phone}</p>
                </div>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedUser(null); }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
                {/* Account Information */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-white text-base sm:text-lg mb-3 sm:mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Full Name</p>
                      <p className="font-semibold text-white text-sm">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-white text-sm">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Role</p>
                      <p className="font-semibold text-white text-sm capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Member Since</p>
                      <p className="font-semibold text-white text-sm">
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 border border-cyan-500/20 rounded-lg p-3 sm:p-4">
                    <p className="text-cyan-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Orders</p>
                    <p className="text-xl sm:text-2xl font-bold text-cyan-400">
                      {userSummaries[selectedUser._id]?.orderCount ??
                        (summaryLoadingMap[selectedUser._id] ? '...' : '—')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/20 rounded-lg p-3 sm:p-4">
                    <p className="text-blue-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Bookings</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400">
                      {userSummaries[selectedUser._id]?.bookingCount ??
                        (summaryLoadingMap[selectedUser._id] ? '...' : '—')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-700 flex-col sm:flex-row">
                  <button
                    onClick={() => { setShowDetailModal(false); setSelectedUser(null); }}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors font-semibold text-white border border-gray-600/50 text-xs sm:text-sm flex-1"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleAskDeleteUser(selectedUser)}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors font-semibold text-red-400 border border-red-500/30 text-xs sm:text-sm flex-1 flex items-center justify-center gap-2"
                    disabled={pageLoading}
                  >
                    <Trash2 size={14} />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Custom Delete Confirmation Modal (Option 2 wording) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-sm rounded-lg border border-gray-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete user "{deleteTarget?.name}" ({deleteTarget?.phone})?
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              This will permanently remove the account and its data. This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
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

      {/* Page action overlay with spinner */}
      {pageLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white/80 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-white text-sm sm:text-lg font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
