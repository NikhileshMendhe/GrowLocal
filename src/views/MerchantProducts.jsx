import React, { useState, useRef } from 'react';
import {
  Plus, Edit2, EyeOff, Trash2, Package, Search, X, ArrowRight, ArrowLeft,
  Sparkles, ShoppingBag, Camera, CheckCircle2, Star, Zap, Upload, RefreshCw
} from 'lucide-react';

const PRODUCT_CATEGORIES = [
  { id: 'clothes',    label: 'Clothes',      emoji: '👕', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Dress.png', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'footwear',   label: 'Footwear',     emoji: '👟', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Running%20Shoe.png', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'electronics',label: 'Electronics',  emoji: '💻', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png', color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'beauty',     label: 'Beauty',       emoji: '💄', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Lipstick.png', color: '#DB2777', bg: '#FDF2F8' },
  { id: 'jewellery',  label: 'Jewellery',    emoji: '💎', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gem%20Stone.png', color: '#D97706', bg: '#FFFBEB' },
  { id: 'health',     label: 'Health',       emoji: '💊', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Pill.png', color: '#0D9488', bg: '#F0FDFA' },
  { id: 'sports',     label: 'Sports',       emoji: '🏋️', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20Lifting%20Weights.png', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'books',      label: 'Books',        emoji: '📚', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png', color: '#475569', bg: '#F8FAFC' },
  { id: 'home',       label: 'Home',         emoji: '🛋️', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Couch%20and%20Lamp.png', color: '#EA580C', bg: '#FFF7ED' },
  { id: 'gadgets',    label: 'Gadgets',      emoji: '📱', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png', color: '#1D4ED8', bg: '#DBEAFE' },
  { id: 'eyewear',    label: 'Eyewear',      emoji: '👓', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Glasses.png', color: '#0891B2', bg: '#ECFEFF' },
  { id: 'other',      label: 'Other',        emoji: '✨', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png', color: '#138A36', bg: '#EAF7EE' },
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

const STEP_INFO = [
  { num: 1, icon: '🎯', title: 'The Basics', sub: 'Name, category & pricing' },
  { num: 2, icon: '📦', title: 'Inventory',   sub: 'Stock, sizes & description' },
  { num: 3, icon: '📸', title: 'Photo & Go',  sub: 'Image & final preview' },
];

// ─── Wizard Modal (Add / Edit) ────────────────────────────────────────────────
function ProductWizard({ onClose, onAddProduct, onUpdateProduct, editingProduct, onShowToast, currentMerchantShop, shops }) {
  const isEditing = Boolean(editingProduct);
  const [step, setStep] = useState(1);
  // Step 1
  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState(() => {
    if (!editingProduct?.category) return '';
    const match = PRODUCT_CATEGORIES.find(c => 
      c.label.toLowerCase() === editingProduct.category.toLowerCase() ||
      c.id.toLowerCase() === editingProduct.category.toLowerCase()
    );
    return match ? match.id : editingProduct.category;
  });
  const [price, setPrice] = useState(editingProduct?.price !== undefined ? String(editingProduct.price) : '');
  const [mrp, setMrp] = useState(editingProduct?.originalPrice !== undefined ? String(editingProduct.originalPrice) : '');
  // Step 2
  const [stock, setStock] = useState(editingProduct?.stockCount !== undefined ? editingProduct.stockCount : 20);
  const [selectedSizes, setSelectedSizes] = useState(editingProduct?.sizes || []);
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [availability, setAvailability] = useState(editingProduct?.availability || 'In Stock');
  // Step 3
  const [image, setImage] = useState(editingProduct?.images?.[0] || '');
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setImgError(false);
    };
    reader.readAsDataURL(file);
  };

  const selectedCat = PRODUCT_CATEGORIES.find(c => c.id === category);
  const discount = mrp && price && Number(mrp) > Number(price)
    ? Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)
    : null;

  const step1Valid = name.trim().length > 0 && category !== '' && price !== '';

  const toggleSize = (sz) => {
    setSelectedSizes(prev =>
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );
  };

  const targetShop = currentMerchantShop || (shops && shops[0]);

  const handleFinish = () => {
    const finalImage = image || DEFAULT_IMAGE;
    if (isEditing) {
      const updatedProduct = {
        ...editingProduct,
        name,
        category: selectedCat?.label || category,
        price: parseFloat(price) || 0,
        originalPrice: parseFloat(mrp) || Math.round(parseFloat(price) * 1.25) || 0,
        sizes: selectedSizes.length > 0 ? selectedSizes : ['Standard'],
        availability,
        stockCount: stock,
        description: description || `Fresh ${selectedCat?.label || 'product'} from a verified local merchant.`,
        images: [finalImage]
      };
      if (onUpdateProduct) {
        onUpdateProduct(updatedProduct);
      }
      setSaved(true);
      setTimeout(() => {
        onClose();
        onShowToast(`✓ "${name}" updated successfully!`);
      }, 1000);
    } else {
      const product = {
        id: `prod-${Date.now()}`,
        shopId: targetShop?.id || 'shop-1',
        shopName: targetShop?.name || 'Local Store',
        shopVerified: Boolean(targetShop?.verified),
        shopDistance: targetShop?.distance || '0.5 km away',
        name,
        category: selectedCat?.label || category,
        price: parseFloat(price) || 0,
        originalPrice: parseFloat(mrp) || Math.round(parseFloat(price) * 1.25) || 0,
        sizes: selectedSizes.length > 0 ? selectedSizes : ['Standard'],
        availability,
        stockCount: stock,
        enquiriesCount: 0,
        description: description || `Fresh ${selectedCat?.label || 'product'} from a verified local merchant.`,
        images: [finalImage],
        is_featured: false,
        approval_status: 'approved'
      };
      onAddProduct(product);
      setSaved(true);
      setTimeout(() => {
        onClose();
        onShowToast(`🎉 "${name}" is now live on GrowLocal!`);
      }, 1800);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '28px', width: '100%', maxWidth: '540px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.3)', border: '1px solid #E5E7E5',
        maxHeight: '94vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 22px 14px', borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #138A36, #1aad44)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
            }}>
              {saved ? '🎉' : STEP_INFO[step - 1].icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#111' }}>
                {saved 
                  ? (isEditing ? 'Product Updated!' : 'Product Added!') 
                  : (isEditing ? `Edit: ${name || 'Product'} (Step ${step})` : `Step ${step}: ${STEP_INFO[step - 1].title}`)}
              </p>
              <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>
                {saved 
                  ? 'Changes saved to GrowLocal' 
                  : (isEditing ? 'Modify your product details, price and stock' : STEP_INFO[step - 1].sub)}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '30px', height: '30px', borderRadius: '50%', background: '#F5F5F5',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X style={{ width: '13px', height: '13px', color: '#666' }} />
          </button>
        </div>

        {/* Step Pills */}
        {!saved && (
          <div style={{ display: 'flex', padding: '12px 22px 0', gap: '6px', flexShrink: 0 }}>
            {STEP_INFO.map(s => (
              <div key={s.num} style={{
                flex: 1, height: '4px', borderRadius: '2px',
                background: s.num <= step ? 'linear-gradient(90deg,#138A36,#1aad44)' : '#EEEEEE',
                transition: 'background 0.3s ease'
              }} />
            ))}
          </div>
        )}

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '18px 22px' }}>

          {/* SUCCESS */}
          {saved && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '14px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #EAF7EE, #D1FAE5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px'
              }}>
                🚀
              </div>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#111', textAlign: 'center' }}>
                "{name}" is live!
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
                Customers nearby can now discover and enquire<br />about your product on GrowLocal.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ background: '#EAF7EE', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, color: '#138A36' }}>
                  🟢 Visible to Customers
                </div>
                {discount && (
                  <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, color: '#D97706' }}>
                    🏷️ {discount}% off
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 1: Basics ─────────── */}
          {!saved && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Name */}
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. Black Oversized Cotton T-Shirt"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  style={{ ...inputStyle, border: name ? '2px solid #138A36' : '2px solid #E5E7E5', fontSize: '14px' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#aaa', textAlign: 'right' }}>
                  {name.length}/80
                </p>
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Category *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {PRODUCT_CATEGORIES.map(cat => {
                    const isSel = category === cat.id;
                    return (
                      <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                        padding: '10px 4px', borderRadius: '14px', cursor: 'pointer',
                        border: isSel ? `2px solid ${cat.color}` : '2px solid transparent',
                        background: isSel ? cat.bg : '#F8FAF8',
                        transition: 'all 0.18s', transform: isSel ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isSel ? `0 4px 12px ${cat.color}35` : 'none'
                      }}>
                        <img
                          src={cat.iconUrl}
                          alt={cat.label}
                          style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.12))',
                            transform: isSel ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.2s'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span style={{ display: 'none', fontSize: '20px', lineHeight: 1 }}>{cat.emoji}</span>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, color: isSel ? cat.color : '#777', textAlign: 'center', lineHeight: 1.2 }}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & MRP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Your Price (₹) *</label>
                  <input
                    type="number" min="0" required
                    placeholder="e.g. 699"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ ...inputStyle, border: price ? '2px solid #138A36' : '2px solid #E5E7E5' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>MRP / Market Price (₹)</label>
                  <input
                    type="number" min="0"
                    placeholder="e.g. 999"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Savings Preview */}
              {discount !== null && (
                <div style={{
                  background: 'linear-gradient(135deg, #FEF3C7, #FEF9EC)',
                  border: '1.5px solid #FDE68A', borderRadius: '14px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span style={{ fontSize: '22px' }}>🏷️</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                      {discount}% OFF — Customers save ₹{Number(mrp) - Number(price)}!
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#B45309' }}>
                      ₹{price} instead of <span style={{ textDecoration: 'line-through' }}>₹{mrp}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Inventory ─────── */}
          {!saved && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Stock */}
              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <button
                    onClick={() => setStock(s => Math.max(0, s - 1))}
                    style={{
                      width: '40px', height: '40px', borderRadius: '12px', background: '#F0F0F0',
                      border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 700, color: '#444'
                    }}
                  >−</button>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#111', minWidth: '40px', textAlign: 'center' }}>
                    {stock}
                  </span>
                  <button
                    onClick={() => setStock(s => s + 1)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '12px', background: '#EAF7EE',
                      border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 700, color: '#138A36'
                    }}
                  >+</button>
                  <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>units in stock</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                    {[
                      { label: 'In Stock', color: '#138A36', bg: '#EAF7EE' },
                      { label: 'Low Stock', color: '#D97706', bg: '#FEF3C7' },
                      { label: 'On Order', color: '#2563EB', bg: '#EFF6FF' }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => setAvailability(opt.label)}
                        style={{
                          padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700,
                          background: availability === opt.label ? opt.bg : '#F5F5F5',
                          color: availability === opt.label ? opt.color : '#999',
                          border: availability === opt.label ? `1.5px solid ${opt.color}40` : '1.5px solid transparent',
                          transition: 'all 0.15s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label style={labelStyle}>Available Sizes <span style={{ fontWeight: 500, color: '#aaa' }}>(tap to select)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {CLOTHING_SIZES.map(sz => {
                    const isSel = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        style={{
                          padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                          background: isSel ? '#138A36' : '#F5F5F5',
                          color: isSel ? '#fff' : '#555', fontWeight: 700, fontSize: '12px',
                          border: isSel ? '2px solid #138A36' : '2px solid transparent',
                          transition: 'all 0.15s', transform: isSel ? 'scale(1.08)' : 'scale(1)'
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {selectedSizes.length === 0 && (
                  <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#bbb' }}>
                    Leave empty to mark as "Standard" size
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the product — material, color options, what makes it special…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    ...inputStyle, resize: 'none', lineHeight: 1.6,
                    paddingTop: '12px', paddingBottom: '12px'
                  }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Photo & Preview ── */}
          {!saved && step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Product Photo with File Upload */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={labelStyle}>Product Photo</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{ fontSize: '10px', fontWeight: 700, color: '#138A36', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showUrlInput ? '← Switch to Upload File' : 'Or paste image link (URL)'}
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {!showUrlInput ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #138A36', background: '#F0FDF4',
                      borderRadius: '16px', padding: '16px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '12px',
                      background: '#EAF7EE', color: '#138A36', margin: '0 auto 8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Upload style={{ width: '18px', height: '18px' }} />
                    </div>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 800, color: '#111' }}>
                      {image ? '✓ Photo selected — click to change' : 'Upload photo from device / camera'}
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>
                      Tap to select photo (PNG, JPG, WEBP up to 10MB)
                    </p>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <Camera style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#aaa' }} />
                    <input
                      type="url"
                      placeholder="Paste any product image URL..."
                      value={image}
                      onChange={(e) => { setImage(e.target.value); setImgError(false); }}
                      style={{ ...inputStyle, paddingLeft: '40px' }}
                    />
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              <div>
                <label style={labelStyle}>🔍 Customer Preview — This is how they'll see it</label>
                <div style={{
                  border: '2px solid #E5E7E5', borderRadius: '20px', overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginTop: '6px'
                }}>
                  {/* Image */}
                  <div style={{ position: 'relative', height: '160px', background: '#F5F5F5' }}>
                    <img
                      src={imgError || !image ? DEFAULT_IMAGE : image}
                      alt={name}
                      onError={() => setImgError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {discount && (
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: '#DC2626', color: '#fff', borderRadius: '8px',
                        padding: '3px 8px', fontSize: '11px', fontWeight: 800
                      }}>
                        -{discount}%
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(255,255,255,0.95)', borderRadius: '8px',
                      padding: '3px 8px', fontSize: '10px', fontWeight: 700,
                      color: availability === 'In Stock' ? '#138A36' : '#D97706'
                    }}>
                      {availability === 'In Stock' ? '✓ ' : '⚡ '}{availability}
                    </div>
                  </div>
                  {/* Card Body */}
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '9px', fontWeight: 800, color: selectedCat?.color || '#138A36',
                          background: selectedCat?.bg || '#EAF7EE', padding: '2px 7px', borderRadius: '6px'
                        }}>
                          {selectedCat?.emoji} {selectedCat?.label || 'Product'}
                        </span>
                        <p style={{ margin: '5px 0 2px', fontSize: '14px', fontWeight: 800, color: '#111' }}>
                          {name || 'Your Product Name'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: '#111' }}>
                            ₹{price || '—'}
                          </span>
                          {mrp && (
                            <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>
                              ₹{mrp}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star style={{ width: '11px', height: '11px', color: '#F59E0B', fill: '#F59E0B' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#444' }}>New</span>
                      </div>
                    </div>
                    {selectedSizes.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {selectedSizes.slice(0, 5).map(sz => (
                          <span key={sz} style={{
                            fontSize: '9px', fontWeight: 700, color: '#555',
                            background: '#F5F5F5', borderRadius: '6px', padding: '2px 6px'
                          }}>{sz}</span>
                        ))}
                      </div>
                    )}
                    <button style={{
                      marginTop: '10px', width: '100%', padding: '9px',
                      background: 'linear-gradient(135deg, #138A36, #1aad44)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                    }}>
                      Enquire Now →
                    </button>
                  </div>
                </div>

                <div style={{
                  marginTop: '12px', background: 'linear-gradient(135deg, #EAF7EE, #D1FAE5)',
                  border: '1.5px solid #86EFAC', borderRadius: '14px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <Zap style={{ width: '18px', height: '18px', color: '#138A36', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                    ✨ You're almost live! Thousands of local customers will discover this product the moment you hit go.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Nav */}
        {!saved && (
          <div style={{
            padding: '14px 22px', borderTop: '1px solid #F0F0F0', flexShrink: 0,
            display: 'flex', gap: '10px'
          }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '12px 18px', background: '#F5F5F5', color: '#444',
                border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
              }}>
                <ArrowLeft style={{ width: '13px', height: '13px' }} />
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => step1Valid || step > 1 ? setStep(s => s + 1) : null}
                disabled={step === 1 && !step1Valid}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px',
                  background: (step === 1 ? step1Valid : true) ? 'linear-gradient(135deg, #138A36, #1aad44)' : '#E5E7E5',
                  color: (step === 1 ? step1Valid : true) ? '#fff' : '#aaa',
                  border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 800,
                  cursor: (step === 1 ? step1Valid : true) ? 'pointer' : 'not-allowed',
                  boxShadow: (step === 1 ? step1Valid : true) ? '0 4px 16px rgba(19,138,54,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>{step === 1 ? 'Next — Inventory' : 'Next — Photo & Preview'}</span>
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            ) : (
              <button onClick={handleFinish} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px', background: 'linear-gradient(135deg, #138A36, #1aad44)',
                color: '#fff', border: 'none', borderRadius: '14px',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(19,138,54,0.3)'
              }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                <span>{isEditing ? 'Save Changes' : 'Go Live Now!'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 800, color: '#111',
  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em'
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: '#F8FAF8', border: '2px solid #E5E7E5',
  borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111',
  outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s'
};

// ─── Main MerchantProducts View ───────────────────────────────────────────────
export default function MerchantProducts({ products, onAddProduct, onUpdateProduct, onShowToast, currentUser, shops }) {
  const [showWizard, setShowWizard] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Try to find the current merchant's shop
  const currentMerchantShop = shops?.find(s => s.merchantId === currentUser?.id) || shops?.[0];

  const filteredProducts = products.filter(p =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: '0 0 4px' }}>Product Inventory</h1>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
            {products.length} product{products.length !== 1 ? 's' : ''} · Customers see these on GrowLocal
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowWizard(true);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', background: 'linear-gradient(135deg, #138A36, #1aad44)',
            color: '#fff', border: 'none', borderRadius: '14px',
            fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(19,138,54,0.25)'
          }}
        >
          <Plus style={{ width: '15px', height: '15px' }} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#aaa' }} />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', paddingLeft: '40px', paddingRight: '16px',
            paddingTop: '11px', paddingBottom: '11px',
            background: '#F8FAF8', border: '2px solid #EEEEEE', borderRadius: '14px',
            fontSize: '13px', color: '#111', outline: 'none', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'linear-gradient(135deg, #F8FAF8, #EAF7EE)',
          borderRadius: '24px', border: '2px dashed #C6E6D0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <p style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: '0 0 6px' }}>
            {searchTerm ? 'No products found' : 'Your shop needs products!'}
          </p>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>
            {searchTerm ? 'Try a different search term.' : 'Add your first product and start attracting local customers.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowWizard(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', background: 'linear-gradient(135deg, #138A36, #1aad44)',
                color: '#fff', border: 'none', borderRadius: '14px',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer'
              }}
            >
              <Sparkles style={{ width: '14px', height: '14px' }} />
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {filteredProducts.map((prod) => (
          <div key={prod.id} style={{
            background: '#fff', borderRadius: '20px', border: '1.5px solid #EEEEEE',
            overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
          >
            {/* Product Image */}
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative', background: '#F5F5F5' }}>
              <img
                src={prod.images?.[0] || DEFAULT_IMAGE}
                alt={prod.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: '8px', left: '8px',
                background: prod.availability === 'In Stock' ? '#EAF7EE' : '#FEF3C7',
                color: prod.availability === 'In Stock' ? '#138A36' : '#D97706',
                fontSize: '9px', fontWeight: 800, borderRadius: '7px', padding: '3px 8px'
              }}>
                {prod.availability === 'In Stock' ? '✓ ' : '⚠ '}{prod.availability} ({prod.stockCount})
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '12px' }}>
              <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 800, color: '#111', lineHeight: 1.3 }}>
                {prod.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#111' }}>₹{prod.price}</span>
                {prod.originalPrice > prod.price && (
                  <span style={{ fontSize: '10px', color: '#bbb', textDecoration: 'line-through' }}>₹{prod.originalPrice}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#888' }}>
                  {prod.enquiriesCount || 0} enquiries
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setShowWizard(true);
                    }}
                    style={{ ...iconBtnStyle, color: '#138A36', cursor: 'pointer' }}
                    title="Edit Product"
                  >
                    <Edit2 style={{ width: '13px', height: '13px' }} />
                  </button>
                  <button
                    onClick={() => {
                      const newStatus = prod.availability === 'In Stock' ? 'Out of Stock' : 'In Stock';
                      if (onUpdateProduct) {
                        onUpdateProduct({ ...prod, availability: newStatus });
                      }
                      onShowToast(`"${prod.name}" marked as ${newStatus}`);
                    }}
                    style={{ ...iconBtnStyle, color: prod.availability === 'In Stock' ? '#888' : '#D97706', cursor: 'pointer' }}
                    title={prod.availability === 'In Stock' ? "Mark Out of Stock" : "Mark In Stock"}
                  >
                    <EyeOff style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wizard */}
      {showWizard && (
        <ProductWizard
          onClose={() => {
            setShowWizard(false);
            setEditingProduct(null);
          }}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          editingProduct={editingProduct}
          onShowToast={onShowToast}
          currentMerchantShop={currentMerchantShop}
          shops={shops}
        />
      )}
    </div>
  );
}

const iconBtnStyle = {
  width: '28px', height: '28px', borderRadius: '8px', border: 'none',
  background: '#F5F5F5', cursor: 'pointer', color: '#777',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
