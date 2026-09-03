import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_SHOPS } from '../data/mockData';

const isUuid = (val) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

export const shopService = {
  // Helper to format Supabase shop row into unified frontend shape
  formatShopRow(s) {
    if (!s) return null;
    return {
      id: s.id,
      merchantId: s.merchant_id,
      merchantEmail: s.email || '',
      email: s.email || '',
      phone: s.phone || '',
      name: s.name || "Local Store",
      category: s.categories?.name || s.category || "Local Business",
      categoryId: s.category_id,
      verified: Boolean(s.is_verified),
      is_verified: Boolean(s.is_verified),
      rating: s.rating ? Number(s.rating) : 4.8,
      reviewsCount: s.review_count || 0,
      distance: s.distance ? `${s.distance} km away` : "0.5 km away",
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
        : [s.cover_image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"]
    };
  },

  // Check if a merchant already has a registered shop in Supabase or local storage
  async checkMerchantHasShop(email, userId, shopName) {
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Check in local storage first
    try {
      const localShops = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      const match = localShops.some(s => 
        (cleanEmail && s.merchantEmail?.toLowerCase() === cleanEmail) ||
        (cleanEmail && s.email?.toLowerCase() === cleanEmail) ||
        (userId && s.merchantId === userId) ||
        (shopName && s.name?.toLowerCase() === shopName.toLowerCase())
      );
      if (match) return true;
    } catch (_) {}

    // 2. Check in Supabase if configured
    if (isSupabaseConfigured) {
      try {
        if (cleanEmail) {
          const { data, error } = await supabase
            .from('shops')
            .select('id, name, email')
            .ilike('email', cleanEmail)
            .limit(1);
          if (!error && data && data.length > 0) return true;
        }

        if (userId && isUuid(userId)) {
          const { data, error } = await supabase
            .from('shops')
            .select('id, name, merchant_id')
            .eq('merchant_id', userId)
            .limit(1);
          if (!error && data && data.length > 0) return true;
        }
      } catch (e) {
        console.warn('Error checking shop existence in Supabase:', e);
      }
    }

    return false;
  },

  // Fetch all shops (Supabase + locally added merchant shops)
  async getAllShops() {
    let localShops = [];
    try {
      localShops = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
    } catch (_) {}

    if (!isSupabaseConfigured) {
      return { data: localShops, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*, shop_hours(*), shop_photos(*), categories(name)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return { data: localShops, error: null };
      }

      const formatted = data.map(s => this.formatShopRow(s)).filter(Boolean);
      // Merge: local merchant-created shops first, then Supabase shops
      const supabaseIds = new Set(formatted.map(s => s.id));
      const supabaseEmails = new Set(formatted.map(s => s.email?.toLowerCase()).filter(Boolean));

      // Filter local shops that aren't already represented in Supabase
      const uniqueLocal = localShops.filter(s => 
        !supabaseIds.has(s.id) && 
        !(s.merchantEmail && supabaseEmails.has(s.merchantEmail.toLowerCase()))
      );

      return { data: [...uniqueLocal, ...formatted], error: null };
    } catch (err) {
      console.warn('getAllShops Supabase fetch error:', err);
      return { data: localShops, error: null };
    }
  },

  // Create new shop in Supabase and sync locally
  async createShop(shopData) {
    let priceMin = 0;
    let priceMax = 9999;
    if (shopData.priceRange) {
      const match = String(shopData.priceRange).match(/(\d+)/g);
      if (match && match.length >= 2) {
        priceMin = Number(match[0]);
        priceMax = Number(match[1]);
      }
    }

    let resolvedCategoryId = isUuid(shopData.categoryId) ? shopData.categoryId : null;

    // Lookup category UUID in Supabase if category name is provided
    if (isSupabaseConfigured && !resolvedCategoryId && shopData.category) {
      try {
        const { data: catRows } = await supabase
          .from('categories')
          .select('id, name')
          .ilike('name', `%${shopData.category.split(' ')[0]}%`)
          .limit(1);
        if (catRows && catRows[0]) {
          resolvedCategoryId = catRows[0].id;
        }
      } catch (_) {}
    }

    const shopRow = {
      name: shopData.name,
      description: shopData.about || shopData.description || `${shopData.name} — local verified store on GrowLocal.`,
      address: shopData.address || `${shopData.city || 'Nagpur'}, Maharashtra`,
      city: shopData.city || 'Nagpur',
      state: 'Maharashtra',
      cover_image_url: shopData.coverImage || shopData.coverImageUrl || null,
      logo_url: shopData.logoImage || shopData.coverImage || null,
      phone: shopData.phone || null,
      email: (shopData.merchantEmail || shopData.email || '').toLowerCase().trim() || null,
      price_min: priceMin,
      price_max: priceMax,
      status: 'open',
      is_verified: Boolean(shopData.verified || shopData.is_verified),
      is_featured: false,
      rating: 4.8,
      review_count: 0,
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
      ...(isUuid(shopData.merchantId) ? { merchant_id: shopData.merchantId } : {})
    };

    let resultShop = {
      ...shopData,
      id: shopData.id || `shop-${Date.now()}`
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .insert([shopRow])
          .select('*, categories(name)')
          .single();

        if (!error && data) {
          resultShop = this.formatShopRow(data);
        } else if (error) {
          console.warn('Supabase shop insertion notice:', error);
        }
      } catch (err) {
        console.warn('Supabase createShop network error:', err);
      }
    }

    // Always update local cache
    this.saveShopLocally(resultShop);
    return { data: resultShop, error: null };
  },

  // Update shop details in Supabase and local cache
  async updateShop(shopId, updates) {
    let formatted = { ...updates };
    if (isSupabaseConfigured && isUuid(shopId)) {
      try {
        const updateRow = {};
        if (updates.name !== undefined) updateRow.name = updates.name;
        if (updates.about !== undefined) updateRow.description = updates.about;
        if (updates.description !== undefined) updateRow.description = updates.description;
        if (updates.address !== undefined) updateRow.address = updates.address;
        if (updates.city !== undefined) updateRow.city = updates.city;
        if (updates.coverImage !== undefined) updateRow.cover_image_url = updates.coverImage;
        if (updates.logoImage !== undefined) updateRow.logo_url = updates.logoImage;
        if (updates.phone !== undefined) updateRow.phone = updates.phone;
        updateRow.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('shops')
          .update(updateRow)
          .eq('id', shopId)
          .select('*, categories(name)')
          .single();

        if (!error && data) {
          formatted = this.formatShopRow(data);
        } else if (error) {
          console.warn('Supabase updateShop notice:', error);
        }
      } catch (err) {
        console.warn('Supabase updateShop network error:', err);
      }
    }
    this.saveShopLocally(formatted);
    return { data: formatted, error: null };
  },

  // Save a merchant-created shop locally
  saveShopLocally(shop) {
    try {
      const existing = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      const updated = [shop, ...existing.filter(s => s.id !== shop.id)];
      localStorage.setItem('growlocal_merchant_shops', JSON.stringify(updated));
    } catch (_) {}
  },

  // Toggle featured status of a shop
  async toggleFeatureShop(shopId, isFeatured) {
    if (!isSupabaseConfigured || !isUuid(shopId)) return { success: true };

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
