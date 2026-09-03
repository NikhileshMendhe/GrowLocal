import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_PRODUCTS } from '../data/mockData';

export const productService = {
  // Helper to format Supabase product row into unified frontend shape
  formatProductRow(p) {
    const images = p.product_images && p.product_images.length > 0
      ? p.product_images.map(i => i.image_url)
      : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"];

    const sizes = p.product_variants && p.product_variants.length > 0
      ? p.product_variants.map(v => v.size).filter(Boolean)
      : ["S", "M", "L", "XL"];

    return {
      id: p.id,
      shopId: p.shop_id || "shop-1",
      shopName: p.shops?.name || "Trendy Wear",
      shopVerified: Boolean(p.shops?.is_verified),
      shopDistance: "1.2 km away",
      name: p.name || "Product Item",
      category: p.categories?.name || p.category || "Clothes",
      price: Number(p.price) || 499,
      originalPrice: p.original_price ? Number(p.original_price) : (Number(p.price) ? Math.round(Number(p.price) * 1.25) : 699),
      sizes: sizes.length > 0 ? sizes : ["Standard"],
      availability: p.availability_status || (p.stock_quantity > 0 ? "In Stock" : "Out of Stock"),
      stockCount: p.stock_quantity || 10,
      enquiriesCount: 8,
      description: p.description || "High-quality local product available in Nagpur.",
      images: images,
      is_featured: Boolean(p.is_featured),
      approval_status: p.approval_status || 'approved'
    };
  },

  // Fetch all products (returns real merchant-created products and Supabase data, no dummy data)
  async getAllProducts() {
    let localProducts = [];
    try {
      localProducts = JSON.parse(localStorage.getItem('growlocal_merchant_products') || '[]');
    } catch (_) {}

    if (!isSupabaseConfigured) {
      return { data: localProducts, error: null };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, shops(name, is_verified, address), categories(name), product_variants(*), product_images(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { data: localProducts, error: null };
    }

    const formatted = data.map(p => this.formatProductRow(p));
    // Merge: local merchant-created products first, then Supabase products
    const supabaseIds = new Set(formatted.map(p => p.id));
    const uniqueLocal = localProducts.filter(p => !supabaseIds.has(p.id));
    return { data: [...uniqueLocal, ...formatted], error: null };
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

  // Update product approval status (approved, pending, rejected, hidden)
  async updateApprovalStatus(productId, approvalStatus) {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .update({ approval_status: approvalStatus, updated_at: new Date() })
      .eq('id', productId);

    return { data, error };
  },

  // Toggle product featured flag
  async toggleFeatured(productId, isFeatured) {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .update({ is_featured: isFeatured, updated_at: new Date() })
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
