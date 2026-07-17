import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MessageSquare, AlertTriangle, ArrowRight, CheckCheck } from 'lucide-react';
import { type RawSmsLog } from '../services/api';
import { TransactionReviewModal } from './TransactionReviewModal';

interface Props {
  unverifiedTransactions: RawSmsLog[];
  onResolve: (updatedTx: RawSmsLog) => void;
  onApproveAll: () => void;
}

export function UserResolutionCenter({ unverifiedTransactions, onResolve, onApproveAll }: Props) {
  const [editingTx, setEditingTx] = useState<RawSmsLog | null>(null);

  if (unverifiedTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-white/5 border border-dashed border-border rounded-3xl p-12 text-center h-[50vh]">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
        <p className="text-muted-foreground text-sm max-w-sm">No unverified SMS found for today. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-20">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Pending Review
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {unverifiedTransactions.length} SMS {unverifiedTransactions.length === 1 ? 'requires' : 'require'} your attention.
          </p>
        </div>
        <button 
          onClick={onApproveAll}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 text-sm"
        >
          <CheckCheck className="w-4 h-4" /> Approve All
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence>
          {unverifiedTransactions.map(tx => (
            <motion.div
              key={tx.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setEditingTx(tx)}
              className="bg-background border border-border hover:border-primary/50 transition-colors rounded-2xl p-5 cursor-pointer shadow-sm group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* SMS Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded uppercase tracking-wider">
                      {tx.sender || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(tx.receivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {(!tx.amount || !tx.merchantClean) && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Check Needed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 italic line-clamp-2">"{tx.smsBody}"</p>
                </div>

                {/* Extracted Data Preview */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Extracted</p>
                    <p className="font-bold text-foreground">
                      {tx.merchantClean || tx.merchantRaw || 'Unknown Merchant'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.category || 'Other'} • {tx.transactionType === 'CREDIT' ? 'Income' : 'Spend'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-extrabold ${tx.transactionType === 'CREDIT' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.transactionType === 'CREDIT' ? '+' : ''}₹{tx.amount?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                  
                  <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reused Edit Modal */}
      <TransactionReviewModal 
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
        onSave={(updated) => {
          onResolve(updated);
          setEditingTx(null);
        }}
      />
    </div>
  );
}
