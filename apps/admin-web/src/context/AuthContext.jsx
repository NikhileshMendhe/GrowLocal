import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { api, http, refreshSession, setSessionExpiredHandler } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/token';
import { unwrapEnvelope } from '../lib/normalize';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearToken();
      setAdmin(null);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const data = await api.get(ENDPOINTS.AUTH.ME);
    const profile = unwrapEnvelope(data);
    return profile && typeof profile === 'object' ? profile : null;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshSession();
        const profile = await fetchMe();
        if (active) setAdmin(profile);
      } catch {
        clearToken();
        if (active) setAdmin(null);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchMe]);

  const login = useCallback(
    async (email, password) => {
      const data = await http.post(ENDPOINTS.AUTH.ADMIN_LOGIN, { email, password });
      const token = data?.accessToken || data?.token;
      if (token) setToken(token);
      let profile = unwrapEnvelope(data);
      if (!profile && getToken()) {
        try {
          profile = await fetchMe();
        } catch {
          profile = { email };
        }
      }
      setAdmin(profile && typeof profile === 'object' ? profile : { email });
      return profile;
    },
    [fetchMe]
  );

  const logout = useCallback(async () => {
    await http.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    clearToken();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, ready, login, logout }),
    [admin, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
