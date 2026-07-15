import React, { useEffect, useState, useMemo } from 'react';
import { fetchTransactions, type RawSmsLog } from '../services/api';
import { MetricCard } from './MetricCard';
import { TransactionList } from './TransactionList';
import { ExpenseChart } from './ExpenseChart';
import { TrendChart } from './TrendChart';
import { FullCalendar } from './FullCalendar';
import { DailyHero } from './DailyHero';
import { IncomeCard } from './IncomeCard';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [transactions, setTransactions] = useState<RawSmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const { totalIncome, balance, expenseDates } = useMemo(() => {
    let income = 0;
    const dates = new Set<string>();

    transactions.forEach(t => {
      if (t.transactionType === 'DEBIT') {
        const d = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
        dates.add(d);
      }
      if (t.transactionType === 'CREDIT') income += (t.amount || 0);
    });

    const latestTx = transactions.length > 0 ? transactions[0] : null;
    const currentBalance = latestTx?.postBalance || 0;

    return { totalIncome: income, balance: currentBalance, expenseDates: dates };
  }, [transactions]);

  // Filter transactions for the selected date
  const filteredTransactions = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return transactions.filter(t => {
      const tDate = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
      return tDate === dateString;
    });
  }, [transactions, selectedDate]);

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
      <div className="max-w-[1400px] mx-auto space-y-6">

        <header className="flex justify-between items-end mb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
            <h1 className="text-3xl font-bold tracking-tight mb-1">DailySpends Overview</h1>
            <p className="text-muted-foreground text-sm">Your financial AI assistant.</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="p-2.5 bg-white/50 dark:bg-black/20 rounded-full shadow-sm hover:shadow-md transition-all backdrop-blur-md border border-border"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </header>

        {/* Desktop Split View Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Primary Focus (Daily Spend, Trends, Transactions) */}
          <div className="xl:col-span-2 space-y-6">
            <DailyHero transactions={transactions} selectedDate={selectedDate} />

            <div className="h-80">
              <TrendChart transactions={transactions} />
            </div>

            <div>
              <div className="mb-4 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <p className="text-sm text-muted-foreground">For {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : selectedDate.toLocaleDateString()}</p>
                </div>
                <button onClick={() => onNavigate('transactions')} className="text-sm font-medium text-primary hover:underline transition-all">See all</button>
              </div>
              <TransactionList transactions={filteredTransactions.length > 0 ? filteredTransactions : []} />
              {filteredTransactions.length === 0 && (
                <div className="glass rounded-3xl p-8 text-center text-muted-foreground mt-4">
                  No transactions recorded on this date.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Context & Navigation (Calendar, Metrics, Breakdown) */}
          <div className="xl:col-span-1 space-y-6">
            <FullCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              expenseDates={expenseDates}
            />

            <div className="flex flex-col gap-4">
              <MetricCard
                title="Current Balance"
                value={`₹${balance.toLocaleString('en-IN')}`}
                icon={Wallet}
                delay={0.1}
              />
              <IncomeCard amount={totalIncome} />
            </div>

            <div>
              <ExpenseChart transactions={transactions} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
