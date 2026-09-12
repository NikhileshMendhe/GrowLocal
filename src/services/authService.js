import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const SESSION_STORAGE_KEY = 'growlocal_user_session';
export const SUPER_ADMIN_EMAIL = 'nikhileshmendhe07@gmail.com';

const cleanEmail = (email = '') => email.trim().toLowerCase();

function toUser(sessionUser, profile, merchant = null) {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    profileId: profile?.id || null,
    merchantId: merchant?.id || null,
    name: profile?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'GrowLocal member',
    email: sessionUser.email,
    role: profile?.role || sessionUser.user_metadata?.role || 'customer',
    onboardingRequired: profile?.role === 'merchant' && !merchant
  };
}

export const authService = {
  saveLocalSession(user) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (_) {}
  },

  clearStoredSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (_) {}
  },

  async loadUser(sessionUser) {
    if (!sessionUser) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, auth_user_id, full_name, email, role, status')
      .eq('auth_user_id', sessionUser.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      throw new Error('Your account is still being prepared. Please wait a moment and sign in again.');
    }

    let merchant = null;
    if (profile.role === 'merchant' || profile.role === 'admin' || profile.role === 'super_admin') {
      const { data, error } = await supabase
        .from('merchants')
        .select('id, user_id, business_name, email, verification_status')
        .eq('user_id', profile.id)
        .maybeSingle();
      if (error) throw error;
      merchant = data;
    }

    const user = toUser(sessionUser, profile, merchant);
    this.saveLocalSession(user);
    return user;
  },

  async signUp({ email, password, fullName, role = 'customer' }) {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'The authentication service is not configured.' } };
    }

    const normalizedEmail = cleanEmail(email);
    if (!normalizedEmail || !password || password.length < 6) {
      return { data: null, error: { message: 'Enter a valid email address and a password of at least 6 characters.' } };
    }
    if (role === 'admin' || role === 'super_admin') {
      return { data: null, error: { message: 'Administrator accounts cannot be created here.' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName?.trim() || normalizedEmail.split('@')[0],
          role: role === 'merchant' ? 'merchant' : 'customer'
        }
      }
    });

    if (error) return { data: null, error };

    // With email confirmation enabled Supabase creates no browser session. Never
    // report a successful sign-in until the customer has verified their address.
    if (!data.session) {
      return { data: { user: data.user, requiresEmailConfirmation: true }, error: null };
    }

    try {
      const user = await this.loadUser(data.session.user);
      return { data: { user: data.user, profile: user, onboardingRequired: user.onboardingRequired }, error: null };
    } catch (loadError) {
      return { data: null, error: { message: loadError.message || 'Account created, but its profile could not be loaded.' } };
    }
  },

  async login({ email, password, targetRole = 'customer' }) {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'The authentication service is not configured.' } };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail(email),
      password
    });
    if (authError || !authData.user) return { data: null, error: authError || { message: 'Unable to sign in.' } };

    try {
      let user = await this.loadUser(authData.user);

      if (targetRole === 'admin' || targetRole === 'super_admin') {
        if (!['admin', 'super_admin'].includes(user.role)) {
          await supabase.auth.signOut();
          return { data: null, error: { message: 'This account does not have administrator access.' } };
        }
      }

      if (targetRole === 'merchant' && user.role === 'customer') {
        const { error: activationError } = await supabase.rpc('activate_merchant_account');
        if (activationError) return { data: null, error: activationError };
        user = await this.loadUser(authData.user);
      }

      if (targetRole === 'merchant' && !['merchant', 'admin', 'super_admin'].includes(user.role)) {
        return { data: null, error: { message: 'This account cannot access the merchant portal.' } };
      }

      return { data: { user: authData.user, profile: user, onboardingRequired: user.onboardingRequired }, error: null };
    } catch (loadError) {
      return { data: null, error: { message: loadError.message || 'Unable to load your account profile.' } };
    }
  },

  async logout() {
    this.clearStoredSession();
    if (!isSupabaseConfigured) return { error: null };
    return supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      this.clearStoredSession();
      return null;
    }
    try {
      return await this.loadUser(session.user);
    } catch (error) {
      console.warn('Could not restore the authenticated user:', error.message);
      return null;
    }
  }
};
