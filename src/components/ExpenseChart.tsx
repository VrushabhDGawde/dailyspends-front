import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { RawSmsLog } from '../services/api';
import { IndianRupee } from 'lucide-react';

interface Props {
  transactions: RawSmsLog[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'];

export function ExpenseChart({ transactions }: Props) {
  
  const { chartData, totalExpense } = useMemo(() => {
    const expenses = transactions.filter(t => t.transactionType === 'DEBIT');
    let total = 0;
    
    const categoryTotals = expenses.reduce((acc, tx) => {
      const cat = tx.category || 'Other';
      const amt = tx.amount || 0;
      acc[cat] = (acc[cat] || 0) + amt;
      total += amt;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    return { chartData: data, totalExpense: total };
  }, [transactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', delay: 0.2 }}
      className="glass rounded-3xl p-6 flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Expense Breakdown</h2>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex-1 min-h-[300px] flex items-center justify-center text-muted-foreground">
          No expenses recorded yet.
        </div>
      ) : (
        <div className="flex flex-col">
          
          {/* Donut Chart with Center Text */}
          <div className="relative h-48 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="expensePieShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.25" floodColor="#000" />
                  </filter>
                  <linearGradient id="expGrad0" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6d28d9"/></linearGradient>
                  <linearGradient id="expGrad1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
                  <linearGradient id="expGrad2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#047857"/></linearGradient>
                  <linearGradient id="expGrad3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
                  <linearGradient id="expGrad4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#b91c1c"/></linearGradient>
                  <linearGradient id="expGrad5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#be185d"/></linearGradient>
                  <linearGradient id="expGrad6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6b7280"/><stop offset="100%" stopColor="#374151"/></linearGradient>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="95%"
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={12}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#expGrad${index % 7})`} 
                      filter="url(#expensePieShadow)"
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)', background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(10px)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Total Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Total Spend</span>
              <span className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                <IndianRupee className="w-5 h-5 mr-0.5 opacity-70" />
                {totalExpense.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Custom Category List with Progress Bars */}
          <div className="space-y-4 pr-1 max-h-[220px] overflow-y-auto scrollbar-thin">
            {chartData.map((item, index) => {
              const percentage = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              const color = COLORS[index % COLORS.length];
              
              return (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground/80 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold">₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </motion.div>
  );
}
