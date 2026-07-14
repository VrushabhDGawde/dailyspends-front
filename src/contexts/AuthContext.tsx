import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
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

  useEffect(() => {
    // Check localStorage for token on mount
    const storedToken = localStorage.getItem('spendsense_auth_token');
    if (storedToken) {
      setToken(storedToken);
      const decoded = parseJwt(storedToken);
      if (decoded && decoded.sub) {
        setUser({ email: decoded.sub, name: decoded.name });
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('spendsense_auth_token', newToken);
    const decoded = parseJwt(newToken);
    if (decoded && decoded.sub) {
      setUser({ email: decoded.sub, name: decoded.name });
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spendsense_auth_token');
  };

  if (!isInitialized) return null; // Avoid flashing unauthenticated state

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
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
