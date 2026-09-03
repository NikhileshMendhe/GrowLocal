import React, { useState, useRef } from 'react';
import { 
  X, Store, MapPin, Clock, Image as ImageIcon, CheckCircle2, 
  ArrowRight, ArrowLeft, Sparkles, Upload, Camera, Trash2, Check, RefreshCw 
} from 'lucide-react';

const SHOP_CATEGORIES = [
  { id: 'fashion',    label: 'Fashion & Clothing',     emoji: '👗', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Dress.png', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'footwear',   label: 'Footwear',               emoji: '👟', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Running%20Shoe.png', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'electronics',label: 'Electronics',            emoji: '💻', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png', color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'home',       label: 'Home & Furniture',       emoji: '🛋️', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Couch%20and%20Lamp.png', color: '#EA580C', bg: '#FFF7ED' },
  { id: 'jewellery',  label: 'Jewellery',              emoji: '💎', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gem%20Stone.png', color: '#D97706', bg: '#FFFBEB' },
  { id: 'health',     label: 'Health & Wellness',      emoji: '💊', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Pill.png', color: '#0D9488', bg: '#F0FDFA' },
  { id: 'sports',     label: 'Sports & Fitness',       emoji: '🏋️', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20Lifting%20Weights.png', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'books',      label: 'Books & Stationery',     emoji: '📚', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png', color: '#475569', bg: '#F8FAFC' },
  { id: 'beauty',     label: 'Beauty & Cosmetics',     emoji: '💄', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Lipstick.png', color: '#DB2777', bg: '#FDF2F8' },
  { id: 'eyewear',    label: 'Eyewear & Optics',       emoji: '👓', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Glasses.png', color: '#0891B2', bg: '#ECFEFF' },
  { id: 'gadgets',    label: 'Mobile & Gadgets',       emoji: '📱', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png', color: '#1D4ED8', bg: '#DBEAFE' },
  { id: 'auto',       label: 'Auto Parts',             emoji: '🔧', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Wrench.png', color: '#57534E', bg: '#F5F5F4' },
  { id: 'cafe',       label: 'Restaurant & Café',      emoji: '☕', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hot%20Beverage.png', color: '#92400E', bg: '#FEF3C7' },
  { id: 'other',      label: 'Other',                  emoji: '✨', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png', color: '#138A36', bg: '#EAF7EE' },
];

export default function MerchantShopSetupModal({ onClose, onSaveShop, currentUser }) {
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState(currentUser?.shopName || '');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [openHours, setOpenHours] = useState('10:00 AM – 9:00 PM');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [saved, setSaved] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // File Upload State
  const fileInputRef = useRef(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const SAMPLE_COVERS = [
    { label: 'Boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Retail Store', url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cafe / Dining', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Electronics', url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImageUrl(event.target.result);
      setUploadedFileName(file.name);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImageUrl(event.target.result);
      setUploadedFileName(file.name);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const selectedCat = SHOP_CATEGORIES.find(c => c.id === category);
  const step1Valid = shopName.trim().length > 0 && category !== '';

  const handleSubmit = () => {
    const catLabel = selectedCat?.label || 'Local Business';
    const newShop = {
      id: `shop-${Date.now()}`,
      merchantId: currentUser?.id || `merchant-${Date.now()}`,
      merchantEmail: currentUser?.email || '',
      name: shopName,
      category: catLabel,
      address: address || `${city}, Maharashtra`,
      city,
      about: description || `${shopName} — your trusted local store on GrowLocal.`,
      openHours,
      openDays: 'Mon – Sun',
      closingTime: openHours.split('–')[1]?.trim() || 'Closes 9 PM',
      status: 'Open',
      verified: false,
      is_verified: false,
      rating: 0,
      reviewsCount: 0,
      distance: '0.5 km away',
      priceRange: priceMin && priceMax ? `₹${priceMin} – ₹${priceMax}` : '₹299 – ₹9,999',
      coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      logoImage: coverImageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80',
      photos: [coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'],
    };
    try {
      const existing = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      localStorage.setItem('growlocal_merchant_shops', JSON.stringify([newShop, ...existing]));
    } catch (_) {}
    onSaveShop(newShop);
    setSaved(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '28px', width: '100%', maxWidth: '520px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.25)', border: '1px solid #E5E7E5',
        maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #138A36, #1aad44)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Store style={{ width: '16px', height: '16px', color: '#fff' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#111', margin: 0 }}>
                {saved ? 'Shop is Live! 🎉' : 'List Your Shop'}
              </h2>
            </div>
            {!saved && (
              <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0 40px' }}>
                Step {step} of 2 — {step === 1 ? 'Shop basics' : 'Hours & details'}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F5',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X style={{ width: '14px', height: '14px', color: '#666' }} />
          </button>
        </div>

        {/* Progress Bar */}
        {!saved && (
          <div style={{ height: '3px', background: '#F0F0F0', flexShrink: 0 }}>
            <div style={{
              height: '100%', width: step === 1 ? '50%' : '100%',
              background: 'linear-gradient(90deg, #138A36, #1aad44)',
              transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0'
            }} />
          </div>
        )}

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>

          {/* Success State */}
          {saved && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '12px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: '#EAF7EE',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle2 style={{ width: '36px', height: '36px', color: '#138A36' }} />
              </div>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#111', margin: 0, textAlign: 'center' }}>
                {shopName} is live! 🚀
              </p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                Your shop is now visible to customers on GrowLocal.<br />
                Head to Products to start listing what you sell.
              </p>
              <div style={{
                background: '#EAF7EE', borderRadius: '12px', padding: '10px 20px',
                fontSize: '12px', fontWeight: 700, color: '#138A36'
              }}>
                🟢 Visible on Customer Home
              </div>
            </div>
          )}

          {/* Step 1: Shop Basics */}
          {!saved && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Shop Name */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Shop / Business Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <Store style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#aaa' }} />
                  <input
                    type="text" required
                    placeholder="e.g. Trendy Wear Nagpur"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    style={{
                      width: '100%', paddingLeft: '40px', paddingRight: '16px',
                      paddingTop: '12px', paddingBottom: '12px',
                      background: '#F8FAF8', border: shopName ? '2px solid #138A36' : '2px solid #E5E7E5',
                      borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111',
                      outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Category Visual Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  What do you sell? *
                </label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px'
                }}>
                  {SHOP_CATEGORIES.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: '6px', padding: '12px 6px 10px', borderRadius: '16px', cursor: 'pointer',
                          border: isSelected ? `2px solid ${cat.color}` : '2px solid #EEEEEE',
                          background: isSelected ? cat.bg : '#FFFFFF',
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: isSelected ? `0 6px 16px ${cat.color}35` : '0 1px 4px rgba(0,0,0,0.04)'
                        }}
                      >
                        <img
                          src={cat.iconUrl}
                          alt={cat.label}
                          style={{
                            width: '38px',
                            height: '38px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))',
                            transition: 'transform 0.2s ease',
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span style={{ display: 'none', fontSize: '26px', lineHeight: 1 }}>{cat.emoji}</span>
                        <span style={{
                          fontSize: '9.5px', fontWeight: 800, color: isSelected ? cat.color : '#333333',
                          textAlign: 'center', lineHeight: 1.2
                        }}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Area / Street
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#aaa' }} />
                    <input
                      type="text"
                      placeholder="e.g. Sitabuldi Market"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: '32px', paddingRight: '10px',
                        paddingTop: '11px', paddingBottom: '11px',
                        background: '#F8FAF8', border: '2px solid #E5E7E5',
                        borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#111',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    City *
                  </label>
                  <input
                    type="text" required
                    placeholder="e.g. Nagpur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: '#F8FAF8', border: city ? '2px solid #138A36' : '2px solid #E5E7E5',
                      borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#111',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hours & Details */}
          {!saved && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Shop Preview Chip */}
              {selectedCat && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: selectedCat.bg, border: `1.5px solid ${selectedCat.color}30`,
                  borderRadius: '14px', padding: '10px 14px'
                }}>
                  <img src={selectedCat.iconUrl} alt={selectedCat.label} style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#111' }}>{shopName}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: selectedCat.color, fontWeight: 700 }}>{selectedCat.label} · {city}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tell customers about your shop
                </label>
                <textarea
                  rows={3}
                  placeholder="What makes your shop special? What do you sell? Any offers?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#F8FAF8', border: '2px solid #E5E7E5',
                    borderRadius: '14px', fontSize: '12px', fontWeight: 500, color: '#111',
                    outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6
                  }}
                />
              </div>

              {/* Cover Image with File Upload */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Shop Cover Photo *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{ fontSize: '10px', fontWeight: 700, color: '#138A36', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showUrlInput ? '← Switch to File Upload' : 'Or paste image link (URL)'}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {!showUrlInput ? (
                  <div>
                    {!coverImageUrl || previewError ? (
                      /* Upload Dropzone */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        style={{
                          border: isDragging ? '2px dashed #138A36' : '2px dashed #D1D5DB',
                          background: isDragging ? '#EAF7EE' : '#F9FAFB',
                          borderRadius: '18px', padding: '22px 16px', textAlign: 'center',
                          cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '46px', height: '46px', borderRadius: '14px',
                          background: '#EAF7EE', color: '#138A36', margin: '0 auto 10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Upload style={{ width: '22px', height: '22px' }} />
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800, color: '#111' }}>
                          Upload photo from device
                        </p>
                        <p style={{ margin: '0 0 12px', fontSize: '10px', color: '#888' }}>
                          Browse your gallery or camera (PNG, JPG, WEBP up to 10MB)
                        </p>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '7px 16px', background: '#fff', border: '1.5px solid #138A36',
                          color: '#138A36', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                          <Camera style={{ width: '13px', height: '13px' }} />
                          <span>Choose Image File</span>
                        </div>
                      </div>
                    ) : (
                      /* Uploaded Image Preview */
                      <div style={{
                        position: 'relative', borderRadius: '18px', overflow: 'hidden',
                        border: '2px solid #138A36', boxShadow: '0 4px 12px rgba(19,138,54,0.15)'
                      }}>
                        <img
                          src={coverImageUrl}
                          alt="Shop Cover"
                          onError={() => setPreviewError(true)}
                          style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
                          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                          padding: '12px 14px'
                        }}>
                          <div style={{ color: '#fff', minWidth: 0, paddingRight: '8px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              background: '#138A36', color: '#fff', fontSize: '9px', fontWeight: 800,
                              padding: '2px 8px', borderRadius: '20px', marginBottom: '4px'
                            }}>
                              <Check style={{ width: '10px', height: '10px' }} /> Ready
                            </span>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                              {uploadedFileName || 'Custom Shop Cover Photo'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '6px 10px', background: 'rgba(255,255,255,0.92)',
                                border: 'none', borderRadius: '8px', fontSize: '10px',
                                fontWeight: 800, color: '#111', cursor: 'pointer'
                              }}
                            >
                              <RefreshCw style={{ width: '10px', height: '10px', color: '#138A36' }} />
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => { setCoverImageUrl(''); setUploadedFileName(''); }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '6px', background: '#DC2626',
                                border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer'
                              }}
                              title="Remove photo"
                            >
                              <Trash2 style={{ width: '11px', height: '11px' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Sample Presets */}
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, color: '#888' }}>
                        Or pick a sample store cover:
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                        {SAMPLE_COVERS.map(sample => (
                          <button
                            key={sample.label}
                            type="button"
                            onClick={() => {
                              setCoverImageUrl(sample.url);
                              setUploadedFileName(sample.label);
                              setPreviewError(false);
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '5px 9px', borderRadius: '8px', background: '#F0F2F0',
                              border: '1px solid #E5E7E5', color: '#444', fontSize: '10px',
                              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                            }}
                          >
                            <ImageIcon style={{ width: '10px', height: '10px', color: '#138A36' }} />
                            <span>{sample.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Direct URL Input fallback */
                  <div>
                    <div style={{ position: 'relative' }}>
                      <ImageIcon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#aaa' }} />
                      <input
                        type="url"
                        placeholder="https://... paste image URL"
                        value={coverImageUrl}
                        onChange={(e) => { setCoverImageUrl(e.target.value); setPreviewError(false); }}
                        style={{
                          width: '100%', paddingLeft: '40px', paddingRight: '16px',
                          paddingTop: '11px', paddingBottom: '11px',
                          background: '#F8FAF8', border: '2px solid #E5E7E5',
                          borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#111',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {coverImageUrl && !previewError && (
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        onError={() => setPreviewError(true)}
                        style={{
                          width: '100%', height: '100px', objectFit: 'cover',
                          borderRadius: '12px', marginTop: '8px', border: '2px solid #E5E7E5'
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Open Hours */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Opening Hours
                </label>
                <div style={{ position: 'relative' }}>
                  <Clock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#aaa' }} />
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM – 9:00 PM"
                    value={openHours}
                    onChange={(e) => setOpenHours(e.target.value)}
                    style={{
                      width: '100%', paddingLeft: '40px', paddingRight: '16px',
                      paddingTop: '11px', paddingBottom: '11px',
                      background: '#F8FAF8', border: '2px solid #E5E7E5',
                      borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#111',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Price Range (₹)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="number" min="0"
                    placeholder="Min e.g. 299"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    style={{
                      padding: '11px 14px', background: '#F8FAF8', border: '2px solid #E5E7E5',
                      borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#111',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="number" min="0"
                    placeholder="Max e.g. 9999"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    style={{
                      padding: '11px 14px', background: '#F8FAF8', border: '2px solid #E5E7E5',
                      borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#111',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid #F0F0F0', flexShrink: 0,
            display: 'flex', gap: '10px'
          }}>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '12px 20px', background: '#F5F5F5', color: '#444',
                  border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} />
                Back
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={() => step1Valid && setStep(2)}
                disabled={!step1Valid}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px', background: step1Valid ? 'linear-gradient(135deg, #138A36, #1aad44)' : '#E5E7E5',
                  color: step1Valid ? '#fff' : '#aaa', border: 'none', borderRadius: '14px',
                  fontSize: '14px', fontWeight: 800, cursor: step1Valid ? 'pointer' : 'not-allowed',
                  boxShadow: step1Valid ? '0 4px 16px rgba(19,138,54,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>Next — Add Details</span>
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px', background: 'linear-gradient(135deg, #138A36, #1aad44)',
                  color: '#fff', border: 'none', borderRadius: '14px',
                  fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(19,138,54,0.3)'
                }}
              >
                <Sparkles style={{ width: '15px', height: '15px' }} />
                <span>Go Live on GrowLocal!</span>
              </button>
            )}
          </div>
        )}

        {!saved && step === 1 && (
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#aaa', padding: '0 24px 14px', margin: 0 }}>
            Your shop will be visible immediately on the Customer Home feed.
          </p>
        )}
      </div>
    </div>
  );
}
