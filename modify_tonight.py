import re

with open('src/pages/TonightPage.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "} from 'lucide-react';",
    "  Clock, CalendarDays, Grid, ChevronRight, List, ArrowDownRight\n} from 'lucide-react';"
)

# 2. Add interface before TonightPage
interface_def = """
interface DaySummary {
  date: string;
  dateObj: Date;
  totalSpent: number;
  totalIncome: number;
  transactions: RawSmsLog[];
  categories: { name: string; amount: number }[];
  isReviewed: boolean;
}
"""
content = content.replace(
    "export function TonightPage() {",
    interface_def + "\nexport function TonightPage() {"
)

# 3. Add state inside TonightPage
state_add = """
  // --- CALENDAR STATE ---
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
"""
content = content.replace(
    "const [quickAddPaymentMode, setQuickAddPaymentMode] = useState('UPI');",
    "const [quickAddPaymentMode, setQuickAddPaymentMode] = useState('UPI');\n" + state_add
)

# 4. Add Memos
memo_add = """
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
"""
content = content.replace(
    "const todayString = new Date().toISOString().split('T')[0];",
    memo_add + "\n  const todayString = new Date().toISOString().split('T')[0];"
)

# 5. Add Calendar UI at the bottom
ui_add = """
        {/* --- MONTHLY CALENDAR HEATMAP --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-6 pb-4 border-t border-white/10"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold">Monthly Expense Heatmap</h3>
              <p className="text-xs text-muted-foreground">Track your daily spending intensity.</p>
            </div>
            {/* Month Selector */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedCalendarDate(null);
                }}
                className="bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 border border-white/10">
            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 gap-2 mb-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Heatmap Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.grid.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-16 md:h-20 bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl border border-transparent" />;
                }

                const dateString = `${calendarGrid.year}-${calendarGrid.monthStr}-${String(day).padStart(2, '0')}`;
                const dayData = daySummaries.find(s => s.date === dateString);
                const spend = dayData ? dayData.totalSpent : 0;
                const isSelected = selectedCalendarDate === dateString;

                let intensityClasses = "border border-border/40 text-foreground hover:bg-black/5 dark:hover:bg-white/5";
                
                if (spend > 0) {
                  if (spend <= 500) {
                    intensityClasses = "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 hover:bg-violet-500/15";
                  } else if (spend <= 1500) {
                    intensityClasses = "bg-violet-500/25 text-violet-800 dark:text-violet-200 border-violet-500/35 hover:bg-violet-500/30 font-semibold";
                  } else if (spend <= 3000) {
                    intensityClasses = "bg-violet-500/50 text-white border-violet-500/60 hover:bg-violet-500/55 font-bold";
                  } else {
                    intensityClasses = "bg-violet-600 text-white border-violet-700 hover:bg-violet-700 font-black shadow-inner ring-1 ring-violet-400";
                  }
                }

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (spend > 0) {
                        setSelectedCalendarDate(isSelected ? null : dateString);
                      } else {
                        setSelectedCalendarDate(null);
                      }
                    }}
                    className={`h-16 md:h-20 w-full rounded-2xl p-2 flex flex-col justify-between items-start transition-all ${intensityClasses} ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950 scale-102 z-10' : ''
                    } ${spend === 0 ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="text-xs font-bold">{day}</span>
                    {spend > 0 && (
                      <span className="text-[10px] md:text-xs font-extrabold tracking-tight self-center">
                        ₹{spend.toLocaleString('en-IN')}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Drawer/Container */}
          <AnimatePresence>
            {selectedCalendarDate && selectedCalendarDayData && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass rounded-[2rem] p-6 border border-white/10 space-y-4 mt-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <div>
                    <h3 className="font-bold text-lg">
                      Transactions on {selectedCalendarDayData.dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold mt-0.5">
                      Total Spent: ₹{selectedCalendarDayData.totalSpent.toLocaleString('en-IN')} • {selectedCalendarDayData.transactions.length} Transactions
                    </p>
                  </div>
                  {selectedCalendarDayData.isReviewed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Pending Review
                    </span>
                  )}
                </div>

                {/* Transactions rows */}
                <div className="space-y-3.5">
                  {selectedCalendarDayData.transactions.map(tx => {
                    const isCredit = tx.transactionType === 'CREDIT';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                            {isCredit ? <ArrowUpRight className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="w-4.5 h-4.5 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{tx.merchantClean || tx.merchantRaw || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{tx.category} • {tx.paymentMode} • {new Date(tx.transactionDate || tx.receivedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <p className={`font-bold text-sm shrink-0 ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                          {isCredit ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
"""

content = content.replace(
    "      </div>\n    </div>\n  );\n}",
    ui_add + "\n      </div>\n    </div>\n  );\n}"
)

with open('src/pages/TonightPage.tsx', 'w') as f:
    f.write(content)
