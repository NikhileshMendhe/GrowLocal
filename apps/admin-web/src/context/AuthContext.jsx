import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { api, http, refreshSession, setSessionExpiredHandler } from '../lib/api';
import { clearToken, getToken, isAdminToken, setToken } from '../lib/token';
import { unwrapEnvelope } from '../lib/normalize';

const AuthContext = createContext(null);

function isProfileAdmin(profile) {
  if (!profile || typeof profile !== 'object') return false;
  const role = profile.role_name || profile.role || profile.type;
  return role === 'admin';
}

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
    try {
      const data = await api.get(ENDPOINTS.AUTH.ME);
      const profile = unwrapEnvelope(data);
      if (profile && isProfileAdmin(profile)) {
        return profile;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existingToken = getToken();
        if (existingToken && !isAdminToken(existingToken)) {
          clearToken();
        }

        // If no token or invalid, try to refresh admin session from cookie
        if (!getToken()) {
          await refreshSession().catch(() => null);
        }

        if (getToken() && isAdminToken(getToken())) {
          const profile = await fetchMe();
          if (active) {
            if (profile && isProfileAdmin(profile)) {
              setAdmin(profile);
            } else {
              clearToken();
              setAdmin(null);
            }
          }
        } else {
          clearToken();
          if (active) setAdmin(null);
        }
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
      const data = await http.post(
        `${ENDPOINTS.AUTH.ADMIN_LOGIN}?audience=admin`,
        { email, password },
        { headers: { 'X-Auth-Audience': 'admin' } }
      );
      const token = data?.accessToken || data?.token;
      if (!token || !isAdminToken(token)) {
        throw new Error('This account does not have administrator privileges.');
      }
      setToken(token);
      let profile = unwrapEnvelope(data);
      if (!profile && getToken()) {
        try {
          profile = await fetchMe();
        } catch {
          profile = { email, role_name: 'admin' };
        }
      }
      const adminProfile =
        profile && typeof profile === 'object'
          ? { ...profile, role_name: 'admin' }
          : { email, role_name: 'admin' };
      setAdmin(adminProfile);
      return adminProfile;
    },
    [fetchMe]
  );

  const logout = useCallback(async () => {
    await http
      .post(`${ENDPOINTS.AUTH.LOGOUT}?audience=admin`, {}, { headers: { 'X-Auth-Audience': 'admin' } })
      .catch(() => {});
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
