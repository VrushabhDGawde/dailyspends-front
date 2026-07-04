import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Store, Tag, Calendar, ArrowRight } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [type, setType] = useState('DEBIT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate adding expense
    console.log("Expense Added:", { amount, merchant, category, type });
    alert("Expense added successfully! (Mock)");
    onClose();
    // Reset form
    setAmount('');
    setMerchant('');
    setCategory('Food & Dining');
    setType('DEBIT');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            <div className="glass bg-white/90 dark:bg-zinc-900/90 p-8 rounded-[2rem] shadow-2xl border border-white/50 dark:border-white/10 relative z-10">
              
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-1">Add Transaction</h2>
                <p className="text-sm text-muted-foreground">Manually log a cash expense or income.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Type Toggle */}
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('DEBIT')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'DEBIT' ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('CREDIT')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'CREDIT' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Income
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="number" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-10 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Merchant / Source</label>
                  <div className="relative">
                    <Store className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      required
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="e.g. Starbucks or Salary" 
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Category</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                    >
                      <option>Food & Dining</option>
                      <option>Shopping</option>
                      <option>Transport & Fuel</option>
                      <option>Groceries</option>
                      <option>Entertainment</option>
                      <option>Income</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-foreground text-background font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 mt-6 shadow-md hover:shadow-lg transition-all"
                >
                  Save Transaction
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
