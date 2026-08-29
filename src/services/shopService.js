import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_SHOPS } from '../data/mockData';

export const shopService = {
  // Fetch all shops
  async getAllShops() {
    if (!isSupabaseConfigured) {
      return { data: INITIAL_SHOPS, error: null };
    }

    const { data, error } = await supabase
      .from('shops')
      .select('*, shop_hours(*), shop_photos(*), categories(name)')
      .order('created_at', { ascending: false });

    return { data, error };
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

    if (error) {
      const { data: shopsFallback } = await supabase.from('shops').select('*').eq('status', 'open');
      return { data: shopsFallback || INITIAL_SHOPS, error: null };
    }

    return { data, error };
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
