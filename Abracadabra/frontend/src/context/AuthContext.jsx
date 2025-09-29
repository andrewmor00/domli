import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Static admin accounts
const ADMIN_ACCOUNTS = [
  {
    id: 'admin-1',
    email: 'admin@domli.ru',
    password: 'domli2024!',
    firstName: 'Администратор',
    lastName: 'Домли',
    isAdmin: true
  },
  {
    id: 'admin-2', 
    email: 'manager@domli.ru',
    password: 'manager2024!',
    firstName: 'Менеджер',
    lastName: 'Домли',
    isAdmin: true
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for admin session first
        const adminSession = localStorage.getItem('domli_admin_session');
        if (adminSession) {
          try {
            const adminUser = JSON.parse(adminSession);
            setUser(adminUser);
            setLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem('domli_admin_session');
          }
        }
        
        // Check regular user authentication
        if (apiService.isAuthenticated()) {
          const response = await apiService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear storage
            apiService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      
      // Check for admin accounts first
      const adminAccount = ADMIN_ACCOUNTS.find(
        admin => admin.email === credentials.email && admin.password === credentials.password
      );
      
      if (adminAccount) {
        const adminUser = {
          id: adminAccount.id,
          email: adminAccount.email,
          firstName: adminAccount.firstName,
          lastName: adminAccount.lastName,
          isAdmin: true
        };
        setUser(adminUser);
        // Store admin session in localStorage
        localStorage.setItem('domli_admin_session', JSON.stringify(adminUser));
        return { success: true };
      }
      
      // If not admin, try regular login
      const response = await apiService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await apiService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      // Clear admin session if exists
      localStorage.removeItem('domli_admin_session');
      
      // Regular logout
      await apiService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 