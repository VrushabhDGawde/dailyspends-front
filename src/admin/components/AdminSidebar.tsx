import React from 'react';
import { motion } from 'framer-motion';
import { Users, LogOut, ShieldAlert, GitPullRequestDraft, MessageSquareWarning, Sparkles, Command } from 'lucide-react';

interface Props {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export function AdminSidebar({ currentTab, onNavigate, onLogout }: Props) {
  const navItems = [
    { id: 'users', icon: Users, label: 'User Management', badge: 'Core' },
    { id: 'rules', icon: GitPullRequestDraft, label: 'Rules Engine' },
    { id: 'complaints', icon: MessageSquareWarning, label: 'Support Tickets' },
  ];

  return (
    <aside className="w-64 bg-zinc-950/90 border-r border-white/[0.08] backdrop-blur-2xl h-screen fixed left-0 top-0 flex flex-col text-white font-sans z-50 selection:bg-blue-500/30">
      
      {/* Apple Style Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/[0.08] gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-white/20">
          <Command className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
            DailySpends
          </h2>
          <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-medium">Admin Workspace</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mb-3 px-3 mt-2">
          Management Console
        </div>
        
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium relative group ${
                isActive ? 'text-white font-semibold' : 'text-[#86868b] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="admin-active-nav-pill" 
                  className="absolute inset-0 bg-blue-500/10 border border-blue-500/25 rounded-xl shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-zinc-200'}`} />
                <span className="relative z-10">{item.label}</span>
              </div>

              {item.badge && (
                <span className="relative z-10 text-[9px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Session */}
      <div className="p-4 border-t border-white/[0.08] bg-black/40">
        <div className="flex items-center gap-3 px-1 mb-4">
          <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center font-bold text-white text-xs border border-white/20 shadow-md">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Administrator</p>
            <p className="text-[10px] text-[#86868b] truncate">superadmin@dailyspends.com</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 text-xs font-medium rounded-xl transition-all border border-white/[0.08] hover:border-rose-500/30 active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" /> End Admin Session
        </button>
      </div>

    </aside>
  );
}
