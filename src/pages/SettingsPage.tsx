import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Shield, Download, Trash2, Camera, Moon, Sun, Monitor, PlaySquare, HelpCircle } from 'lucide-react';

interface SettingsPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  reduceMotion: boolean;
  toggleMotion: () => void;
  onOpenSupport?: () => void;
}

export function SettingsPage({ isDark, toggleTheme, reduceMotion, toggleMotion, onOpenSupport }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'data'>('profile');

  // Mock Profile State
  const [name, setName] = useState('Guest User');
  const [email, setEmail] = useState('guest@example.com');
  const [currency, setCurrency] = useState('INR (₹)');

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <header>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your profile, app appearance, and data.</p>
          </motion.div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'appearance' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              <Palette className="w-4 h-4" /> Appearance
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'data' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              <Shield className="w-4 h-4" /> Data & Privacy
            </button>
            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 mt-4"
              >
                <HelpCircle className="w-4 h-4" /> Help & Support
              </button>
            )}
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 glass rounded-[2rem] p-8 border border-white/50 dark:border-white/10 min-h-[500px]">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900 dark:to-purple-900 border-4 border-white dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                      <User className="w-10 h-10 text-indigo-700 dark:text-indigo-300" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-foreground text-background rounded-full shadow-lg hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p className="text-muted-foreground text-sm">Personal Account</p>
                  </div>
                </div>

                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Full Name</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Default Currency</label>
                    <select
                      value={currency} onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <button className="mt-4 bg-foreground text-background px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>

                <div className="space-y-8 max-w-md">

                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">App Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={!isDark ? undefined : toggleTheme} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${!isDark ? 'border-primary bg-primary/5' : 'border-border bg-white/30 dark:bg-black/20 hover:border-foreground/30'}`}>
                        <Sun className="w-6 h-6" />
                        <span className="text-xs font-medium">Light</span>
                      </button>
                      <button onClick={isDark ? undefined : toggleTheme} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${isDark ? 'border-primary bg-primary/5' : 'border-border bg-white/30 dark:bg-black/20 hover:border-foreground/30'}`}>
                        <Moon className="w-6 h-6" />
                        <span className="text-xs font-medium">Dark</span>
                      </button>
                      <button className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border bg-white/30 dark:bg-black/20 hover:border-foreground/30 opacity-50 cursor-not-allowed`} title="Coming soon">
                        <Monitor className="w-6 h-6" />
                        <span className="text-xs font-medium">System</span>
                      </button>
                    </div>
                  </div>

                  {/* Accessibility / Motion */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Accessibility</h3>
                    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 border border-border rounded-2xl">
                      <div className="flex items-center gap-3">
                        <PlaySquare className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Reduce Animations</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Disables UI bounce and slide effects.</p>
                        </div>
                      </div>

                      {/* iOS Style Toggle Switch */}
                      <button
                        onClick={toggleMotion}
                        className={`w-12 h-6 rounded-full transition-colors relative ${reduceMotion ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${reduceMotion ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* DATA TAB */}
            {activeTab === 'data' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-semibold mb-6">Data & Privacy</h2>

                <div className="space-y-4 max-w-md">

                  <div className="p-5 bg-white/50 dark:bg-black/20 border border-border rounded-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <Download className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Export Data</p>
                        <p className="text-xs text-muted-foreground mt-1">Download a copy of your transactions and settings as a CSV file.</p>
                      </div>
                    </div>
                    <button onClick={() => alert('Data export started!')} className="w-full bg-white dark:bg-zinc-800 border border-border text-foreground font-medium py-2 rounded-xl text-sm shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                      Download CSV
                    </button>
                  </div>

                  <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-red-600 dark:text-red-400">Danger Zone</p>
                        <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and wipe all transaction data from your device.</p>
                      </div>
                    </div>
                    <button onClick={() => confirm('Are you sure? This cannot be undone.')} className="w-full bg-red-500 text-white font-medium py-2 rounded-xl text-sm shadow-sm hover:bg-red-600 transition-all">
                      Delete Account
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
