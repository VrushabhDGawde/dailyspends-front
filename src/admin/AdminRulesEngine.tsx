import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Plus, Search, Trash2, Edit2 } from 'lucide-react';

interface Rule {
  id: string;
  keyword: string;
  category: string;
  txType: 'DEBIT' | 'CREDIT';
  isActive: boolean;
}

const initialRules: Rule[] = [
  { id: 'r1', keyword: 'SWIGGY', category: 'Food & Dining', txType: 'DEBIT', isActive: true },
  { id: 'r2', keyword: 'ZOMATO', category: 'Food & Dining', txType: 'DEBIT', isActive: true },
  { id: 'r3', keyword: 'UBER', category: 'Transport', txType: 'DEBIT', isActive: true },
  { id: 'r4', keyword: 'SALARY', category: 'Income', txType: 'CREDIT', isActive: true },
  { id: 'r5', keyword: 'AMAZON', category: 'Shopping', txType: 'DEBIT', isActive: true },
];

export function AdminRulesEngine() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [search, setSearch] = useState('');
  
  // New Rule Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Shopping');
  const [newTxType, setNewTxType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

  const filteredRules = rules.filter(r => r.keyword.toLowerCase().includes(search.toLowerCase()));

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: Rule = {
      id: `r_${Date.now()}`,
      keyword: newKeyword.toUpperCase(),
      category: newCategory,
      txType: newTxType,
      isActive: true
    };
    setRules([newRule, ...rules]);
    setIsAdding(false);
    setNewKeyword('');
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="flex-1 p-8 min-h-screen flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Rules Engine</h1>
          <p className="text-zinc-400 mt-1">Train the ML parser by adding global keyword-based categorization rules.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> New Rule
        </button>
      </header>

      {/* Add Rule Modal/Inline Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddRule} className="bg-zinc-900 border border-red-500/30 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-zinc-400 mb-2">If SMS contains keyword:</label>
                <input 
                  type="text" 
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. NETFLIX"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 uppercase"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Set Category to:</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 appearance-none"
                >
                  <option>Food & Dining</option>
                  <option>Shopping</option>
                  <option>Transport</option>
                  <option>Bills & Utilities</option>
                  <option>Entertainment</option>
                  <option>Income</option>
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Transaction Type:</label>
                <select 
                  value={newTxType}
                  onChange={(e) => setNewTxType(e.target.value as 'DEBIT' | 'CREDIT')}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 appearance-none"
                >
                  <option value="DEBIT">Expense (DEBIT)</option>
                  <option value="CREDIT">Income (CREDIT)</option>
                </select>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 md:flex-none px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-colors"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Table */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-red-500" /> Active Rules
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-widest">
                <th className="p-4 font-semibold">Keyword Match</th>
                <th className="p-4 font-semibold">Target Category</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No rules found.</td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <motion.tr 
                      key={rule.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`transition-colors group ${rule.isActive ? 'hover:bg-white/5' : 'bg-black/40 opacity-60'}`}
                    >
                      <td className="p-4">
                        <span className="font-mono font-bold text-white bg-white/10 px-2 py-1 rounded">
                          "{rule.keyword}"
                        </span>
                      </td>
                      <td className="p-4 font-medium text-zinc-300">
                        {rule.category}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${rule.txType === 'DEBIT' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {rule.txType}
                        </span>
                      </td>
                      <td className="p-4">
                         {/* Toggle Switch */}
                         <button 
                           onClick={() => toggleRule(rule.id)}
                           className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${rule.isActive ? 'bg-red-500' : 'bg-zinc-700'}`}
                         >
                           <motion.div 
                             layout
                             className="w-4 h-4 bg-white rounded-full shadow-md"
                             animate={{ x: rule.isActive ? 24 : 0 }}
                             transition={{ type: "spring", stiffness: 500, damping: 30 }}
                           />
                         </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-white/5">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteRule(rule.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
