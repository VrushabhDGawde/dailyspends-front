import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Shield, Download, Trash2, Camera, Moon, Sun, Monitor, PlaySquare, HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userApi';

interface SettingsPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  reduceMotion: boolean;
  toggleMotion: () => void;
  onOpenSupport?: () => void;
}

export function SettingsPage({ isDark, toggleTheme, reduceMotion, toggleMotion, onOpenSupport }: SettingsPageProps) {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'data'>('profile');

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [salary, setSalary] = useState(user?.salary != null ? String(user.salary) : '');
  const [savingsPercentage, setSavingsPercentage] = useState(user?.savingsPercentage || 0);
  const [dob, setDob] = useState(user?.dob || '');
  const [occupation, setOccupation] = useState(user?.occupation || 'Software Engineer / IT Professional');
  const [currency, setCurrency] = useState('INR (₹)');
  const [isSaving, setIsSaving] = useState(false);

  const OCCUPATIONS = [
    'Software Engineer / IT Professional',
    'Business Owner / Entrepreneur',
    'Finance & Banking Specialist',
    'Healthcare & Medical Professional',
    'Creative / Designer / Artist',
    'Education & Academician',
    'Sales & Marketing Executive',
    'Freelancer / Consultant',
    'Student',
    'Government Employee',
    'Other'
  ];

  // Sync state if user context updates after mount
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setSalary(user.salary != null ? String(user.salary) : '');
      setSavingsPercentage(user?.savingsPercentage || 0);
      if (user.dob) setDob(user.dob);
      if (user.occupation) setOccupation(user.occupation);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const parsedSalary = salary.trim() !== '' ? parseFloat(salary) : undefined;
      await updateUserProfile({
        fullName: name,
        salary: parsedSalary,
        savingsPercentage: savingsPercentage,
        dob: dob,
        occupation: occupation
      });
      await refreshProfile();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

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
                <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

                <div className="flex items-center gap-6 mb-10 p-6 bg-white/30 dark:bg-black/10 rounded-3xl border border-white/20 dark:border-white/5">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-background flex items-center justify-center overflow-hidden shadow-xl">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-foreground text-background rounded-full shadow-lg hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{name}</h3>
                    <p className="text-muted-foreground text-sm font-medium">Personal Account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Personal Info */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Personal Details</h3>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Full Name</label>
                      <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Email Address</label>
                      <input
                        type="email" value={email} disabled
                        className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Date of Birth</label>
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Occupation / Profession</label>
                      <select
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer font-medium"
                      >
                        {OCCUPATIONS.map((occ) => (
                          <option key={occ} value={occ} className="bg-background text-foreground">
                            {occ}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Default Currency</label>
                      <select
                        value={currency} onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer font-medium"
                      >
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Financial Goals */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Financial Goals</h3>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Monthly Salary (₹)</label>
                      <input
                        type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 50000"
                        className="w-full bg-white/50 dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-semibold text-muted-foreground ml-1">Savings Goal (%)</label>
                        <span className="text-lg font-black text-primary">{savingsPercentage}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="1"
                        value={savingsPercentage} onChange={(e) => setSavingsPercentage(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      
                      {/* Live Preview */}
                      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Live Projection</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Monthly Savings</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{salary ? Math.round((Number(salary) * savingsPercentage) / 100).toLocaleString('en-IN') : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                          <span className="text-sm font-medium">Usable Budget</span>
                          <span className="font-bold text-foreground">
                            ₹{salary ? Math.round(Number(salary) - (Number(salary) * savingsPercentage) / 100).toLocaleString('en-IN') : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center min-w-[160px]"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
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
