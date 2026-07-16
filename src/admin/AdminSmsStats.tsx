import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { MessageSquareText, CheckCircle2, AlertOctagon, TrendingUp, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Dummy Data ---
const dailyVolumeData = [
  { date: 'Jul 01', volume: 45000, count: 120 },
  { date: 'Jul 02', volume: 52000, count: 145 },
  { date: 'Jul 03', volume: 38000, count: 110 },
  { date: 'Jul 04', volume: 61000, count: 160 },
  { date: 'Jul 05', volume: 75000, count: 195 },
  { date: 'Jul 06', volume: 82000, count: 210 },
  { date: 'Jul 07', volume: 90000, count: 240 },
  { date: 'Jul 08', volume: 110000, count: 280 },
  { date: 'Jul 09', volume: 95000, count: 250 },
  { date: 'Jul 10', volume: 88000, count: 220 },
  { date: 'Jul 11', volume: 105000, count: 260 },
  { date: 'Jul 12', volume: 115000, count: 290 },
  { date: 'Jul 13', volume: 125000, count: 310 },
  { date: 'Jul 14', volume: 142000, count: 350 },
];

const parsingStatusData = [
  { name: 'Successfully Parsed', value: 92.5, color: '#10b981' }, // Green
  { name: 'Unrecognized Format', value: 4.2, color: '#f59e0b' },  // Orange
  { name: 'Ignored (Spam/Promotional)', value: 3.3, color: '#64748b' } // Slate
];

const topSendersData = [
  { name: 'HDFC-TXN', value: 14500 },
  { name: 'SBI-UPI', value: 12200 },
  { name: 'ICICI-ALRT', value: 8900 },
  { name: 'AXIS-BNK', value: 6400 },
  { name: 'KOTAK-MSG', value: 4200 },
];

const recentFailures = [
  { id: 'err_1', time: '10 mins ago', sender: 'VM-SWIGGY', preview: 'Your Swiggy order #4928 is confirmed...', reason: 'Missing Amount Pattern' },
  { id: 'err_2', time: '25 mins ago', sender: 'AX-AMZNIN', preview: 'Thanks for paying via Amazon Pay...', reason: 'Unknown Transaction Type' },
  { id: 'err_3', time: '1 hr ago', sender: 'JD-JIOCHG', preview: 'Recharge of Rs.299 successful for...', reason: 'Failed to extract Merchant' },
];

export function AdminSmsStats() {
  const totalVolume = useMemo(() => dailyVolumeData.reduce((acc, curr) => acc + curr.volume, 0), []);
  const totalCount = useMemo(() => dailyVolumeData.reduce((acc, curr) => acc + curr.count, 0), []);

  return (
    <div className="flex-1 p-8 min-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SMS Analytics</h1>
          <p className="text-zinc-400 mt-1">Deep dive into transaction parsing performance & volume.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors">
          <Filter className="w-4 h-4" /> Last 14 Days
        </button>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-40 group hover:border-red-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-zinc-400 font-semibold">Total SMS Parsed</p>
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white">{totalCount.toLocaleString()}</h2>
            <p className="text-sm text-green-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +12.5% this week
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-40 group hover:border-red-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-zinc-400 font-semibold">Parsing Success Rate</p>
            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white">92.5%</h2>
            <p className="text-sm text-green-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +1.2% this week
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-40 group hover:border-red-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-zinc-400 font-semibold">Total Tracked Volume</p>
            <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <span className="font-bold">₹</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white">₹{(totalVolume / 100000).toFixed(2)}L</h2>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Across all active users</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Daily Volume Area Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-3xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Daily Processed Volume (₹)</h2>
            <p className="text-sm text-zinc-500">Transaction amounts parsed successfully over time.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyVolumeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Volume']}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Parsing Status Donut Chart */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Parsing Status</h2>
            <p className="text-sm text-zinc-500">Model hit rate</p>
          </div>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="adminPieShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.4" floodColor="#000" />
                  </filter>
                </defs>
                <Pie
                  data={parsingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {parsingStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      filter="url(#adminPieShadow)"
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => `${value}%`}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#18181b', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white">92.5%</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">Success</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {parsingStatusData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Senders & Failed Parses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Senders Bar Chart */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Top SMS Senders</h2>
            <p className="text-sm text-zinc-500">Highest volume by bank/sender ID.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSendersData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}
                  width={90}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Messages']}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Parsing Failures Log */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-orange-500" /> Recent Failures
              </h2>
              <p className="text-sm text-zinc-500">SMS formats requiring ML model updates.</p>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {recentFailures.map(fail => (
              <motion.div 
                key={fail.id} 
                className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 hover:bg-black/40 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md">
                    {fail.sender}
                  </span>
                  <span className="text-xs text-zinc-500">{fail.time}</span>
                </div>
                <p className="text-sm text-zinc-300 italic">"{fail.preview}"</p>
                <p className="text-xs text-orange-400 font-semibold flex items-center gap-1.5 mt-1">
                  Reason: {fail.reason}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
