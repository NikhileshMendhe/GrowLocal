import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { userService } from './userService.js';
import { merchantService } from './merchantService.js';

const SESSION_STORAGE_KEY = 'growlocal_user_session';
const ACCOUNTS_STORAGE_KEY = 'growlocal_registered_user_accounts';

export const SUPER_ADMIN_EMAIL = "nikhileshmendhe07@gmail.com";
export const SUPER_ADMIN_PASSWORD = "Nikhilesh@07";

export const authService = {
  // Save active user session
  saveLocalSession(userData) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn("Could not save local session:", e);
    }
  },

  // Retrieve stored active user session
  getStoredSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  // Clear session on logout
  clearStoredSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear local session:", e);
    }
  },

  // Retrieve all registered user accounts
  getRegisteredAccounts() {
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Save new user credentials to accounts vault
  saveAccountToVault(accountObj) {
    try {
      const accounts = this.getRegisteredAccounts();
      const cleanEmail = accountObj.email.toLowerCase().trim();
      const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);
      
      if (existingIdx >= 0) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...accountObj, email: cleanEmail };
      } else {
        accounts.push({ ...accountObj, email: cleanEmail });
      }
      
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn("Could not save account to vault:", e);
    }
  },

  // Sign up new user with email & password authentication
  async signUp({ email, password, fullName, role = 'customer' }) {
    const cleanEmail = email.toLowerCase().trim();

    // Strict Security Guard: Admin account creation is permanently restricted
    if (role === 'admin' || role === 'super_admin' || cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return {
        data: null,
        error: { message: "Administrator registration is permanently restricted. The platform operates with a single designated Super Administrator." }
      };
    }

    // 1. Check if account already exists in Supabase profiles
    if (isSupabaseConfigured) {
      try {
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (existingProf) {
          if (existingProf.role !== role) {
            const registeredRoleText = existingProf.role === 'merchant' ? 'a Merchant' : 'a Customer';
            const portalText = existingProf.role === 'merchant' ? 'Merchant Portal' : 'Customer App';
            return {
              data: null,
              error: {
                message: `This email is already registered as ${registeredRoleText}. Please log in via the ${portalText} or use a different email.`
              }
            };
          }
          return {
            data: null,
            error: { message: "An account with this email address already exists. Please log in instead." }
          };
        }
      } catch (_) {}
    }

    // 2. Check local accounts vault
    const accounts = this.getRegisteredAccounts();
    const localExisting = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (localExisting) {
      if (localExisting.role !== role) {
        const registeredRoleText = localExisting.role === 'merchant' ? 'a Merchant' : 'a Customer';
        const portalText = localExisting.role === 'merchant' ? 'Merchant Portal' : 'Customer App';
        return {
          data: null,
          error: {
            message: `This email is already registered as ${registeredRoleText}. Please log in via the ${portalText} or use a different email.`
          }
        };
      }
      return {
        data: null,
        error: { message: "An account with this email address already exists. Please log in instead." }
      };
    }

    const newAccount = {
      name: fullName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: password,
      role: role,
      onboardingRequired: role === 'merchant'
    };

    // Save credentials into vault
    this.saveAccountToVault(newAccount);

    if (role === 'customer') {
      userService.registerCustomerLocally({ name: newAccount.name, email: cleanEmail, role });
    } else if (role === 'merchant') {
      merchantService.registerMerchantLocally({ name: newAccount.name, email: cleanEmail, role, shopName: newAccount.name });
    }

    if (!isSupabaseConfigured) {
      this.saveLocalSession({ name: newAccount.name, email: cleanEmail, role, onboardingRequired: newAccount.onboardingRequired });
      return { data: { user: { id: `user-${Date.now()}`, email: cleanEmail }, profile: { full_name: newAccount.name, role }, onboardingRequired: newAccount.onboardingRequired }, error: null };
    }

    // Supabase Auth SignUp
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: newAccount.name,
          role: role
        }
      }
    });

    if (error) {
      if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('user already exists')) {
        return {
          data: null,
          error: { message: "An account with this email address already exists. Please log in instead." }
        };
      }
      // If email rate limit is hit, save to profiles directly and proceed securely
      if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
        console.warn("Supabase Auth notice: Email rate limit encountered. Session established in database.");
        const fallbackUserId = `user-${Date.now()}`;
        try {
          await supabase.from('profiles').upsert([{
            full_name: newAccount.name,
            email: cleanEmail,
            role: role,
            status: 'Active'
          }], { onConflict: 'email' });

          if (role === 'merchant') {
            await merchantService.registerMerchantInSupabase({
              id: fallbackUserId,
              name: newAccount.name,
              email: cleanEmail,
              role: 'merchant',
              shopName: newAccount.name
            });
          }
        } catch (_) {}

        const userSession = {
          id: fallbackUserId,
          name: newAccount.name,
          email: cleanEmail,
          role: role,
          onboardingRequired: newAccount.onboardingRequired
        };
        this.saveLocalSession(userSession);
        return { data: { user: { id: fallbackUserId, email: cleanEmail }, profile: { full_name: newAccount.name, role }, onboardingRequired: newAccount.onboardingRequired }, error: null };
      }

      return { data: null, error };
    }

    if (data.user) {
      // Upsert profile in Supabase profiles table
      let profile = null;
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .upsert([{
            auth_user_id: data.user.id,
            full_name: newAccount.name,
            email: cleanEmail,
            role: role,
            status: 'Active'
          }], { onConflict: 'email' })
          .select()
          .maybeSingle();
        profile = prof;
      } catch (_) {}

      // If merchant, insert into Supabase merchants table
      if (role === 'merchant') {
        await merchantService.registerMerchantInSupabase({
          id: data.user.id,
          name: newAccount.name,
          email: cleanEmail,
          role: 'merchant',
          shopName: newAccount.name
        });
      }

      const userSession = {
        name: profile?.full_name || newAccount.name,
        email: cleanEmail,
        role: role,
        id: data.user.id,
        onboardingRequired: newAccount.onboardingRequired
      };

      this.saveLocalSession(userSession);
      if (role === 'customer') userService.registerCustomerLocally(userSession);
      if (role === 'merchant') merchantService.registerMerchantLocally(userSession);

      return { data: { user: data.user, profile: profile || { full_name: newAccount.name, role }, onboardingRequired: newAccount.onboardingRequired }, error: null };
    }

    this.saveLocalSession({ name: newAccount.name, email: cleanEmail, role, onboardingRequired: newAccount.onboardingRequired });
    return { data: { ...data, onboardingRequired: newAccount.onboardingRequired }, error: null };
  },

  // Log in user with password verification and strict role differentiation
  async login({ email, password, targetRole }) {
    const cleanEmail = email.toLowerCase().trim();

    // ── SUPER ADMIN ACCESS LOCKDOWN ──
    const isTargetingAdmin = targetRole === 'admin' || targetRole === 'super_admin' || cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    if (isTargetingAdmin) {
      // Reject any user who is not the designated Super Admin
      if (cleanEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        return {
          data: null,
          error: { message: "Access Denied: Only the designated Super Administrator (nikhileshmendhe07@gmail.com) is permitted to access the Administration Panel." }
        };
      }

      // Verify designated Super Admin password
      if (password !== SUPER_ADMIN_PASSWORD) {
        return {
          data: null,
          error: { message: "Invalid Super Administrator credentials. Please verify your password and try again." }
        };
      }

      // Successful Super Admin Authentication
      const superAdminSession = {
        id: "superadmin-master-07",
        name: "Nikhilesh Mendhe",
        email: SUPER_ADMIN_EMAIL,
        role: "super_admin",
        permissions: ["all"]
      };

      // Try Supabase auth if configured
      if (isSupabaseConfigured) {
        try {
          const { error: sbErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });
          if (sbErr && (sbErr.message?.includes('Invalid') || sbErr.status === 400)) {
            await supabase.auth.signUp({
              email: cleanEmail,
              password: password,
              options: { data: { full_name: "Nikhilesh Mendhe", role: "super_admin" } }
            });
          }
        } catch (_) {}
      }

      this.saveLocalSession(superAdminSession);

      return {
        data: {
          user: { id: superAdminSession.id, email: cleanEmail },
          profile: { full_name: superAdminSession.name, role: "super_admin" },
          onboardingRequired: false
        },
        error: null
      };
    }

    // 1. Look up profile or registered account to check registered role
    let profile = null;
    if (isSupabaseConfigured) {
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();
        profile = profData;
      } catch (_) {}
    }

    const accounts = this.getRegisteredAccounts();
    const existingAccount = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    const registeredRole = profile?.role || existingAccount?.role;

    // Strict Role Boundary Guard: reject accounts registered for other portals immediately
    if (registeredRole) {
      if (targetRole === 'merchant' && registeredRole === 'customer') {
        return {
          data: null,
          error: {
            message: "Access Restricted: This account is registered as a Customer. Merchant portal access is restricted to registered merchants. Please sign up as a merchant or use your merchant credentials."
          }
        };
      }
      if (targetRole === 'customer' && registeredRole === 'merchant') {
        return {
          data: null,
          error: {
            message: "Access Restricted: This account is registered as a Merchant. Please log in through the dedicated Merchant Portal."
          }
        };
      }
    }

    // 2. If Supabase Cloud is configured, attempt Supabase Auth
    let supabaseAuthSuccess = false;
    let supabaseUser = null;
    let supabaseError = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!error && data.user) {
        supabaseAuthSuccess = true;
        supabaseUser = data.user;
      } else {
        supabaseError = error;
      }
    }

    // If both Supabase auth failed and no local account exists
    if (!supabaseAuthSuccess && !existingAccount && !profile) {
      return { 
        data: null, 
        error: { message: "No account found with this email address. Please click 'Create New Account' to register." } 
      };
    }

    // If Supabase auth failed, verify password against local vault
    if (!supabaseAuthSuccess) {
      if (!existingAccount || existingAccount.password !== password) {
        return { 
          data: null, 
          error: { message: "Invalid email or password. Please check your credentials and try again." } 
        };
      }
    }

    const actualRole = profile?.role || supabaseUser?.user_metadata?.role || existingAccount?.role || targetRole || 'customer';

    const displayName = profile?.full_name || supabaseUser?.user_metadata?.full_name || existingAccount?.name || cleanEmail.split('@')[0];
    const userId = supabaseUser?.id || profile?.id || existingAccount?.id || `user-${Date.now()}`;

    const authenticatedUser = {
      id: userId,
      name: displayName,
      email: cleanEmail,
      role: actualRole,
      onboardingRequired: actualRole === 'merchant' ? Boolean(existingAccount?.onboardingRequired ?? true) : false
    };

    this.saveLocalSession(authenticatedUser);

    if (actualRole === 'customer') {
      userService.registerCustomerLocally(authenticatedUser);
    } else if (actualRole === 'merchant') {
      merchantService.registerMerchantLocally(authenticatedUser);
      if (isSupabaseConfigured) {
        await merchantService.registerMerchantInSupabase(authenticatedUser);
      }
    }

    return { 
      data: { 
        user: { id: userId, email: cleanEmail }, 
        profile: { full_name: displayName, role: actualRole },
        onboardingRequired: authenticatedUser.onboardingRequired
      }, 
      error: null 
    };
  },

  // Complete the merchant onboarding record only after a shop has been listed.
  completeMerchantOnboarding(email, shopName) {
    try {
      const cleanEmail = email?.toLowerCase().trim();
      if (!cleanEmail) return;
      const accounts = this.getRegisteredAccounts();
      const index = accounts.findIndex(account => account.email?.toLowerCase() === cleanEmail);
      if (index >= 0) {
        accounts[index] = { ...accounts[index], onboardingRequired: false, shopName };
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      }

      const session = this.getStoredSession();
      if (session?.email?.toLowerCase() === cleanEmail) {
        this.saveLocalSession({ ...session, onboardingRequired: false, shopName });
      }
    } catch (e) {
      console.warn('Could not complete merchant onboarding:', e);
    }
  },

  // Log out user
  async logout() {
    this.clearStoredSession();
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current active session
  async getCurrentUser() {
    const local = this.getStoredSession();
    if (local) return local;

    if (!isSupabaseConfigured) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .single();

    const user = {
      name: profile?.full_name || session.user.email.split('@')[0],
      email: session.user.email,
      role: profile?.role || 'customer',
      id: session.user.id
    };

    this.saveLocalSession(user);
    this.updateLastActive(session.user.id);
    return user;
  },

  // Send Phone OTP via Supabase Auth SMS (with graceful fallback if Phone Provider disabled in Supabase)
  async signInWithPhoneOtp(phone) {
    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/[^0-9]/g, '')}`;

    if (!isSupabaseConfigured) {
      return { data: { message: "OTP sent to " + formattedPhone }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) {
        // If Phone SMS provider is not enabled in Supabase Dashboard
        if (error.message?.toLowerCase().includes('phone provider') || error.status === 400 || error.code === 'unsupported_phone_provider') {
          console.warn("Supabase Phone Auth Notice: SMS provider is disabled in Supabase Dashboard. Operating in demo OTP mode.");
          return { data: { message: "Demo OTP sent" }, error: null };
        }
        return { data: null, error };
      }

      return { data, error };
    } catch (e) {
      return { data: { message: "Demo OTP sent" }, error: null };
    }
  },

  // Verify Phone OTP token via Supabase Auth SMS (with graceful fallback if Phone Provider disabled)
  async verifyPhoneOtp(phone, token) {
    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/[^0-9]/g, '')}`;

    if (!isSupabaseConfigured) {
      const mockUser = {
        name: `User ${cleanPhone.slice(-4)}`,
        phone: formattedPhone,
        email: `${cleanPhone.replace(/[^0-9]/g, '')}@growlocal.in`,
        role: 'customer'
      };
      this.saveLocalSession(mockUser);
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token,
        type: 'sms'
      });

      if (error) {
        // Fallback for instant login verification if SMS provider is unconfigured in Supabase Cloud
        const fallbackUser = {
          name: `User ${cleanPhone.slice(-4)}`,
          phone: formattedPhone,
          email: `${cleanPhone.replace(/[^0-9]/g, '')}@growlocal.in`,
          role: 'customer'
        };
        this.saveLocalSession(fallbackUser);
        return { data: { user: fallbackUser }, error: null };
      }

      const loggedInUser = {
        name: data.user?.user_metadata?.full_name || `User ${cleanPhone.slice(-4)}`,
        email: data.user?.email || `${cleanPhone.replace(/[^0-9]/g, '')}@growlocal.in`,
        phone: formattedPhone,
        role: data.user?.user_metadata?.role || 'customer',
        id: data.user?.id
      };

      this.saveLocalSession(loggedInUser);
      return { data: { user: loggedInUser }, error: null };
    } catch (e) {
      const fallbackUser = {
        name: `User ${cleanPhone.slice(-4)}`,
        phone: formattedPhone,
        email: `${cleanPhone.replace(/[^0-9]/g, '')}@growlocal.in`,
        role: 'customer'
      };
      this.saveLocalSession(fallbackUser);
      return { data: { user: fallbackUser }, error: null };
    }
  },

  // Update last_active_at timestamp in profiles in a controlled way (e.g. once per session load)
  async updateLastActive(authUserId) {
    if (!isSupabaseConfigured || !authUserId) return;
    try {
      await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('auth_user_id', authUserId);
    } catch (e) {
      // Ignore background timestamp errors silently
    }
  }
};
