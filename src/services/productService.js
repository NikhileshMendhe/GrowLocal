import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_PRODUCTS } from '../data/mockData';

export const productService = {
  // Fetch all products
  async getAllProducts() {
    if (!isSupabaseConfigured) {
      return { data: INITIAL_PRODUCTS, error: null };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, shops(name, is_verified, address), categories(name), product_variants(*), product_images(*)')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create new product
  async createProduct(productData) {
    if (!isSupabaseConfigured) return { data: { id: `prod-${Date.now()}`, ...productData }, error: null };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    return { data, error };
  },

  // Update product price
  async updatePrice(productId, newPrice) {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .update({ price: newPrice, updated_at: new Date() })
      .eq('id', productId);

    return { data, error };
  },

  // Update product stock
  async updateStock(productId, stockQuantity, status = 'In Stock') {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: stockQuantity, availability_status: status, updated_at: new Date() })
      .eq('id', productId);

    return { data, error };
  },

  // Delete product
  async deleteProduct(productId) {
    if (!isSupabaseConfigured) return { success: true };

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    return { error };
  },

  // Real-time subscription to products channel
  subscribeToProducts(onProductChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        onProductChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
