import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const isUuid = (value) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

export const productService = {
  formatProductRow(product) {
    if (!product) return null;
    return {
      id: product.id,
      shopId: product.shop_id,
      shopName: product.shops?.name || '',
      shopVerified: Boolean(product.shops?.is_verified),
      shopDistance: '',
      name: product.name,
      category: product.categories?.name || '',
      categoryId: product.category_id || null,
      price: Number(product.price),
      originalPrice: product.original_price == null ? null : Number(product.original_price),
      sizes: (product.product_variants || []).map((variant) => variant.size).filter(Boolean),
      availability: product.availability_status,
      stockCount: Number(product.stock_quantity || 0),
      description: product.description || '',
      images: (product.product_images || []).map((image) => image.image_url).filter(Boolean),
      is_featured: Boolean(product.is_featured),
      approval_status: product.approval_status
    };
  },

  async getAllProducts() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    const { data, error } = await supabase
      .from('products')
      .select('*, shops(id, name, is_verified, address), categories(name), product_variants(size, price, stock_quantity, is_available), product_images(image_url, display_order)')
      .order('created_at', { ascending: false });
    return { data: (data || []).map((product) => this.formatProductRow(product)), error };
  },

  async createProduct(productData) {
    if (!isSupabaseConfigured) return { data: null, error: { message: 'Supabase is not configured.' } };
    if (!isUuid(productData.shopId)) return { data: null, error: { message: 'Create your shop before adding products.' } };
    if (!productData.name?.trim()) return { data: null, error: { message: 'Product name is required.' } };

    let categoryId = isUuid(productData.categoryId) ? productData.categoryId : null;
    if (!categoryId && productData.category) {
      const { data: categories } = await supabase.from('categories').select('id').ilike('name', productData.category).limit(1);
      categoryId = categories?.[0]?.id || null;
    }

    const price = Number(productData.price);
    if (!Number.isFinite(price) || price < 0) return { data: null, error: { message: 'Enter a valid product price.' } };

    const { data: created, error: createError } = await supabase
      .from('products')
      .insert({
        shop_id: productData.shopId,
        category_id: categoryId,
        name: productData.name.trim(),
        description: productData.description?.trim() || null,
        price,
        original_price: Number(productData.originalPrice) || null,
        availability_status: productData.availability || 'In Stock',
        stock_quantity: Number.parseInt(productData.stockCount, 10) || 0,
        is_featured: Boolean(productData.is_featured),
        approval_status: 'approved'
      })
      .select('*, shops(id, name, is_verified), categories(name)')
      .single();
    if (createError || !created) return { data: null, error: createError || { message: 'Product could not be created.' } };

    const imageRows = (productData.images || []).filter(Boolean).map((image_url, display_order) => ({ product_id: created.id, image_url, display_order }));
    const variantRows = (productData.sizes || []).filter(Boolean).map((size) => ({ product_id: created.id, size, price, stock_quantity: Number.parseInt(productData.stockCount, 10) || 0, is_available: true }));
    if (imageRows.length) {
      const { error } = await supabase.from('product_images').insert(imageRows);
      if (error) return { data: null, error };
    }
    if (variantRows.length) {
      const { error } = await supabase.from('product_variants').insert(variantRows);
      if (error) return { data: null, error };
    }

    return {
      data: this.formatProductRow({ ...created, product_images: imageRows, product_variants: variantRows }),
      error: null
    };
  },

  async updatePrice(productId, price) {
    return this.updateProduct(productId, { price });
  },

  async updateStock(productId, stockCount, availability = 'In Stock') {
    return this.updateProduct(productId, { stockCount, availability });
  },

  async updateProduct(productId, productData) {
    if (!isUuid(productId)) return { data: null, error: { message: 'Invalid product ID.' } };
    const row = {
      ...(productData.name !== undefined ? { name: productData.name } : {}),
      ...(productData.price !== undefined ? { price: Number(productData.price) } : {}),
      ...(productData.originalPrice !== undefined ? { original_price: Number(productData.originalPrice) || null } : {}),
      ...(productData.description !== undefined ? { description: productData.description } : {}),
      ...(productData.availability !== undefined ? { availability_status: productData.availability } : {}),
      ...(productData.stockCount !== undefined ? { stock_quantity: Number.parseInt(productData.stockCount, 10) || 0 } : {})
    };
    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', productId)
      .select('*, shops(id, name, is_verified), categories(name), product_variants(size), product_images(image_url, display_order)')
      .single();
    return { data: data ? this.formatProductRow(data) : null, error };
  },

  async deleteProduct(productId) {
    if (!isUuid(productId)) return { error: { message: 'Invalid product ID.' } };
    return supabase.from('products').delete().eq('id', productId);
  },

  subscribeToProducts(onChange) {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase.channel('products-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, onChange)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
