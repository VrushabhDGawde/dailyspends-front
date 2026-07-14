import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, TrendingUp, Calendar, Zap, Lock } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterDemo: () => void;
}

export function LandingPage({ onOpenAuth, onEnterDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-950 text-foreground">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar Minimal */}
      <header className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">DailySpends</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl font-semibold bg-white/50 dark:bg-black/20 backdrop-blur-md border border-border hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-border text-sm font-medium text-primary shadow-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Financial Assistant</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Take control of your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">daily spending.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically track expenses, analyze spending habits with beautiful heatmaps, and get AI-driven insights to save more money every month.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnterDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/50 dark:bg-black/30 backdrop-blur-md border border-border font-bold text-lg flex items-center justify-center gap-2 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all"
            >
              <Play className="w-5 h-5" />
              Try Interactive Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
        >
          {[
            { icon: Calendar, title: 'Daily Wrap-ups', desc: 'Review and approve your expenses every night to build better habits.' },
            { icon: TrendingUp, title: 'Visual Heatmaps', desc: 'See exactly where your money goes with beautiful, interactive charts.' },
            { icon: Zap, title: 'AI Insights', desc: 'Get personalized recommendations on how to cut unnecessary costs.' },
          ].map((feature, i) => (
            <div key={i} className="glass p-6 rounded-3xl border border-white/50 dark:border-white/10 text-left hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="w-full p-6 text-center text-sm text-muted-foreground z-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border mt-12 bg-white/30 dark:bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" /> Secure & Private
        </div>
        <p>&copy; {new Date().getFullYear()} DailySpends. All rights reserved.</p>
      </footer>
    </div>
  );
}
