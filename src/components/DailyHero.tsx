import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import type { RawSmsLog } from '../services/api';

interface Props {
  transactions: RawSmsLog[];
  selectedDate: Date;
}

export function DailyHero({ transactions, selectedDate }: Props) {
  const { todaySpend, comparisonText, isHigher } = useMemo(() => {
    // We calculate based on the 'selectedDate' (which defaults to today)
    // "today" contextually means the selected date. "yesterday" means the day before the selected date.
    
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateString = prevDate.toISOString().split('T')[0];

    let todayTotal = 0;
    let yesterdayTotal = 0;

    transactions.forEach(t => {
      if (t.transactionType !== 'DEBIT') return;
      const tDate = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
      if (tDate === selectedDateString) {
        todayTotal += (t.amount || 0);
      } else if (tDate === prevDateString) {
        yesterdayTotal += (t.amount || 0);
      }
    });

    const diff = todayTotal - yesterdayTotal;
    const isHigher = diff > 0;
    const comparison = Math.abs(diff);

    let comparisonText = "Same as yesterday";
    if (todayTotal === 0 && yesterdayTotal === 0) comparisonText = "No expenses yet";
    else if (isHigher) comparisonText = `₹${comparison.toLocaleString('en-IN')} more than yesterday`;
    else if (diff < 0) comparisonText = `₹${comparison.toLocaleString('en-IN')} less than yesterday`;

    return { todaySpend: todayTotal, yesterdaySpend: yesterdayTotal, comparison, comparisonText, isHigher };
  }, [transactions, selectedDate]);

  // Budget Mock Data (This could be dynamic later)
  const monthlyBudget = 50000;
  // Calculate total month spend simply by summing all debits for this month
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthSpend = transactions.reduce((sum, t) => {
    if (t.transactionType !== 'DEBIT') return sum;
    const d = new Date(t.transactionDate || t.receivedAt);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return sum + (t.amount || 0);
    }
    return sum;
  }, 0);
  
  const budgetPercentage = Math.min((monthSpend / monthlyBudget) * 100, 100);

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const titleText = isToday ? "Today's Spend" : `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} Spend`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="glass rounded-3xl p-8 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{titleText}</h2>
          </div>
          
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl md:text-6xl font-black tracking-tighter">
              ₹{todaySpend.toLocaleString('en-IN')}
            </span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isHigher && todaySpend > 0 ? 'bg-red-500/10 text-red-500 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
            {isHigher && todaySpend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {comparisonText}
          </div>
        </div>

        {/* AI Insight & Budget */}
        <div className="flex flex-col gap-4 max-w-xs w-full">
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/40 dark:border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Insight</span>
            </div>
            <p className="text-sm text-foreground/80 leading-snug">
              {todaySpend > 2000 
                ? "Your spending is unusually high today. Keep an eye on your budget." 
                : "You are on track with your daily average. Great job!"}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
              <span>Monthly Budget</span>
              <span>{Math.round(budgetPercentage)}% Used</span>
            </div>
            <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercentage}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${budgetPercentage > 90 ? 'bg-red-500' : 'bg-primary'}`}
              />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
