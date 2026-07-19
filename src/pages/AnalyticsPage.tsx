import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Calculator, AlertTriangle, Coffee, TrendingDown, RefreshCw, Wallet } from 'lucide-react';
import { fetchTransactions, type RawSmsLog } from '../services/api';

export function AnalyticsPage() {
  const [transactions, setTransactions] = useState<RawSmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hardcoded target for now, but editable
  const [monthlyBudget, setMonthlyBudget] = useState(30000);
  const [whatIfAmount, setWhatIfAmount] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Time calculations
  const { today, daysInMonth, currentDay, daysLeft } = useMemo(() => {
    const t = new Date();
    const dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    const cd = t.getDate();
    const dl = dim - cd + 1; // including today
    return { today: t, daysInMonth: dim, currentDay: cd, daysLeft: dl };
  }, []);

  // Spend calculations
  const { totalSpent, categories } = useMemo(() => {
    const expenses = transactions.filter(t => t.transactionType === 'DEBIT');
    let total = 0;
    const cats: Record<string, number> = {};
    
    expenses.forEach(t => {
      const amt = t.amount || 0;
      total += amt;
      const cat = t.category || 'Other';
      cats[cat] = (cats[cat] || 0) + amt;
    });

    const sortedCats = Object.entries(cats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { totalSpent: total, categories: sortedCats };
  }, [transactions]);

  // Derived Metrics
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const safeToSpendToday = remainingBudget / daysLeft;
  
  // Projections
  const averageSpendPerDay = currentDay > 1 ? totalSpent / currentDay : totalSpent;
  const projectedMonthlySpend = averageSpendPerDay * daysInMonth;
  const isProjectedToOverspend = projectedMonthlySpend > monthlyBudget;

  // What If Simulation
  const simulatedAmount = parseFloat(whatIfAmount) || 0;
  const simulatedRemaining = Math.max(0, remainingBudget - simulatedAmount);
  const simulatedSafeToSpend = simulatedRemaining / daysLeft;
  const safeToSpendDrop = safeToSpendToday - simulatedSafeToSpend;

  if (loading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
          <RefreshCw className="w-8 h-8 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Financial Intelligence</h1>
            <p className="text-muted-foreground text-sm">Actionable insights to keep your budget on track.</p>
          </motion.div>

          <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 border border-border px-4 py-2 rounded-2xl">
            <Target className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Monthly Budget Goal</label>
              <div className="flex items-center gap-1">
                <span className="font-semibold">₹</span>
                <input 
                  type="number" 
                  value={monthlyBudget} 
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="bg-transparent border-none outline-none font-bold text-lg w-24"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Focus: Safe to Spend */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 glass rounded-[2rem] p-8 relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-full h-2 ${safeToSpendToday < 500 ? 'bg-red-500' : 'bg-emerald-500'}`} />
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Wallet className="w-5 h-5" /> Daily Allowance
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  This is exactly how much you can spend today without ruining your monthly budget. If you spend less, tomorrow's limit goes up!
                </p>
                
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-black tracking-tighter ${safeToSpendToday < 500 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ₹{safeToSpendToday.toFixed(0)}
                  </span>
                  <span className="text-muted-foreground font-medium">/ day</span>
                </div>
              </div>

              {/* Guilt Trip / Praise Card */}
              <div className="w-full md:w-64 bg-white/40 dark:bg-black/40 rounded-2xl p-5 border border-white/50 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {isProjectedToOverspend ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-emerald-500" />
                  )}
                  <span className="font-semibold text-sm">AI Projection</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isProjectedToOverspend 
                    ? `Warning: At this speed, you will overshoot your budget by ₹${(projectedMonthlySpend - monthlyBudget).toFixed(0)} this month.` 
                    : `Great job! You are projected to save ₹${(monthlyBudget - projectedMonthlySpend).toFixed(0)} this month.`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Burn Rate */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-[2rem] p-8 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Burn Rate
              </h2>
              <p className="text-sm text-muted-foreground">How fast you are spending.</p>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">of ₹{monthlyBudget.toLocaleString()}</span>
              </div>
              
              <div className="w-full h-4 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalSpent / monthlyBudget) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${totalSpent > monthlyBudget ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                />
                {/* Time Indicator Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-foreground/50 z-10"
                  style={{ left: `${(currentDay / daysInMonth) * 100}%` }}
                  title="Today"
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] uppercase font-semibold text-muted-foreground">
                <span>0%</span>
                <span className="flex items-center gap-1">Today Marker</span>
                <span>100%</span>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* The "What If" Simulator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-[2rem] p-8"
          >
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5" /> "What If" Simulator
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Thinking of buying something expensive? Type the amount here to see how it destroys your budget before you actually buy it.
            </p>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₹</span>
              <input 
                type="number" 
                placeholder="0"
                value={whatIfAmount}
                onChange={(e) => setWhatIfAmount(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-primary/20 rounded-2xl pl-10 pr-4 py-4 text-2xl font-bold focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {simulatedAmount > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Reality Check</p>
                    <p className="text-sm mt-1">
                      If you buy this, your daily allowance will instantly drop by <strong>₹{safeToSpendDrop.toFixed(0)}</strong> to just <strong>₹{simulatedSafeToSpend.toFixed(0)}/day</strong> for the rest of the month.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Guilty Pleasures */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-[2rem] p-8"
          >
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Coffee className="w-5 h-5" /> Guilty Pleasures
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              The categories draining your wallet the fastest.
            </p>

            <div className="space-y-4">
              {categories.slice(0, 3).map((cat, index) => {
                const percentOfBudget = ((cat.amount / monthlyBudget) * 100).toFixed(1);
                return (
                  <div key={cat.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/30 dark:hover:bg-black/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-semibold">{cat.name}</span>
                        <span className="font-bold">₹{cat.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${percentOfBudget}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        That's {percentOfBudget}% of your entire monthly budget.
                      </p>
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="text-center p-6 text-muted-foreground">
                  No expenses found yet. Keep it up!
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
