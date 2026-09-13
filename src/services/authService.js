import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const SESSION_STORAGE_KEY = 'growlocal_user_session';
const ACCOUNTS_STORAGE_KEY = 'growlocal_registered_user_accounts';

export const SUPER_ADMIN_EMAIL = 'nikhileshmendhe07@gmail.com';
export const SUPER_ADMIN_PASSWORD = 'Nikhilesh@07';

const cleanEmail = (email = '') => email.trim().toLowerCase();

const isNetworkError = (error) => {
  if (!error) return false;
  const msg = (error.message || String(error)).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('fetch failed') ||
    msg.includes('load failed') ||
    msg.includes('connection refused') ||
    msg.includes('econnreset') ||
    msg.includes('enotfound') ||
    msg.includes('socket hang up')
  );
};

function toUser(sessionUser, profile, merchant = null) {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    profileId: profile?.id || sessionUser.id,
    merchantId: merchant?.id || null,
    name: profile?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'GrowLocal member',
    email: sessionUser.email,
    role: profile?.role || sessionUser.user_metadata?.role || 'customer',
    onboardingRequired: (profile?.role === 'merchant' || sessionUser.user_metadata?.role === 'merchant') && !merchant
  };
}

export const authService = {
  // Save active user session
  saveLocalSession(user) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (_) {}
  },

  // Retrieve stored active user session
  getStoredSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  },

  // Clear stored session
  clearStoredSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (_) {}
  },

  // Retrieve locally cached registered accounts
  getRegisteredAccounts() {
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  },

  // Cache user credentials locally for offline/network fallback
  saveAccountToVault(accountObj) {
    try {
      const accounts = this.getRegisteredAccounts();
      const email = cleanEmail(accountObj.email);
      const existingIdx = accounts.findIndex(a => cleanEmail(a.email) === email);
      if (existingIdx >= 0) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...accountObj, email };
      } else {
        accounts.push({ ...accountObj, email });
      }
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (_) {}
  },

  // Completely purge deleted user credentials from local vault and active session
  removeAccountFromVault(identifier) {
    if (!identifier) return;
    try {
      const cleanId = String(identifier).trim().toLowerCase();
      const accounts = this.getRegisteredAccounts();
      const updated = accounts.filter(a => {
        const aEmail = cleanEmail(a.email);
        const aId = String(a.id || '').toLowerCase();
        return aEmail !== cleanId && aId !== cleanId;
      });
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));

      // Clear active session if it matches the removed account
      const session = this.getStoredSession();
      if (session) {
        const sEmail = cleanEmail(session.email);
        const sId = String(session.id || '').toLowerCase();
        if (sEmail === cleanId || sId === cleanId) {
          this.clearStoredSession();
        }
      }
    } catch (_) {}
  },

  async loadUser(sessionUser) {
    if (!sessionUser) return null;

    // Reject unverified sessions (except super admin)
    if (!sessionUser.email_confirmed_at && sessionUser.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return null;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, auth_user_id, full_name, email, phone, role, status')
        .eq('auth_user_id', sessionUser.id)
        .maybeSingle();

      if (!profileError && profile) {
        let merchant = null;
        if (profile.role === 'merchant' || profile.role === 'admin' || profile.role === 'super_admin') {
          try {
            const { data } = await supabase
              .from('merchants')
              .select('id, user_id, business_name, email, phone, verification_status')
              .eq('user_id', profile.id)
              .maybeSingle();
            merchant = data;
          } catch (_) {}
        }

        const user = toUser(sessionUser, profile, merchant);
        this.saveLocalSession(user);
        return user;
      }
    } catch (err) {
      console.warn('Network error loading profile from Supabase:', err);
    }

    // Fallback if profile row is pending or network is down
    const userRole = sessionUser.user_metadata?.role || (sessionUser.email === SUPER_ADMIN_EMAIL ? 'super_admin' : 'customer');
    const fallbackUser = {
      id: sessionUser.id,
      profileId: sessionUser.id,
      merchantId: null,
      name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'GrowLocal member',
      email: sessionUser.email,
      phone: sessionUser.user_metadata?.phone || null,
      role: userRole,
      onboardingRequired: userRole === 'merchant'
    };

    this.saveLocalSession(fallbackUser);
    return fallbackUser;
  },

  async signUp({ email, password, fullName, phone = null, role = 'customer' }) {
    const normalizedEmail = cleanEmail(email);
    const cleanPhone = phone?.trim() || null;
    if (!normalizedEmail || !password || password.length < 6) {
      return { data: null, error: { message: 'Enter a valid email address and a password of at least 6 characters.' } };
    }

    if (role === 'admin' || role === 'super_admin') {
      return { data: null, error: { message: 'Administrator accounts cannot be created here.' } };
    }

    // Attempt Supabase sign up if configured
    if (isSupabaseConfigured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName?.trim() || normalizedEmail.split('@')[0],
              phone: cleanPhone,
              role: role === 'merchant' ? 'merchant' : 'customer'
            }
          }
        });

        if (!error && data?.user) {
          const isConfirmed = Boolean(data.user.email_confirmed_at);

          // If email confirmation is required/pending, DO NOT log in or activate session
          if (!isConfirmed) {
            await supabase.auth.signOut().catch(() => {});
            this.clearStoredSession();
            this.saveAccountToVault({
              id: data.user.id,
              email: normalizedEmail,
              password,
              fullName: fullName?.trim() || normalizedEmail.split('@')[0],
              phone: cleanPhone,
              role: role === 'merchant' ? 'merchant' : 'customer',
              isVerified: false
            });
            return { data: { user: data.user, requiresEmailConfirmation: true }, error: null };
          }

          // Save to local vault for seamless offline resilience
          this.saveAccountToVault({
            id: data.user.id,
            email: normalizedEmail,
            password,
            fullName: fullName?.trim() || normalizedEmail.split('@')[0],
            phone: cleanPhone,
            role: role === 'merchant' ? 'merchant' : 'customer',
            isVerified: true
          });

          if (!data.session) {
            return { data: { user: data.user, requiresEmailConfirmation: true }, error: null };
          }

          try {
            const user = await this.loadUser(data.session.user);
            return { data: { user: data.user, profile: user, onboardingRequired: user?.onboardingRequired }, error: null };
          } catch (_) {
            const localUser = {
              id: data.user.id,
              name: fullName?.trim() || normalizedEmail.split('@')[0],
              email: normalizedEmail,
              phone: cleanPhone,
              role: role === 'merchant' ? 'merchant' : 'customer',
              onboardingRequired: role === 'merchant'
            };
            this.saveLocalSession(localUser);
            return { data: { user: data.user, profile: localUser, onboardingRequired: localUser.onboardingRequired }, error: null };
          }
        }

        // If error is not a network error, return the actual Supabase error (e.g. user already registered)
        if (error && !isNetworkError(error)) {
          return { data: null, error };
        }
      } catch (networkErr) {
        console.warn('Supabase sign up network glitch:', networkErr);
      }
    }

    // Offline / Network Fallback Sign Up
    const localId = `user-${Date.now()}`;
    const localUser = {
      id: localId,
      profileId: localId,
      name: fullName?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: cleanPhone,
      role: role === 'merchant' ? 'merchant' : 'customer',
      onboardingRequired: role === 'merchant'
    };

    this.saveAccountToVault({
      id: localId,
      email: normalizedEmail,
      password,
      fullName: localUser.name,
      phone: cleanPhone,
      role: localUser.role,
      isVerified: true
    });

    this.saveLocalSession(localUser);
    return { data: { user: localUser, profile: localUser, onboardingRequired: localUser.onboardingRequired }, error: null };
  },

  async login({ email, password, targetRole = 'customer' }) {
    const normalizedEmail = cleanEmail(email);

    if (!normalizedEmail || !password) {
      return { data: null, error: { message: 'Please provide both email and password.' } };
    }

    // ── SUPER ADMIN SPECIAL CREDENTIALS CHECK ──
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASSWORD) {
      const superAdminUser = {
        id: 'superadmin-master-07',
        profileId: 'superadmin-profile-07',
        name: 'Nikhilesh Mendhe',
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        onboardingRequired: false
      };
      this.saveLocalSession(superAdminUser);
      // Attempt background Supabase sign in silently
      if (isSupabaseConfigured) {
        supabase.auth.signInWithPassword({ email: normalizedEmail, password }).catch(() => {});
      }
      return { data: { user: superAdminUser, profile: superAdminUser, onboardingRequired: false }, error: null };
    }

    // 1. Try Supabase Auth first
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

        if (!authError && authData?.user) {
          // Check email verification: unverified users cannot login
          const isConfirmed = Boolean(authData.user.email_confirmed_at);
          if (!isConfirmed && normalizedEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            await supabase.auth.signOut().catch(() => {});
            this.clearStoredSession();
            return {
              data: null,
              error: {
                message: 'Your email has not been verified yet. Please check your inbox and click the confirmation link before logging in.'
              }
            };
          }

          // Update local accounts vault with verified credentials
          this.saveAccountToVault({
            id: authData.user.id,
            email: normalizedEmail,
            password,
            fullName: authData.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
            role: authData.user.user_metadata?.role || targetRole,
            isVerified: true
          });

          let user = await this.loadUser(authData.user);

          if (targetRole === 'admin' || targetRole === 'super_admin') {
            if (!['admin', 'super_admin'].includes(user?.role)) {
              await supabase.auth.signOut().catch(() => {});
              return { data: null, error: { message: 'This account does not have administrator access.' } };
            }
          }

          if (targetRole === 'merchant' && user?.role === 'customer') {
            try {
              await supabase.rpc('activate_merchant_account');
              user = await this.loadUser(authData.user);
            } catch (_) {}
          }

          return { data: { user: authData.user, profile: user, onboardingRequired: user?.onboardingRequired }, error: null };
        }

        // If credentials are explicitly invalid (400 / invalid_credentials), check local vault or return error
        if (authError && !isNetworkError(authError)) {
          // Check local vault to see if registered locally
          const accounts = this.getRegisteredAccounts();
          const localMatch = accounts.find(a => cleanEmail(a.email) === normalizedEmail && a.password === password);
          if (localMatch) {
            if (localMatch.isVerified === false) {
              return {
                data: null,
                error: {
                  message: 'Your email has not been verified yet. Please check your inbox and click the confirmation link before logging in.'
                }
              };
            }
            const localUser = {
              id: localMatch.id || `user-${Date.now()}`,
              name: localMatch.fullName || localMatch.name || normalizedEmail.split('@')[0],
              email: normalizedEmail,
              role: localMatch.role || targetRole,
              onboardingRequired: localMatch.role === 'merchant' && !localMatch.hasShop
            };
            this.saveLocalSession(localUser);
            return { data: { user: localUser, profile: localUser, onboardingRequired: localUser.onboardingRequired }, error: null };
          }
          return { data: null, error: { message: authError.message || 'Invalid email or password. Please verify your credentials.' } };
        }
      } catch (err) {
        console.warn('Supabase Auth network exception:', err);
      }
    }

    // 2. Offline / Resilient Local Vault Login Check
    const accounts = this.getRegisteredAccounts();
    const localMatch = accounts.find(a => cleanEmail(a.email) === normalizedEmail && a.password === password);
    if (localMatch) {
      if (localMatch.isVerified === false) {
        return {
          data: null,
          error: {
            message: 'Your email has not been verified yet. Please check your inbox and click the confirmation link before logging in.'
          }
        };
      }
      const localUser = {
        id: localMatch.id || `user-${Date.now()}`,
        name: localMatch.fullName || localMatch.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: localMatch.role || targetRole,
        onboardingRequired: localMatch.role === 'merchant' && !localMatch.hasShop
      };
      this.saveLocalSession(localUser);
      return { data: { user: localUser, profile: localUser, onboardingRequired: localUser.onboardingRequired }, error: null };
    }

    // Check if merchant registered a shop with this email
    try {
      const storedShops = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      const matchingShop = storedShops.find(s => s.merchantEmail && cleanEmail(s.merchantEmail) === normalizedEmail);
      if (matchingShop) {
        const merchantUser = {
          id: matchingShop.merchantId || matchingShop.id || `merchant-${Date.now()}`,
          name: matchingShop.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: 'merchant',
          shopId: matchingShop.id,
          onboardingRequired: false
        };
        this.saveLocalSession(merchantUser);
        return { data: { user: merchantUser, profile: merchantUser, onboardingRequired: false }, error: null };
      }
    } catch (_) {}

    // If we reached here during network failure and no local account exists
    return {
      data: null,
      error: { message: 'Unable to connect to the server. Please check your internet connection or verify your credentials.' }
    };
  },

  async logout() {
    this.clearStoredSession();
    if (!isSupabaseConfigured) return { error: null };
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    return { error: null };
  },

  async getCurrentUser() {
    // Check local session first for instantaneous loading
    const localSession = this.getStoredSession();

    if (!isSupabaseConfigured) return localSession;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return await this.loadUser(session.user);
      }
    } catch (err) {
      console.warn('Network issue restoring Supabase session, using local session:', err);
    }

    return localSession;
  }
};
