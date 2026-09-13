import { supabase, isSupabaseConfigured } from './supabaseClient';

const ENQUIRIES_STORAGE_KEY = 'growlocal_user_enquiries';

export const enquiryService = {
  // Helper to get local stored enquiries
  getStoredEnquiries() {
    try {
      const stored = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      let list = stored ? JSON.parse(stored) : [];

      // Automatically sync any customer orders/reservations into enquiries list
      try {
        const reservationsRaw = localStorage.getItem('growlocal_user_reservations');
        if (reservationsRaw) {
          const reservations = JSON.parse(reservationsRaw);
          if (Array.isArray(reservations)) {
            reservations.forEach(res => {
              if (res && res.id && !list.some(e => e.id === res.id || e.reservationCode === res.id || e.id === res.reservationCode)) {
                const orderItem = {
                  id: res.id || res.reservationCode || `ORD-${Date.now()}`,
                  reservationCode: res.reservationCode || res.id,
                  customerId: res.customer_id || res.customerId || '',
                  customerName: res.customerName || 'Nagpur Shopper',
                  customerPhone: res.customerPhone || '',
                  productRequested: res.productName || 'Customer Order',
                  productName: res.productName || 'Customer Order',
                  productImage: res.productImage || '',
                  shopId: res.shopId || '',
                  shopName: res.shopName || '',
                  merchantId: res.merchantId || '',
                  size: res.size || 'Standard',
                  quantity: res.quantity || 1,
                  budget: res.price || `₹${res.totalAmount || 0}`,
                  price: res.price || `₹${res.totalAmount || 0}`,
                  totalAmount: res.totalAmount || (Number(String(res.price || '').replace(/[^0-9]/g, '')) || 0),
                  fulfillmentType: res.fulfillmentType || 'pickup',
                  deliveryAddress: res.deliveryAddress || null,
                  status: res.status || 'Pending',
                  isOrder: true,
                  orderType: res.fulfillmentType === 'delivery' ? 'Express Delivery Order' : 'Store Pickup Order',
                  timestamp: res.orderTime || 'Just now',
                  submittedDate: res.orderDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  lastMessage: `🛒 Customer Order: "${res.productName}" (${res.price || ''})`
                };
                list.unshift(orderItem);
              }
            });
            // Persist back so it's cached in enquiries
            localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(list));
          }
        }
      } catch (err) {}

      return list;
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
        ...enquiryObj,
        id: enquiryObj.id || `#${code}`,
        customerId: enquiryObj.customerId || enquiryObj.customer_id || "",
        customerEmail: enquiryObj.customerEmail || enquiryObj.email || "",
        customerName: enquiryObj.customerName || enquiryObj.userName || "Customer",
        customerPhone: enquiryObj.phone || enquiryObj.customerPhone || "",
        productRequested: enquiryObj.productRequested || enquiryObj.productName || enquiryObj.itemRequested || "Requested Product",
        productName: enquiryObj.productName || enquiryObj.productRequested || "Requested Product",
        productImage: enquiryObj.productImage || (enquiryObj.images ? enquiryObj.images[0] : (enquiryObj.image || "")),
        shopId: enquiryObj.shopId || "",
        shopName: enquiryObj.shopName || "",
        merchantId: enquiryObj.merchantId || "",
        merchantEmail: enquiryObj.merchantEmail || "",
        isOrder: Boolean(enquiryObj.isOrder),
        orderType: enquiryObj.orderType || (enquiryObj.isOrder ? 'Buy Now Order' : null),
        category: enquiryObj.category || "General Local Retail",
        targetArea: enquiryObj.targetArea || enquiryObj.area || "Nagpur",
        budget: enquiryObj.budget ? (typeof enquiryObj.budget === 'number' ? `₹${enquiryObj.budget}` : enquiryObj.budget) : (enquiryObj.price || "₹1,500"),
        price: enquiryObj.price || enquiryObj.budget || "₹1,500",
        totalAmount: enquiryObj.totalAmount || (Number(String(enquiryObj.price || enquiryObj.budget).replace(/[^0-9]/g, '')) || 0),
        size: enquiryObj.size || "Standard",
        quantity: enquiryObj.quantity || 1,
        fulfillmentType: enquiryObj.fulfillmentType || "delivery",
        deliveryAddress: enquiryObj.deliveryAddress || "",
        submittedDate: enquiryObj.submittedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: enquiryObj.status || (enquiryObj.isOrder ? "Pending" : "Pending Quotes"),
        orderStatus: enquiryObj.orderStatus || (enquiryObj.isOrder ? "Confirmed" : null),
        merchantResponsesCount: enquiryObj.merchantResponsesCount || 0,
        bestQuote: enquiryObj.bestQuote || (enquiryObj.isOrder ? enquiryObj.price : "Awaiting Shop Responses"),
        lastMessage: enquiryObj.lastMessage || (enquiryObj.isOrder 
          ? `🛒 Order placed for "${enquiryObj.productName || 'Product'}" (${enquiryObj.price})` 
          : `Enquiry for "${enquiryObj.productName || 'Product'}"`)
      };

      const updated = [formatted, ...current.filter(e => e.id !== formatted.id)];
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
