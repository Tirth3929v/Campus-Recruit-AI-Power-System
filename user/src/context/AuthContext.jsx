import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('userToken');

      if (!token || !isTokenValid(token)) {
        localStorage.removeItem('userToken');
        setUser(null);
        setLoading(false);
        return;
      }

      // /api/auth/profile uses the shared `protect` middleware which correctly
      // resolves the user from the right collection (Student → User fallback)
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const userData = await res.json();
        if (userData?.email) {
          setUser(userData);
        } else {
          localStorage.removeItem('userToken');
          setUser(null);
        }
      } else {
        localStorage.removeItem('userToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed', error);
      localStorage.removeItem('userToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout API failed', error);
    }
    localStorage.removeItem('userToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkAuth, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);