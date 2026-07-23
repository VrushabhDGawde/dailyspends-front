import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Search, ShieldAlert, Ban, Trash2, 
  CheckCircle2, Crown, RefreshCw, Sparkles, Filter, 
  ChevronRight, Mail, Calendar, Fingerprint, ShieldCheck,
  UserCheck, UserX, MoreHorizontal, ArrowUpRight
} from 'lucide-react';
import { adminApi, type UserResponseDTO } from './services/adminApi';

type FilterTab = 'all' | 'active' | 'blocked' | 'admin';

export function AdminDashboard() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const data = await adminApi.fetchUsers(0, 100);
      setUsers(data.content);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Unable to sync user database. Please verify backend connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.uuid && u.uuid.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'active') return u.enabled;
    if (activeTab === 'blocked') return !u.enabled;
    if (activeTab === 'admin') return u.role === 'ADMIN';
    return true;
  });

  const toggleStatus = async (id: number, currentEnabled: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActionLoading(id);
    try {
      const updatedUser = await adminApi.updateUserStatus(id, !currentEnabled);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleRole = async (id: number, currentRole: 'USER' | 'ADMIN', e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActionLoading(id);
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      const updatedUser = await adminApi.updateUserRole(id, newRole);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      alert("Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this account? This action cannot be undone.')) {
      setActionLoading(id);
      try {
        await adminApi.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        if (selectedUser?.id === id) {
          setSelectedUser(null);
        }
      } catch (err) {
        alert("Failed to delete user");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.enabled).length;
  const blockedUsers = users.filter(u => !u.enabled).length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] font-sans p-6 lg:p-10 selection:bg-blue-500/30">
      
      {/* Apple Style Top Header */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                System Administration
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white font-sans">
              Users & Credentials
            </h1>
            <p className="text-sm text-[#86868b] mt-1 font-normal">
              Manage accounts, roles, access permissions, and platform security.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadUsers(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full text-xs font-medium text-white transition-all hover:border-white/20 active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* Apple Bento Box Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Accounts */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.36)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Registered
              </span>
            </div>
            <p className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Total Users</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-semibold text-white tracking-tight">{totalUsers}</h3>
              <span className="text-xs text-[#86868b] flex items-center gap-0.5">
                Accounts <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </span>
            </div>
          </motion.div>

          {/* Active Accounts */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.36)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {activePercentage}% Active
              </span>
            </div>
            <p className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Active Status</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-semibold text-white tracking-tight">{activeUsers}</h3>
              <span className="text-xs text-emerald-400 font-medium">Healthy</span>
            </div>
          </motion.div>

          {/* Blocked Accounts */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.36)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <UserX className="w-5 h-5" />
              </div>
              <span className="text-xs text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Restricted
              </span>
            </div>
            <p className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Blocked Accounts</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-semibold text-white tracking-tight">{blockedUsers}</h3>
              <span className="text-xs text-rose-400 font-medium">{blockedUsers > 0 ? 'Action Needed' : 'None'}</span>
            </div>
          </motion.div>

          {/* Administrators */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.36)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Privileged
              </span>
            </div>
            <p className="text-xs font-medium text-[#86868b] uppercase tracking-wider">Super Admins</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-semibold text-white tracking-tight">{adminUsers}</h3>
              <span className="text-xs text-amber-400 font-medium">Access Granted</span>
            </div>
          </motion.div>

        </div>

        {/* Filter Segmented Controls & Search Bar */}
        <div className="bg-zinc-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-3 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          
          {/* Apple Segmented Control Pill */}
          <div className="flex bg-black/60 p-1 rounded-xl border border-white/[0.06] w-full md:w-auto">
            {(
              [
                { id: 'all', label: `All Users (${totalUsers})` },
                { id: 'active', label: `Active (${activeUsers})` },
                { id: 'blocked', label: `Blocked (${blockedUsers})` },
                { id: 'admin', label: `Admins (${adminUsers})` },
              ] as { id: FilterTab; label: string }[]
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 md:flex-initial px-4 py-2 text-xs font-medium rounded-lg transition-all z-10 ${
                    isActive ? 'text-white font-semibold' : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="apple-tab-indicator"
                      className="absolute inset-0 bg-zinc-800 border border-white/10 rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Filter by name, email or UUID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/60 border border-white/[0.08] focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86868b] hover:text-white bg-zinc-800 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

        </div>

        {/* User Table Container */}
        <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          
          {error && (
            <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-medium text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/30 text-[#86868b] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-800" />
                          <div className="space-y-1.5">
                            <div className="w-28 h-3.5 bg-zinc-800 rounded" />
                            <div className="w-40 h-2.5 bg-zinc-800/60 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><div className="w-16 h-5 bg-zinc-800 rounded-full" /></td>
                      <td className="py-4 px-4"><div className="w-20 h-5 bg-zinc-800 rounded-full" /></td>
                      <td className="py-4 px-4"><div className="w-24 h-3 bg-zinc-800 rounded" /></td>
                      <td className="py-4 px-6 text-right"><div className="w-24 h-7 bg-zinc-800 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-[#86868b]">
                      <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-3 border border-white/10 text-zinc-500">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-white">No accounts found</p>
                      <p className="text-xs text-[#86868b] mt-1">Try adjusting your search query or filter segment.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isAdmin = user.role === 'ADMIN';
                    const isBlocked = !user.enabled;
                    const isProcessing = actionLoading === user.id;

                    return (
                      <tr 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        {/* User Identity Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            {/* Apple style gradient avatar */}
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold tracking-tight text-white border border-white/10 shadow-sm ${
                                isAdmin 
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                                  : 'bg-gradient-to-br from-zinc-700 to-zinc-900'
                              }`}>
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                                isBlocked ? 'bg-rose-500' : 'bg-emerald-400'
                              }`} />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
                                  {user.fullName || 'Anonymous User'}
                                </span>
                                {isAdmin && (
                                  <span className="p-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Super Admin">
                                    <Crown className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#86868b] font-mono mt-0.5">
                                <Mail className="w-3 h-3" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                            isAdmin 
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm' 
                              : 'bg-zinc-800/80 text-zinc-300 border border-white/10'
                          }`}>
                            {isAdmin ? <Crown className="w-3 h-3 text-amber-400" /> : <ShieldCheck className="w-3 h-3 text-zinc-400" />}
                            {user.role}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${
                            !isBlocked
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!isBlocked ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {!isBlocked ? 'Active' : 'Blocked'}
                          </span>
                        </td>

                        {/* Date Joined Column */}
                        <td className="py-4 px-4 text-xs text-[#86868b] font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Toggle Role */}
                            <button
                              onClick={(e) => toggleRole(user.id, user.role, e)}
                              disabled={isProcessing}
                              className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                                isAdmin 
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-white/10 hover:border-white/20'
                              }`}
                              title={isAdmin ? "Demote to standard user" : "Promote to Super Admin"}
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>

                            {/* Block / Unblock */}
                            <button
                              onClick={(e) => toggleStatus(user.id, user.enabled, e)}
                              disabled={isProcessing}
                              className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                                isBlocked 
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-white/10 hover:border-white/20'
                              }`}
                              title={isBlocked ? "Unblock Account" : "Suspend Account"}
                            >
                              {isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5 text-rose-400" />}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => deleteUser(user.id, e)}
                              disabled={isProcessing}
                              className="p-2 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all hover:border-rose-500/40"
                              title="Delete User Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868b]">
            <span>Showing {filteredUsers.length} of {totalUsers} total registered accounts</span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Sparkles className="w-3 h-3 text-blue-400" /> Apple HIG Standard Admin Layout
            </span>
          </div>

        </div>

      </main>

      {/* Apple macOS Style User Detail Modal / Sheet */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="bg-zinc-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold tracking-wider uppercase">
                  <Fingerprint className="w-4 h-4" /> User Details Sheet
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Profile Overview */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-black/50 border border-white/10 rounded-2xl">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white border border-white/10 shadow-md ${
                  selectedUser.role === 'ADMIN' 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                }`}>
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedUser.fullName}
                    {selectedUser.role === 'ADMIN' && <Crown className="w-4 h-4 text-amber-400" />}
                  </h3>
                  <p className="text-xs text-[#86868b]">{selectedUser.email}</p>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                    selectedUser.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {selectedUser.enabled ? '● Account Active' : '● Account Restricted'}
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-[#86868b]">Database Record ID</span>
                  <span className="font-mono text-white font-medium">#{selectedUser.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-[#86868b]">UUID Identity Tag</span>
                  <span className="font-mono text-xs text-blue-300 truncate max-w-[200px]">{selectedUser.uuid || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span className="text-[#86868b]">Access Privilege Level</span>
                  <span className="font-semibold text-white">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span className="text-[#86868b]">Registration Timestamp</span>
                  <span className="text-white">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3">
                <button
                  onClick={(e) => toggleRole(selectedUser.id, selectedUser.role, e)}
                  className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  {selectedUser.role === 'ADMIN' ? 'Demote to User' : 'Make Super Admin'}
                </button>

                <button
                  onClick={(e) => toggleStatus(selectedUser.id, selectedUser.enabled, e)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                    selectedUser.enabled 
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {selectedUser.enabled ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  {selectedUser.enabled ? 'Suspend Account' : 'Activate Account'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
