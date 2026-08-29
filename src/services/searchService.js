import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_LOCATIONS, SEARCH_DEMAND_GAPS, POPULAR_SEARCHES } from '../data/adminMockData';

export const locationService = {
  async getLocations() {
    if (!isSupabaseConfigured) return { data: INITIAL_LOCATIONS, error: null };

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('city', { ascending: true });

    return { data, error };
  },

  async addLocation(locObj) {
    if (!isSupabaseConfigured) return { data: locObj, error: null };

    const { data, error } = await supabase
      .from('locations')
      .insert([locObj])
      .select()
      .single();

    return { data, error };
  }
};

export const searchService = {
  // Execute search and record search history
  async searchProductsAndShops(query, userId = null) {
    if (!isSupabaseConfigured) return { success: true };

    // Record search history for demand intelligence
    if (query) {
      await supabase.from('search_history').insert([{
        user_id: userId,
        search_query: query
      }]);
    }

    const { data: products } = await supabase
      .from('products')
      .select('*, shops(*)')
      .ilike('name', `%${query}%`);

    return { products, error: null };
  },

  // Get search demand gaps for admin demand intelligence
  async getDemandGaps() {
    if (!isSupabaseConfigured) return { data: SEARCH_DEMAND_GAPS, error: null };

    const { data, error } = await supabase
      .from('search_history')
      .select('search_query, created_at')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getPopularSearches() {
    if (!isSupabaseConfigured) return { data: POPULAR_SEARCHES, error: null };

    return { data: POPULAR_SEARCHES, error: null };
  }
};
