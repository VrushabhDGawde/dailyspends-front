import React, { useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { Sidebar } from './components/Navbar'; 
import { AuthModal } from './components/AuthModal';
import { TonightPage } from './pages/TonightPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { ResolutionPage } from './pages/ResolutionPage';
import { useAuth } from './contexts/AuthContext';
import { fetchTransactions } from './services/api';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('tonight');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [txFilterState, setTxFilterState] = useState<{fromDate?: string, toDate?: string} | null>(null);
  
  const { isAuthenticated } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Auto-exit demo mode when user logs in
  useEffect(() => {
    if (isAuthenticated) setIsDemoMode(false);
  }, [isAuthenticated]);

  // Global unverified count for the sidebar badge
  const [unverifiedCount, setUnverifiedCount] = useState(0);

  useEffect(() => {
    // Basic fetch to keep the sidebar badge updated
    const loadUnverifiedCount = async () => {
      try {
        const data = await fetchTransactions();
        const unverified = data.filter(t => !t.isReviewed && t.transactionType === 'DEBIT').length;
        setUnverifiedCount(unverified);
      } catch (error) {
        console.error("Failed to fetch global unverified count:", error);
      }
    };
    
    loadUnverifiedCount();
    // In a real app, this might poll or be updated via Context/WebSockets
    const interval = setInterval(loadUnverifiedCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Global Settings State
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('reduceMotion') === 'true';
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const toggleMotion = () => {
    setReduceMotion(!reduceMotion);
    localStorage.setItem('reduceMotion', !reduceMotion ? 'true' : 'false');
  };

  if (!isAuthenticated && !isDemoMode) {
    return (
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        <LandingPage 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
          onEnterDemo={() => setIsDemoMode(true)} 
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <div className="flex min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-950 text-foreground transition-colors duration-500">
        <Sidebar 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isDark={isDark}
          toggleTheme={toggleTheme}
          isDemoMode={isDemoMode}
          onExitDemo={() => {
            setIsDemoMode(false);
            setIsAuthModalOpen(true);
          }}
          unverifiedCount={unverifiedCount}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          {currentPage === 'tonight' && (
            <TonightPage onNavigateToTransactions={(filter) => {
              setTxFilterState(filter);
              setCurrentPage('transactions');
            }} />
          )}
          {currentPage === 'transactions' && (
            <TransactionsPage 
              initialFilter={txFilterState} 
              onFilterConsumed={() => setTxFilterState(null)} 
            />
          )}
          {currentPage === 'resolution' && <ResolutionPage />}
          {currentPage === 'insights' && <InsightsPage />}
          {currentPage === 'settings' && (
            <SettingsPage 
              isDark={isDark} toggleTheme={toggleTheme}
              reduceMotion={reduceMotion} toggleMotion={toggleMotion}
            />
          )}
        </main>
      </div>
    </MotionConfig>
  );
}

export default App;
