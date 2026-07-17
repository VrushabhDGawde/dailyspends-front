import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTransactions, addTransaction, type RawSmsLog } from '../services/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { 
  RefreshCw, CheckCircle2, Coffee, ShoppingBag, 
  Car, Zap, Home, IndianRupee, TrendingUp, TrendingDown, 
  Sparkles, PartyPopper, Edit3, ArrowUpRight, 
  Utensils, Clapperboard, MoreHorizontal, Plus, X, Wallet, 
  AlertTriangle,
  Clock, CalendarDays, Grid, ChevronRight, List, ArrowDownRight,
  Target, PieChart, Check, MessageSquare, ArrowRight, Inbox
} from 'lucide-react';

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport & Fuel',
  'Groceries',
  'Entertainment',
  'Utilities',
  'Housing',
  'Income',
  'Other',
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Food & Dining': Utensils,
  'Transport & Fuel': Car,
  'Shopping': ShoppingBag,
  'Utilities': Zap,
  'Housing': Home,
  'Groceries': Coffee,
  'Entertainment': Clapperboard,
  'Income': IndianRupee,
  'Other': MoreHorizontal,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Transport & Fuel': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Shopping': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'Utilities': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  'Housing': 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'Groceries': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Entertainment': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'Income': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Other': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

// Category icons definition
interface DaySummary {
  date: string;
  dateObj: Date;
  totalSpent: number;
  totalIncome: number;
  transactions: RawSmsLog[];
  categories: { name: string; amount: number }[];
  isReviewed: boolean;
}

interface TonightPageProps {
  onNavigateToTransactions?: (filter: { fromDate?: string; toDate?: string }) => void;
}

