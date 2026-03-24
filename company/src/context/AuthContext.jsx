import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const decodeJWT = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      if (!token) { setUser(null); setLoading(false); return; }

      // Validate expiry locally first
      const decoded = decodeJWT(token);
      if (!decoded || (decoded.exp && decoded.exp < Date.now() / 1000)) {
        localStorage.removeItem('companyToken');
        setUser(null); setLoading(false); return;
      }

      // Fetch user — header only, no cookies (avoids cross-portal bleed)
      const res = await fetch('/api/currentuser', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        localStorage.removeItem('companyToken');
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAuth(); }, []);

  const logout = async () => {
    try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('companyToken');
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
