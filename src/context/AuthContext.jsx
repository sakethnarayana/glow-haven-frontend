// src/context/AuthContext.jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';
import api, { setAuthHeader } from '../config/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setAuthHeader(storedToken);
      }
    } catch (e) {
      console.error('Auth restore error', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    setAuthHeader(authToken);
    window.dispatchEvent(new Event('app:login'));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthHeader(null);

    // Clear auth & cart from storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');

    // Notify app (other providers/components will react)
    window.dispatchEvent(new Event('app:logout'));
    window.dispatchEvent(new Event('app:cartCleared'));
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  }, [navigate]);

  const updateUser = useCallback((u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, login, logout, updateUser,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};


