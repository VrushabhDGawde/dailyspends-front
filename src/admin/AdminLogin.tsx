import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Props {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Map 'admin' to 'admin@dailyspends.com' if user typed 'admin'
      const email = username.trim() === 'admin' ? 'admin@dailyspends.com' : username.trim();
      const response = await axios.post('/api/v1/auth/login', {
        email: email,
        password: password,
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem('spendsense_admin_token', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('spendsense_admin_refresh_token', response.data.refreshToken);
        }
        onLoginSuccess();
      } else {
        setError('Login failed: Invalid response from server');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Invalid admin credentials. Use admin / admin or admin@dailyspends.com / admin');
      } else {
        setError('Connection error. Ensure backend service is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background styling for admin login */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">Admin Portal</h1>
        <p className="text-zinc-400 text-center mb-8 text-sm">Secure access for DailySpends administrators</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Admin Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Admin Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Authenticate <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Return to main application
          </a>
        </div>
      </motion.div>
    </div>
  );
}
