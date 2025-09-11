// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  role: string;
  name: string;
}

interface StoredUser extends User {
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: { token: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserJSON = localStorage.getItem('user');
      if (storedUserJSON) {
        const storedUser: StoredUser = JSON.parse(storedUserJSON);
        const decodedToken: User = jwtDecode(storedUser.token);
        setUser(decodedToken);
        setToken(storedUser.token);
      }
    } catch (error) {
      console.error("Failed to decode token from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (data: { token: string }) => {
    const decodedUser: User = jwtDecode(data.token);
    const userToStore: StoredUser = { ...decodedUser, token: data.token };

    localStorage.setItem('user', JSON.stringify(userToStore));
    setUser(decodedUser);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};