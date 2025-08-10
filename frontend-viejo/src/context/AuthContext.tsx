// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Definimos la forma de los datos del usuario y del contexto
interface User {
  id: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Creamos el Proveedor del contexto
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    // Al cargar la app, revisamos si ya hay un token en el localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decodedUser: User = jwtDecode(storedToken);
      setUser(decodedUser);
      setToken(storedToken);
    }
  }, []);

  // Función para iniciar sesión
  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedUser: User = jwtDecode(newToken);
    setUser(decodedUser);
    setToken(newToken);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};