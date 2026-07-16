import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, LogOut, ShieldAlert } from 'lucide-react';

interface Props {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export function AdminSidebar({ currentTab, onNavigate, onLogout }: Props) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'settings', icon: Settings, label: 'Platform Settings' },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col text-white font-sans z-50">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight tracking-tight">Admin Control</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">DailySpends</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-4 px-2 mt-4">Menu</div>
        
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium relative group ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="admin-active-nav" 
                  className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-red-400' : 'group-hover:text-zinc-300'}`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-white border border-white/10">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">Super Admin</p>
            <p className="text-xs text-zinc-500 truncate">admin@dailyspends.com</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4" /> End Session
        </button>
      </div>
    </div>
  );
}
