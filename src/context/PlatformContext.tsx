import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminApi, type PlatformSettingsDTO } from '../admin/services/adminApi';

interface PlatformContextType {
  settings: PlatformSettingsDTO | null;
  refreshSettings: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettingsDTO | null>(null);

  const applySettings = (newSettings: PlatformSettingsDTO) => {
    // 1. Update Title
    document.title = newSettings.websiteTitle || 'DailySpends';

    // 2. Update Theme Class (Tailwind)
    const root = window.document.documentElement;
    const userTheme = localStorage.getItem('theme');
    
    // Only apply platform theme if the user hasn't explicitly chosen one locally
    if (!userTheme) {
      if (newSettings.themeMode === 'light') {
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
      }
    }

    // 3. Update Primary Color (CSS Variables)
    // Tailwind config usually has colors.primary, we can override root CSS vars if needed
    // But since Tailwind generates utilities, changing root styles directly for a dynamic hex can be tricky 
    // unless we use CSS variables in our tailwind.config.ts.
    // For now, we inject a root style.
    root.style.setProperty('--primary-color', newSettings.primaryColor);
  };

  const refreshSettings = async () => {
    try {
      const adminToken = localStorage.getItem('spendsense_admin_token');
      if (!adminToken) {
        applySettings({ websiteTitle: 'DailySpends', themeMode: 'dark', primaryColor: '#ef4444' });
        return;
      }
      
      const data = await adminApi.getSettings();
      setSettings(data);
      applySettings(data);
    } catch (error) {
      // Fallback silently without throwing errors for non-admins
      applySettings({ websiteTitle: 'DailySpends', themeMode: 'dark', primaryColor: '#ef4444' });
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <PlatformContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </PlatformContext.Provider>
  );
}

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
