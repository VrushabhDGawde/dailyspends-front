import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check localStorage for token on mount
    const storedToken = localStorage.getItem('spendsense_auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsInitialized(true);
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('spendsense_auth_token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('spendsense_auth_token');
  };

  if (!isInitialized) return null; // Avoid flashing unauthenticated state

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
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
