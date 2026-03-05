import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civiceye_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const token = localStorage.getItem('civiceye_token');
      return !!token;
    } catch {
      return false;
    }
  });

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Persist to localStorage
    localStorage.setItem('civiceye_user', JSON.stringify(userData));
    localStorage.setItem('civiceye_token', userData.token || '');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('civiceye_user');
    localStorage.removeItem('civiceye_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
