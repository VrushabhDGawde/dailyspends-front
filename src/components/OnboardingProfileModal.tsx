import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, IndianRupee, Calendar, Briefcase, Percent, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { updateUserProfile, type UserProfile } from '../services/userApi';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProfileModalProps {
  isOpen: boolean;
  onComplete: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

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

export function OnboardingProfileModal({ isOpen, onComplete, onClose }: OnboardingProfileModalProps) {
  const { user } = useAuth();
  const [salary, setSalary] = useState('');
  const [savingsPercentage, setSavingsPercentage] = useState('20');
  const [dob, setDob] = useState('');
  const [occupation, setOccupation] = useState('Software Engineer / IT Professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (user?.salary != null) setSalary(String(user.salary));
      if (user?.savingsPercentage != null) setSavingsPercentage(String(user.savingsPercentage));
      if (user?.dob) setDob(user.dob);
      if (user?.occupation) setOccupation(user.occupation);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numSalary = Number(salary);
    const numSavings = Number(savingsPercentage);

    if (!salary || isNaN(numSalary) || numSalary <= 0) {
      setError('Please enter a valid monthly salary amount.');
      return;
    }

    if (!savingsPercentage || isNaN(numSavings) || numSavings < 0 || numSavings > 100) {
      setError('Please enter a valid savings percentage (0-100%).');
      return;
    }

    if (!dob) {
      setError('Please select your Date of Birth.');
      return;
    }

    if (!occupation) {
      setError('Please select your primary occupation.');
      return;
    }

    setLoading(true);
    try {
      const updated = await updateUserProfile({
        salary: numSalary,
        savingsPercentage: numSavings,
        dob,
        occupation,
        isProfileComplete: true
      });
      onComplete(updated);
    } catch (err: any) {
      console.error("Failed to complete profile onboarding:", err);
      setError("Failed to save profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-200/50 dark:border-zinc-800/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side Decorative Panel */}
          <div className="hidden md:flex flex-col justify-between w-2/5 p-8 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]" />
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-[60px]" />
             
             <div className="relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold tracking-wide uppercase mb-8 border border-indigo-200 dark:border-indigo-500/20">
                 <Sparkles className="w-4 h-4" /> Welcome
               </div>
               <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-4">
                 Unlock your financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">potential.</span>
               </h2>
               <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                 Tell us a bit about yourself so we can personalize your dashboard, calibrate budget AI, and set up your goals.
               </p>
             </div>

             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    <span className="text-emerald-500">✓</span>
                  </div>
                  Basic Details
                </div>
                <div className="w-0.5 h-6 bg-indigo-200 dark:bg-indigo-500/30 ml-4" />
                <div className="flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-100 font-bold">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm flex items-center justify-center border border-indigo-600 dark:border-indigo-500 text-white">
                    2
                  </div>
                  Financial Profile
                </div>
             </div>
          </div>

          {/* Right Side Form Panel */}
          <div className="w-full md:w-3/5 p-6 sm:p-8 relative bg-white dark:bg-zinc-950">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="md:hidden mb-6">
               <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Almost there!</h2>
               <p className="text-sm text-zinc-500">Just a few details to personalize your experience.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-5"
              variants={formVariants}
              initial="hidden"
              animate="show"
            >
              
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Monthly Income */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    Monthly Income <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="50000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Savings Target */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    Savings Target <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      placeholder="20"
                      value={savingsPercentage}
                      onChange={(e) => setSavingsPercentage(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Date of Birth */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                  />
                </div>
              </motion.div>

              {/* Occupation */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Occupation / Profession <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                  >
                    {OCCUPATIONS.map((occ) => (
                      <option key={occ} value={occ} className="bg-white dark:bg-zinc-900">
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden group py-3.5 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-indigo-500/25"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {loading ? (
                    <span className="relative z-10 flex items-center gap-2 text-white dark:text-white transition-colors">
                       <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                       Saving...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2 text-white dark:text-zinc-900 dark:group-hover:text-white transition-colors">
                      Complete Setup <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </motion.div>

              {onClose && (
                <motion.div variants={itemVariants} className="text-center mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Skip for now
                  </button>
                </motion.div>
              )}

            </motion.form>
            
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-6">
               🔒 Your data is securely stored and never shared with third parties.
            </p>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

