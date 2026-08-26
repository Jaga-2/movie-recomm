import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          localStorage.setItem('token', token);
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          logout();
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      setToken(data.access_token);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.detail || "Invalid credentials."
      };
    }
  };

  const register = async (email, password, fullName) => {
    setLoading(true);
    try {
      await authAPI.register({ email, password, full_name: fullName });
      // Login automatically
      return await login(email, password);
    } catch (error) {
      console.error("Registration failed:", error);
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.detail || "Email already exists or invalid data."
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (fullName) => {
    try {
      const updatedUser = await authAPI.updateProfile({ email: user.email, full_name: fullName });
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update profile."
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
