import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      API.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/users/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const loginWithGoogle = async (idToken) => {
    const { data } = await API.post('/users/google', { idToken });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const signup = async (name, email, password) => {
    const { data } = await API.post('/users/signup', { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
