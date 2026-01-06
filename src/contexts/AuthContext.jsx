
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Dados iniciais de usuários, incluindo o administrador principal
const initialUsers = [
  { id: 1, name: 'Administrador', email: 'pnsc.arquivos@gmail.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Membro Teste', email: 'membro@teste.com', password: 'membro123', role: 'member' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsersState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safeParse = (value, fallback) => {
      if (!value) return fallback;
      try {
        return JSON.parse(value);
      } catch (error) {
        return fallback;
      }
    };

    // Carrega o usuario logado
    const storedUserRaw = localStorage.getItem('paroquia_user');
    const storedUser = safeParse(storedUserRaw, null);
    if (storedUser) {
      setUser(storedUser);
    } else if (storedUserRaw) {
      localStorage.removeItem('paroquia_user');
    }

    // Carrega a lista de todos os usuarios
    const storedUsersRaw = localStorage.getItem('paroquia_users_list');
    const storedUsers = safeParse(storedUsersRaw, null);
    if (Array.isArray(storedUsers)) {
      setUsersState(storedUsers);
    } else {
      if (storedUsersRaw) {
        localStorage.removeItem('paroquia_users_list');
      }
      // Se nao houver lista, inicializa com os dados padrao
      setUsersState(initialUsers);
      localStorage.setItem('paroquia_users_list', JSON.stringify(initialUsers));
    }

    setLoading(false);
  }, []);

  const setUsers = (newUsers) => {
    setUsersState(newUsers);
    localStorage.setItem('paroquia_users_list', JSON.stringify(newUsers));
  }

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('paroquia_user', JSON.stringify(foundUser));
      return { success: true };
    }
    
    return { success: false, error: 'Credenciais inválidas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paroquia_user');
  };

  const value = {
    user,
    users,
    setUsers,
    login,
    logout,
    loading,
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member' || user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


