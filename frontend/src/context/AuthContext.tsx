// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // ✅ PASO 1.1: Añadimos un estado de carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const decodedUser: User = jwtDecode(storedToken);
          setUser(decodedUser);
          setToken(storedToken);
        }
    } catch (error) {
        console.error("Failed to decode token", error);
        // Si el token es inválido, lo limpiamos
        localStorage.removeItem('token');
    } finally {
        // ✅ PASO 1.2: Marcamos la carga como completada, haya o no token
        setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedUser: User = jwtDecode(newToken);
    setUser(decodedUser);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // ✅ PASO 1.3: No renderizamos la aplicación hasta que la comprobación haya terminado
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