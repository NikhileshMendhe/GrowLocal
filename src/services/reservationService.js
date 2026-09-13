import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_OFFERS, INITIAL_REVIEWS } from '../data/adminMockData';
import { orderNotificationService } from './orderNotificationService';
import { enquiryService } from './enquiryService';

const RESERVATIONS_STORAGE_KEY = 'growlocal_user_reservations';

export const offerService = {
  async getOffers() {
    if (!isSupabaseConfigured) return { data: INITIAL_OFFERS, error: null };

    const { data, error } = await supabase
      .from('offers')
      .select('*, merchants(business_name), products(name)')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createOffer(offerData) {
    if (!isSupabaseConfigured) return { data: offerData, error: null };

    const { data, error } = await supabase
      .from('offers')
      .insert([offerData])
      .select()
      .single();

    return { data, error };
  },

  subscribeToOffers(onOfferChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:offers')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers'
      }, (payload) => {
        onOfferChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export const reservationService = {
  // Helper to read local stored reservations
  getStoredReservations() {
    try {
      const stored = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Helper to save reservation locally
  saveReservationLocally(resObj) {
    try {
      const current = this.getStoredReservations();
      const code = `GL-R-${Math.floor(10000 + Math.random() * 90000)}`;
      const formatted = {
        id: resObj.id || code,
        reservationCode: resObj.reservationCode || code,
        customerId: resObj.customerId || resObj.customer_id || "",
        customerEmail: resObj.customerEmail || resObj.email || "",
        customerName: resObj.customerName || "Customer",
        customerPhone: resObj.customerPhone || "",
        shopName: resObj.shopName || "Nagpur Store",
        shopArea: resObj.shopArea || "Sitabuldi, Nagpur",
        productName: resObj.productName || "Reserved Item",
        price: resObj.price ? (typeof resObj.price === 'number' ? `₹${resObj.price}` : resObj.price) : "₹1,299",
        pickupTime: resObj.pickupTime || "Today by 7:00 PM",
        status: resObj.status || "Ready for Pickup",
        createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      const updated = [formatted, ...current];
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  async getReservations() {
    if (!isSupabaseConfigured) {
      const local = this.getStoredReservations();
      return { data: local, error: null };
    }

    const { data, error } = await supabase
      .from('reservations')
      .select('*, profiles!customer_id(full_name), shops(name), products(name)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const local = this.getStoredReservations();
      return { data: local, error: null };
    }

    return { data, error: null };
  },

  async createReservation(resData) {
    const reservationCode = `GL-R-${Math.floor(10000 + Math.random() * 90000)}`;
    const newResObj = { id: reservationCode, reservationCode, ...resData };

    this.saveReservationLocally(newResObj);

    try {
      enquiryService.saveEnquiryLocally({
        id: reservationCode,
        reservationCode: reservationCode,
        isOrder: true,
        orderType: 'Reservation Order',
        productRequested: resData.productName || 'Reserved Item',
        productName: resData.productName || 'Reserved Item',
        productImage: resData.productImage || '',
        customerName: resData.customerName || 'Nagpur Shopper',
        customerPhone: resData.customerPhone || '',
        shopId: resData.shopId || '',
        shopName: resData.shopName || '',
        merchantId: resData.merchantId || '',
        size: resData.size || 'Standard',
        quantity: resData.quantity || 1,
        price: resData.price || '₹0',
        budget: resData.price || '₹0',
        totalAmount: resData.totalAmount || (Number(String(resData.price || '').replace(/[^0-9]/g, '')) || 0),
        fulfillmentType: resData.fulfillmentType || 'pickup',
        status: 'Pending',
        timestamp: 'Just now',
        lastMessage: `🛍️ New In-Store Reservation: "${resData.productName}" (${resData.price})`
      });
    } catch (e) {}

    try {
      orderNotificationService.notifyNewOrder(newResObj);
    } catch (e) {}

    if (!isSupabaseConfigured) {
      return { data: newResObj, error: null };
    }

    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', resData.product_id)
      .single();

    if (product && product.stock_quantity < 1) {
      return { data: null, error: { message: "Item is out of stock!" } };
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        reservation_code: reservationCode,
        ...resData
      }])
      .select()
      .single();

    if (!error && product) {
      await supabase
        .from('products')
        .update({ stock_quantity: product.stock_quantity - 1 })
        .eq('id', resData.product_id);
    }

    return { data: data || newResObj, error };
  },

  subscribeToReservations(onReservationChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:reservations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations'
      }, (payload) => {
        onReservationChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export const reviewService = {
  async getReviews() {
    if (!isSupabaseConfigured) return { data: INITIAL_REVIEWS, error: null };

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!customer_id(full_name), shops(name)')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async updateReviewStatus(reviewId, status) {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('reviews')
      .update({ status, updated_at: new Date() })
      .eq('id', reviewId);

    return { data, error };
  }
};
