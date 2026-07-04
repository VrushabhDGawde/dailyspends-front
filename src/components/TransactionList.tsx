import React from 'react';
import { motion } from 'framer-motion';
import type { RawSmsLog } from '../services/api';
import { Coffee, ShoppingBag, Zap, Car, Home, IndianRupee, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Food & Dining': <Coffee className="w-5 h-5" />,
  'Transport & Fuel': <Car className="w-5 h-5" />,
  'Shopping': <ShoppingBag className="w-5 h-5" />,
  'Utilities': <Zap className="w-5 h-5" />,
  'Housing': <Home className="w-5 h-5" />,
  'default': <IndianRupee className="w-5 h-5" />
};

interface Props {
  transactions: RawSmsLog[];
}

const listVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export function TransactionList({ transactions }: Props) {
  return (
    <div className="glass rounded-3xl p-6">
      <motion.div 
        variants={listVariant}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {transactions.map((tx) => {
          const isCredit = tx.transactionType === 'CREDIT';
          const Icon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS['default'];
          
          return (
            <motion.div 
              key={tx.id}
              variants={itemVariant}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }}
              className="flex items-center justify-between p-3 rounded-2xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isCredit ? 'bg-green-500/10 text-green-600' : 'bg-primary/5 text-primary/80'}`}>
                  {Icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground/90">{tx.merchantClean || tx.merchantRaw}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tx.category} • {new Date(tx.transactionDate || tx.receivedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold flex items-center justify-end gap-1 ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                  {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN') || 0}
                </p>
                {tx.paymentMode && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{tx.paymentMode}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
