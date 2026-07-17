import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Inbox, ArrowRight, MessageSquare, CheckCheck } from 'lucide-react';
import { type RawSmsLog } from '../services/api';

interface Props {
  unverifiedTransactions: RawSmsLog[];
  onResolve: (updatedTx: RawSmsLog) => void;
  onApproveAll?: () => void;
}

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transport & Fuel', 'Groceries', 
  'Entertainment', 'Utilities', 'Housing', 'Income', 'Other'
];

export function UserResolutionCenter({ unverifiedTransactions, onResolve, onApproveAll }: Props) {
  const [selectedItem, setSelectedItem] = useState<RawSmsLog | null>(null);
  
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Other');
  const [txType, setTxType] = useState('DEBIT');

  // Auto-select first item when list changes
  useEffect(() => {
    if (unverifiedTransactions.length > 0 && !selectedItem) {
      setSelectedItem(unverifiedTransactions[0]);
    } else if (unverifiedTransactions.length === 0) {
      setSelectedItem(null);
    }
  }, [unverifiedTransactions, selectedItem]);

  // Pre-fill form when a new item is selected
  useEffect(() => {
    if (selectedItem) {
      setAmount(selectedItem.amount?.toString() || '');
      setMerchant(selectedItem.merchantClean || selectedItem.merchantRaw || '');
      setCategory(selectedItem.category || 'Other');
      setTxType(selectedItem.transactionType || 'DEBIT');
    }
  }, [selectedItem]);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updatedTx: RawSmsLog = {
      ...selectedItem,
      amount: parseFloat(amount) || 0,
      merchantClean: merchant,
      category: category,
      transactionType: txType
    };

    onResolve(updatedTx);
    
    // Reset selection so the next item gets auto-selected by the effect
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col mt-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" /> SMS Resolution Inbox
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Review and approve your auto-fetched SMS transactions.</p>
        </div>
        {onApproveAll && unverifiedTransactions.length > 0 && (
          <button 
            onClick={onApproveAll}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 text-sm"
          >
            <CheckCheck className="w-4 h-4" /> Approve All
          </button>
        )}
      </div>

      {unverifiedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border border-dashed border-border rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Inbox Empty!</h3>
          <p className="text-muted-foreground text-sm max-w-sm">All fetched SMS transactions have been reviewed and approved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Queue List */}
          <div className="lg:col-span-1 bg-white/50 dark:bg-black/20 border border-border rounded-3xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-border bg-black/5 dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                Unverified SMS
              </h3>
              <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-md">
                {unverifiedTransactions.length} Pending
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {unverifiedTransactions.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      selectedItem?.id === item.id 
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.15)]' 
                        : 'bg-background border-transparent hover:border-border'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded">
                        {item.sender || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(item.receivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    {(!item.amount || !item.merchantClean) && (
                      <p className="text-[10px] text-orange-500 font-bold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Needs Attention
                      </p>
                    )}
                    <p className="text-xs text-foreground/80 line-clamp-2 italic">"{item.smsBody}"</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Resolution Workspace */}
          <div className="lg:col-span-2 bg-white/50 dark:bg-black/20 border border-border rounded-3xl p-6 flex flex-col relative overflow-hidden h-[500px]">
            {/* Background glowing accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-lg font-bold mb-4 z-10">Review Details</h3>
            
            <div className="bg-background border border-border p-5 rounded-2xl mb-6 relative z-10">
              <div className="absolute -top-3 left-4 bg-muted text-muted-foreground text-[10px] font-bold px-2 py-1 rounded border border-border flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Raw SMS Content
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-medium italic mt-2">
                "{selectedItem?.smsBody}"
              </p>
            </div>

            <form onSubmit={handleResolve} className="space-y-5 flex-1 overflow-y-auto z-10 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">Extracted Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">Transaction Type</label>
                  <div className="flex bg-muted/30 rounded-xl p-1 border border-border">
                    <button 
                      type="button"
                      onClick={() => setTxType('DEBIT')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${txType === 'DEBIT' ? 'bg-background shadow-sm text-foreground border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Debit (Spend)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTxType('CREDIT')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${txType === 'CREDIT' ? 'bg-background shadow-sm text-foreground border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Credit (Income)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">Merchant Name</label>
                  <input 
                    type="text" 
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Swiggy"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={!selectedItem}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                >
                  Approve & Save <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
