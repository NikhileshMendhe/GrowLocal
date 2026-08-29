import { supabase, isSupabaseConfigured } from './supabaseClient';

const MERCHANTS_STORAGE_KEY = 'growlocal_registered_merchants';
const VERIFICATIONS_STORAGE_KEY = 'growlocal_pending_verifications';

export const merchantService = {
  // Helper to read stored merchants
  getStoredMerchants() {
    try {
      const stored = localStorage.getItem(MERCHANTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Helper to read stored pending verifications
  getStoredPendingVerifications() {
    try {
      const stored = localStorage.getItem(VERIFICATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Register new merchant locally on signup/login
  registerMerchantLocally(userObj) {
    try {
      const currentMerchants = this.getStoredMerchants();
      const currentVerifs = this.getStoredPendingVerifications();

      if (!currentMerchants.some(m => m.email?.toLowerCase() === userObj.email?.toLowerCase())) {
        const merchantId = `MERCH-${Math.floor(1000 + Math.random() * 9000)}`;
        const businessName = userObj.shopName || userObj.name || `${userObj.email?.split('@')[0]}'s Shop`;
        const ownerName = userObj.name || userObj.email?.split('@')[0] || "Merchant Owner";

        const newMerchant = {
          id: merchantId,
          businessName: businessName,
          ownerName: ownerName,
          email: userObj.email || "merchant@growlocal.in",
          phone: userObj.phone || "+91 98765 43210",
          category: "Clothing & Retail",
          status: "Active",
          verificationStatus: "Pending Verification",
          registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          shopsCount: 1,
          productsCount: 0,
          monthlyRevenue: "₹0",
          address: "Model Town, Nagpur, Maharashtra"
        };

        const newVerif = {
          id: `VERIF-${Math.floor(1000 + Math.random() * 9000)}`,
          merchantId: merchantId,
          businessName: businessName,
          ownerName: ownerName,
          email: newMerchant.email,
          phone: newMerchant.phone,
          submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          gstin: `27AAACG${Math.floor(1000 + Math.random() * 9000)}1Z5`,
          tradeLicense: "TL-NGP-2026-8842",
          status: "Pending Verification",
          documents: [
            { name: "GSTIN Registration Certificate", verified: true },
            { name: "Nagpur Municipal Trade License", verified: false },
            { name: "Storefront Physical Photo", verified: true }
          ]
        };

        const updatedMerchants = [newMerchant, ...currentMerchants];
        const updatedVerifs = [newVerif, ...currentVerifs];

        localStorage.setItem(MERCHANTS_STORAGE_KEY, JSON.stringify(updatedMerchants));
        localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(updatedVerifs));

        return { merchants: updatedMerchants, verifications: updatedVerifs };
      }

      return { merchants: currentMerchants, verifications: currentVerifs };
    } catch (e) {
      return { merchants: [], verifications: [] };
    }
  },

  // Fetch all merchants
  async getAllMerchants() {
    if (!isSupabaseConfigured) {
      const local = this.getStoredMerchants();
      return { data: local, error: null };
    }

    const { data, error } = await supabase
      .from('merchants')
      .select('*, shops(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const local = this.getStoredMerchants();
      return { data: local, error: null };
    }

    const formatted = data.map(m => ({
      id: m.id || `MERCH-${m.user_id?.substring(0, 5)}`,
      businessName: m.business_name || "Nagpur Store",
      ownerName: m.owner_name || "Owner",
      email: m.email || "",
      phone: m.phone || "+91 98765 43210",
      category: "Local Retailer",
      status: m.status || "Active",
      verificationStatus: m.verification_status === 'approved' ? '✓ Verified Shop' : 'Pending Verification',
      registeredDate: m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Today",
      shopsCount: m.shops ? m.shops.length : 1,
      productsCount: 0,
      monthlyRevenue: "₹0",
      address: "Nagpur, Maharashtra"
    }));

    return { data: formatted, error: null };
  },

  // Fetch pending merchant verifications
  async getPendingVerifications() {
    if (!isSupabaseConfigured) {
      const localVerifs = this.getStoredPendingVerifications();
      return { data: localVerifs, error: null };
    }

    const { data, error } = await supabase
      .from('shop_verifications')
      .select('*, shops(*), merchants(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const localVerifs = this.getStoredPendingVerifications();
      return { data: localVerifs, error: null };
    }

    return { data, error: null };
  },

  // Approve merchant verification application
  async approveVerification(verifId, shopId, merchantId, reviewerProfileId) {
    const currentVerifs = this.getStoredPendingVerifications();
    const updatedVerifs = currentVerifs.filter(v => v.id !== verifId);
    localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(updatedVerifs));

    const currentMerchants = this.getStoredMerchants();
    const updatedMerchants = currentMerchants.map(m => {
      if (m.id === merchantId || m.businessName === verifId) {
        return { ...m, verificationStatus: "✓ Verified Shop" };
      }
      return m;
    });
    localStorage.setItem(MERCHANTS_STORAGE_KEY, JSON.stringify(updatedMerchants));

    if (!isSupabaseConfigured) return { success: true };

    const { error: verifErr } = await supabase
      .from('shop_verifications')
      .update({
        status: 'approved',
        reviewed_by: reviewerProfileId,
        reviewed_at: new Date()
      })
      .eq('id', verifId);

    if (verifErr) return { error: verifErr };

    await supabase.from('shops').update({ is_verified: true }).eq('id', shopId);
    await supabase.from('merchants').update({ verification_status: 'approved' }).eq('id', merchantId);

    return { error: null };
  },

  // Real-time subscription to merchant profiles
  subscribeToMerchants(onMerchantChange) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:merchants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'merchants'
      }, (payload) => {
        onMerchantChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
