import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default config
  axios.defaults.baseURL = ''; // Use proxy configurations

  // Hydrate user from local storage token
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Configure headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setUserDetails(res.data.details);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        
        // Fetch full profile info
        const meRes = await axios.get('/api/auth/me');
        setUserDetails(meRes.data.details);
        setLoading(false);
        return { success: true, role: userData.role };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (registerData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/register', registerData);
      if (res.data.success) {
        const { token, user: userData, verificationToken } = res.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        
        // Fetch details
        const meRes = await axios.get('/api/auth/me');
        setUserDetails(meRes.data.details);
        setLoading(false);
        return { success: true, verificationToken };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setUserDetails(null);
    setLoading(false);
  };

  // Update profile locally
  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setUserDetails(res.data.details);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
