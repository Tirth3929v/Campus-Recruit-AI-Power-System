import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = decodeJWT(token);
      if (!decoded) return false;
      if (decoded.exp) {
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
      }
      return true;
    } catch {
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      if (!token || !isTokenValid(token)) {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('role');
        setUser(null);
        setLoading(false);
        return;
      }
      // Always send the token explicitly — never rely on cookies
      // (cookies may belong to a different portal's session)
      const res = await fetch('/api/currentuser', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData || null);
      } else {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('role');
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('role');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error("Logout API failed", error);
    }
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);