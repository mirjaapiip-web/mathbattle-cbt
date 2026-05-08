'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'player' | 'admin';

export interface SessionUser {
  id: string;
  fullName: string;
  class: string;
  absenNumber?: string;
  role: UserRole;
}

interface SessionContextType {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser) => void;
  clearUser: () => void;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from sessionStorage on mount
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const setUser = (newUser: SessionUser) => {
    setUserState(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const clearUser = () => {
    setUserState(null);
    sessionStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SessionContext.Provider value={{ user, loading, setUser, clearUser, isAdmin }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
