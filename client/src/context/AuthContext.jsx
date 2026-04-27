import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('vaulttrack_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('vaulttrack_user')));

  const login = (token, user) => {
    localStorage.setItem('vaulttrack_token', token);
    localStorage.setItem('vaulttrack_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('vaulttrack_token');
    localStorage.removeItem('vaulttrack_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);