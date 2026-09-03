import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_SHOPS } from '../data/mockData';

export const shopService = {
  // Helper to format Supabase shop row into unified frontend shape
  formatShopRow(s) {
    return {
      id: s.id,
      merchantId: s.merchant_id,
      name: s.name || "Local Store",
      category: s.categories?.name || s.category || "Local Business",
      verified: Boolean(s.is_verified),
      is_verified: Boolean(s.is_verified),
      rating: s.rating ? Number(s.rating) : 4.8,
      reviewsCount: s.review_count || 12,
      distance: s.distance ? `${s.distance} km away` : "1.2 km away",
      address: s.address || "Nagpur, Maharashtra",
      city: s.city || "Nagpur",
      status: s.status === 'open' || s.status === 'Open' ? 'Open' : (s.status || 'Open'),
      closingTime: "Closes 9 PM",
      openHours: "10:00 AM – 9:00 PM",
      openDays: "Mon – Sun",
      priceRange: s.price_min && s.price_max ? `₹${s.price_min} – ₹${s.price_max}` : "₹299 – ₹9,999",
      coverImage: s.cover_image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      logoImage: s.logo_url || s.cover_image_url || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80",
      about: s.description || "Verified local store in Nagpur.",
      photos: s.shop_photos && s.shop_photos.length > 0
        ? s.shop_photos.map(p => p.image_url)
        : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"]
    };
  },

  // Fetch all shops (Supabase + locally added merchant shops)
  async getAllShops() {
    // Always include locally-added merchant shops
    let localShops = [];
    try {
      localShops = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
    } catch (_) {}

    if (!isSupabaseConfigured) {
      return { data: localShops, error: null };
    }

    const { data, error } = await supabase
      .from('shops')
      .select('*, shop_hours(*), shop_photos(*), categories(name)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { data: localShops, error: null };
    }

    const formatted = data.map(s => this.formatShopRow(s));
    // Merge: local merchant-created shops first, then Supabase shops
    const supabaseIds = new Set(formatted.map(s => s.id));
    const uniqueLocal = localShops.filter(s => !supabaseIds.has(s.id));
    return { data: [...uniqueLocal, ...formatted], error: null };
  },

  // Get nearby shops using PostGIS or Haversine distance function
  async getNearbyShops(lat = 21.0112, lng = 79.0024, radiusKm = 3.0) {
    if (!isSupabaseConfigured) {
      return { data: INITIAL_SHOPS, error: null };
    }

    const { data, error } = await supabase.rpc('get_nearby_shops', {
      lat_param: lat,
      lng_param: lng,
      radius_param: radiusKm
    });

    if (error || !data || data.length === 0) {
      const { data: shopsFallback } = await supabase.from('shops').select('*, categories(name)').eq('status', 'open');
      if (shopsFallback && shopsFallback.length > 0) {
        return { data: shopsFallback.map(s => this.formatShopRow(s)), error: null };
      }
      return { data: INITIAL_SHOPS, error: null };
    }

    return { data: data.map(s => this.formatShopRow(s)), error: null };
  },

  // Save a merchant-created shop locally (until Supabase write is wired)
  saveShopLocally(shop) {
    try {
      const existing = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      const updated = [shop, ...existing.filter(s => s.id !== shop.id)];
      localStorage.setItem('growlocal_merchant_shops', JSON.stringify(updated));
    } catch (_) {}
  },

  // Toggle featured status of a shop
  async toggleFeatureShop(shopId, isFeatured) {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('shops')
      .update({ is_featured: isFeatured, updated_at: new Date() })
      .eq('id', shopId);

    return { data, error };
  },

  // Real-time subscription to shops channel
  subscribeToShops(onShopChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:shops')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shops'
      }, (payload) => {
        onShopChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
