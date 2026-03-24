import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import attendees from '../data/attendees.json';

const STORAGE_KEY = 'diwaliBall.session.user';

const AuthContext = createContext(null);

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    setUser(parsed);
    setIsHydrating(false);
  }, []);

  const login = useCallback(({ username, password }) => {
    const normalizedUsername = String(username ?? '').trim().toLowerCase();
    const normalizedPassword = String(password ?? '').trim();

    const matched = attendees.find(
      (u) => u.username.toLowerCase() === normalizedUsername && u.password === normalizedPassword
    );

    if (!matched) {
      return { ok: false, error: 'Invalid credentials provided.' };
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matched));
    setUser(matched);
    return { ok: true, user: matched };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrating,
      login,
      logout,
    }),
    [user, isHydrating, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

