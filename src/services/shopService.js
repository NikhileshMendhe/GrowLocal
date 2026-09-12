import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const isUuid = (value) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
// Never load unbounded base64 images with every marketplace request. Images are
// fetched from storage URLs when present; this keeps the live feed responsive.
const SHOP_SELECT = 'id, merchant_id, name, description, category_id, phone, email, address, city, state, pincode, price_min, price_max, rating, review_count, is_verified, is_featured, status, created_at, updated_at, categories(name), shop_photos(image_url), merchants(id, email)';

export const shopService = {
  formatShopRow(shop) {
    if (!shop) return null;
    return {
      id: shop.id,
      merchantId: shop.merchant_id,
      merchantEmail: shop.merchants?.email || shop.email || '',
      email: shop.email || shop.merchants?.email || '',
      phone: shop.phone || '',
      name: shop.name,
      category: shop.categories?.name || '',
      categoryId: shop.category_id || null,
      verified: Boolean(shop.is_verified),
      is_verified: Boolean(shop.is_verified),
      rating: Number(shop.rating || 0),
      reviewsCount: Number(shop.review_count || 0),
      distance: shop.distance ? `${shop.distance} km away` : '',
      address: shop.address || '',
      city: shop.city || '',
      status: shop.status === 'open' ? 'Open' : (shop.status || 'Closed'),
      priceRange: shop.price_min != null && shop.price_max != null ? `₹${shop.price_min} – ₹${shop.price_max}` : '',
      coverImage: shop.cover_image_url || '',
      logoImage: shop.logo_url || shop.cover_image_url || '',
      about: shop.description || '',
      photos: (shop.shop_photos || []).map((photo) => photo.image_url).filter(Boolean)
    };
  },

  async getAllShops() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    const { data, error } = await supabase
      .from('shops')
      .select(SHOP_SELECT)
      .order('created_at', { ascending: false });
    return { data: (data || []).map((shop) => this.formatShopRow(shop)).filter(Boolean), error };
  },

  async getCurrentMerchant() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'Sign in as a merchant before managing a shop.' } };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    if (profileError || !profile) return { data: null, error: profileError || { message: 'Your profile could not be found.' } };
    if (!['merchant', 'admin', 'super_admin'].includes(profile.role)) {
      return { data: null, error: { message: 'Only merchant accounts can create shops.' } };
    }

    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, user_id, email')
      .eq('user_id', profile.id)
      .maybeSingle();
    return { data: merchant, error: merchantError || (!merchant ? { message: 'Your merchant account is not ready yet. Please sign in again.' } : null) };
  },

  async checkMerchantHasShop(_email, authUserId) {
    if (!isSupabaseConfigured || !authUserId) return false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (!profile) return false;
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', profile.id)
      .maybeSingle();
    if (!merchant) return false;
    const { data, error } = await supabase.from('shops').select('id').eq('merchant_id', merchant.id).limit(1);
    return !error && Boolean(data?.length);
  },

  async createShop(shopData) {
    if (!isSupabaseConfigured) return { data: null, error: { message: 'Supabase is not configured.' } };
    const { data: merchant, error: merchantError } = await this.getCurrentMerchant();
    if (merchantError || !merchant) return { data: null, error: merchantError };

    let categoryId = isUuid(shopData.categoryId) ? shopData.categoryId : null;
    if (!categoryId && shopData.category) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', shopData.category)
        .limit(1);
      categoryId = categories?.[0]?.id || null;
    }

    const prices = String(shopData.priceRange || '').match(/\d+(?:\.\d+)?/g) || [];
    const row = {
      merchant_id: merchant.id,
      name: shopData.name?.trim(),
      description: shopData.about?.trim() || null,
      category_id: categoryId,
      logo_url: shopData.logoImage || null,
      cover_image_url: shopData.coverImage || null,
      phone: shopData.phone?.trim() || null,
      email: merchant.email,
      address: shopData.address?.trim(),
      city: shopData.city?.trim() || 'Nagpur',
      state: 'Maharashtra',
      price_min: Number(prices[0] || 0),
      price_max: Number(prices[1] || prices[0] || 0),
      status: 'open',
      is_verified: false
    };
    if (!row.name || !row.address) return { data: null, error: { message: 'Shop name and address are required.' } };

    const { data, error } = await supabase
      .from('shops')
      .insert(row)
      .select(SHOP_SELECT)
      .single();
    return { data: data ? this.formatShopRow(data) : null, error };
  },

  async updateShop(shopId, updates) {
    if (!isUuid(shopId)) return { data: null, error: { message: 'Invalid shop ID.' } };
    const row = {
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.about !== undefined ? { description: updates.about } : {}),
      ...(updates.address !== undefined ? { address: updates.address } : {}),
      ...(updates.city !== undefined ? { city: updates.city } : {}),
      ...(updates.coverImage !== undefined ? { cover_image_url: updates.coverImage || null } : {}),
      ...(updates.logoImage !== undefined ? { logo_url: updates.logoImage || null } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone } : {})
    };
    const { data, error } = await supabase
      .from('shops')
      .update(row)
      .eq('id', shopId)
      .select(SHOP_SELECT)
      .single();
    return { data: data ? this.formatShopRow(data) : null, error };
  },

  subscribeToShops(onChange) {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase.channel('shops-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, onChange)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
