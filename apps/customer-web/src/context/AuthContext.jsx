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
import { supabase } from '../lib/supabase';
import { trackActivity } from '../lib/activityTracker';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: 'login', // 'login' | 'register' | 'forgot'
    onSuccessCallback: null,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const userRef = useRef(null);
  userRef.current = user;

  const applySession = useCallback((data) => {
    setAccessToken(data?.accessToken ?? null);
    setUser(data?.user ?? null);
    return data?.user ?? null;
  }, []);

  // Initial session restoration
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      try {
        // 1. Try restoring backend API session
        const data = await refreshSession().catch(() => null);
        if (!cancelled && data?.user) {
          setUser(data.user);
          return;
        }

        // 2. Check Supabase session
        const { data: supaSession } = await supabase.auth.getSession().catch(() => ({ data: null }));
        if (!cancelled && supaSession?.session?.user) {
          const supaUser = supaSession.session.user;
          const restoredUser = {
            id: supaUser.id,
            email: supaUser.email,
            full_name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0],
            phone: supaUser.user_metadata?.phone || '',
          };
          setUser(restoredUser);
        }
      } catch (err) {
        console.warn('Session init warning:', err);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    initAuth();

    // Listen for Supabase auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const supaUser = session.user;
          setUser((prev) => ({
            id: supaUser.id,
            email: supaUser.email,
            full_name: supaUser.user_metadata?.full_name || prev?.full_name || supaUser.email?.split('@')[0],
            phone: supaUser.user_metadata?.phone || prev?.phone || '',
            ...prev,
          }));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAccessToken(null);
        }
      }
    );

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
      authListener?.subscription?.unsubscribe();
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      // 1. Authenticate with backend API
      let apiUser = null;
      try {
        const data = await api.post(
          ENDPOINTS.AUTH.CUSTOMER_LOGIN,
          { email, password },
          { skipAuthRetry: true }
        );
        apiUser = applySession(data);
      } catch (apiErr) {
        console.warn('Backend login attempt:', apiErr.message);
      }

      // 2. Authenticate with Supabase Auth for complete cloud integration
      try {
        const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (supaErr && !apiUser) {
          throw new Error(supaErr.message || 'Invalid email or password');
        }
        if (supaData?.user && !apiUser) {
          const userObj = {
            id: supaData.user.id,
            email: supaData.user.email,
            full_name: supaData.user.user_metadata?.full_name || email.split('@')[0],
          };
          setUser(userObj);
          return userObj;
        }
      } catch (err) {
        if (!apiUser) throw err;
      }

      const finalUser = apiUser;
      if (finalUser) {
        trackActivity({ activityType: 'login', customer: finalUser });
      }
      return finalUser;
    },
    [applySession]
  );

  const register = useCallback(
    async ({ fullName, email, password, phone }) => {
      // 1. Register with backend API
      let apiUser = null;
      try {
        const data = await api.post(
          ENDPOINTS.AUTH.CUSTOMER_SIGNUP,
          { fullName, email, password, ...(phone ? { phone } : {}) },
          { skipAuthRetry: true }
        );
        apiUser = applySession(data);
      } catch (apiErr) {
        console.warn('Backend signup attempt:', apiErr.message);
      }

      // 2. Register with Supabase Auth
      try {
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || '',
            },
          },
        });
        if (supaErr && !apiUser) {
          throw new Error(supaErr.message || 'Registration failed');
        }
        if (supaData?.user && !apiUser) {
          const userObj = {
            id: supaData.user.id,
            email: supaData.user.email,
            full_name: fullName,
            phone: phone || '',
          };
          setUser(userObj);
          apiUser = userObj;
        }
      } catch (err) {
        if (!apiUser) throw err;
      }

      if (apiUser) {
        trackActivity({ activityType: 'registered', customer: apiUser });
      }
      return apiUser;
    },
    [applySession]
  );

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login?reset=success`,
    });
    if (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT, undefined, { skipAuthRetry: true });
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  const openAuthModal = useCallback((mode = 'login', onSuccessCallback = null) => {
    setAuthModalState({
      isOpen: true,
      mode,
      onSuccessCallback,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false, onSuccessCallback: null }));
  }, []);

  const value = {
    user,
    ready,
    isAuthenticated: user !== null,
    login,
    register,
    resetPassword,
    logout,
    authModalState,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
