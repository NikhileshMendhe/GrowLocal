import { supabase, isSupabaseConfigured } from './supabaseClient.js';

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
          phone: userObj.phone || "+91 98765 43210",
          location: "Butibori, Nagpur",
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
      auth_user_id: p.auth_user_id || `7f2c8d91-3a4b-5c6d-7e8f-${Math.floor(1000 + Math.random() * 9000)}`,
      name: p.full_name || p.email?.split('@')[0] || "Customer User",
      email: p.email || "",
      phone: p.phone || "+91 98765 43210",
      city: p.city || "Nagpur",
      location: p.city ? `${p.city}, Maharashtra` : "Butibori, Nagpur",
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
