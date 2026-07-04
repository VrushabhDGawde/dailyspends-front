import re

with open('src/pages/TonightPage.tsx', 'r') as f:
    content = f.read()

start_marker = '  return (\n    <div className="p-4 md:p-8 relative">'
if start_marker not in content:
    print("Marker not found")
    exit(1)

start_index = content.find(start_marker)

new_jsx = """  return (
    <div className="p-4 md:p-8 relative">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="bg-white dark:bg-zinc-900 shadow-2xl rounded-[2rem] p-10 text-center border border-white/50 dark:border-white/10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">All Done! 🎉</h2>
                <p className="text-muted-foreground">Today's transactions verified.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Greeting Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">{getGreeting()} 👋</h1>
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isQuickAddOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>Quick Log</span>
          </motion.button>
        </motion.header>

        {/* Quick Add Form Section */}
        <AnimatePresence>
          {isQuickAddOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -15 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleQuickAddSubmit} className="glass rounded-[2rem] p-6 border border-white/20 dark:border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-500" /> Log Missed Expense
                  </h3>
                  <button type="button" onClick={() => setIsQuickAddOpen(false)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 250"
                      value={quickAddAmount}
                      onChange={(e) => setQuickAddAmount(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Merchant / Description</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Tea Stall"
                      value={quickAddMerchant}
                      onChange={(e) => setQuickAddMerchant(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                    <select
                      value={quickAddCategory}
                      onChange={(e) => setQuickAddCategory(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {CATEGORIES.filter(c => c !== 'Income').map(cat => (
                        <option key={cat} value={cat} className="dark:bg-zinc-900">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                    <select
                      value={quickAddPaymentMode}
                      onChange={(e) => setQuickAddPaymentMode(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="UPI" className="dark:bg-zinc-900">UPI / PayTM</option>
                      <option value="CARD" className="dark:bg-zinc-900">Credit/Debit Card</option>
                      <option value="CASH" className="dark:bg-zinc-900">Cash</option>
                      <option value="NETBANKING" className="dark:bg-zinc-900">Net Banking</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Log Expense
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Today's Spend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Today's Spend
              </p>
              <h2 className="text-5xl font-black tracking-tighter tabular-nums leading-none mb-4">
                <span className="text-2xl mr-1 opacity-70">₹</span>
                {totalSpent.toLocaleString('en-IN')}
              </h2>
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold w-fit ${isHigher ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              {isHigher ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(diff) === 0 ? 'Same as yesterday' : `₹${Math.abs(diff).toLocaleString('en-IN')} ${isHigher ? 'more' : 'less'} than yesterday`}</span>
            </div>
          </motion.div>

          {/* Card 2: Budget Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" /> Daily Budget
              </p>
              <p className="text-2xl font-bold tracking-tight mt-1 mb-1">₹{dailyLimit.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground font-medium">Limit based on monthly target</p>
            </div>
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="stroke-black/5 dark:stroke-white/5" strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className={`${strokeColorClass} transition-all duration-500 ease-in-out`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black tracking-tighter">{progressPercent}%</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Top Category / Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Top Spend
              </p>
              {categoryBreakdown.length > 0 ? (
                <div>
                  <h3 className="text-xl font-bold truncate">{categoryBreakdown[0].name}</h3>
                  <p className="text-3xl font-black tracking-tight mt-1 text-primary">₹{categoryBreakdown[0].amount.toLocaleString('en-IN')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <PieChart className="w-8 h-8 opacity-20 mb-2" />
                  <span className="text-sm">No expenses yet</span>
                </div>
              )}
            </div>
            {categoryBreakdown.length > 1 && (
              <p className="text-xs text-muted-foreground mt-4 truncate">
                Next: {categoryBreakdown[1].name} (₹{categoryBreakdown[1].amount.toLocaleString('en-IN')})
              </p>
            )}
          </motion.div>
        </div>

        {/* AI Advice Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`flex items-start gap-3 p-4 rounded-2xl border ${aiAdvice.color} backdrop-blur-md`}
        >
          <aiAdvice.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold leading-relaxed">{aiAdvice.text}</p>
        </motion.div>

        {/* Section 2: Main Body Dashboard (2 Columns) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Transactions Log */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" /> Today's Log
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {debitTransactions.length} transactions detected
                  </p>
                </div>
              </div>

              {debitTransactions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-black/5 dark:bg-white/5">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">All Caught Up</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">No expenses recorded today yet. Log an expense manually if you made a cash payment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {debitTransactions.map((tx) => {
                    const currentCategory = categoryOverrides[tx.id] || tx.category || 'Other';
                    return (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 border border-transparent hover:border-border transition-all gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground line-clamp-1">{tx.merchantClean || tx.merchantRaw}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {editingId === tx.id ? (
                                <select 
                                  value={currentCategory}
                                  onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                                  className="text-xs bg-black/5 dark:bg-white/10 rounded-md px-2 py-1 outline-none border border-border"
                                >
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-bold text-muted-foreground">
                                  {currentCategory}
                                  <button onClick={() => setEditingId(tx.id)} className="hover:text-primary transition-colors p-0.5"><Edit3 className="w-3 h-3" /></button>
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground opacity-50 flex items-center gap-1">
                                • {tx.paymentMode || 'UPI'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center justify-between sm:block">
                          <p className="font-black text-lg text-foreground tracking-tight tabular-nums">
                            -₹{(tx.amount || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                            {new Date(tx.transactionDate || tx.receivedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Approve Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={isSubmitted || debitTransactions.length === 0}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all ${
                isSubmitted || debitTransactions.length === 0
                  ? 'bg-black/5 dark:bg-white/5 text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-foreground to-foreground/80 text-background hover:shadow-2xl'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-6 h-6" /> Wrapped Up for Today
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" /> Approve & Save Today's Record
                </>
              )}
            </motion.button>
          </div>

          {/* Right Column: Heatmap Calendar & Category Breakdown */}
          <div className="space-y-6">
            
            {/* Calendar Widget */}
            <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /> Heatmap</h2>
                  <p className="text-xs text-muted-foreground mt-1 tracking-wide">Daily spend intensity</p>
                </div>
                <select 
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-white/50 dark:bg-black/20 border border-border rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-shadow cursor-pointer"
                >
                  {Array.from(new Set(daySummaries.map(s => s.date.substring(0, 7)))).map(m => {
                    const [y, mo] = m.split('-');
                    const date = new Date(Number(y), Number(mo)-1, 1);
                    return (
                      <option key={m} value={m}>
                        {date.toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest">{d}</div>
                ))}
              </div>
              
              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarGrid.grid.map((dayNum, i) => {
                  if (!dayNum) return <div key={`empty-${i}`} className="aspect-square" />;
                  
                  const dateStr = `${calendarGrid.year}-${calendarGrid.monthStr}-${dayNum.toString().padStart(2, '0')}`;
                  const data = daySummaries.find(s => s.date === dateStr);
                  
                  let bgClass = "bg-black/5 dark:bg-white/5";
                  let textColor = "text-muted-foreground/50";
                  
                  if (data && data.totalSpent > 0) {
                    const maxSpend = Math.max(...daySummaries.map(s => s.totalSpent));
                    const intensity = data.totalSpent / maxSpend;
                    textColor = "text-primary-foreground";
                    if (intensity > 0.8) bgClass = "bg-violet-700";
                    else if (intensity > 0.5) bgClass = "bg-violet-500";
                    else if (intensity > 0.2) bgClass = "bg-violet-400";
                    else bgClass = "bg-violet-300 dark:bg-violet-800/50";
                  }

                  const isSelected = selectedCalendarDate === dateStr;

                  return (
                    <motion.button
                      key={dayNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedCalendarDate(isSelected ? null : dateStr)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${bgClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background z-10' : ''}`}
                    >
                      <span className={`text-xs font-bold ${textColor}`}>{dayNum}</span>
                      {data && data.totalSpent > 0 && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/50" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Calendar Selected Day Drawer */}
              <AnimatePresence>
                {selectedCalendarDayData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-border">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm">
                          {selectedCalendarDayData.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                        </h4>
                        <span className="font-black text-sm text-primary tabular-nums">
                          ₹{selectedCalendarDayData.totalSpent.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedCalendarDayData.transactions.slice(0, 3).map(tx => (
                          <div key={tx.id} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground truncate pr-2">{tx.merchantClean || tx.merchantRaw}</span>
                            <span className="font-bold tabular-nums">₹{tx.amount?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        {selectedCalendarDayData.transactions.length > 3 && (
                          <div className="text-center pt-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary cursor-pointer hover:underline">
                              + {selectedCalendarDayData.transactions.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mini Category Breakdown Widget */}
            <div className="glass rounded-3xl p-6 border border-white/20 dark:border-white/5 hidden md:block">
               <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                 <PieChart className="w-4 h-4 text-primary" /> Today's Categories
               </h3>
               <div className="space-y-3">
                 {categoryBreakdown.map(cat => (
                   <div key={cat.name} className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-muted-foreground">{cat.name}</span>
                     <span className="text-sm font-black tabular-nums">₹{cat.amount.toLocaleString('en-IN')}</span>
                   </div>
                 ))}
                 {categoryBreakdown.length === 0 && (
                   <p className="text-xs text-muted-foreground/50 italic text-center py-4">No data to display.</p>
                 )}
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
"""

with open('src/pages/TonightPage.tsx', 'w') as f:
    f.write(content[:start_index] + new_jsx)

print("Rewrote TonightPage.tsx successfully.")
