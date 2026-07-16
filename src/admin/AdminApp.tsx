import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminResolutionQueue } from './AdminResolutionQueue';
import { AdminRulesEngine } from './AdminRulesEngine';

export function AdminApp() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('spendsense_admin_token');
    if (token) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spendsense_admin_token');
    setIsAdminLoggedIn(false);
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
      <AdminSidebar 
        currentTab={currentTab} 
        onNavigate={setCurrentTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 overflow-x-hidden">
        {currentTab === 'dashboard' && <AdminDashboard />}
        {currentTab === 'users' && <AdminDashboard />} {/* Reusing dashboard for users tab for now */}
        {currentTab === 'resolution' && <AdminResolutionQueue />}
        {currentTab === 'rules' && <AdminRulesEngine />}
        {currentTab === 'settings' && (
          <div className="p-8 flex items-center justify-center h-full text-zinc-500">
            Platform Settings Module (Coming Soon)
          </div>
        )}
      </main>
    </div>
  );
}
