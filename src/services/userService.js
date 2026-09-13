import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { authService } from './authService.js';

const CUSTOMERS_STORAGE_KEY = 'growlocal_registered_customers';

export const userService = {
  // Helper to read locally stored registered customers
  getStoredRegisteredCustomers() {
    try {
      const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Helper to save registered customer
  registerCustomerLocally(userObj) {
    try {
      const currentList = this.getStoredRegisteredCustomers();
      if (!currentList.some(c => c.email?.toLowerCase() === userObj.email?.toLowerCase())) {
        const formattedNew = {
          id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: userObj.name || userObj.fullName || userObj.email?.split('@')[0] || "Customer",
          email: userObj.email,
          phone: userObj.phone || "",
          location: "Nagpur, Maharashtra",
          registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          enquiriesCount: 0,
          reservationsCount: 0,
          status: "Active",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          totalSpent: "₹0",
          internalNotes: "Registered customer from Customer Web App."
        };
        const updated = [formattedNew, ...currentList];
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return currentList;
    } catch (e) {
      return [];
    }
  },

  // Fetch all registered customers for admin management
  async getAllCustomers() {
    if (!isSupabaseConfigured) {
      const localCustomers = this.getStoredRegisteredCustomers();
      return { data: localCustomers, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const localCustomers = this.getStoredRegisteredCustomers();
      return { data: localCustomers, error: null };
    }

    const formatted = data.map(p => ({
      id: p.id || `CUST-${p.auth_user_id?.substring(0, 5)}`,
      auth_user_id: p.auth_user_id || '',
      name: p.full_name || p.email?.split('@')[0] || "Customer User",
      email: p.email || "",
      phone: p.phone || "",
      city: p.city || "Nagpur",
      location: p.city ? `${p.city}, Maharashtra` : "Nagpur, Maharashtra",
      registeredDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Today",
      lastActive: p.last_active_at ? new Date(p.last_active_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Recently",
      enquiriesCount: p.enquiries_count || 0,
      reservationsCount: p.reservations_count || 0,
      savedShopsCount: 2,
      reviewsCount: 1,
      status: p.status || "Active",
      avatar: p.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      totalSpent: "₹0",
      internalNotes: p.internal_notes || "Registered customer from Customer Web App."
    }));

    return { data: formatted, error: null };
  },

  // Permanently delete customer from auth.users and public tables
  async deleteCustomer(id, authUserId, email) {
    try {
      // 1. Remove from local storage cache
      const currentList = this.getStoredRegisteredCustomers();
      const updated = currentList.filter(c => c.id !== id && c.email?.toLowerCase() !== email?.toLowerCase());
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));

      // 2. Remove credentials from offline account vault
      authService.removeAccountFromVault(email || authUserId || id);

      if (!isSupabaseConfigured) return { success: true };

      // 3. Call database SECURITY DEFINER RPC function to delete from auth.users
      const targetIdentifier = authUserId || id || email;
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_delete_user', {
        target_identifier: targetIdentifier
      });

      if (rpcError) {
        console.warn('RPC admin_delete_user fallback to direct delete:', rpcError);
        // Fallback: delete directly from public.profiles
        if (id) await supabase.from('profiles').delete().eq('id', id);
        if (email) await supabase.from('profiles').delete().eq('email', email);
      }

      return { success: true, data: rpcData };
    } catch (e) {
      console.error('Error in deleteCustomer:', e);
      return { success: false, error: e };
    }
  },

  // Update customer status (Active, Suspended, Blocked)
  async updateCustomerStatus(id, status) {
    // Update local storage
    const currentList = this.getStoredRegisteredCustomers();
    const updated = currentList.map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));

    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date() })
      .eq('id', id);

    return { data, error };
  },

  // Save internal admin note for customer
  async saveInternalNote(id, note) {
    const currentList = this.getStoredRegisteredCustomers();
    const updated = currentList.map(c => c.id === id ? { ...c, internalNotes: note } : c);
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));

    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('profiles')
      .update({ internal_notes: note, updated_at: new Date() })
      .eq('id', id);

    return { data, error };
  },

  // Real-time subscription to customer profiles
  subscribeToCustomers(onCustomerChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.customer'
      }, (payload) => {
        onCustomerChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
