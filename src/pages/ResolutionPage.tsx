import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchTransactions, updateTransaction, type RawSmsLog } from '../services/api';
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
    // Only show TODAY's unverified transactions in this list. 
    // Older ones are auto-approved at midnight.
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions.filter(t => 
      !t.isReviewed && 
      t.transactionType === 'DEBIT' && 
      t.sender !== 'MANUAL' &&
      t.receivedAt && t.receivedAt.startsWith(todayStr)
    );
  }, [transactions]);

  const handleResolve = async (updatedTx: RawSmsLog) => {
    const finalTx = { ...updatedTx, isReviewed: true };
    setTransactions(prev => prev.map(t => t.id === finalTx.id ? finalTx : t));
    
    try {
      await updateTransaction(finalTx.id, finalTx);
    } catch (error) {
      console.error("Failed to save resolved transaction:", error);
      alert("Failed to save resolution. Please try again.");
    }
  };

  const handleApproveAll = async () => {
    const idsToApprove = new Set(unverifiedTxs.map(t => t.id));
    setTransactions(prev => prev.map(t => 
      idsToApprove.has(t.id) ? { ...t, isReviewed: true } : t
    ));
    
    try {
      await Promise.all(unverifiedTxs.map(t => 
        updateTransaction(t.id, { ...t, isReviewed: true })
      ));
    } catch (error) {
      console.error("Failed to approve all transactions:", error);
      alert("Some transactions failed to save. Please refresh and try again.");
    }
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
          onApproveAll={handleApproveAll}
        />
      )}
    </div>
  );
}
