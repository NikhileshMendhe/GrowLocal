import { supabase, isSupabaseConfigured } from './supabaseClient';

const ENQUIRIES_STORAGE_KEY = 'growlocal_user_enquiries';

export const enquiryService = {
  // Helper to get local stored enquiries
  getStoredEnquiries() {
    try {
      const stored = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Helper to save enquiry locally
  saveEnquiryLocally(enquiryObj) {
    try {
      const current = this.getStoredEnquiries();
      const code = `GL${Math.floor(1000 + Math.random() * 9000)}`;
      const formatted = {
        id: enquiryObj.id || `#${code}`,
        customerName: enquiryObj.customerName || enquiryObj.userName || "Customer",
        customerPhone: enquiryObj.phone || enquiryObj.customerPhone || "+91 98765 43210",
        productRequested: enquiryObj.productRequested || enquiryObj.itemRequested || "Requested Product",
        category: enquiryObj.category || "General Local Retail",
        targetArea: enquiryObj.targetArea || enquiryObj.area || "Sitabuldi, Nagpur",
        budget: enquiryObj.budget ? (typeof enquiryObj.budget === 'number' ? `₹${enquiryObj.budget}` : enquiryObj.budget) : "₹1,500",
        submittedDate: enquiryObj.submittedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: enquiryObj.status || "Pending Quotes",
        merchantResponsesCount: enquiryObj.merchantResponsesCount || 0,
        bestQuote: enquiryObj.bestQuote || "Awaiting Shop Responses"
      };

      const updated = [formatted, ...current];
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  // Fetch enquiries
  async getEnquiries() {
    if (!isSupabaseConfigured) {
      const local = this.getStoredEnquiries();
      return { data: local, error: null };
    }

    const { data, error } = await supabase
      .from('enquiries')
      .select('*, profiles!customer_id(full_name), shops(name), products(name)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const local = this.getStoredEnquiries();
      return { data: local, error: null };
    }

    return { data, error: null };
  },

  // Create new enquiry
  async createEnquiry(enquiryData) {
    const code = `GL${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiryObj = { id: `#${code}`, ...enquiryData };

    this.saveEnquiryLocally(newEnquiryObj);

    if (!isSupabaseConfigured) {
      return { data: newEnquiryObj, error: null };
    }

    const { data, error } = await supabase
      .from('enquiries')
      .insert([{
        enquiry_code: code,
        ...enquiryData
      }])
      .select()
      .single();

    return { data: data || newEnquiryObj, error };
  },

  // Update enquiry status
  async updateStatus(enquiryId, status) {
    const current = this.getStoredEnquiries();
    const updated = current.map(e => e.id === enquiryId ? { ...e, status } : e);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));

    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('enquiries')
      .update({ status, updated_at: new Date() })
      .eq('id', enquiryId);

    return { data, error };
  },

  // Real-time subscription to enquiries channel
  subscribeToEnquiries(onEnquiryChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:enquiries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enquiries'
      }, (payload) => {
        onEnquiryChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
