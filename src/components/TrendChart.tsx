import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { RawSmsLog } from '../services/api';

interface Props {
  transactions: RawSmsLog[];
}

export function TrendChart({ transactions }: Props) {
  // Aggregate expenses for the last 7 days
  const chartData = React.useMemo(() => {
    const data = [];
    const expenses = transactions.filter(t => t.transactionType === 'DEBIT');
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const dayTotal = expenses
        .filter(t => {
          const tDate = new Date(t.transactionDate || t.receivedAt).toISOString().split('T')[0];
          return tDate === dateString;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);
        
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateString,
        amount: dayTotal
      });
    }
    return data;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass px-4 py-3 rounded-2xl shadow-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', delay: 0.1 }}
      className="glass rounded-3xl p-6 h-full flex flex-col"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Spending Trend</h2>
        <p className="text-sm text-muted-foreground">Last 7 days overview</p>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2, strokeDasharray: '3 3' }} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#8b5cf6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
