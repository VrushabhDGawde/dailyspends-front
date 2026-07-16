import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageSquare, Edit3 } from 'lucide-react';
import { RawSmsLog } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: RawSmsLog | null;
  onSave: (updatedTx: RawSmsLog) => void;
}

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transport', 'Bills & Utilities', 
  'Entertainment', 'Health & Fitness', 'Travel', 'Income', 'Other'
];

export function TransactionReviewModal({ isOpen, onClose, transaction, onSave }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [txType, setTxType] = useState<string>('DEBIT');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount?.toString() || '');
      setMerchant(transaction.merchantClean || transaction.merchantRaw || '');
      setCategory(transaction.category || 'Other');
      setTxType(transaction.transactionType || 'DEBIT');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTx: RawSmsLog = {
      ...transaction,
      amount: parseFloat(amount) || 0,
      merchantClean: merchant,
      category: category,
      transactionType: txType
    };
    onSave(updatedTx);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background border border-border w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" /> Edit & Verify
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Make sure the AI extracted it correctly.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-muted/50 hover:bg-muted text-muted-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            
            {/* Raw SMS Preview */}
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl relative">
              <div className="absolute -top-3 left-4 bg-background text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Original SMS
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{transaction.smsBody || 'Manual Entry'}"
              </p>
              {transaction.sender && (
                <div className="mt-3 text-xs font-bold text-muted-foreground flex justify-end">
                  From: {transaction.sender}
                </div>
              )}
            </div>

            {/* Form */}
            <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-lg transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Type</label>
                  <div className="flex bg-muted/30 rounded-xl p-1 border border-border">
                    <button 
                      type="button"
                      onClick={() => setTxType('DEBIT')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${txType === 'DEBIT' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Debit
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTxType('CREDIT')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${txType === 'CREDIT' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Credit
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Merchant / Title</label>
                <input 
                  type="text" 
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium appearance-none transition-all cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-muted/30 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-background border border-border hover:bg-muted text-foreground font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              form="review-form"
              type="submit"
              className="flex-[2] py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              <CheckCircle2 className="w-5 h-5" /> Save Changes
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
