import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, clearAccessToken, refreshSession, setSessionExpiredHandler } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    let cancelled = false;

    setSessionExpiredHandler(() => {
      clearAccessToken();
      setUser(null);
      setStatus('anonymous');
      navigateRef.current('/login', { replace: true });
    });

    refreshSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session.user);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
      setSessionExpiredHandler(null);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const session = await authApi.login(email, password);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const signup = useCallback(async (data) => {
    const session = await authApi.signup(data);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      clearAccessToken();
    }
    setUser(null);
    setStatus('anonymous');
    navigateRef.current('/login', { replace: true });
  }, []);

  const value = useMemo(
    () => ({ user, status, login, signup, logout }),
    [user, status, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
