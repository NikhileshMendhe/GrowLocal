import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { authService } from './authService.js';

const formatMerchant = (merchant) => ({
  id: merchant.id,
  profileId: merchant.user_id,
  businessName: merchant.business_name,
  ownerName: merchant.owner_name,
  email: merchant.email,
  phone: merchant.phone || '',
  status: merchant.status,
  verificationStatus: merchant.verification_status,
  registeredDate: merchant.created_at,
  shopsCount: merchant.shops?.length || 0,
  productsCount: merchant.shops?.reduce((count, shop) => count + (shop.products?.length || 0), 0) || 0
});

export const merchantService = {
  // A merchant row is provisioned by the database's auth trigger. This method is
  // intentionally read-only so the browser never fabricates a merchant identity.
  async registerMerchantInSupabase(user) {
    if (!isSupabaseConfigured || !user?.profileId) return null;
    const { data, error } = await supabase
      .from('merchants')
      .select('id, user_id, business_name, email, verification_status')
      .eq('user_id', user.profileId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async checkMerchantExists(_email, authUserId) {
    if (!isSupabaseConfigured || !authUserId) return false;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (profileError || !profile) return false;
    const { data, error } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', profile.id)
      .maybeSingle();
    return !error && Boolean(data);
  },

  async getAllMerchants() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    const { data, error } = await supabase
      .from('merchants')
      .select('*, shops(id, products(id))')
      .order('created_at', { ascending: false });
    return { data: (data || []).map(formatMerchant), error };
  },

  async deleteMerchant(merchantId, email, profileId) {
    try {
      // 1. Purge credentials from offline account vault
      authService.removeAccountFromVault(email || profileId || merchantId);

      if (!isSupabaseConfigured) return { success: true };

      // 2. Call database RPC function to delete user and cascade shops/products
      const targetIdentifier = profileId || merchantId || email;
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_delete_user', {
        target_identifier: targetIdentifier
      });

      if (rpcError) {
        console.warn('RPC admin_delete_user fallback to direct merchant delete:', rpcError);
        if (merchantId) await supabase.from('merchants').delete().eq('id', merchantId);
        if (profileId) await supabase.from('profiles').delete().eq('id', profileId);
      }

      return { success: true, data: rpcData };
    } catch (e) {
      console.error('Error in deleteMerchant:', e);
      return { success: false, error: e };
    }
  },

  async getPendingVerifications() {
    if (!isSupabaseConfigured) return { data: [], error: { message: 'Supabase is not configured.' } };
    return supabase
      .from('shop_verifications')
      .select('*, shops(id, name), merchants(id, business_name, email)')
      .in('status', ['pending', 'under_review'])
      .order('created_at', { ascending: false });
  },

  async approveVerification(verifId, shopId, merchantId, reviewerProfileId) {
    const { error } = await supabase
      .from('shop_verifications')
      .update({ status: 'approved', reviewed_by: reviewerProfileId, reviewed_at: new Date().toISOString() })
      .eq('id', verifId);
    if (error) return { error };
    return { data: { shopId, merchantId }, error: null };
  },

  subscribeToMerchants(onChange) {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase.channel('merchants-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, onChange)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
