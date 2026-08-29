import { supabase, isSupabaseConfigured } from './supabaseClient';
import { userService } from './userService';
import { merchantService } from './merchantService';

const SESSION_STORAGE_KEY = 'growlocal_user_session';
const ACCOUNTS_STORAGE_KEY = 'growlocal_registered_user_accounts';

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
    const accounts = this.getRegisteredAccounts();

    // Check if account already exists
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { 
        data: null, 
        error: { message: "An account with this email address already exists. Please log in instead." } 
      };
    }

    const newAccount = {
      name: fullName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: password,
      role: role
    };

    // Save credentials into vault
    this.saveAccountToVault(newAccount);

    // Sync to user & merchant service tables
    if (role === 'customer') {
      userService.registerCustomerLocally({ name: newAccount.name, email: cleanEmail, role });
    } else if (role === 'merchant') {
      merchantService.registerMerchantLocally({ name: newAccount.name, email: cleanEmail, role });
    }

    if (!isSupabaseConfigured) {
      this.saveLocalSession({ name: newAccount.name, email: cleanEmail, role });
      return { data: { user: { id: `user-${Date.now()}`, email: cleanEmail }, profile: { fullName: newAccount.name, role } }, error: null };
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

    if (error) return { data: null, error };

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .insert([{
          auth_user_id: data.user.id,
          full_name: newAccount.name,
          email: cleanEmail,
          role: role,
          status: 'Active'
        }])
        .select()
        .single();

      const userSession = {
        name: profile?.full_name || newAccount.name,
        email: cleanEmail,
        role: role,
        id: data.user.id
      };

      this.saveLocalSession(userSession);
      if (role === 'customer') userService.registerCustomerLocally(userSession);
      if (role === 'merchant') merchantService.registerMerchantLocally(userSession);
      return { data: { user: data.user, profile }, error: null };
    }

    this.saveLocalSession({ name: newAccount.name, email: cleanEmail, role });
    return { data, error: null };
  },

  // Log in user with password verification
  async login({ email, password, targetRole }) {
    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase Cloud is configured, attempt Supabase Auth
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        return { 
          data: null, 
          error: { message: "Invalid email or password! Please check your credentials and try again." } 
        };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      const userRole = targetRole || profile?.role || (cleanEmail.includes('merchant') ? 'merchant' : cleanEmail.includes('admin') ? 'admin' : 'customer');

      const loggedInUser = {
        name: profile?.full_name || data.user.email.split('@')[0],
        email: data.user.email,
        role: userRole,
        id: data.user.id
      };

      this.saveLocalSession(loggedInUser);
      if (loggedInUser.role === 'customer') userService.registerCustomerLocally(loggedInUser);
      if (loggedInUser.role === 'merchant') merchantService.registerMerchantLocally(loggedInUser);

      return { data: { session: data.session, user: data.user, profile: { full_name: loggedInUser.name, role: userRole } }, error: null };
    }

    // 2. Local Account Vault Verification (when offline / local dev)
    const accounts = this.getRegisteredAccounts();
    const existingAccount = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!existingAccount) {
      return { 
        data: null, 
        error: { message: "No account found with this email address. Please click 'Create New Account' first." } 
      };
    }

    if (existingAccount.password !== password) {
      return { 
        data: null, 
        error: { message: "Incorrect password! Please check your password and try again." } 
      };
    }

    const assignedRole = targetRole || existingAccount.role || 'customer';

    const authenticatedUser = {
      name: existingAccount.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: assignedRole
    };

    // Save updated role in vault if logged in as merchant
    if (targetRole && existingAccount.role !== targetRole) {
      existingAccount.role = targetRole;
      this.saveAccountToVault(existingAccount);
    }

    this.saveLocalSession(authenticatedUser);
    if (authenticatedUser.role === 'customer') userService.registerCustomerLocally(authenticatedUser);
    if (authenticatedUser.role === 'merchant') merchantService.registerMerchantLocally(authenticatedUser);

    return { 
      data: { 
        user: { email: cleanEmail }, 
        profile: { full_name: authenticatedUser.name, role: authenticatedUser.role } 
      }, 
      error: null 
    };
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
    return user;
  }
};
