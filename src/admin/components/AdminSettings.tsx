import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, Monitor, Moon, Sun, Palette, AppWindow } from 'lucide-react';
import { adminApi, type PlatformSettingsDTO } from '../services/adminApi';
import { usePlatform } from '../../context/PlatformContext';

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark Mode', icon: Moon },
  { id: 'light', label: 'Light Mode', icon: Sun },
];

const COLOR_PRESETS = [
  { name: 'Ruby Red', hex: '#ef4444' },     // tailwind red-500
  { name: 'Emerald', hex: '#10b981' },      // tailwind emerald-500
  { name: 'Sapphire', hex: '#3b82f6' },     // tailwind blue-500
  { name: 'Amethyst', hex: '#8b5cf6' },     // tailwind violet-500
  { name: 'Sunset', hex: '#f97316' },       // tailwind orange-500
  { name: 'Pink', hex: '#ec4899' },         // tailwind pink-500
];

export function AdminSettings() {
  const { settings, refreshSettings } = usePlatform();
  const [formData, setFormData] = useState<PlatformSettingsDTO>({
    websiteTitle: 'DailySpends',
    themeMode: 'dark',
    primaryColor: '#ef4444'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof PlatformSettingsDTO, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await adminApi.updateSettings(formData);
      await refreshSettings();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen bg-[#09090b] text-white">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className="text-zinc-400 mt-1">Customize global identity, themes, and colors.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Site Identity */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <AppWindow className="w-5 h-5 text-zinc-400" />
              Website Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Website Title</label>
                <input 
                  type="text" 
                  value={formData.websiteTitle}
                  onChange={(e) => handleChange('websiteTitle', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="e.g. DailySpends"
                />
                <p className="text-xs text-zinc-500 mt-2">This appears in the browser tab and meta tags.</p>
              </div>
            </div>
          </div>

          {/* Theme Mode */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Monitor className="w-5 h-5 text-zinc-400" />
              Theme Mode
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {THEME_OPTIONS.map((theme) => {
                const Icon = theme.icon;
                const isActive = formData.themeMode === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleChange('themeMode', theme.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-zinc-800 border-white/30 text-white' 
                        : 'bg-black/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-zinc-400" />
              Primary Brand Color
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-zinc-300 mb-3">Premium Presets</label>
              <div className="flex flex-wrap gap-4">
                {COLOR_PRESETS.map((preset) => {
                  const isActive = formData.primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      onClick={() => handleChange('primaryColor', preset.hex)}
                      className={`relative w-12 h-12 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                        isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {isActive && <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Custom Hex Code</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-black/50 border border-white/10 p-1"
                />
                <input 
                  type="text" 
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>

            {showSuccess && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-400 font-semibold flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Successfully saved!
              </motion.span>
            )}
          </div>

        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Live Preview</h3>
            
            <div 
              className={`rounded-2xl border overflow-hidden ${
                formData.themeMode === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-zinc-800 text-white'
              }`}
            >
              <div className="p-4 border-b border-inherit flex items-center justify-between">
                <span className="font-bold">{formData.websiteTitle}</span>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black">Welcome back</h4>
                  <p className="text-sm opacity-60">Here is a preview of your brand.</p>
                </div>
                
                <button 
                  className="w-full py-3 rounded-xl font-bold transition-opacity hover:opacity-90 text-white shadow-lg"
                  style={{ backgroundColor: formData.primaryColor, boxShadow: `0 4px 14px 0 ${formData.primaryColor}40` }}
                >
                  Primary Button
                </button>

                <div className="p-4 rounded-xl border border-inherit bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold opacity-80">Sample Metric</span>
                    <span className="text-sm font-bold" style={{ color: formData.primaryColor }}>+14.5%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full w-2/3" style={{ backgroundColor: formData.primaryColor }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
