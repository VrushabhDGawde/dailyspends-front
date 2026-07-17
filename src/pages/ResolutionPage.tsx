import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchTransactions, type RawSmsLog } from '../services/api';
import { UserResolutionCenter } from '../components/UserResolutionCenter';

export function ResolutionPage() {
  const [transactions, setTransactions] = useState<RawSmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const unverifiedTxs = useMemo(() => {
    return transactions.filter(t => !t.isReviewed && t.transactionType === 'DEBIT');
  }, [transactions]);

  const handleResolve = (updatedTx: RawSmsLog) => {
    const finalTx = { ...updatedTx, isReviewed: true };
    setTransactions(prev => prev.map(t => t.id === finalTx.id ? finalTx : t));
    
    // In a real app, you would make an API call here to save the updated transaction to the backend
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">Resolution Center</h1>
        <p className="text-muted-foreground mt-2 text-lg">Verify your auto-fetched SMS transactions before they hit your analytics.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <UserResolutionCenter 
          unverifiedTransactions={unverifiedTxs}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
