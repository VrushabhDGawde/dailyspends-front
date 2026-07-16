import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Inbox, ArrowRight } from 'lucide-react';

const dummyFailedSms = [
  { id: 'f1', userId: 'usr_1', sender: 'VM-SWIGGY', receivedAt: '2023-11-01 14:30', body: 'Your Swiggy order #4928 is confirmed. Total amount Rs 450.00 will be deducted from your linked card.', reason: 'Amount format not recognized' },
  { id: 'f2', userId: 'usr_4', sender: 'AX-AMZNIN', receivedAt: '2024-02-05 09:15', body: 'Thanks for paying Rs.1299 via Amazon Pay for your recent order.', reason: 'Unknown Transaction Type (Debit/Credit)' },
  { id: 'f3', userId: 'usr_2', sender: 'JD-JIOCHG', receivedAt: '2023-12-15 18:45', body: 'Recharge of Rs.299 successful for your Jio number ending 9090.', reason: 'Failed to extract Merchant' },
];

export function AdminResolutionQueue() {
  const [queue, setQueue] = useState(dummyFailedSms);
  const [selectedItem, setSelectedItem] = useState(dummyFailedSms[0] || null);
  
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Shopping');
  const [txType, setTxType] = useState('DEBIT');

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // In a real app, we would POST this to the backend
    console.log('Resolved:', { originalId: selectedItem.id, amount, merchant, category, txType });

    // Remove from queue
    const newQueue = queue.filter(item => item.id !== selectedItem.id);
    setQueue(newQueue);
    
    // Select next item
    setSelectedItem(newQueue[0] || null);
    
    // Reset form
    setAmount('');
    setMerchant('');
  };

  return (
    <div className="flex-1 p-8 min-h-screen flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Resolution Queue</h1>
        <p className="text-zinc-400 mt-1">Manually resolve SMS messages that the ML parser failed to understand.</p>
      </header>

      {queue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 border border-white/10 rounded-3xl p-12">
          <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Queue is Empty!</h2>
          <p className="text-zinc-400">All failed transactions have been resolved.</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Queue List */}
          <div className="lg:col-span-1 bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Inbox className="w-4 h-4" /> Pending
              </h2>
              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-md">
                {queue.length} items
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {queue.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => {
                      setSelectedItem(item);
                      setAmount('');
                      setMerchant('');
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      selectedItem?.id === item.id 
                        ? 'bg-zinc-800 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                        : 'bg-zinc-950/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-zinc-300 px-2 py-0.5 bg-white/10 rounded">
                        {item.sender}
                      </span>
                      <span className="text-xs text-zinc-500">{item.receivedAt}</span>
                    </div>
                    <p className="text-xs text-orange-400 font-semibold mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {item.reason}
                    </p>
                    <p className="text-sm text-zinc-400 line-clamp-2 italic">"{item.body}"</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Resolution Workspace */}
          <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden">
            {/* Background glowing accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <h2 className="text-xl font-bold text-white mb-6">Resolve Transaction</h2>
            
            <div className="bg-zinc-950 border border-white/5 p-6 rounded-2xl mb-8 relative">
              <div className="absolute -top-3 left-4 bg-zinc-800 text-zinc-400 text-xs font-bold px-2 py-1 rounded border border-white/10">
                Raw SMS Content
              </div>
              <p className="text-lg text-zinc-300 leading-relaxed font-medium">
                "{selectedItem?.body}"
              </p>
            </div>

            <form onSubmit={handleResolve} className="space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Extracted Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Merchant Name</label>
                  <input 
                    type="text" 
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Swiggy"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 appearance-none"
                  >
                    <option>Food & Dining</option>
                    <option>Shopping</option>
                    <option>Transport</option>
                    <option>Bills & Utilities</option>
                    <option>Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Transaction Type</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setTxType('DEBIT')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${txType === 'DEBIT' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      DEBIT (Expense)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTxType('CREDIT')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${txType === 'CREDIT' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      CREDIT (Income)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
                <button 
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors"
                >
                  Resolve & Save <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
