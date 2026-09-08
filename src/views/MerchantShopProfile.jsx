import React, { useState, useRef } from 'react';
import VerifiedBadge from '../components/VerifiedBadge';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Store, MapPin, Clock, Phone, Save, Eye, Share2, QrCode,
  CheckCircle2, Star, Sparkles, Package, ExternalLink, Camera,
  ArrowRight, ShieldCheck, Copy, Check, MessageSquare, Tag,
  ShoppingBag, Award, ChevronRight, X, Heart, Globe, Download
} from 'lucide-react';

const CATEGORIES = [
  'Grocery & Supermarket',
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Bakery, Sweets & Snacks',
  'Cafe, Dining & Cloud Kitchen',
  'Pharmacy & Healthcare',
  'Home, Kitchen & Decor',
  'Jewelry & Accessories',
  'Hardware & Electricals',
  'Stationery & Books',
  'Local Artisan & Handcraft'
];

export default function MerchantShopProfile({
  shop = {},
  products = [],
  onPreviewPublic,
  onSaveShop,
  onNavigate,
  onShowToast
}) {
  const currentShop = shop || {};
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'products' | 'edit'
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [name, setName] = useState(currentShop.name || 'My Store');
  const [category, setCategory] = useState(currentShop.category || 'Local Retail');
  const [address, setAddress] = useState(currentShop.address || 'Nagpur, Maharashtra');
  const [city, setCity] = useState(currentShop.city || 'Nagpur');
  const [phone, setPhone] = useState(currentShop.phone || '');
  const [hours, setHours] = useState(currentShop.openHours || '10:00 AM – 9:00 PM');
  const [openDays, setOpenDays] = useState(currentShop.openDays || 'Mon – Sun');
  const [about, setAbout] = useState(currentShop.about || '');
  const [coverImage, setCoverImage] = useState(currentShop.coverImage || '');
  const [logoImage, setLogoImage] = useState(currentShop.logoImage || '');
  const [priceRange, setPriceRange] = useState(currentShop.priceRange || '');

  const fileCoverRef = useRef(null);
  const fileLogoRef = useRef(null);

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverImage(ev.target.result);
      if (onShowToast) onShowToast("Cover photo uploaded! Remember to save changes.");
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoImage(ev.target.result);
      if (onShowToast) onShowToast("Store logo uploaded! Remember to save changes.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const updated = {
      ...currentShop,
      name,
      category,
      address,
      city,
      phone,
      openHours: hours,
      openDays,
      about,
      coverImage,
      logoImage,
      priceRange,
    };

    if (onSaveShop) {
      await onSaveShop(updated);
    }
    if (onShowToast) {
      onShowToast("✓ Your Shop details saved & synchronized in realtime!");
    }
    setActiveSubTab('overview');
  };

  const shopSlug = currentShop.id || (name ? name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : 'store');
  const shopUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/shop/${encodeURIComponent(shopSlug)}`
    : `https://growlocal.netlify.app/shop/${encodeURIComponent(shopSlug)}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shopUrl);
    setCopiedLink(true);
    if (onShowToast) onShowToast("🔗 Store link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQR = () => {
    try {
      const canvas = document.getElementById('merchant-qr-canvas');
      if (!canvas) {
        if (onShowToast) onShowToast("Generating QR image...");
        return;
      }
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `${(name || 'shop').toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr-station.png`;
      a.href = url;
      a.click();
      if (onShowToast) onShowToast("📥 Store QR Code poster downloaded!");
    } catch (e) {
      console.warn("Could not download QR canvas:", e);
    }
  };

  const storeProducts = products.length > 0
    ? (products.filter(p => 
        !currentShop?.id || 
        p.shopId === currentShop.id || 
        (currentShop.name && p.shopName?.toLowerCase() === currentShop.name?.toLowerCase()) ||
        (currentShop.merchantId && p.merchantId === currentShop.merchantId) ||
        (currentShop.merchantEmail && p.merchantEmail?.toLowerCase() === currentShop.merchantEmail?.toLowerCase())
      ).length > 0 
        ? products.filter(p => 
            !currentShop?.id || 
            p.shopId === currentShop.id || 
            (currentShop.name && p.shopName?.toLowerCase() === currentShop.name?.toLowerCase()) ||
            (currentShop.merchantId && p.merchantId === currentShop.merchantId) ||
            (currentShop.merchantEmail && p.merchantEmail?.toLowerCase() === currentShop.merchantEmail?.toLowerCase())
          )
        : products)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">

      {/* ── Top Header Bar & Mode Switcher ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#E5E7E5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#EAF7EE] text-[#138A36] px-2.5 py-0.5 rounded-full border border-[#CDEED5]">
              🟢 Your Shop Command Center
            </span>
            <span className="text-xs text-gray-400 font-medium">·</span>
            <span className="text-xs text-gray-500 font-semibold">
              {currentShop.verified ? 'Nagpur Verified Retailer' : 'Nagpur Retail Partner'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111] font-poppins tracking-tight flex items-center gap-2">
            <span>{name}</span>
            {Boolean(currentShop.verified) && <VerifiedBadge text="Verified" />}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Scan or share QR code"
          >
            <QrCode className="w-4 h-4 text-[#138A36]" />
            <span>Store QR & Link</span>
          </button>

          {onPreviewPublic && (
            <button
              onClick={onPreviewPublic}
              className="px-3.5 py-2 bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-bold text-xs rounded-xl border border-[#CDEED5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Preview how local customers see your store"
            >
              <Eye className="w-4 h-4" />
              <span>Customer Preview</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab(activeSubTab === 'edit' ? 'overview' : 'edit')}
            className={`px-4 py-2 font-black text-xs rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeSubTab === 'edit'
                ? 'bg-gray-900 text-white'
                : 'bg-[#138A36] hover:bg-[#0F752C] text-white'
            }`}
          >
            <span>{activeSubTab === 'edit' ? 'Close Editor' : '✏️ Edit Shop'}</span>
          </button>
        </div>
      </div>

      {/* ── Sub-navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[#E5E7E5] pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'overview'
              ? 'bg-[#138A36] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          🏬 Storefront Overview
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeSubTab === 'products'
              ? 'bg-[#138A36] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>📦 In-Store Products</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'products' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {storeProducts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('edit')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'edit'
              ? 'bg-[#138A36] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          ✏️ Edit Details & Photos
        </button>
      </div>

      {/* ── 1. STOREFRONT OVERVIEW TAB ─────────────────────── */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Creative Hero Banner Card */}
          <div className="bg-white rounded-3xl border border-[#E5E7E5] overflow-hidden shadow-xs relative">
            {/* Cover Image with Gradient Vignette or Clean Slate Banner */}
            <div className="relative h-48 sm:h-64 w-full bg-linear-to-r from-[#0F2417] via-[#163622] to-[#0A1B11] overflow-hidden group">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/90 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white mb-2 shadow-inner">
                    <Store className="w-7 h-7 text-emerald-300" />
                  </div>
                  <p className="text-sm sm:text-base font-black text-white tracking-wide">
                    {name}
                  </p>
                  <p className="text-xs text-emerald-200/70 max-w-xs mt-0.5">
                    Your storefront in {city} · Upload photos to showcase your shop
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Cover Photo Change Trigger */}
              <button
                onClick={() => fileCoverRef.current?.click()}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 shadow-md cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{coverImage ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
              </button>
              <input
                type="file"
                ref={fileCoverRef}
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {/* Status pills inside cover */}
              <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 ${storeProducts.length > 0 ? 'bg-emerald-600/90' : 'bg-amber-600/90'} text-white backdrop-blur-md text-xs font-black rounded-full flex items-center gap-1.5 shadow-md`}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {storeProducts.length > 0 ? 'Live on GrowLocal' : 'Draft · Ready to List'}
                </span>
                <span className="px-2.5 py-1 bg-black/60 text-white/90 backdrop-blur-md text-[11px] font-bold rounded-full">
                  📍 {city}
                </span>
              </div>

              {/* Store Identity Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                <div className="flex items-end gap-3.5">
                  {/* Logo / Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white flex items-center justify-center">
                      {logoImage ? (
                        <img src={logoImage} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-[#EAF7EE] to-[#D1FAE5] flex flex-col items-center justify-center text-[#138A36]">
                          <span className="text-2xl sm:text-3xl font-black font-poppins">
                            {name ? name.charAt(0).toUpperCase() : 'S'}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileLogoRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-[#138A36] text-white p-1 rounded-lg shadow-md hover:bg-[#0F752C] transition-colors cursor-pointer"
                      title={logoImage ? "Update Store Logo" : "Upload Store Logo"}
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      type="file"
                      ref={fileLogoRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md truncate">
                        {name}
                      </h2>
                      {Boolean(currentShop.verified) ? (
                        <VerifiedBadge text="Verified" />
                      ) : (
                        <span className="bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold border border-white/20">
                          Verification In Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 font-medium truncate flex items-center gap-2 mt-0.5">
                      <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {category}
                      </span>
                      <span>·</span>
                      <span>{openDays}: {hours}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-extrabold flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                    {currentShop.reviewsCount > 0 ? (
                      <>
                        <span>{(Number(currentShop.rating) || 5.0).toFixed(1)} / 5.0</span>
                        <span className="text-white/60 font-normal">({currentShop.reviewsCount} review{currentShop.reviewsCount !== 1 ? 's' : ''})</span>
                      </>
                    ) : (
                      <span>New Store · No reviews yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar Under Cover */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-white p-3 sm:p-4 text-center">
              <div className="p-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Store Catalog</p>
                <p className="text-lg sm:text-xl font-black text-[#111111]">{storeProducts.length} Item{storeProducts.length !== 1 ? 's' : ''} Listed</p>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Operating Status</p>
                <p className="text-lg sm:text-xl font-black text-[#138A36] flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {hours ? 'Open Today' : 'Hours Not Set'}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Estimated Price</p>
                <p className="text-lg sm:text-xl font-black text-[#111111]">
                  {priceRange || (storeProducts.length > 0 ? `₹${Math.min(...storeProducts.map(p => Number(p.price) || 0))} – ₹${Math.max(...storeProducts.map(p => Number(p.price) || 0))}` : '—')}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Customer Trust</p>
                <p className={`text-lg sm:text-xl font-black ${currentShop.verified ? 'text-[#138A36]' : 'text-amber-600'}`}>
                  {currentShop.verified ? '100% Verified Local' : 'Verification In Review'}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Store Blueprint & About (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* About Store Card */}
              <div className="bg-white rounded-3xl border border-[#E5E7E5] p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#138A36]" />
                    About Your Store
                  </h3>
                  <button
                    onClick={() => setActiveSubTab('edit')}
                    className="text-xs font-bold text-[#138A36] hover:underline cursor-pointer"
                  >
                    Edit Story
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {about || (
                    <span className="text-gray-400 italic">
                      No store description added yet. Click "Edit Story" to add your store background, specialties, and offerings for local customers in Nagpur.
                    </span>
                  )}
                </p>

                {/* Highlights / Badges */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1">
                    ⚡ Instant In-Store Pickup
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1">
                    💳 UPI, Cards & Cash Accepted
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1">
                    🛡️ {currentShop.verified ? 'Verified Merchant' : 'Local Retail Merchant'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1">
                    💬 Direct Customer Inquiries
                  </span>
                </div>
              </div>

              {/* Location & Contact Information */}
              <div className="bg-white rounded-3xl border border-[#E5E7E5] p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#138A36]" />
                  Location & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Store Address</p>
                    <p className="font-extrabold text-gray-900 text-sm">{address}</p>
                    <p className="text-gray-500 mt-0.5">{city}, Maharashtra</p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Contact Phone</p>
                    <p className="font-extrabold text-gray-900 text-sm">
                      {phone || <span className="text-gray-400 font-normal italic">Not specified</span>}
                    </p>
                    {phone ? (
                      <p className="text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available for buyer calls
                      </p>
                    ) : (
                      <p className="text-amber-700 font-semibold mt-0.5 text-[11px]">
                        Add phone in Edit Details
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Open Timings</p>
                    <p className="font-extrabold text-gray-900 text-sm">{hours || '10:00 AM – 9:00 PM'}</p>
                    <p className="text-gray-500 mt-0.5">Days: {openDays}</p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Price Range</p>
                    <p className="font-extrabold text-gray-900 text-sm">
                      {priceRange || (storeProducts.length > 0 ? `₹${Math.min(...storeProducts.map(p => Number(p.price) || 0))} – ₹${Math.max(...storeProducts.map(p => Number(p.price) || 0))}` : 'Based on catalog')}
                    </p>
                    <p className="text-gray-500 mt-0.5">Local retail pricing</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Printable Store QR Station & Quick Tools */}
            <div className="space-y-6">

              {/* Branded QR Station Card */}
              <div className="bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] rounded-3xl border-2 border-[#CDEED5] p-5 text-center shadow-xs space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#CDEED5] shadow-xs text-xs font-black text-[#138A36]">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Storefront QR Station</span>
                </div>

                {/* QR Code Frame */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#CDEED5] shadow-sm max-w-[210px] mx-auto space-y-2">
                  <div className="flex justify-center p-2 bg-white rounded-xl">
                    <QRCodeSVG
                      value={shopUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      level="H"
                      includeMargin={false}
                      className="w-full h-auto rounded-lg mx-auto"
                    />
                    {/* Hidden canvas for downloading crisp high-res 600px PNG */}
                    <div className="hidden">
                      <QRCodeCanvas
                        id="merchant-qr-canvas"
                        value={shopUrl}
                        size={600}
                        bgColor="#ffffff"
                        fgColor="#111111"
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-gray-800 truncate">{name}</p>
                  <p className="text-[9px] text-[#138A36] font-bold uppercase tracking-wider">Scan with Phone Camera</p>
                </div>

                <p className="text-xs text-gray-600 px-2">
                  Place this QR code at your cash counter so walking customers can browse your digital inventory and chat with you!
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold border border-gray-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Store Web Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out our shop ${name} on GrowLocal: ${shopUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#138A36] rounded-xl text-xs font-bold border border-[#CDEED5] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR Code (PNG)</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="bg-white rounded-3xl border border-[#E5E7E5] p-5 shadow-xs space-y-3">
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Quick Management</p>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('merchantProducts');
                  }}
                  className="w-full p-3 bg-gray-50 hover:bg-[#EAF7EE] text-gray-800 hover:text-[#138A36] rounded-xl text-xs font-bold transition-colors flex items-center justify-between border border-gray-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>Manage Store Products</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('merchantEnquiries');
                  }}
                  className="w-full p-3 bg-gray-50 hover:bg-[#EAF7EE] text-gray-800 hover:text-[#138A36] rounded-xl text-xs font-bold transition-colors flex items-center justify-between border border-gray-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>View Customer Inquiries</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveSubTab('edit')}
                  className="w-full p-3 bg-gray-50 hover:bg-[#EAF7EE] text-gray-800 hover:text-[#138A36] rounded-xl text-xs font-bold transition-colors flex items-center justify-between border border-gray-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-purple-600" />
                    <span>Update Timings & Photos</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ── 2. IN-STORE PRODUCTS CATALOG TAB ───────────────── */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-[#E5E7E5] shadow-xs">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#111111]">
                Products Listed at {name}
              </h3>
              <p className="text-xs text-gray-500">
                These items appear under your shop in the Nagpur marketplace
              </p>
            </div>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('merchantProducts');
              }}
              className="px-4 py-2 bg-[#138A36] hover:bg-[#0F752C] text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>+ Add Products</span>
            </button>
          </div>

          {storeProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
              <span className="text-4xl">📦</span>
              <h4 className="text-base font-extrabold text-gray-800">No products added under this shop yet</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Add your items to showcase your store inventory to thousands of customers looking for local products in Nagpur.
              </p>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('merchantProducts');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Package className="w-4 h-4" />
                <span>Add Your First Product</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {storeProducts.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-[#E5E7E5] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
                  <div className="h-40 w-full bg-gray-100 overflow-hidden relative">
                    <img
                      src={prod.image || prod.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.inStock !== false && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        In Stock
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.category || 'Retail'}</p>
                      <h4 className="font-extrabold text-sm text-[#111111] line-clamp-1 mt-0.5">{prod.name}</h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <p className="font-black text-sm text-[#138A36]">
                        ₹{prod.price?.toLocaleString?.('en-IN') || prod.price || '0'}
                      </p>
                      <span className="text-[10px] font-semibold text-gray-400">Nagpur</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. EDIT SHOP INFORMATION TAB ───────────────────── */}
      {activeSubTab === 'edit' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E5E7E5] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7E5]">
            <div>
              <h3 className="text-lg font-black text-[#111111]">Edit Store Details</h3>
              <p className="text-xs text-gray-500">Update your store information visible to Nagpur shoppers</p>
            </div>
            <button
              type="submit"
              className="bg-[#138A36] hover:bg-[#0F752C] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Shop Name */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Shop Business Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rameshwar Sweets & Bakery"
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Business Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Store Address */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#111111] mb-1.5">Store Address (Nagpur)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No., Street, Landmark, Dharampeth / Sadar / Sitabuldi"
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Contact Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98230 12345"
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
              />
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Operating Hours</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="10:00 AM – 9:00 PM"
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
              />
            </div>

            {/* Open Days */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Open Days</label>
              <input
                type="text"
                value={openDays}
                onChange={(e) => setOpenDays(e.target.value)}
                placeholder="Mon – Sun (or Mon – Sat)"
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Estimated Price Range</label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="₹299 – ₹9,999"
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Cover Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white truncate"
                />
                <button
                  type="button"
                  onClick={() => fileCoverRef.current?.click()}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs shrink-0"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Logo Image URL */}
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">Logo Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoImage}
                  onChange={(e) => setLogoImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white truncate"
                />
                <button
                  type="button"
                  onClick={() => fileLogoRef.current?.click()}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs shrink-0"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* About / Story */}
            <div className="md:col-span-2">
              <label className="block font-bold text-[#111111] mb-1.5">About Your Shop / Story</label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell customers about your shop, specialties, quality guarantees, and what makes your store special in Nagpur..."
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#138A36] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('overview')}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#138A36] hover:bg-[#0F752C] text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* ── QR CODE SHARE MODAL ────────────────────────────── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-gray-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center mx-auto text-xl shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">{name}</h3>
              <p className="text-xs text-gray-500">Official GrowLocal Storefront QR</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block shadow-xs">
              <QRCodeSVG
                value={shopUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#111111"
                level="H"
                includeMargin={false}
                className="w-48 h-48 rounded-xl mx-auto"
              />
            </div>

            <p className="text-xs text-gray-600">
              Customers can scan this to open your store profile, view products, and send instant chat inquiries.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Web Link'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out our shop ${name} on GrowLocal: ${shopUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="w-full py-2 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#138A36] rounded-xl text-xs font-bold border border-[#CDEED5] transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Code Poster</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
