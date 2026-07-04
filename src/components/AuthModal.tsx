import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            {/* Animated Glowing Orb Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-48 h-48 bg-primary/30 rounded-full blur-[60px] animate-pulse" />

            <motion.div 
              layout
              className="glass bg-white/80 dark:bg-zinc-900/80 p-8 rounded-[2rem] shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden relative z-10"
            >
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <motion.div layout className="mb-8 text-center pt-2">
                <motion.div layout className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <motion.h2 layout className="text-2xl font-bold tracking-tight mb-2">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </motion.h2>
                <motion.p layout className="text-muted-foreground text-sm px-4">
                  {isLogin 
                    ? 'Enter your details to access your SpendSense dashboard.' 
                    : 'Start tracking your expenses seamlessly today.'}
                </motion.p>
              </motion.div>

              <motion.div layout className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div layout>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </motion.div>

                <motion.div layout>
                  <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                    <label className="block text-xs font-medium text-muted-foreground">Password</label>
                    {isLogin && <button className="text-[10px] font-semibold text-primary hover:underline">Forgot?</button>}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button 
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-foreground text-background font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 mt-6 shadow-md hover:shadow-lg transition-all"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.div layout className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">or continue with</span>
                  <div className="flex-grow border-t border-border"></div>
                </motion.div>

                <motion.div layout className="grid grid-cols-2 gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white dark:bg-zinc-800 border border-border text-foreground font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white dark:bg-zinc-800 border border-border text-foreground font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.09 2.4-.87 4-.73 1.35.08 2.47.6 3.16 1.6-2.72 1.54-2.25 5.16.48 6.13-.59 1.54-1.63 3.5-2.72 5.19z"/>
                      <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.35 2.4-1.92 4.36-3.74 4.25z"/>
                    </svg>
                    Apple
                  </motion.button>
                </motion.div>

              </motion.div>

              <motion.div layout className="mt-8 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
