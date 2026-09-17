import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { Building2, CheckCircle2, MapPin, Save, Store, Phone, Mail } from 'lucide-react';
import { api } from '../lib/apiClient';
import { SHOP_STATUS_META } from '../lib/format';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader } from '../components/ui';
import { VerifiedBadge } from '@growlocal/ui';
import { useAsync } from '../hooks/useAsync';

const inputClass =
  'px-3 py-2 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]';

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[#111111]">{label}</span>
      {children}
    </label>
  );
}

export default function ShopProfile() {
  const toast = useToast();
  const merchantQuery = useAsync(() => api.get(ENDPOINTS.MERCHANTS.ME), []);
  const [shop, setShop] = useState(undefined);
  const [shopError, setShopError] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [merchantForm, setMerchantForm] = useState(null);
  const [shopForm, setShopForm] = useState(null);
  const [savingMerchant, setSavingMerchant] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setShopLoading(true);
    api
      .get(ENDPOINTS.MERCHANTS.MY_SHOP)
      .then((data) => {
        if (cancelled) return;
        setShop(data.shop);
        setShopError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          setShop(null);
          setShopError(null);
        } else {
          setShopError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setShopLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (merchantQuery.data?.merchant && merchantForm === null) {
      const merchant = merchantQuery.data.merchant;
      setMerchantForm({
        businessName: merchant.business_name || '',
        ownerName: merchant.owner_name || '',
        phone: merchant.phone || '',
        businessDescription: merchant.business_description || '',
        gstin: merchant.gstin || '',
      });
    }
  }, [merchantQuery.data, merchantForm]);

  useEffect(() => {
    if (shop && shopForm === null) {
      setShopForm({
        name: shop.name || '',
        description: shop.description || '',
        phone: shop.phone || '',
        email: shop.email || '',
        address: shop.address || '',
        city: shop.city || '',
        state: shop.state || '',
        pincode: shop.pincode || '',
        logoUrl: shop.logo_url || '',
        coverImageUrl: shop.cover_image_url || '',
        priceMin: shop.price_min !== null && shop.price_min !== undefined ? String(shop.price_min) : '',
        priceMax: shop.price_max !== null && shop.price_max !== undefined ? String(shop.price_max) : '',
        status: shop.status || 'open',
      });
    }
  }, [shop, shopForm]);

  async function saveMerchantProfile(event) {
    event.preventDefault();
    setSavingMerchant(true);
    try {
      await api.patch(ENDPOINTS.MERCHANTS.ME, {
        businessName: merchantForm.businessName.trim(),
        ownerName: merchantForm.ownerName.trim(),
        phone: merchantForm.phone.trim(),
        businessDescription: merchantForm.businessDescription.trim() || undefined,
        gstin: merchantForm.gstin.trim() || undefined,
      });
      merchantQuery.reload();
      setMerchantForm(null);
      toast('Business profile updated');
    } catch (err) {
      toast(err.message || 'Could not save your profile', 'error');
    } finally {
      setSavingMerchant(false);
    }
  }

  async function saveShopProfile(event) {
    event.preventDefault();
    setSavingShop(true);
    try {
      const data = await api.patch(ENDPOINTS.MERCHANTS.MY_SHOP, {
        name: shopForm.name.trim(),
        description: shopForm.description.trim() || undefined,
        phone: shopForm.phone.trim() || undefined,
        email: shopForm.email.trim() || undefined,
        address: shopForm.address.trim(),
        city: shopForm.city.trim(),
        state: shopForm.state.trim() || undefined,
        pincode: shopForm.pincode.trim() || undefined,
        logoUrl: shopForm.logoUrl.trim() || undefined,
        coverImageUrl: shopForm.coverImageUrl.trim() || undefined,
        priceMin: shopForm.priceMin === '' ? undefined : Number(shopForm.priceMin),
        priceMax: shopForm.priceMax === '' ? undefined : Number(shopForm.priceMax),
        status: shopForm.status,
      });
      setShop(data.shop);
      setShopForm(null);
      toast('Shop details updated');
    } catch (err) {
      toast(err.message || 'Could not save your shop', 'error');
    } finally {
      setSavingShop(false);
    }
  }

  if (merchantQuery.loading || shopLoading) return <PageLoader label="Loading your shop…" />;
  if (merchantQuery.error) return <ErrorState error={merchantQuery.error} onRetry={merchantQuery.reload} />;
  if (shopError) return <ErrorState error={shopError} />;

  const merchant = merchantQuery.data?.merchant;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">My Shop</h1>
        <p className="text-sm text-[#666666] mt-0.5">Your business profile and shop details as customers see them.</p>
      </div>

      <section className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#111111]">Business profile</h2>
            <p className="text-xs text-[#666666]">
              {merchant?.email} · account status: {merchant?.status}
            </p>
          </div>
          {merchant?.verification_status === 'approved' && <VerifiedBadge />}
        </div>

        <form onSubmit={saveMerchantProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Business name">
            <input
              required
              minLength={2}
              value={merchantForm?.businessName || ''}
              onChange={(event) => setMerchantForm((prev) => ({ ...prev, businessName: event.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Owner name">
            <input
              required
              minLength={2}
              value={merchantForm?.ownerName || ''}
              onChange={(event) => setMerchantForm((prev) => ({ ...prev, ownerName: event.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Phone">
            <input
              required
              value={merchantForm?.phone || ''}
              onChange={(event) => setMerchantForm((prev) => ({ ...prev, phone: event.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="GSTIN">
            <input
              value={merchantForm?.gstin || ''}
              onChange={(event) => setMerchantForm((prev) => ({ ...prev, gstin: event.target.value }))}
              placeholder="optional"
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Business description">
              <textarea
                rows={3}
                maxLength={2000}
                value={merchantForm?.businessDescription || ''}
                onChange={(event) => setMerchantForm((prev) => ({ ...prev, businessDescription: event.target.value }))}
                placeholder="Tell customers about your business"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingMerchant}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {savingMerchant ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      {shop === null ? (
        <section className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow">
          <EmptyState
            icon={Store}
            title="No shop linked to this account yet"
            description="Shop creation is handled by the GrowLocal team during onboarding. Once your shop exists, you can manage its details here."
          />
        </section>
      ) : (
        <section className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
              <Store className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">Shop details</h2>
              <p className="text-xs text-[#666666]">
                {shop.city}, {shop.state} · {shop.review_count || 0} reviews · ★ {shop.rating || '—'}
              </p>
            </div>
            <div className="ml-auto">
              <StatusBadge meta={SHOP_STATUS_META[shop.status]} />
            </div>
          </div>

          <form onSubmit={saveShopProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Shop name">
              <input
                required
                minLength={2}
                value={shopForm?.name || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, name: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Shop status">
              <select
                value={shopForm?.status || 'open'}
                onChange={(event) => setShopForm((prev) => ({ ...prev, status: event.target.value }))}
                className={inputClass}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="temporarily_closed">Temporarily closed</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={shopForm?.description || ''}
                  onChange={(event) => setShopForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="What your shop offers"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Phone">
              <input
                value={shopForm?.phone || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, phone: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={shopForm?.email || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, email: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <input
                  required
                  minLength={5}
                  value={shopForm?.address || ''}
                  onChange={(event) => setShopForm((prev) => ({ ...prev, address: event.target.value }))}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="City">
              <input
                required
                value={shopForm?.city || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, city: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="State">
              <input
                value={shopForm?.state || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, state: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Pincode">
              <input
                value={shopForm?.pincode || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, pincode: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Logo URL">
              <input
                type="url"
                value={shopForm?.logoUrl || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>
            <Field label="Cover image URL">
              <input
                type="url"
                value={shopForm?.coverImageUrl || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>
            <Field label="Price range — min (₹)">
              <input
                type="number"
                min="0"
                value={shopForm?.priceMin || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, priceMin: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Price range — max (₹)">
              <input
                type="number"
                min="0"
                value={shopForm?.priceMax || ''}
                onChange={(event) => setShopForm((prev) => ({ ...prev, priceMax: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingShop}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {savingShop ? 'Saving…' : 'Save shop details'}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#666666] border-t border-[#E5E7E5] pt-4">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {shop.address}, {shop.city}
            </span>
            {shop.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {shop.phone}
              </span>
            )}
            {shop.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {shop.email}
              </span>
            )}
            {shop.is_verified && (
              <span className="inline-flex items-center gap-1.5 text-brand font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified shop
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
