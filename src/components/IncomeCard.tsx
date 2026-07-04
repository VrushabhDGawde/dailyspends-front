import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface IncomeCardProps {
  amount: number;
}

export function IncomeCard({ amount }: IncomeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', delay: 0.2 }}
      className="relative overflow-hidden glass rounded-3xl p-6 group"
    >
      {/* Background Glow / Gradient Effect */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 dark:bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-110 group-hover:bg-emerald-500/30 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm uppercase tracking-wider">Cash Inflow</h3>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +12%
          </div>
        </div>

        <div className="mt-2">
          <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
            ₹{amount.toLocaleString('en-IN')}
          </span>
          <p className="text-sm text-muted-foreground mt-1">Total income this month</p>
        </div>

        {/* Mini Sparkline (Visual representation only) */}
        <div className="mt-6 flex items-end gap-1 h-8 opacity-60">
          {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
            <div 
              key={i} 
              className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-t-sm"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
