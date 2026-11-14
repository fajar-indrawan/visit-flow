import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('visit_flow_token'),
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('visit_flow_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('visit_flow_token', res.accessToken);
    localStorage.setItem('visit_flow_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('visit_flow_token');
    localStorage.removeItem('visit_flow_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return ctx;
}
