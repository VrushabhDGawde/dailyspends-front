import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Settings, User, PanelLeftClose, PanelLeftOpen, CalendarDays, Sparkles, Home, LogOut, Inbox, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { name: 'Tonight', icon: Home, page: 'tonight' },
  { name: 'Transactions', icon: CalendarDays, page: 'transactions' },
  { name: 'Insights', icon: Sparkles, page: 'insights' },
  { name: 'Resolution Center', icon: Inbox, page: 'resolution' },
];

interface SidebarProps {
  onOpenAuth: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenSupport?: () => void;
  isDemoMode?: boolean;
  onExitDemo?: () => void;
  unverifiedCount?: number;
}

export function Sidebar({ onOpenAuth, currentPage, onNavigate, isCollapsed, onToggleCollapse, isDark, toggleTheme, onOpenSupport, isDemoMode, onExitDemo, unverifiedCount = 0 }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`hidden md:flex fixed top-0 left-0 h-screen flex-col justify-between border-r border-white/20 dark:border-white/5 glass bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 p-4' : 'w-64 p-6'}`}
      >
        <div>
          {/* Logo */}
          <div className={`flex items-center mb-10 ${isCollapsed ? 'justify-center' : 'gap-3 pl-2'}`}>
            <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-2xl tracking-tighter text-foreground whitespace-nowrap overflow-hidden">
                DailySpends.
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {!isCollapsed && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-2">Menu</div>}
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.page)}
                  title={item.name}
                  className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all relative ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${
                    isActive 
                      ? "bg-primary/10 text-primary dark:bg-primary/20" 
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                  {!isCollapsed && item.page === 'insights' && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-0.5 rounded-full">AI</span>
                  )}
                  {!isCollapsed && item.page === 'resolution' && unverifiedCount > 0 && (
                    <span className="ml-auto flex items-center justify-center font-bold px-2 py-0.5 text-[10px] rounded-full bg-red-500 text-white shadow-sm">
                      {unverifiedCount}
                    </span>
                  )}
                  {isCollapsed && item.page === 'resolution' && unverifiedCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
                      {unverifiedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className={`space-y-4 pt-6 border-t border-border`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between px-2'}`}>
            <button 
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Toggle Sidebar"
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={onOpenSupport}
              className="w-9 h-9 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-500/10 transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button 
              onClick={() => onNavigate('settings')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${currentPage === 'settings' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {isDemoMode && (
            <div className={`mt-4 ${isCollapsed ? 'hidden' : 'block'}`}>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider">Demo Mode</p>
                <button 
                  onClick={onExitDemo}
                  className="w-full py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-amber-600 transition-colors"
                >
                  Exit Demo
                </button>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <div className={`flex items-center rounded-xl transition-colors group ${isCollapsed ? 'justify-center p-0 mt-4' : 'gap-3 p-2 border border-border/50 bg-white/30 dark:bg-black/20'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-900 border border-white/50 dark:border-white/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                  {user?.name ? user.name.charAt(0) : user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="text-left flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold truncate">{user?.name || user?.email?.split('@')[0]}</p>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors mt-0.5"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className={`w-full flex items-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group ${isCollapsed ? 'justify-center p-0 mt-4' : 'gap-3 p-2'}`}
              title="Guest User"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900 dark:to-purple-900 border border-white/50 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
              </div>
              {!isCollapsed && (
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Guest User</p>
                  <p className="text-xs text-muted-foreground truncate">Sign in to sync</p>
                </div>
              )}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Bottom Dock */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed bottom-0 left-0 w-full glass bg-white/80 dark:bg-zinc-900/80 border-t border-white/20 dark:border-white/5 backdrop-blur-xl z-50 pb-safe"
      >
        <div className="flex items-center justify-around p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.name}
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium text-center leading-tight max-w-[60px] truncate">{item.name}</span>
                {item.page === 'resolution' && unverifiedCount > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 text-[8px] font-bold flex items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
                    {unverifiedCount}
                  </span>
                )}
              </button>
            );
          })}
          <button 
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentPage === 'settings' ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </motion.nav>
    </>
  );
}
