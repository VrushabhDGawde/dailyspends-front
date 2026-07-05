import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, RefreshCw, ArrowDownRight, ArrowUpRight, Edit3, Check, X, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTransactions, type RawSmsLog } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { PieChart as PieChartIcon, List as ListIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-border shadow-xl rounded-2xl p-4">
        <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm font-black flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface TransactionsPageProps {
  initialFilter?: { fromDate?: string; toDate?: string } | null;
  onFilterConsumed?: () => void;
}

export function TransactionsPage({ initialFilter, onFilterConsumed }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<RawSmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Sort & View
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ amount: 0, merchant: '', category: '' });

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

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.fromDate) setFromDate(initialFilter.fromDate);
      if (initialFilter.toDate) setToDate(initialFilter.toDate);
      if (onFilterConsumed) onFilterConsumed();
    }
  }, [initialFilter, onFilterConsumed]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [transactions]);

  const dateRangeLabel = useMemo(() => {
    if (transactions.length === 0) return null;
    let minDate = new Date().getTime();
    let maxDate = 0;
    
    transactions.forEach(t => {
      const d = new Date(t.transactionDate || t.receivedAt).getTime();
      if (!isNaN(d)) {
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    });
    
    if (maxDate === 0) return null;
    
    const format = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Data available from ${format(minDate)} to ${format(maxDate)}`;
  }, [transactions]);

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        ((t.merchantClean || t.merchantRaw) && (t.merchantClean || t.merchantRaw).toLowerCase().includes(q)) ||
        (t.smsBody && t.smsBody.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (typeFilter !== 'ALL') {
      result = result.filter(t => t.transactionType === typeFilter);
    }
    
    if (fromDate) {
      const from = new Date(fromDate + 'T00:00:00').getTime();
      result = result.filter(t => new Date(t.transactionDate || t.receivedAt).getTime() >= from);
    }
    
    if (toDate) {
      const to = new Date(toDate + 'T23:59:59').getTime();
      result = result.filter(t => new Date(t.transactionDate || t.receivedAt).getTime() <= to);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const d1 = new Date(a.transactionDate || a.receivedAt).getTime();
        const d2 = new Date(b.transactionDate || b.receivedAt).getTime();
        return sortOrder === 'desc' ? d2 - d1 : d1 - d2;
      } else {
        const a1 = a.amount || 0;
        const a2 = b.amount || 0;
        return sortOrder === 'desc' ? a2 - a1 : a1 - a2;
      }
    });

    return result;
  }, [transactions, searchQuery, categoryFilter, typeFilter, fromDate, toDate, sortBy, sortOrder]);

  const { totalDebit, totalCredit, chartData } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    const dailyMap: Record<string, { debit: number, credit: number }> = {};

    filteredAndSorted.forEach(t => {
      const amt = t.amount || 0;
      const dateStr = new Date(t.transactionDate || t.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { debit: 0, credit: 0 };
      
      if (t.transactionType === 'DEBIT') {
        debit += amt;
        dailyMap[dateStr].debit += amt;
      } else {
        credit += amt;
        dailyMap[dateStr].credit += amt;
      }
    });
    
    const chartDataList = Object.keys(dailyMap).map(date => ({
      date,
      debit: dailyMap[date].debit,
      credit: dailyMap[date].credit,
    })).reverse(); // Assuming descending sort by default, reversing for chronological chart

    return { totalDebit: debit, totalCredit: credit, chartData: chartDataList };
  }, [filteredAndSorted]);

  const categoryPieData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredAndSorted.forEach(tx => {
      // If we are looking at ALL, maybe group by category but only sum expenses?
      // Usually pie chart is best for expenses. Let's sum absolute amounts.
      if (tx.transactionType === 'DEBIT') {
        const amt = tx.amount || 0;
        cats[tx.category] = (cats[tx.category] || 0) + amt;
      }
    });
    return Object.keys(cats).map(name => ({ name, value: cats[name] })).sort((a,b) => b.value - a.value);
  }, [filteredAndSorted]);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const startEdit = (tx: RawSmsLog) => {
    setEditingId(tx.id);
    setEditForm({
      amount: tx.amount || 0,
      merchant: tx.merchantClean || tx.merchantRaw || '',
      category: tx.category || 'Other'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: number) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          amount: editForm.amount,
          merchantClean: editForm.merchant,
          category: editForm.category
        };
      }
      return t;
    }));
    setEditingId(null);
  };

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
    <div className="p-4 md:p-8 w-full overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
            <h1 className="text-3xl font-bold tracking-tight mb-1">All Transactions</h1>
            <p className="text-muted-foreground text-sm">Advanced view of your complete history with filters.</p>
          </motion.div>
          {dateRangeLabel && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring', delay: 0.1 }}
              className="px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10 tracking-wide"
            >
              {dateRangeLabel}
            </motion.div>
          )}
        </header>

        {/* Filters & Controls */}
        <div className="glass rounded-3xl p-6 mb-6 border border-white/10 relative z-50">
          <div className="flex flex-col xl:flex-row gap-4 items-end">
            
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search merchants or messages..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full sm:w-auto">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <CalendarIcon className="w-4 h-4 text-primary hidden sm:block" />
                  <div className="flex-1 sm:flex-none">
                    <CustomDatePicker 
                      value={fromDate}
                      onChange={setFromDate}
                      placeholder="From Date"
                    />
                  </div>
                </div>
                <span className="text-muted-foreground text-xs font-extrabold mx-1 uppercase tracking-widest hidden sm:block">TO</span>
                <div className="flex items-center justify-center sm:hidden w-full h-px bg-border my-1 relative">
                  <span className="absolute bg-background px-2 text-[10px] text-muted-foreground font-bold">TO</span>
                </div>
                <div className="w-full sm:w-auto flex-1 sm:flex-none">
                  <CustomDatePicker 
                    value={toDate}
                    onChange={setToDate}
                    placeholder="To Date"
                  />
                </div>
              </div>

              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium w-full sm:w-auto"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium w-full sm:w-auto"
              >
                <option value="ALL">All Types</option>
                <option value="DEBIT">Expense (Debit)</option>
                <option value="CREDIT">Income (Credit)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Top Widget: Totals & Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
        >
          {/* Totals */}
          <div className="glass rounded-[2rem] p-8 border border-white/10 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filtered Spend</h3>
              </div>
              <p className="text-4xl font-black text-foreground">₹{totalDebit.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="h-px w-full bg-border" />
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filtered Income</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">+₹{totalCredit.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 glass rounded-[2rem] p-6 border border-white/10 h-[300px] flex flex-col">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 
              Expense & Income Trend (Filtered)
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                    tickFormatter={(val) => `₹${val}`}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.2 }} />
                  <Area type="monotone" dataKey="credit" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCredit)" />
                  <Area type="monotone" dataKey="debit" name="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDebit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Data Table / Pie Chart Toggle & View */}
        <div className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col">
          <div className="p-4 border-b border-border/50 flex justify-end">
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-1 flex items-center gap-1">
              <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ListIcon className="w-4 h-4" /> Table
              </button>
              <button 
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'chart' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <PieChartIcon className="w-4 h-4" /> Breakdown
              </button>
            </div>
          </div>
          
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {viewMode === 'table' ? (
                <motion.div 
                  key="table"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-x-auto w-full"
                >
                  <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-black/5 dark:bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-5 font-semibold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group w-[150px]" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'date' ? 'text-primary' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  </th>
                  <th className="p-5 font-semibold">Merchant / Details</th>
                  <th className="p-5 font-semibold w-[200px]">Category</th>
                  <th className="p-5 font-semibold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group w-[180px]" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'amount' ? 'text-primary' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  </th>
                  <th className="p-5 font-semibold w-[80px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 mb-3 opacity-20" />
                        <p>No transactions found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((tx) => {
                    const isDebit = tx.transactionType === 'DEBIT';
                    const Icon = isDebit ? ArrowDownRight : ArrowUpRight;
                    const isEditing = editingId === tx.id;
                    
                    return (
                      <tr key={tx.id} className={`transition-colors ${isEditing ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-white/30 dark:hover:bg-black/10'}`}>
                        <td className="p-5 whitespace-nowrap align-top">
                          <div className="text-sm font-bold">
                            {new Date(tx.transactionDate || tx.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                            {new Date(tx.transactionDate || tx.receivedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        
                        <td className="p-5 align-top">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editForm.merchant}
                              onChange={e => setEditForm(prev => ({ ...prev, merchant: e.target.value }))}
                              className="w-full bg-background border border-primary/30 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                              placeholder="Merchant Name"
                            />
                          ) : (
                            <>
                              <div className="text-sm font-bold text-foreground/90">{tx.merchantClean || tx.merchantRaw || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground max-w-md truncate" title={tx.smsBody}>
                                {tx.smsBody}
                              </div>
                            </>
                          )}
                        </td>
                        
                        <td className="p-5 align-top">
                          {isEditing ? (
                            <select
                              value={editForm.category}
                              onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-background border border-primary/30 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {categories.length > 0 ? categories.map(c => <option key={c} value={c}>{c}</option>) : <option value="Other">Other</option>}
                              {!categories.includes('Other') && <option value="Other">Other</option>}
                            </select>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 text-foreground/80">
                              {tx.category || 'Uncategorized'}
                            </span>
                          )}
                        </td>
                        
                        <td className="p-5 text-right align-top">
                          {isEditing ? (
                            <div className="flex justify-end items-center gap-1 text-sm font-bold">
                              {isDebit ? '-' : '+'}₹
                              <input 
                                type="number" 
                                value={editForm.amount}
                                onChange={e => setEditForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                className="w-24 bg-background border border-primary/30 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                          ) : (
                            <>
                              <div className={`text-sm font-black flex items-center justify-end gap-1 ${isDebit ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {isDebit ? '-' : '+'}&#8377;{(tx.amount || 0).toLocaleString('en-IN')}
                                <Icon className="w-4 h-4 opacity-70" />
                              </div>
                              {tx.postBalance > 0 && (
                                <div className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
                                  Bal: &#8377;{tx.postBalance.toLocaleString('en-IN')}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        <td className="p-5 align-top text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => saveEdit(tx.id)} className="p-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors" title="Save">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors" title="Cancel">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startEdit(tx)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                              title="Edit Transaction"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
                </motion.div>
              ) : (
                <motion.div 
                  key="chart"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-[500px] flex items-center justify-center p-8"
                >
                  {categoryPieData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <PieChartIcon className="w-12 h-12 mb-4 opacity-20" />
                      <p>No expense data to breakdown.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={160}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: any) => {
                            const shortName = name.length > 20 ? name.slice(0, 20) + '...' : name;
                            return `${shortName} ${((percent || 0) * 100).toFixed(0)}%`;
                          }}
                          labelLine={true}
                        >
                          {categoryPieData.map((entry, index) => {
                            const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#64748b', '#ef4444'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`}
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="p-4 border-t border-border bg-black/5 dark:bg-white/5 text-center text-xs font-bold text-muted-foreground tracking-wider uppercase">
            Showing {filteredAndSorted.length} transactions
          </div>
        </div>

      </div>
    </div>
  );
}
