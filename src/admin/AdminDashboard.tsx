import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, Search, ShieldAlert, Ban, Trash2, CheckCircle2, Crown } from 'lucide-react';
import { adminApi, type UserResponseDTO } from './services/adminApi';

export function AdminDashboard() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.fetchUsers(0, 100); // Fetch up to 100 users for now
      setUsers(data.content);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Could not load users. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id: number, currentEnabled: boolean) => {
    try {
      const updatedUser = await adminApi.updateUserStatus(id, !currentEnabled);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const toggleRole = async (id: number, currentRole: 'USER' | 'ADMIN') => {
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      const updatedUser = await adminApi.updateUserRole(id, newRole);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const deleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to hard delete this user? This cannot be undone.')) {
      try {
        await adminApi.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time metrics and user management for DailySpends.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-blue-500" />
          </div>
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 font-semibold mb-1">Total Registered Users</p>
          <h2 className="text-4xl font-black text-white">{users.length}</h2>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-green-500" />
          </div>
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 font-semibold mb-1">Active Accounts</p>
          <h2 className="text-4xl font-black text-white">{users.filter(u => u.enabled).length}</h2>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">User Management</h2>
            <p className="text-sm text-zinc-400">View, block, or delete platform users.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {error && <div className="p-4 text-red-400 bg-red-500/10 text-center">{error}</div>}
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-widest">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                      <p>Loading users from database...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white border border-white/10">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {user.fullName}
                              {user.role === 'ADMIN' && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <div className="text-xs text-zinc-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-zinc-300">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.enabled
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {user.enabled ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {user.enabled ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => toggleRole(user.id, user.role)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-white/5"
                          title={user.role === 'ADMIN' ? 'Demote to User' : 'Make Admin'}
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(user.id, user.enabled)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-white/5"
                          title={user.enabled ? 'Block User' : 'Unblock User'}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
