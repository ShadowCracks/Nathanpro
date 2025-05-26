// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

interface User {
  id: string;
  email: string;
  name: string;
  hasPurchasedCourse: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};