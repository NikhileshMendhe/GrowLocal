import { supabase, isSupabaseConfigured } from './supabaseClient';
import { CATEGORIES } from '../data/mockData';

export const categoryService = {
  // Fetch all active categories
  async getCategories() {
    if (!isSupabaseConfigured) {
      return { data: CATEGORIES, error: null };
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return { data, error };
  },

  // Create category (Admin)
  async createCategory(catObj) {
    if (!isSupabaseConfigured) return { data: catObj, error: null };

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: catObj.name,
        slug: catObj.name.toLowerCase().replace(/\s+/g, '-'),
        icon_url: catObj.icon,
        is_active: true
      }])
      .select()
      .single();

    return { data, error };
  },

  // Delete category
  async deleteCategory(id) {
    if (!isSupabaseConfigured) return { success: true };
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return { error };
  }
};
