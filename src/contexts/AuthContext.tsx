import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/userApi';

export interface User {
  email: string;
  name?: string;
  salary?: number;
  savingsPercentage?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: (showSessionExpiredAlert?: boolean) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT without a library
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUser(prev => prev ? { ...prev, name: profile.fullName, salary: profile.salary, savingsPercentage: profile.savingsPercentage } : { email: profile.email, name: profile.fullName, salary: profile.salary, savingsPercentage: profile.savingsPercentage });
    } catch (error) {
      console.warn("Failed to fetch user profile", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('spendsense_auth_token');
      if (storedToken) {
        const decoded = parseJwt(storedToken);
        
        // Check if token is expired
        if (decoded && decoded.exp) {
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token is expired, clear storage and do not authenticate
            localStorage.removeItem('spendsense_auth_token');
            localStorage.removeItem('spendsense_refresh_token');
            localStorage.removeItem('spendsense_token');
            // We don't alert here on reload to prevent annoying popups, just silently logout
          } else {
            setToken(storedToken);
            if (decoded.sub) {
              setUser({ email: decoded.sub, name: decoded.name });
            }
          }
        } else if (decoded) {
          // No expiry, just restore
          setToken(storedToken);
          if (decoded.sub) {
            setUser({ email: decoded.sub, name: decoded.name });
          }
        }
      }

      // Always load profile data (from backend or local storage fallback)
      await refreshProfile();
      setIsInitialized(true);
    };
    
    initializeAuth();
    
    // Listen for automatic logouts triggered by the apiClient
    const handleLogout = () => logout();
    window.addEventListener('spendsense_logout', handleLogout);
    
    return () => {
      window.removeEventListener('spendsense_logout', handleLogout);
    };
  }, []);

  const login = async (newToken: string, newRefreshToken?: string) => {
    setToken(newToken);
    localStorage.setItem('spendsense_auth_token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('spendsense_refresh_token', newRefreshToken);
    }
    const decoded = parseJwt(newToken);
    if (decoded && decoded.sub) {
      setUser({ email: decoded.sub, name: decoded.name });
      await refreshProfile();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spendsense_auth_token');
    localStorage.removeItem('spendsense_refresh_token');
    localStorage.removeItem('spendsense_token');
  };

  if (!isInitialized) return null; // Avoid flashing unauthenticated state

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
