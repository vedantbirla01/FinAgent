import { createContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('finagent_user');
    const token = localStorage.getItem('finagent_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const { token, ...userData } = data;
    localStorage.setItem('finagent_token', token);
    localStorage.setItem('finagent_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, ...userData } = data;
    localStorage.setItem('finagent_token', token);
    localStorage.setItem('finagent_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('finagent_token');
    localStorage.removeItem('finagent_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;