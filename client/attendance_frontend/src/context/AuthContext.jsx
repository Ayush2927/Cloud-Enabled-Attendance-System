import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('attendEase_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, liveFaceImage, liveFaceDescriptor) => {
    try {
      const response = await api.post('/auth/login', { email, password, liveFaceImage, liveFaceDescriptor });
      const userData = response.data.data.user;
      const token = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;
      
      setUser(userData);
      localStorage.setItem('attendEase_user', JSON.stringify(userData));
      localStorage.setItem('attendEase_token', token);
      localStorage.setItem('attendEase_refresh_token', refreshToken);
      toast.success('Login successful!');
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('attendEase_user');
      localStorage.removeItem('attendEase_token');
      localStorage.removeItem('attendEase_refresh_token');
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
