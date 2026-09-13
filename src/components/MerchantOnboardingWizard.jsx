import React, { useState, useRef, useEffect } from 'react';
import {
  Store, MapPin, Clock, Image as ImageIcon, CheckCircle2,
  ArrowRight, ArrowLeft, Sparkles, Upload, Camera, Trash2,
  RefreshCw, Check, Star, Zap, Package, Users, TrendingUp,
  ShieldCheck, PartyPopper, Rocket, LogOut
} from 'lucide-react';

// ─── Shop Categories ──────────────────────────────────────────────────────────
const SHOP_CATEGORIES = [
  { id: 'fashion',     label: 'Fashion & Clothing',   emoji: '👗', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Dress.png',                  color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'footwear',   label: 'Footwear',              emoji: '👟', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Running%20Shoe.png',        color: '#2563EB', bg: '#EFF6FF' },
  { id: 'electronics',label: 'Electronics',           emoji: '💻', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png',                 color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'home',       label: 'Home & Furniture',      emoji: '🛋️', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Couch%20and%20Lamp.png',   color: '#EA580C', bg: '#FFF7ED' },
  { id: 'jewellery',  label: 'Jewellery',             emoji: '💎', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gem%20Stone.png',            color: '#D97706', bg: '#FFFBEB' },
  { id: 'health',     label: 'Health & Wellness',     emoji: '💊', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Pill.png',                   color: '#0D9488', bg: '#F0FDFA' },
  { id: 'sports',     label: 'Sports & Fitness',      emoji: '🏋️', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20Lifting%20Weights.png', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'books',      label: 'Books & Stationery',    emoji: '📚', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png',                  color: '#475569', bg: '#F8FAFC' },
  { id: 'beauty',     label: 'Beauty & Cosmetics',    emoji: '💄', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Lipstick.png',               color: '#DB2777', bg: '#FDF2F8' },
  { id: 'eyewear',    label: 'Eyewear & Optics',      emoji: '👓', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Glasses.png',                color: '#0891B2', bg: '#ECFEFF' },
  { id: 'gadgets',    label: 'Mobile & Gadgets',      emoji: '📱', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png',         color: '#1D4ED8', bg: '#DBEAFE' },
  { id: 'auto',       label: 'Auto Parts',            emoji: '🔧', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Wrench.png',                 color: '#57534E', bg: '#F5F5F4' },
  { id: 'cafe',       label: 'Restaurant & Café',     emoji: '☕', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hot%20Beverage.png',            color: '#92400E', bg: '#FEF3C7' },
  { id: 'other',      label: 'Other',                 emoji: '✨', iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png',             color: '#138A36', bg: '#EAF7EE' },
];

const SAMPLE_COVERS = [
  { label: 'Boutique',      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Retail Store',  url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Café / Dining', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Electronics',   url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80' },
];

const HOUR_OPTIONS = [
  '6:00 AM – 10:00 PM',
  '8:00 AM – 10:00 PM',
  '9:00 AM – 9:00 PM',
  '10:00 AM – 9:00 PM',
  '10:00 AM – 10:00 PM',
  '11:00 AM – 11:00 PM',
  '24 Hours Open',
  'Custom Hours',
];

// ─── Step Definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: 'Welcome',    emoji: '👋' },
  { num: 2, label: 'Shop Type',  emoji: '🏷️' },
  { num: 3, label: 'Identity',   emoji: '🏪' },
  { num: 4, label: 'Hours',      emoji: '🕐' },
  { num: 5, label: 'Photo',      emoji: '📸' },
  { num: 6, label: 'About',      emoji: '📝' },
  { num: 7, label: 'Go Live!',   emoji: '🚀' },
];

// ─── Confetti burst (pure CSS keyframe driven dots) ──────────────────────────
function ConfettiBurst() {
  const particles = Array.from({ length: 24 }, (_, i) => i);
  const colors = ['#138A36','#1aad44','#FFD700','#FF6B6B','#4ECDC4','#A855F7','#3B82F6','#F97316'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((i) => {
        const angle = (360 / particles.length) * i;
        const dist = 80 + Math.random() * 120;
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        const delay = Math.random() * 0.4;
        const dur = 1.2 + Math.random() * 0.6;
        const x = Math.cos((angle * Math.PI) / 180) * dist;
        const y = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: `${size}px`, height: `${size}px`,
              borderRadius: i % 3 === 0 ? '50%' : '3px',
              background: color,
              animation: `confetti-fly ${dur}s ease-out ${delay}s both`,
              '--tx': `${x}px`,
              '--ty': `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fly {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MerchantOnboardingWizard({ currentUser, onComplete, onSaveShop, onClose, onLogout }) {
  const [step, setStep] = useState(1);

  // Step 2 — Category
  const [category, setCategory] = useState('');

  // Step 3 — Identity
  const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.name || '');
  const [city, setCity] = useState('Nagpur');
  const [address, setAddress] = useState('');

  // Step 4 — Hours & Price
  const [openHours, setOpenHours] = useState('10:00 AM – 9:00 PM');
  const [customHours, setCustomHours] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Step 5 — Photo
  const fileInputRef = useRef(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Step 6 — About
  const [description, setDescription] = useState('');

  // Finish
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCat = SHOP_CATEGORIES.find(c => c.id === category);
  const finalHours = openHours === 'Custom Hours' ? (customHours || '10:00 AM – 9:00 PM') : openHours;

  // Per-step validation
  const stepValid = () => {
    if (step === 1) return true;
    if (step === 2) return category !== '';
    if (step === 3) return shopName.trim().length > 0 && city.trim().length > 0;
    if (step === 4) return true;
    if (step === 5) return true;
    if (step === 6) return true;
    if (step === 7) return true;
    return false;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Please select an image smaller than 10MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setCoverImageUrl(ev.target.result); setUploadedFileName(file.name); setPreviewError(false); };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCoverImageUrl(ev.target.result); setUploadedFileName(file.name); setPreviewError(false); };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setSaveError('');
    setSaving(true);
    const catLabel = selectedCat?.label || 'Local Business';
    const newShop = {
      name: shopName,
      category: catLabel,
      address: address || `${city}, Maharashtra`,
      city,
      about: description || `${shopName} — your trusted local store on GrowLocal.`,
      openHours: finalHours,
      openDays: 'Mon – Sun',
      closingTime: finalHours.split('–')[1]?.trim() || 'Closes 9 PM',
      status: 'Open',
      verified: false,
      is_verified: false,
      rating: 0,
      reviewsCount: 0,
      distance: '0.5 km away',
      priceRange: priceMin && priceMax ? `₹${priceMin} – ₹${priceMax}` : '',
      coverImage: coverImageUrl || '',
      logoImage: coverImageUrl || '',
      photos: coverImageUrl ? [coverImageUrl] : [],
    };
    try {
      const savedShop = onSaveShop ? await onSaveShop(newShop) : newShop;
      setSaved(true);
      setTimeout(() => { if (onComplete) onComplete(savedShop); }, 2400);
    } catch (error) {
      setSaveError(error.message || 'Your shop could not be published. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(145deg, #0B6B2B 0%, #138A36 55%, #1aad44 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px', fontFamily: "'Inter', 'Outfit', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Background decorative blobs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

      {/* Top Branding Bar */}
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>GrowLocal</p>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Merchant Onboarding</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 14px' }}>
            <Zap style={{ width: '13px', height: '13px', color: '#FFD700' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Setup in 2 min</span>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255,255,255,0.18)', border: 'none',
                color: '#fff', borderRadius: '20px', padding: '6px 12px',
                fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              title="Log Out"
            >
              <LogOut style={{ width: '13px', height: '13px' }} />
              <span>Log Out</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)', border: 'none',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '14px', fontWeight: 800,
                transition: 'background 0.2s'
              }}
              title="Close Onboarding"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Step Checklist Progress Bar ── */}
      {!saved && (
        <div style={{ width: '100%', maxWidth: '560px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {STEPS.map((s, idx) => {
              const isDone = step > s.num;
              const isActive = step === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    opacity: isDone || isActive ? 1 : 0.45,
                    transition: 'opacity 0.3s ease',
                    flex: '0 0 auto',
                  }}>
                    <div style={{
                      width: isActive ? '32px' : '28px',
                      height: isActive ? '32px' : '28px',
                      borderRadius: '50%',
                      background: isDone ? '#FFD700' : isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                      border: isActive ? '3px solid #fff' : isDone ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 0 4px rgba(255,255,255,0.2)' : 'none',
                    }}>
                      {isDone ? (
                        <Check style={{ width: '13px', height: '13px', color: '#0B6B2B' }} />
                      ) : (
                        <span style={{ fontSize: isActive ? '14px' : '12px' }}>{s.emoji}</span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '8.5px', fontWeight: isActive ? 900 : 700,
                      color: isActive ? '#fff' : isDone ? '#FFD700' : 'rgba(255,255,255,0.6)',
                      whiteSpace: 'nowrap',
                    }}>{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: '2px',
                      background: step > s.num ? '#FFD700' : 'rgba(255,255,255,0.2)',
                      borderRadius: '1px',
                      transition: 'background 0.4s ease',
                      marginBottom: '14px',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Card ── */}
      <div style={{
        background: '#fff',
        borderRadius: '28px',
        width: '100%', maxWidth: '560px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
        maxHeight: '76vh',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>

        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '36px 32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px',
              background: 'linear-gradient(135deg, #EAF7EE, #D1FAE5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
            }}>👋</div>
            <div>
              <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 900, color: '#111', lineHeight: 1.2 }}>
                Welcome, {currentUser?.name?.split(' ')[0] || 'Merchant'}!
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: 1.7, maxWidth: '380px' }}>
                You're just <strong>2 minutes</strong> away from listing your shop on <strong>GrowLocal</strong> and reaching thousands of local customers nearby.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '400px' }}>
              {[
                { icon: TrendingUp, label: 'Real-Time Demand', desc: 'See what customers want', color: '#138A36' },
                { icon: Users,      label: 'Direct Connect',   desc: 'Chat & convert visitors',  color: '#7C3AED' },
                { icon: Package,    label: 'Product Catalog',  desc: 'List & sell anything',     color: '#2563EB' },
                { icon: ShieldCheck,label: 'Verified Badge',   desc: 'Build instant trust',      color: '#D97706' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '16px 14px', borderRadius: '16px',
                  background: '#FAFAFA', border: '1.5px solid #F0F0F0',
                  textAlign: 'left',
                }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '16px', height: '16px', color }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#111' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '10.5px', color: '#888', marginTop: '2px' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Shop Type ── */}
        {step === 2 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '28px 28px 12px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#111' }}>What kind of shop are you? 🏷️</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Pick your primary category — this helps customers find you faster.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
                      boxShadow: isSelected ? `0 6px 16px ${cat.color}35` : '0 1px 4px rgba(0,0,0,0.04)',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check style={{ width: '10px', height: '10px', color: '#fff' }} />
                      </div>
                    )}
                    <img
                      src={cat.iconUrl} alt={cat.label}
                      style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))', transition: 'transform 0.2s', transform: isSelected ? 'scale(1.1)' : 'scale(1)' }}
                      onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; }}
                    />
                    <span style={{ display: 'none', fontSize: '24px', lineHeight: 1 }}>{cat.emoji}</span>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: isSelected ? cat.color : '#333', textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Identity ── */}
        {step === 3 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '28px 32px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#111' }}>Name your shop 🏪</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>This is the name customers will see when they search for you.</p>
            </div>
            {selectedCat && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: selectedCat.bg, borderRadius: '14px', border: `1.5px solid ${selectedCat.color}30` }}>
                <img src={selectedCat.iconUrl} alt={selectedCat.label} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: selectedCat.color }}>{selectedCat.label}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>Category selected ✓</p>
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop / Business Name *</label>
              <div style={{ position: 'relative' }}>
                <Store style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#aaa' }} />
                <input
                  type="text" required autoFocus
                  placeholder="e.g. Trendy Wear Nagpur"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: '40px', paddingRight: '16px',
                    paddingTop: '13px', paddingBottom: '13px',
                    background: '#F8FAF8', border: shopName ? '2px solid #138A36' : '2px solid #E5E7E5',
                    borderRadius: '14px', fontSize: '14px', fontWeight: 600, color: '#111',
                    outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City *</label>
                <input
                  type="text" required
                  placeholder="e.g. Nagpur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#F8FAF8', border: city ? '2px solid #138A36' : '2px solid #E5E7E5',
                    borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area / Street</label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#aaa' }} />
                  <input
                    type="text"
                    placeholder="e.g. Sitabuldi Market"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%', paddingLeft: '32px', paddingRight: '10px',
                      paddingTop: '12px', paddingBottom: '12px',
                      background: '#F8FAF8', border: '2px solid #E5E7E5',
                      borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Hours & Price ── */}
        {step === 4 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '28px 32px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#111' }}>When are you open? 🕐</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Pick your regular hours — customers see this on your shop profile.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Opening Hours</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {HOUR_OPTIONS.map(h => {
                  const isSelected = openHours === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setOpenHours(h)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '14px', cursor: 'pointer',
                        border: isSelected ? '2px solid #138A36' : '2px solid #EEEEEE',
                        background: isSelected ? '#EAF7EE' : '#FAFAFA',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: isSelected ? '#138A36' : '#aaa' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#138A36' : '#333' }}>{h}</span>
                      </div>
                      {isSelected && <Check style={{ width: '14px', height: '14px', color: '#138A36' }} />}
                    </button>
                  );
                })}
              </div>
              {openHours === 'Custom Hours' && (
                <input
                  type="text" autoFocus
                  placeholder="e.g. 7:00 AM – 11:30 PM"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  style={{
                    marginTop: '10px', width: '100%', padding: '12px 16px',
                    background: '#F8FAF8', border: '2px solid #138A36',
                    borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Range (₹) — optional</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="number" min="0" placeholder="Min e.g. 299"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  style={{ padding: '12px 14px', background: '#F8FAF8', border: '2px solid #E5E7E5', borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                />
                <input
                  type="number" min="0" placeholder="Max e.g. 9999"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  style={{ padding: '12px 14px', background: '#F8FAF8', border: '2px solid #E5E7E5', borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Photo ── */}
        {step === 5 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '28px 32px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#111' }}>Show off your shop! 📸</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>A great photo increases customer clicks by 3×. You can always change this later.</p>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover Photo</span>
              <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} style={{ fontSize: '10px', fontWeight: 700, color: '#138A36', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showUrlInput ? '← Upload from device' : 'Or paste image URL'}
              </button>
            </div>
            {!showUrlInput ? (
              <div>
                {!coverImageUrl || previewError ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{
                      border: isDragging ? '2px dashed #138A36' : '2px dashed #D1D5DB',
                      background: isDragging ? '#EAF7EE' : '#F9FAFB',
                      borderRadius: '18px', padding: '30px 16px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#EAF7EE', color: '#138A36', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload style={{ width: '24px', height: '24px' }} />
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#111' }}>Upload from your device</p>
                    <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#888' }}>Drag & drop or click to browse (PNG, JPG up to 10MB)</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: '#fff', border: '1.5px solid #138A36', color: '#138A36', borderRadius: '12px', fontSize: '12px', fontWeight: 800, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <Camera style={{ width: '14px', height: '14px' }} />
                      <span>Choose Image File</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', border: '2px solid #138A36', boxShadow: '0 4px 12px rgba(19,138,54,0.15)' }}>
                    <img src={coverImageUrl} alt="Shop Cover" onError={() => setPreviewError(true)} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '12px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFileName || 'Shop Cover'}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '8px', fontSize: '10px', fontWeight: 800, color: '#111', cursor: 'pointer' }}>
                          <RefreshCw style={{ width: '10px', height: '10px', color: '#138A36' }} /> Change
                        </button>
                        <button type="button" onClick={() => { setCoverImageUrl(''); setUploadedFileName(''); }} style={{ padding: '5px 8px', background: '#DC2626', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 style={{ width: '11px', height: '11px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '12px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: '#888' }}>Or pick a sample cover:</p>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {SAMPLE_COVERS.map(s => (
                      <button key={s.label} type="button" onClick={() => { setCoverImageUrl(s.url); setUploadedFileName(s.label); setPreviewError(false); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', background: '#F0F2F0', border: '1px solid #E5E7E5', color: '#444', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <ImageIcon style={{ width: '10px', height: '10px', color: '#138A36' }} /> {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative' }}>
                  <ImageIcon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#aaa' }} />
                  <input type="url" placeholder="https://... paste image URL" value={coverImageUrl} onChange={(e) => { setCoverImageUrl(e.target.value); setPreviewError(false); }}
                    style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', background: '#F8FAF8', border: '2px solid #E5E7E5', borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {coverImageUrl && !previewError && (
                  <img src={coverImageUrl} alt="preview" onError={() => setPreviewError(true)} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', marginTop: '8px', border: '2px solid #E5E7E5' }} />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 6: About ── */}
        {step === 6 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '28px 32px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#111' }}>Tell your story 📝</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>A great description builds trust and makes customers want to visit. Keep it real and personal.</p>
            </div>
            {shopName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#EAF7EE', borderRadius: '14px', border: '1.5px solid #CDEED5' }}>
                {selectedCat && <img src={selectedCat.iconUrl} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />}
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#111' }}>{shopName}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#138A36', fontWeight: 700 }}>{selectedCat?.label || 'Local Business'} · {city}</p>
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#111', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Your Shop</label>
              <textarea
                rows={5}
                placeholder="What makes your shop special? What do you sell? Do you have any ongoing offers? Tell your customers why they should visit!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#F8FAF8', border: description ? '2px solid #138A36' : '2px solid #E5E7E5',
                  borderRadius: '16px', fontSize: '13px', fontWeight: 500, color: '#111',
                  outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.7,
                  transition: 'border 0.2s',
                }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#aaa', textAlign: 'right' }}>{description.length} / 300</p>
            </div>
            <div style={{ background: '#F8FAF8', borderRadius: '14px', padding: '14px 16px', border: '1.5px solid #E5E7E5' }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 800, color: '#555' }}>💡 Tips for a great description:</p>
              {[
                'Mention what you specialize in (e.g., "branded shoes at best prices")',
                'Add any offers or seasonal discounts',
                'Tell customers your USP — what makes you different',
              ].map(tip => (
                <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
                  <Star style={{ width: '10px', height: '10px', color: '#FFD700', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '11px', color: '#777' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 7: Go Live! ── */}
        {step === 7 && !saved && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '28px 32px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>🚀</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#111' }}>You're all set!</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.6 }}>Review your shop details below. Once you hit <strong>Go Live</strong>, your shop will be instantly visible to thousands of nearby customers.</p>
            </div>
            <div style={{ background: '#F8FAF8', borderRadius: '20px', border: '1.5px solid #E5E7E5', overflow: 'hidden' }}>
              {coverImageUrl && (
                <img src={coverImageUrl} alt="Shop Cover" style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
              )}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#111' }}>{shopName}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#138A36', fontWeight: 700, marginTop: '2px' }}>{selectedCat?.label || 'Local Business'} · {city}</p>
                  </div>
                  {selectedCat && <img src={selectedCat.iconUrl} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />}
                </div>
                {[
                  { label: '📍 Address', value: address ? `${address}, ${city}` : city },
                  { label: '🕐 Hours', value: finalHours },
                  { label: '💰 Price Range', value: priceMin && priceMax ? `₹${priceMin} – ₹${priceMax}` : 'Not specified' },
                  { label: '📝 About', value: description || 'No description added' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#555', minWidth: '90px', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: '11px', color: '#333', lineHeight: 1.5 }}>{row.value.length > 80 ? row.value.slice(0, 80) + '…' : row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { emoji: '✓', text: 'Visible on Customer Home' },
                { emoji: '✓', text: 'Searchable by category' },
                { emoji: '✓', text: 'Customers can send enquiries' },
              ].map(item => (
                <div key={item.text} style={{ flex: 1, padding: '10px 8px', background: '#EAF7EE', borderRadius: '12px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#138A36' }}>
                  {item.emoji} {item.text}
                </div>
              ))}
            </div>
            {saveError && (
              <p style={{ margin: 0, padding: '10px 12px', borderRadius: '12px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 700 }}>
                {saveError}
              </p>
            )}
          </div>
        )}

        {/* ── SUCCESS STATE ── */}
        {saved && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center', gap: '18px', position: 'relative', overflow: 'hidden' }}>
            <ConfettiBurst />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #EAF7EE, #D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #138A36', animation: 'pop 0.4s ease-out' }}>
                <CheckCircle2 style={{ width: '48px', height: '48px', color: '#138A36' }} />
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#111' }}>🎉 {shopName} is LIVE!</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.7 }}>Your shop is now visible to customers across <strong>{city}</strong>. Opening your Merchant Dashboard…</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['🟢 Shop is Live', '📦 Add Products', '💬 Get Enquiries'].map(t => (
                  <div key={t} style={{ padding: '8px 12px', background: '#EAF7EE', borderRadius: '10px', fontSize: '10px', fontWeight: 800, color: '#138A36' }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer Navigation ── */}
        {!saved && (
          <div style={{ padding: '16px 28px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: '10px', flexShrink: 0 }}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 20px', background: '#F5F5F5', color: '#444', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
              </button>
            )}
            {step < 7 ? (
              <button
                onClick={() => stepValid() && setStep(s => s + 1)}
                disabled={!stepValid()}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px',
                  background: stepValid() ? 'linear-gradient(135deg, #138A36, #1aad44)' : '#E5E7E5',
                  color: stepValid() ? '#fff' : '#aaa',
                  border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 800,
                  cursor: stepValid() ? 'pointer' : 'not-allowed',
                  boxShadow: stepValid() ? '0 4px 16px rgba(19,138,54,0.35)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span>{step === 1 ? "Let's Start! →" : step === 6 ? 'Preview My Shop →' : 'Continue →'}</span>
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #138A36, #1aad44)',
                  color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 900,
                  cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 6px 20px rgba(19,138,54,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>{saving ? 'Publishing your shop…' : '🚀 Go Live on GrowLocal!'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
