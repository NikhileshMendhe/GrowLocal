import { supabase, isSupabaseConfigured } from './supabaseClient';

const isUuid = (val) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

export const productService = {
  // Helper to format Supabase product row into unified frontend shape
  formatProductRow(p) {
    if (!p) return null;

    const images = p.product_images && p.product_images.length > 0
      ? p.product_images.map(i => i.image_url).filter(Boolean)
      : (p.images && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"]);

    const sizes = p.product_variants && p.product_variants.length > 0
      ? p.product_variants.map(v => v.size).filter(Boolean)
      : (p.sizes && p.sizes.length > 0 ? p.sizes : ["Standard"]);

    return {
      id: p.id,
      shopId: p.shop_id || p.shopId || "shop-1",
      shopName: p.shops?.name || p.shopName || "Local Store",
      shopVerified: Boolean(p.shops?.is_verified || p.shopVerified),
      shopDistance: "0.5 km away",
      name: p.name || "Product Item",
      category: p.categories?.name || p.category || "General",
      categoryId: p.category_id,
      price: Number(p.price) || 0,
      originalPrice: p.original_price ? Number(p.original_price) : (Number(p.price) ? Math.round(Number(p.price) * 1.25) : 0),
      sizes: sizes,
      availability: p.availability_status || (p.stock_quantity > 0 ? "In Stock" : "Out of Stock"),
      stockCount: p.stock_quantity !== undefined ? p.stock_quantity : (p.stockCount || 10),
      enquiriesCount: p.enquiries_count || p.enquiriesCount || 0,
      description: p.description || `Fresh ${p.name} from a verified local merchant.`,
      images: images,
      is_featured: Boolean(p.is_featured),
      approval_status: p.approval_status || 'approved'
    };
  },

  // Fetch all products (returns real merchant-created products from Supabase + local cache)
  async getAllProducts() {
    let localProducts = [];
    try {
      localProducts = JSON.parse(localStorage.getItem('growlocal_merchant_products') || '[]');
    } catch (_) {}

    if (!isSupabaseConfigured) {
      return { data: localProducts, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(id, name, is_verified, address), categories(name), product_variants(*), product_images(*)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return { data: localProducts, error: null };
      }

      const formatted = data.map(p => this.formatProductRow(p)).filter(Boolean);
      const supabaseIds = new Set(formatted.map(p => p.id));
      const uniqueLocal = localProducts.filter(p => !supabaseIds.has(p.id));

      return { data: [...uniqueLocal, ...formatted], error: null };
    } catch (err) {
      console.warn('getAllProducts Supabase error:', err);
      return { data: localProducts, error: null };
    }
  },

  // Create new product in Supabase & local storage
  async createProduct(productData) {
    let resolvedShopId = isUuid(productData.shopId) ? productData.shopId : null;
    let resolvedCategoryId = isUuid(productData.categoryId) ? productData.categoryId : null;

    if (isSupabaseConfigured) {
      // 1. If shopId is not a valid UUID, lookup the shop's UUID from Supabase by shopName
      if (!resolvedShopId && productData.shopName) {
        try {
          const { data: matchedShops } = await supabase
            .from('shops')
            .select('id, name')
            .ilike('name', productData.shopName.trim())
            .limit(1);
          if (matchedShops && matchedShops[0]) {
            resolvedShopId = matchedShops[0].id;
          }
        } catch (_) {}
      }

      // If still no resolvedShopId, get the first shop available in Supabase
      if (!resolvedShopId) {
        try {
          const { data: firstShop } = await supabase
            .from('shops')
            .select('id, name')
            .limit(1);
          if (firstShop && firstShop[0]) {
            resolvedShopId = firstShop[0].id;
          }
        } catch (_) {}
      }

      // 2. Lookup category UUID if category label provided
      if (!resolvedCategoryId && productData.category) {
        try {
          const { data: catRows } = await supabase
            .from('categories')
            .select('id, name')
            .ilike('name', `%${productData.category.split(' ')[0]}%`)
            .limit(1);
          if (catRows && catRows[0]) {
            resolvedCategoryId = catRows[0].id;
          }
        } catch (_) {}
      }
    }

    const priceNum = parseFloat(productData.price) || 0;
    const mrpNum = parseFloat(productData.originalPrice) || Math.round(priceNum * 1.25) || priceNum;

    const productRow = {
      name: productData.name,
      description: productData.description || `Fresh ${productData.name} from a verified local merchant.`,
      price: priceNum,
      original_price: mrpNum,
      discount_percentage: mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
      availability_status: productData.availability || 'In Stock',
      stock_quantity: parseInt(productData.stockCount, 10) || 10,
      is_featured: Boolean(productData.is_featured),
      approval_status: 'approved',
      ...(resolvedShopId ? { shop_id: resolvedShopId } : {}),
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {})
    };

    let resultProduct = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      price: priceNum,
      originalPrice: mrpNum
    };

    if (isSupabaseConfigured) {
      try {
        const { data: insertedProduct, error } = await supabase
          .from('products')
          .insert([productRow])
          .select('*, shops(id, name, is_verified), categories(name)')
          .single();

        if (!error && insertedProduct) {
          // Insert product images
          if (productData.images && productData.images.length > 0) {
            const imageRows = productData.images.filter(Boolean).map((url, idx) => ({
              product_id: insertedProduct.id,
              image_url: url,
              display_order: idx
            }));
            if (imageRows.length > 0) {
              await supabase.from('product_images').insert(imageRows).catch(() => {});
            }
          }

          // Insert product sizes/variants
          if (productData.sizes && productData.sizes.length > 0) {
            const variantRows = productData.sizes.filter(Boolean).map(sz => ({
              product_id: insertedProduct.id,
              size: sz,
              price: priceNum,
              stock_quantity: 5
            }));
            if (variantRows.length > 0) {
              await supabase.from('product_variants').insert(variantRows).catch(() => {});
            }
          }

          resultProduct = this.formatProductRow({
            ...insertedProduct,
            product_images: productData.images?.map(url => ({ image_url: url })),
            product_variants: productData.sizes?.map(sz => ({ size: sz }))
          });
        } else if (error) {
          console.warn('Supabase product insertion notice:', error);
        }
      } catch (err) {
        console.warn('Supabase createProduct network notice:', err);
      }
    }

    // Always update local storage cache
    this.saveProductLocally(resultProduct);
    return { data: resultProduct, error: null };
  },

  // Save product to local storage cache
  saveProductLocally(product) {
    try {
      const existing = JSON.parse(localStorage.getItem('growlocal_merchant_products') || '[]');
      const updated = [product, ...existing.filter(p => p.id !== product.id)];
      localStorage.setItem('growlocal_merchant_products', JSON.stringify(updated));
    } catch (_) {}
  },

  // Update product price
  async updatePrice(productId, newPrice) {
    if (!isSupabaseConfigured || !isUuid(productId)) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .update({ price: newPrice, updated_at: new Date() })
      .eq('id', productId);

    return { data, error };
  },

  // Update product stock
  async updateStock(productId, stockQuantity, status = 'In Stock') {
    if (!isSupabaseConfigured || !isUuid(productId)) return { success: true };

    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: stockQuantity, availability_status: status, updated_at: new Date() })
      .eq('id', productId);

    return { data, error };
  },

  // Delete product
  async deleteProduct(productId) {
    if (!isSupabaseConfigured || !isUuid(productId)) return { success: true };

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
