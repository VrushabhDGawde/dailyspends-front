import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CreditCard, Activity, Search, ShieldAlert, Ban, Trash2, CheckCircle2 } from 'lucide-react';

// --- Dummy Data ---
const dummyUsers = [
  { id: 'usr_1', name: 'Rahul Sharma', email: 'rahul@example.com', joined: '2023-11-01', txCount: 142, status: 'Active' },
  { id: 'usr_2', name: 'Priya Patel', email: 'priya.p@example.com', joined: '2023-12-15', txCount: 89, status: 'Active' },
  { id: 'usr_3', name: 'Amit Kumar', email: 'amit.k99@example.com', joined: '2024-01-10', txCount: 12, status: 'Blocked' },
  { id: 'usr_4', name: 'Sneha Reddy', email: 'snehareddy@example.com', joined: '2024-02-05', txCount: 304, status: 'Active' },
  { id: 'usr_5', name: 'Vikas Singh', email: 'vikas_s@example.com', joined: '2024-03-22', txCount: 0, status: 'Active' },
  { id: 'usr_6', name: 'Neha Gupta', email: 'neha.g@example.com', joined: '2024-04-18', txCount: 45, status: 'Blocked' },
];

export function AdminDashboard() {
  const [users, setUsers] = useState(dummyUsers);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to hard delete this user and all their transactions? This cannot be undone.')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen">
      
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time metrics and user management for DailySpends.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-blue-500" />
          </div>
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 font-semibold mb-1">Total Registered Users</p>
          <h2 className="text-4xl font-black text-white">{users.length + 136}</h2>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-green-500" />
          </div>
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 font-semibold mb-1">Active Users Today</p>
          <h2 className="text-4xl font-black text-white">42</h2>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="w-24 h-24 text-purple-500" />
          </div>
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 font-semibold mb-1">Total Transactions Processed</p>
          <h2 className="text-4xl font-black text-white">1,402</h2>
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-widest">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Transactions</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredUsers.length === 0 ? (
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
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{user.name}</div>
                            <div className="text-xs text-zinc-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-zinc-300">
                        {new Date(user.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-sm font-medium text-zinc-300">
                        {user.txCount}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === 'Active' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {user.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => toggleStatus(user.id)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-white/5"
                          title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
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