export function TonightPage({ onNavigateToTransactions }: TonightPageProps) {
  const [transactions, setTransactions] = useState<RawSmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Transaction Review Workspace State
  const [reviewingTx, setReviewingTx] = useState<RawSmsLog | null>(null);
  const [reviewAmount, setReviewAmount] = useState<string>('');
  const [reviewMerchant, setReviewMerchant] = useState<string>('');
  const [reviewCategory, setReviewCategory] = useState<string>('');
  const [reviewTxType, setReviewTxType] = useState<string>('DEBIT');

  useEffect(() => {
    if (reviewingTx) {
      setReviewAmount(reviewingTx.amount?.toString() || '');
      setReviewMerchant(reviewingTx.merchantClean || reviewingTx.merchantRaw || '');
      setReviewCategory(reviewingTx.category || 'Other');
      setReviewTxType(reviewingTx.transactionType || 'DEBIT');
    }
  }, [reviewingTx]);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingTx) return;
    
    const updatedTx: RawSmsLog = {
      ...reviewingTx,
      amount: parseFloat(reviewAmount) || 0,
      merchantClean: reviewMerchant,
      category: reviewCategory,
      transactionType: reviewTxType
    };

    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    if (updatedTx.category) {
      handleCategoryChange(updatedTx.id, updatedTx.category);
    }
    setReviewingTx(null);
  };

  // Track category overrides
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, string>>({});

  // Settings
  const [monthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? Number(saved) : 30000;
  });

  // Quick Add Form State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddAmount, setQuickAddAmount] = useState('');
  const [quickAddMerchant, setQuickAddMerchant] = useState('');
  const [quickAddCategory, setQuickAddCategory] = useState('Food & Dining');
  const [quickAddPaymentMode, setQuickAddPaymentMode] = useState('UPI');

  // --- CALENDAR STATE ---
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [pieChartModalDate, setPieChartModalDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });


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
    // Check if today was already submitted
    const submitted = localStorage.getItem(`reviewed_${new Date().toISOString().split('T')[0]}`);
    if (submitted) setIsSubmitted(true);
  }, []);

  
  // --- CALENDAR MEMOS ---
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value: val, label });
    }
    return options;
  }, []);

  const daySummaries = useMemo(() => {
    const grouped: Record<string, RawSmsLog[]> = {};
    transactions.forEach(t => {
      const dateStr = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(t);
    });

    const summaries: DaySummary[] = Object.entries(grouped)
      .map(([date, txs]) => {
        let spent = 0;
        let income = 0;
        const cats: Record<string, number> = {};

        txs.forEach(t => {
          if (t.transactionType === 'DEBIT') {
            spent += t.amount || 0;
            const cat = categoryOverrides[t.id] || t.category || 'Other';
            cats[cat] = (cats[cat] || 0) + (t.amount || 0);
          } else {
            income += t.amount || 0;
          }
        });

        const categories = Object.entries(cats)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);

        const isReviewed = localStorage.getItem(`reviewed_${date}`) === 'true';

        return {
          date,
          dateObj: new Date(date + 'T00:00:00'),
          totalSpent: spent,
          totalIncome: income,
          transactions: txs,
          categories,
          isReviewed,
        };
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    return summaries.filter(s => s.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth, categoryOverrides]);

  const monthlyTotal = useMemo(() => {
    return daySummaries.reduce((sum, d) => sum + d.totalSpent, 0);
  }, [daySummaries]);

  const monthlyIncome = useMemo(() => {
    return daySummaries.reduce((sum, d) => sum + d.totalIncome, 0);
  }, [daySummaries]);

  const calendarGrid = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayIndex = new Date(year, monthIndex, 1).getDay();

    const grid = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(i);
    }
    return { grid, year, monthStr };
  }, [selectedMonth]);

  const selectedCalendarDayData = useMemo(() => {
    if (!selectedCalendarDate) return null;
    return daySummaries.find(s => s.date === selectedCalendarDate) || null;
  }, [daySummaries, selectedCalendarDate]);

  const todayString = new Date().toISOString().split('T')[0];

  const todayTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
      return tDate === todayString;
    });
  }, [transactions, todayString]);

  // Calculate stats
  const { totalSpent, categoryBreakdown, yesterdaySpent } = useMemo(() => {
    let spent = 0;
    let income = 0;
    const cats: Record<string, number> = {};

    todayTransactions.forEach(t => {
      const category = categoryOverrides[t.id] || t.category || 'Other';
      if (t.transactionType === 'DEBIT') {
        spent += t.amount || 0;
        cats[category] = (cats[category] || 0) + (t.amount || 0);
      } else {
        income += t.amount || 0;
      }
    });

    // Yesterday's spend
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    let ySpent = 0;
    transactions.forEach(t => {
      if (t.transactionType !== 'DEBIT') return;
      const tDate = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
      if (tDate === yesterdayStr) ySpent += t.amount || 0;
    });

    const sortedCats = Object.entries(cats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { totalSpent: spent, totalIncome: income, categoryBreakdown: sortedCats, yesterdaySpent: ySpent };
  }, [todayTransactions, transactions, categoryOverrides]);

  const diff = totalSpent - yesterdaySpent;
  const isHigher = diff > 0;

  // Daily Limit Calculations
  const daysInMonth = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  }, []);
  const dailyLimit = Math.round(monthlyBudget / daysInMonth);
  const progressPercent = Math.round((totalSpent / dailyLimit) * 100);

  // SVG Gauge metrics
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, progressPercent) / 100) * circumference;

  // Dynamic colors for progress ring
  const strokeColorClass = useMemo(() => {
    if (progressPercent < 75) return 'stroke-emerald-500 dark:stroke-emerald-400';
    if (progressPercent < 100) return 'stroke-amber-500 dark:stroke-amber-400';
    return 'stroke-red-500 dark:stroke-red-400';
  }, [progressPercent]);

  // Dynamic AI Advice message
  const aiAdvice = useMemo(() => {
    if (totalSpent === 0) {
      return {
        text: "No expenses logged yet. Today is off to an excellent start!",
        icon: Sparkles,
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      };
    }
    if (progressPercent < 60) {
      return {
        text: `You've spent ₹${totalSpent} out of ₹${dailyLimit} today. Safe & well within budget!`,
        icon: Sparkles,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      };
    }
    if (progressPercent < 100) {
      return {
        text: `Approaching daily limit. You have ₹${dailyLimit - totalSpent} remaining for today.`,
        icon: AlertTriangle,
        color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
      };
    }
    return {
      text: `Budget alert: Exceeded daily allowance by ₹${totalSpent - dailyLimit}. AI predicts adjustments for tomorrow's limit.`,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
    };
  }, [totalSpent, progressPercent, dailyLimit]);

  const handleCategoryChange = useCallback((txId: number, newCategory: string) => {
    setCategoryOverrides(prev => ({ ...prev, [txId]: newCategory }));
    setEditingId(null);
  }, []);

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddAmount || !quickAddMerchant) return;

    const newTx: RawSmsLog = {
      id: Date.now(),
      sender: "MANUAL",
      smsBody: `Manual expense added: ₹${quickAddAmount} at ${quickAddMerchant}`,
      receivedAt: new Date().toISOString(),
      amount: Number(quickAddAmount),
      transactionType: "DEBIT",
      paymentMode: quickAddPaymentMode,
      accountRef: "CASH / SELF",
      merchantRaw: quickAddMerchant.toUpperCase(),
      merchantClean: quickAddMerchant,
      category: quickAddCategory,
      postBalance: 0,
      transactionDate: new Date().toISOString(),
      isRecurring: false,
      counterpartyType: "MERCHANT",
      upiRef: ""
    };

    await addTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
    
    // Reset Form
    setQuickAddAmount('');
    setQuickAddMerchant('');
    setQuickAddCategory('Food & Dining');
    setQuickAddPaymentMode('UPI');
    setIsQuickAddOpen(false);
  };

  const handleSubmit = () => {
    setShowCelebration(true);
    setIsSubmitted(true);
    localStorage.setItem(`reviewed_${todayString}`, 'true');
    console.log('Reviewed transactions:', todayTransactions.map(t => ({
      ...t,
      category: categoryOverrides[t.id] || t.category,
    })));
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
          <RefreshCw className="w-8 h-8 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  const debitTransactions = todayTransactions.filter(t => t.transactionType === 'DEBIT');

  return (
    <div className="p-4 md:p-8 relative">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="bg-white dark:bg-zinc-900 shadow-2xl rounded-[2rem] p-10 text-center border border-white/50 dark:border-white/10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">All Done! 🎉</h2>
                <p className="text-muted-foreground">Today's transactions verified.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Greeting Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Dashboard Overview</h1>
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isQuickAddOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>Log Missed Expense</span>
          </motion.button>
        </motion.header>

        {/* Quick Add Form Section */}
        <AnimatePresence>
          {isQuickAddOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -15 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleQuickAddSubmit} className="glass rounded-[2rem] p-6 border border-white/20 dark:border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-500" /> Log Missed Expense
                  </h3>
                  <button type="button" onClick={() => setIsQuickAddOpen(false)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 250"
                      value={quickAddAmount}
                      onChange={(e) => setQuickAddAmount(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Merchant / Description</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Tea Stall"
                      value={quickAddMerchant}
                      onChange={(e) => setQuickAddMerchant(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                    <select
                      value={quickAddCategory}
                      onChange={(e) => setQuickAddCategory(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {CATEGORIES.filter(c => c !== 'Income').map(cat => (
                        <option key={cat} value={cat} className="dark:bg-zinc-900">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                    <select
                      value={quickAddPaymentMode}
                      onChange={(e) => setQuickAddPaymentMode(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="UPI" className="dark:bg-zinc-900">UPI / PayTM</option>
                      <option value="CARD" className="dark:bg-zinc-900">Credit/Debit Card</option>
                      <option value="CASH" className="dark:bg-zinc-900">Cash</option>
                      <option value="NETBANKING" className="dark:bg-zinc-900">Net Banking</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Log Expense
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {transactions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-white/10 mt-6"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Sparkles className="w-12 h-12 relative z-10" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Welcome to DailySpends</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed">
              You're all set! To see your dashboard come alive with insights, heatmaps, and budgets, start by adding your very first transaction.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsQuickAddOpen(true)}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Log First Expense
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Section 1: Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Today's Spend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Today's Spend
              </p>
              <h2 className="text-5xl font-black tracking-tighter tabular-nums leading-none mb-4">
                <span className="text-2xl mr-1 opacity-70">₹</span>
                {totalSpent.toLocaleString('en-IN')}
              </h2>
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold w-fit ${isHigher ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              {isHigher ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(diff) === 0 ? 'Same as yesterday' : `₹${Math.abs(diff).toLocaleString('en-IN')} ${isHigher ? 'more' : 'less'} than yesterday`}</span>
            </div>
          </motion.div>

          {/* Card 2: Budget Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" /> Daily Budget
              </p>
              <p className="text-2xl font-bold tracking-tight mt-1 mb-1">₹{dailyLimit.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground font-medium">Limit based on monthly target</p>
            </div>
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="stroke-black/5 dark:stroke-white/5" strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className={`${strokeColorClass} transition-all duration-500 ease-in-out`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black tracking-tighter">{progressPercent}%</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Top Category / Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Top Spend
              </p>
              {categoryBreakdown.length > 0 ? (
                <div>
                  <h3 className="text-xl font-bold truncate">{categoryBreakdown[0].name}</h3>
                  <p className="text-3xl font-black tracking-tight mt-1 text-primary">₹{categoryBreakdown[0].amount.toLocaleString('en-IN')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <PieChart className="w-8 h-8 opacity-20 mb-2" />
                  <span className="text-sm">No expenses yet</span>
                </div>
              )}
            </div>
            {categoryBreakdown.length > 1 && (
              <p className="text-xs text-muted-foreground mt-4 truncate">
                Next: {categoryBreakdown[1].name} (₹{categoryBreakdown[1].amount.toLocaleString('en-IN')})
              </p>
            )}
          </motion.div>
        </div>

        {/* AI Advice Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`flex items-start gap-3 p-4 rounded-2xl border ${aiAdvice.color} backdrop-blur-md`}
        >
          <aiAdvice.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold leading-relaxed">{aiAdvice.text}</p>
        </motion.div>

        {/* Section 2: Main Body Dashboard (2 Columns) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Transactions Log */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" /> Today's Log
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {debitTransactions.length} transactions detected
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTransactions?.({ fromDate: todayString, toDate: todayString })}
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {debitTransactions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-black/5 dark:bg-white/5">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">All Caught Up</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">No expenses recorded today yet. Log an expense manually if you made a cash payment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {debitTransactions.map((tx) => {
                    const currentCategory = categoryOverrides[tx.id] || tx.category || 'Other';
                    return (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setReviewingTx(tx)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 border border-transparent hover:border-primary/50 transition-all gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground line-clamp-1">{tx.merchantClean || tx.merchantRaw}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-bold text-muted-foreground">
                                {currentCategory}
                                <span className="hover:text-primary transition-colors p-0.5"><Edit3 className="w-3 h-3" /></span>
                              </span>
                              <span className="text-xs text-muted-foreground opacity-50 flex items-center gap-1">
                                • {tx.paymentMode || 'UPI'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center justify-between sm:block">
                          <p className="font-black text-lg text-foreground tracking-tight tabular-nums">
                            -₹{(tx.amount || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                            {new Date(tx.transactionDate || tx.receivedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Approve Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={isSubmitted || debitTransactions.length === 0}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${
                isSubmitted || debitTransactions.length === 0
                  ? 'bg-black/5 dark:bg-white/5 text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-foreground to-foreground/80 text-background hover:shadow-2xl'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-6 h-6" /> Wrapped Up for Today
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" /> Approve & Save Today's Record
                </>
              )}
            </motion.button>
          </div>

          {/* Right Column: Heatmap Calendar & Category Breakdown */}
          <div className="space-y-6">
            
            {/* Calendar Widget */}
            <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /> Heatmap</h2>
                  <p className="text-xs text-muted-foreground mt-1 tracking-wide">Daily spend intensity</p>
                </div>
                <select 
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-border rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-shadow cursor-pointer"
                >
                  {Array.from(new Set(daySummaries.map(s => s.date.substring(0, 7)))).map(m => {
                    const [y, mo] = m.split('-');
                    const date = new Date(Number(y), Number(mo)-1, 1);
                    return (
                      <option key={m} value={m}>
                        {date.toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest">{d}</div>
                ))}
              </div>
              
              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarGrid.grid.map((dayNum, i) => {
                  if (!dayNum) return <div key={`empty-${i}`} className="aspect-square" />;
                  
                  const dateStr = `${calendarGrid.year}-${calendarGrid.monthStr}-${dayNum.toString().padStart(2, '0')}`;
                  const data = daySummaries.find(s => s.date === dateStr);
                  
                  let bgClass = "bg-black/5 dark:bg-white/5";
                  let textColor = "text-muted-foreground/50";
                  
                  if (data && data.totalSpent > 0) {
                    const maxSpend = Math.max(...daySummaries.map(s => s.totalSpent));
                    const intensity = data.totalSpent / maxSpend;
                    textColor = "text-primary-foreground";
                    if (intensity > 0.8) bgClass = "bg-violet-700";
                    else if (intensity > 0.5) bgClass = "bg-violet-500";
                    else if (intensity > 0.2) bgClass = "bg-violet-400";
                    else bgClass = "bg-violet-300 dark:bg-violet-800/50";
                  }

                  const isSelected = selectedCalendarDate === dateStr;

                  return (
                    <motion.button
                      key={dayNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedCalendarDate(isSelected ? null : dateStr)}
                      onDoubleClick={() => data && data.totalSpent > 0 && setPieChartModalDate(dateStr)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${bgClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background z-10' : ''}`}
                    >
                      <span className={`text-xs font-bold ${textColor}`}>{dayNum}</span>
                      {data && data.totalSpent > 0 && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/50" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Calendar Selected Day Drawer */}
              <AnimatePresence>
                {selectedCalendarDayData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-border">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm">
                          {selectedCalendarDayData.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                        </h4>
                        <span className="font-black text-sm text-primary tabular-nums">
                          ₹{selectedCalendarDayData.totalSpent.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedCalendarDayData.transactions.slice(0, 3).map(tx => (
                          <div key={tx.id} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground truncate pr-2">{tx.merchantClean || tx.merchantRaw}</span>
                            <span className="font-bold tabular-nums">₹{tx.amount?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        {selectedCalendarDayData.transactions.length > 3 && (
                          <div className="text-center pt-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary cursor-pointer hover:underline">
                              + {selectedCalendarDayData.transactions.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mini Category Breakdown Widget */}
            <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 hidden md:block">
               <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                 <PieChart className="w-4 h-4 text-primary" /> Today's Categories
               </h3>
               <div className="space-y-3">
                 {categoryBreakdown.map(cat => (
                   <div key={cat.name} className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-muted-foreground">{cat.name}</span>
                     <span className="text-sm font-black tabular-nums">₹{cat.amount.toLocaleString('en-IN')}</span>
                   </div>
                 ))}
                 {categoryBreakdown.length === 0 && (
                   <p className="text-xs text-muted-foreground/50 italic text-center py-4">No data to display.</p>
                 )}
               </div>
            </div>

          </div>
        </div>
        </>
        )}
      </div>

      {/* Pie Chart Modal (Frosted Glass) */}
      <AnimatePresence>
        {pieChartModalDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPieChartModalDate(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass !bg-white/70 dark:!bg-white/15 rounded-3xl w-full max-w-2xl p-8 shadow-2xl border border-white/40 dark:border-white/20 relative overflow-hidden"
            >
              <button 
                onClick={() => setPieChartModalDate(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <h2 className="text-xl font-bold mb-1">Expense Breakdown</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {new Date(pieChartModalDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
              </p>

              {(() => {
                const dayData = daySummaries.find(s => s.date === pieChartModalDate);
                if (!dayData || dayData.categories.length === 0) return <p className="text-center py-10 text-muted-foreground">No expenses for this day.</p>;
                
                return (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <defs>
                          <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.2" floodColor="#000" />
                          </filter>
                          <linearGradient id="grad0" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6d28d9"/></linearGradient>
                          <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#be185d"/></linearGradient>
                          <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
                          <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#047857"/></linearGradient>
                          <linearGradient id="grad4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
                          <linearGradient id="grad5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#0369a1"/></linearGradient>
                          <linearGradient id="grad6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#64748b"/><stop offset="100%" stopColor="#334155"/></linearGradient>
                        </defs>
                        <Pie
                          data={dayData.categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={6}
                          cornerRadius={10}
                          dataKey="amount"
                          nameKey="name"
                          stroke="none"
                          labelLine={false}
                          label={false}
                        >
                          {dayData.categories.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#grad${index % 7})`} 
                              filter="url(#pieShadow)"
                              style={{ outline: 'none' }}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`}
                          contentStyle={{ borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)' }}
                          itemStyle={{ fontWeight: 900, color: '#000' }}
                        />
                        <Legend 
                           verticalAlign="bottom" 
                           height={36}
                           iconType="circle"
                           formatter={(value) => <span className="text-foreground font-bold text-[10px] px-1">{value}</span>}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Resolution Center */}
      <div className="mt-12 pt-12 border-t border-border">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold flex items-center gap-3"><Inbox className="w-8 h-8 text-primary" /> Resolution Center</h2>
          <p className="text-muted-foreground mt-2">Verify and correct how the AI parsed your recent transactions.</p>
        </header>

        {!reviewingTx ? (
          <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border border-dashed border-border rounded-3xl p-12">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">You're All Caught Up!</h3>
            <p className="text-muted-foreground text-center max-w-md">Select an unverified transaction from above or wait for new SMS to arrive to train the AI.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Resolution Workspace */}
            <div className="bg-white/50 dark:bg-zinc-900 border border-border rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-xl">
              {/* Background glowing accent */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit3 className="w-5 h-5 text-primary" /> Edit & Verify</h3>
              
              <div className="bg-black/5 dark:bg-zinc-950 border border-border p-6 rounded-2xl mb-8 relative">
                <div className="absolute -top-3 left-4 bg-background text-primary text-xs font-bold px-2 py-1 rounded border border-border uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Original SMS
                </div>
                <p className="text-lg text-foreground/80 leading-relaxed font-medium italic mt-2">
                  "{reviewingTx.smsBody}"
                </p>
                <div className="mt-4 text-xs font-bold text-muted-foreground flex justify-end">
                  Sender: {reviewingTx.sender}
                </div>
              </div>

              <form onSubmit={handleResolve} className="space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={reviewAmount}
                      onChange={(e) => setReviewAmount(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-black text-xl transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Transaction Type</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setReviewTxType('DEBIT')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${reviewTxType === 'DEBIT' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                      >
                        DEBIT
                      </button>
                      <button 
                        type="button"
                        onClick={() => setReviewTxType('CREDIT')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${reviewTxType === 'CREDIT' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                      >
                        CREDIT
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Merchant / Title</label>
                    <input 
                      type="text" 
                      required
                      value={reviewMerchant}
                      onChange={(e) => setReviewMerchant(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold text-lg transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Category</label>
                    <select 
                      value={reviewCategory}
                      onChange={(e) => setReviewCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-medium appearance-none transition-all cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setReviewingTx(null)}
                    className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-foreground hover:bg-foreground/90 text-background font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform active:scale-[0.98] shadow-xl"
                  >
                    Resolve & Save <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
            
            {/* Spacer/Helper text for wide screens */}
            <div className="hidden lg:flex flex-col justify-center items-center text-center p-8 opacity-50">
              <Target className="w-16 h-16 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Train your AI</h3>
              <p className="max-w-sm">Every time you correct a transaction, the engine learns your parsing preferences.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
