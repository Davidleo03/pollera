'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'gerente' | 'jefe';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  initialized: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'pollera_auth_users';
const CURRENT_USER_KEY = 'pollera_current_user';

const defaultUsers: UserAccount[] = [
  { id: 'U-1', username: 'gerente', password: 'Gerente123', role: 'gerente' },
  { id: 'U-2', username: 'jefe', password: 'Jefe123', role: 'jefe' },
];

function loadUsers(): UserAccount[] {
  if (typeof window === 'undefined') return defaultUsers;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultUsers;
    const parsed = JSON.parse(stored) as UserAccount[];
    return parsed.length > 0 ? parsed : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function saveUsers(users: UserAccount[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadCurrentUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? (JSON.parse(stored) as UserAccount) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user: UserAccount | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>(defaultUsers);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadedUsers = loadUsers();
    setUsers(loadedUsers);
    setCurrentUser(loadCurrentUser());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === 'undefined') return;
    saveUsers(users);
  }, [users, initialized]);

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return false;
    setCurrentUser(user);
    saveCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
