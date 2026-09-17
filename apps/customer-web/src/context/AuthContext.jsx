import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  ENDPOINTS,
  SESSION_EXPIRED_EVENT,
  api,
  refreshSession,
  setAccessToken,
} from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRef = useRef(null);
  userRef.current = user;

  const applySession = useCallback((data) => {
    setAccessToken(data?.accessToken ?? null);
    setUser(data?.user ?? null);
    return data?.user ?? null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    const onSessionExpired = () => {
      const wasLoggedIn = userRef.current !== null;
      setAccessToken(null);
      setUser(null);
      if (wasLoggedIn) {
        navigate('/login', {
          state: { from: location.pathname + location.search, reason: 'expired' },
          replace: true,
        });
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      cancelled = true;
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api.post(
        ENDPOINTS.AUTH.CUSTOMER_LOGIN,
        { email, password },
        { skipAuthRetry: true }
      );
      return applySession(data);
    },
    [applySession]
  );

  const register = useCallback(
    async ({ fullName, email, password, phone }) => {
      const data = await api.post(
        ENDPOINTS.AUTH.CUSTOMER_SIGNUP,
        { fullName, email, password, ...(phone ? { phone } : {}) },
        { skipAuthRetry: true }
      );
      return applySession(data);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT, undefined, { skipAuthRetry: true });
    } catch {
      // refresh cookie may already be gone — clearing local state is enough
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    ready,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
