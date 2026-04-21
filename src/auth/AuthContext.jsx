import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_STORAGE_KEY = 'diwaliBall.session.token';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isHydrating, setIsHydrating] = useState(() => Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY)));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsHydrating(false);
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session invalid');
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setUser(data.user ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async ({ username, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: String(username ?? '').trim(),
        password: String(password ?? '').trim(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token || !data.user) {
      return { ok: false, error: data.message || 'Invalid credentials provided.' };
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return { ok: true, user: data.user };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrating,
      token,
      login,
      logout,
    }),
    [user, isHydrating, token, login, logout]
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

