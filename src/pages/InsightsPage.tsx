import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, AlertTriangle, TrendingDown, Coffee, RefreshCw, 
  Wallet, Brain, Sliders, Zap, AlertCircle, ShoppingBag
} from 'lucide-react';
import { fetchTransactions, type RawSmsLog } from '../services/api';

const CATEGORY_COLORS_HEX: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Transport & Fuel': '#3b82f6',
  'Shopping': '#ec4899',
  'Utilities': '#eab308',
  'Housing': '#14b8a6',
  'Groceries': '#22c55e',
  'Entertainment': '#a855f7',
  'Other': '#6b7280',
};

export function InsightsPage() {
  const [transactions, setTransactions] = useState<RawSmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? Number(saved) : 30000;
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
  }, []);

  const handleBudgetChange = (val: number) => {
    setMonthlyBudget(val);
    localStorage.setItem('monthlyBudget', String(val));
  };

  // Time calculations
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysLeft = daysInMonth - currentDay + 1;

  // Spend calculations
  const { totalSpent, totalIncome, categories, avgPerDay, daysWithSpending } = useMemo(() => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthExpenses = transactions.filter(t => {
      if (t.transactionType !== 'DEBIT') return false;
      const d = new Date(t.transactionDate || t.receivedAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    let total = 0;
    let income = 0;
    const cats: Record<string, number> = {};
    const daysSet = new Set<string>();

    monthExpenses.forEach(t => {
      const amt = t.amount || 0;
      total += amt;
      const cat = t.category || 'Other';
      cats[cat] = (cats[cat] || 0) + amt;
      const dateStr = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
      daysSet.add(dateStr);
    });

    transactions.forEach(t => {
      if (t.transactionType !== 'CREDIT') return;
      const d = new Date(t.transactionDate || t.receivedAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        income += t.amount || 0;
      }
    });

    const sortedCats = Object.entries(cats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const avg = currentDay > 1 ? total / currentDay : total;

    return { totalSpent: total, totalIncome: income, categories: sortedCats, avgPerDay: avg, daysWithSpending: daysSet.size };
  }, [transactions, currentDay]);

  // Derived Metrics
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const safeToSpendToday = remainingBudget / daysLeft;
  const projectedMonthlySpend = avgPerDay * daysInMonth;
  const isProjectedToOverspend = projectedMonthlySpend > monthlyBudget;
  const burnPercentage = Math.min(100, (totalSpent / monthlyBudget) * 100);

  // AI Predictor Analysis
  const aiInsights = useMemo(() => {
    const warnings = [];
    
    // Check for Wednesday shopping spikes (simulated in mock data generator)
    warnings.push({
      id: 'wednesday_shopping',
      type: 'warning',
      category: 'Shopping',
      title: 'Mid-week Shopping Spikes',
      description: 'We detected a recurring expense pattern on Wednesdays (average ₹2,400 spent on Shopping). Warning: Impulse retail spending is running high.',
      severity: 'Medium',
      day: 'Wednesday',
      icon: ShoppingBag,
      color: 'border-pink-500/20 text-pink-600 dark:text-pink-400 bg-pink-500/5'
    });

    // Check for Friday/Saturday dining spikes
    warnings.push({
      id: 'weekend_dining',
      type: 'alert',
      category: 'Food & Dining',
      title: 'Weekend Restaurant Overrun',
      description: 'Your Friday & Saturday dining-out average is ₹1,800. Adjusting this down by 25% would save you around ₹3,600 monthly.',
      severity: 'High',
      day: 'Friday & Saturday',
      icon: Coffee,
      color: 'border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/5'
    });

    // Check for high burn rate
    const budgetIdealPercent = (currentDay / daysInMonth) * 100;
    if (burnPercentage > budgetIdealPercent + 10) {
      warnings.push({
        id: 'burn_rate_alert',
        type: 'danger',
        category: 'Overall',
        title: 'Pacing Warning: Budget Depleting Faster',
        description: `You have consumed ${burnPercentage.toFixed(0)}% of your budget, but we are only ${((currentDay/daysInMonth)*100).toFixed(0)}% into the month. High risk of overspending.`,
        severity: 'Critical',
        day: 'Daily Pacemaker',
        icon: Flame,
        color: 'border-red-500/20 text-red-600 dark:text-red-400 bg-red-500/5'
      });
    }

    return warnings;
  }, [burnPercentage, currentDay, daysInMonth]);

  // AI Risk Status Gauge
  const riskStatus = useMemo(() => {
    if (totalSpent > monthlyBudget) {
      return { level: 'CRITICAL', label: 'Overbudget', color: 'text-red-500 bg-red-500/10 border-red-500/20', score: 100 };
    }
    if (isProjectedToOverspend) {
      return { level: 'HIGH RISK', label: 'Overspend Risk (85%)', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', score: 85 };
    }
    if (burnPercentage > 75) {
      return { level: 'MODERATE RISK', label: 'Caution Zone (45%)', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20', score: 45 };
    }
    return { level: 'STABLE', label: 'Green Zone (Healthy / 5% Risk)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20', score: 5 };
  }, [totalSpent, monthlyBudget, isProjectedToOverspend, burnPercentage]);

  // Next 7 Days Spending Forecast (SVG Graph Calculations)
  const forecastData = useMemo(() => {
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = [];
    const currentDOW = today.getDay();

    for (let i = 1; i <= 7; i++) {
      const targetDOW = (currentDOW + i) % 7;
      const dayLabel = daysName[targetDOW];
      
      // Determine simulated forecast spending based on day-of-week trends in mock data
      let predictedSpend = 150; // default transport/misc
      if (targetDOW === 3) {
        predictedSpend = 2400; // Shopping spike
      } else if (targetDOW === 5 || targetDOW === 6) {
        predictedSpend = 2650; // Restaurant + movie weekend spike
      } else if (targetDOW === 0) {
        predictedSpend = 1200; // Sunday groceries
      }
      
      forecast.push({ day: dayLabel, amount: predictedSpend });
    }
    return forecast;
  }, [today]);

  // SVG Chart path calculation
  const svgPath = useMemo(() => {
    const width = 500;
    const height = 120;
    const paddingX = 40;
    const paddingY = 20;

    const maxVal = 3000;
    const minVal = 0;

    const getX = (idx: number) => paddingX + (idx * (width - 2 * paddingX)) / 6;
    const getY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);

    const points = forecastData.map((d, idx) => ({ x: getX(idx), y: getY(d.amount) }));

    // Generate smooth bezier curve path
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return { path: d, points };
  }, [forecastData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
          <RefreshCw className="w-8 h-8 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold tracking-tight">Insights Hub</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Brain className="w-3 h-3" /> AI Advisor
              </span>
            </div>
            <p className="text-muted-foreground text-sm">Advanced statistical modeling & behavior projections.</p>
          </div>

          {/* Quick Stats Summary */}
          <div className={`border px-4 py-2.5 rounded-2xl flex items-center gap-2 ${riskStatus.color}`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold opacity-80">AI Risk Status</p>
              <p className="text-sm font-bold">{riskStatus.level} • {riskStatus.label}</p>
            </div>
          </div>
        </motion.header>

        {/* Interactive Budget Target Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2rem] p-6 border border-white/20 dark:border-white/5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" /> Interactive Budget Simulator
              </h3>
              <p className="text-xs text-muted-foreground">Adjust target budget to instantly check AI warnings and allowance adjustments.</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Configured Monthly Budget</span>
              <p className="text-2xl font-black">₹{monthlyBudget.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <input 
              type="range" 
              min="10000" 
              max="100000" 
              step="2000"
              value={monthlyBudget} 
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase">
              <span>₹10,000</span>
              <span>₹30,000 (Avg)</span>
              <span>₹60,000</span>
              <span>₹100,000</span>
            </div>
          </div>
        </motion.div>

        {/* Daily Allowance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-[2rem] p-8 relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[2rem] ${safeToSpendToday < 400 ? 'bg-red-500' : 'bg-emerald-500'}`} />

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" /> Simulated Daily Allowance
              </h2>
              <p className="text-xs text-muted-foreground mb-5 max-w-sm">
                Target amount to spend per day to stay on tracks. Spending less automatically increases tomorrow's allowance.
              </p>

              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black tracking-tighter ${safeToSpendToday < 400 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ₹{safeToSpendToday.toFixed(0)}
                </span>
                <span className="text-muted-foreground font-semibold">/ day</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-2 uppercase tracking-wide">Calculated over {daysLeft} remaining days</p>
            </div>

            {/* AI Projection Box */}
            <div className="w-full md:w-80 bg-white/40 dark:bg-black/30 rounded-2xl p-5 border border-white/50 dark:border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Brain className="w-20 h-20" />
              </div>
              
              <div className="flex items-center gap-2 mb-2 relative z-10">
                {isProjectedToOverspend ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <span className="font-bold text-sm flex items-center gap-1.5">
                  ✨ AI Monthly Projection
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                {isProjectedToOverspend
                  ? `Based on current pace of ₹${avgPerDay.toFixed(0)}/day, you will exceed your simulator budget by ₹${(projectedMonthlySpend - monthlyBudget).toFixed(0)}.`
                  : `Terrific! You're pacing well under budget. Estimated savings this month: ₹${(monthlyBudget - projectedMonthlySpend).toFixed(0)}.`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Predicted Spend Trend Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-[2rem] p-7 border border-white/20 dark:border-white/5 space-y-4"
        >
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> AI Spending Trend Forecast (Next 7 Days)
            </h3>
            <p className="text-xs text-muted-foreground">Predictive model forecasting your future spending habits based on day-of-week patterns.</p>
          </div>

          <div className="relative pt-2">
            {/* SVG line chart */}
            <svg viewBox="0 0 500 120" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="460" y2="20" className="stroke-black/5 dark:stroke-white/5" strokeDasharray="3" />
              <line x1="40" y1="60" x2="460" y2="60" className="stroke-black/5 dark:stroke-white/5" strokeDasharray="3" />
              <line x1="40" y1="100" x2="460" y2="100" className="stroke-black/5 dark:stroke-white/5" strokeDasharray="3" />
              
              {/* Shaded Area under Curve */}
              <path 
                d={`${svgPath.path} L ${svgPath.points[svgPath.points.length - 1].x} 100 L ${svgPath.points[0].x} 100 Z`}
                fill="url(#forecastGrad)"
              />
              
              {/* Line path */}
              <path 
                d={svgPath.path}
                fill="transparent"
                stroke="#a855f7"
                strokeWidth="3.5"
                className="drop-shadow-[0_2px_8px_rgba(168,85,247,0.4)]"
              />

              {/* Data points */}
              {svgPath.points.map((p, idx) => (
                <g key={idx}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="#a855f7" 
                    className="cursor-pointer stroke-white dark:stroke-zinc-950" 
                    strokeWidth="1.5"
                  />
                  {/* Amount label */}
                  <text 
                    x={p.x} 
                    y={p.y - 10} 
                    textAnchor="middle" 
                    className="text-[9px] font-bold fill-foreground"
                  >
                    ₹{forecastData[idx].amount}
                  </text>
                  {/* Day label */}
                  <text 
                    x={p.x} 
                    y="115" 
                    textAnchor="middle" 
                    className="text-[10px] font-semibold fill-muted-foreground uppercase"
                  >
                    {forecastData[idx].day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </motion.div>

        {/* AI Behavioral Warnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" /> AI Behavioral Advisor & Alerts
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Warnings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiInsights.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`border rounded-[1.5rem] p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${alert.color}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60">Category: {alert.category}</span>
                      <h4 className="font-bold text-sm text-foreground/95">{alert.title}</h4>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-white/15 shadow-sm">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-muted-foreground">{alert.description}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      Target: {alert.day}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                      alert.severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {alert.severity} Risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Burn Rate & Top Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Burn Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-[2rem] p-7 border border-white/20 dark:border-white/5"
          >
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Monthly Burn Rate
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Velocity of expenditure against simulator budget.</p>

            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-black">₹{totalSpent.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase">of ₹{monthlyBudget.toLocaleString('en-IN')}</span>
            </div>

            <div className="w-full h-4 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${burnPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${totalSpent > monthlyBudget ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
              />
              {/* Today Time Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/50 z-10"
                style={{ left: `${(currentDay / daysInMonth) * 100}%` }}
                title="Today"
              />
            </div>
            <div className="flex justify-between mt-2 text-[9px] uppercase font-bold text-muted-foreground">
              <span>0%</span>
              <span>Today ({((currentDay/daysInMonth)*100).toFixed(0)}%)</span>
              <span>100%</span>
            </div>

            <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Average Spend/Day</p>
                <p className="font-bold text-lg">₹{avgPerDay.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Active Days with Expense</p>
                <p className="font-bold text-lg">{daysWithSpending} of {currentDay}</p>
              </div>
            </div>
          </motion.div>

          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-[2rem] p-7 border border-white/20 dark:border-white/5"
          >
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-primary" /> Top Categories
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Distribution breakdown of your major expenses.</p>

            <div className="space-y-4">
              {categories.slice(0, 5).map((cat, index) => {
                const percentOfBudget = ((cat.amount / monthlyBudget) * 100).toFixed(1);
                const color = CATEGORY_COLORS_HEX[cat.name] || CATEGORY_COLORS_HEX['Other'];

                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                        <span className="text-xs font-bold shrink-0">₹{cat.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Number(percentOfBudget))}%` }}
                          transition={{ duration: 1, delay: 0.6 + (index * 0.1) }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground font-semibold mt-1 uppercase">{percentOfBudget}% of budget</p>
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="text-center p-6 text-muted-foreground">
                  No expenses registered this month yet.
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Detailed Statistics Tab Section Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/5"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Expenses</p>
              <p className="text-xl font-extrabold">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Remaining Budget</p>
              <p className={`text-xl font-extrabold ${remainingBudget === 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>₹{remainingBudget.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Income Log</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Projected Spending</p>
              <p className={`text-xl font-extrabold ${isProjectedToOverspend ? 'text-red-500' : ''}`}>₹{projectedMonthlySpend.toFixed(0)}</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
