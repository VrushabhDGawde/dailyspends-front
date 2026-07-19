import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminRulesEngine } from './AdminRulesEngine';
import { AdminComplaints } from './AdminComplaints';

export function AdminApp() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('users');

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
        {currentTab === 'users' && <AdminDashboard />} {/* Reusing dashboard for users tab for now */}
        {currentTab === 'rules' && <AdminRulesEngine />}
        {currentTab === 'complaints' && <AdminComplaints />}
      </main>
    </div>
  );
}
