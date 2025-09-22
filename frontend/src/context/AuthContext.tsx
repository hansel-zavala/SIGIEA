// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface User {
  id: number;
  role: string;
  name: string;
  permissions?: Record<string, boolean>;
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
    const loadUser = async () => {
      try {
        const storedUserJSON = localStorage.getItem('user');
        if (storedUserJSON) {
          const storedUser: StoredUser = JSON.parse(storedUserJSON);
          const decodedToken: User = jwtDecode(storedUser.token);

          // Load full profile with permissions
          try {
            const response = await api.get('users/profile');
            const fullUser = response.data;
            const userWithPermissions: User = {
              id: decodedToken.id || fullUser.id,
              role: decodedToken.role || fullUser.role,
              name: decodedToken.name || fullUser.name,
              permissions: fullUser.permissions?.reduce((acc: Record<string, boolean>, p: { permission: string; granted: boolean }) => { acc[p.permission] = p.granted; return acc; }, {}) || {},
            };
            setUser(userWithPermissions);
          } catch (profileError) {
            console.error('Error loading user profile:', profileError);
            // Fallback to profile data
            const response = await api.get('users/profile');
            if (response) {
              const fullUser = response.data;
              setUser({
                id: fullUser.id,
                role: fullUser.role,
                name: fullUser.name,
                permissions: fullUser.permissions || [],
              });
            } else {
              setUser(null); // Force logout
            }
          }

          setToken(storedUser.token);
        }
      } catch (error) {
        console.error("Failed to decode token from localStorage", error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: { token: string }) => {
    const decodedUser: User = jwtDecode(data.token);

    // Load full profile with permissions
    try {
      const response = await api.get('users/profile');
      const fullUser = response.data;
      const userWithPermissions: User = {
        ...decodedUser,
        permissions: fullUser.permissions?.reduce((acc: Record<string, boolean>, p: { permission: string; granted: boolean }) => { acc[p.permission] = p.granted; return acc; }, {}) || {},
      };
      const userToStore: StoredUser = { ...userWithPermissions, token: data.token };
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userWithPermissions);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to decoded user
      const userToStore: StoredUser = { ...decodedUser, token: data.token };
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(decodedUser);
    }

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