import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export const locationService = {
  async getLocations() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    return supabase.from('locations').select('*').eq('is_active', true).order('city');
  },

  async addLocation(location) {
    return supabase.from('locations').insert(location).select().single();
  }
};

export const searchService = {
  async recordSearch(query, profileId = null) {
    const searchQuery = query?.trim();
    if (!searchQuery || !isSupabaseConfigured) return { error: null };
    return supabase.from('search_history').insert({
      search_query: searchQuery,
      user_id: profileId || null
    });
  },

  async searchProductsAndShops(query, profileId = null) {
    const searchQuery = query?.trim() || '';
    await this.recordSearch(searchQuery, profileId);
    const pattern = `%${searchQuery.replace(/[%_]/g, '\\$&')}%`;
    const { data, error } = await supabase
      .from('products')
      .select('*, shops(id, name, is_verified), categories(name), product_variants(size), product_images(image_url, display_order)')
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order('created_at', { ascending: false });
    return { products: data || [], error };
  },

  async getDemandGaps() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    return supabase.from('search_history').select('search_query, created_at').order('created_at', { ascending: false });
  },

  async getPopularSearches() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    const { data, error } = await supabase
      .from('search_history')
      .select('search_query, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return { data: [], error };
    const counts = new Map();
    for (const row of data || []) counts.set(row.search_query, (counts.get(row.search_query) || 0) + 1);
    return {
      data: [...counts.entries()]
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count),
      error: null
    };
  }
};
