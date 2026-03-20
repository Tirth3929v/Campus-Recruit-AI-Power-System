import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // The proxy in vite.config.js forwards /api to localhost:5000
        // We expect the backend to return the user object OR null (not 401)
        const { data } = await axios.get('/api/currentuser');
        setUser(data);
      } catch (err) {
        console.error("Error checking user session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
      window.location.href = '/login'; // Redirect to login page
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);