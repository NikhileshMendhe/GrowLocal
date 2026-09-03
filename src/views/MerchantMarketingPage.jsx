import React, { useState, useEffect } from 'react';
import {
  Store, TrendingUp, Users, MessageSquare, ShieldCheck, Zap,
  ArrowRight, CheckCircle2, Star, MapPin, Package, BarChart2,
  Clock, DollarSign, Eye, Bell, ChevronDown, ChevronRight,
  Smartphone, Globe, Award, Sparkles, X, Play
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────────── */
const STATS = [
  { value: '2,400+', label: 'Active Merchants', icon: Store },
  { value: '₹4.2 Cr', label: 'Revenue Generated', icon: DollarSign },
  { value: '78%', label: 'Enquiry Conversion', icon: TrendingUp },
  { value: '3 Min', label: 'Avg. Response Time', icon: Clock },
];

const BENEFITS = [
  {
    icon: Eye,
    color: 'bg-blue-50 text-blue-600',
    title: 'Get Discovered First',
    desc: 'Appear at the top of search results when nearby customers look for products you sell. No ad spend needed — your listing does the work.',
  },
  {
    icon: Bell,
    color: 'bg-amber-50 text-amber-600',
    title: 'Real-Time Demand Alerts',
    desc: 'Get instant notifications when customers near your area search for products in your category. Be the first to respond and win the sale.',
  },
  {
    icon: MessageSquare,
    color: 'bg-purple-50 text-purple-600',
    title: 'Direct Chat & Quotes',
    desc: 'Chat directly with interested buyers, send custom price quotes, and close deals — all without leaving your dashboard.',
  },
  {
    icon: Package,
    color: 'bg-green-50 text-green-600',
    title: 'Product Reservation System',
    desc: 'Customers can reserve items online and pick them up in-store. No delivery headache, guaranteed foot traffic, zero returns hassle.',
  },
  {
    icon: BarChart2,
    color: 'bg-rose-50 text-rose-600',
    title: 'Demand Intelligence',
    desc: 'See exactly what\'s being searched in your locality — daily, weekly, monthly. Stock what sells, never miss trending demand.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-teal-50 text-teal-600',
    title: 'Verified Merchant Badge',
    desc: 'Get GrowLocal-verified status that boosts customer trust, improves your search ranking, and increases your conversion rate.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Free Listing',
    desc: 'Sign up, add your shop name, category, address, and photos. Go live in under 5 minutes. No technical skills required.',
    color: 'from-[#138A36] to-[#1aad44]',
  },
  {
    step: '02',
    title: 'Receive Customer Enquiries',
    desc: 'When customers nearby search for what you sell, your shop appears. They send you enquiries or reserve products directly.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '03',
    title: 'Chat & Quote Instantly',
    desc: 'Respond in real-time via the chat dashboard. Send custom price quotes, share product photos, and confirm availability.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    step: '04',
    title: 'Customer Visits & Buys',
    desc: 'The customer walks into your store with a reservation code. You scan it, complete the sale, and track your revenue growth.',
    color: 'from-amber-500 to-orange-500',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    shop: 'Trendy Wear, Sitabuldi',
    avatar: 'RS',
    rating: 5,
    quote: 'Within 2 weeks of joining GrowLocal, I had 40+ enquiries and 18 confirmed store visits. My monthly sales jumped by 32%. This is the best thing to happen to my shop.',
    metric: '+32% Sales',
    metricColor: 'text-[#138A36]',
  },
  {
    name: 'Priya Deshmukh',
    shop: 'Arya Jewellers, Dharampeth',
    avatar: 'PD',
    rating: 5,
    quote: 'Customers would walk in saying "I found you on GrowLocal." That never happened before. The reservation feature is brilliant — customers are more committed when they pre-reserve.',
    metric: '60+ Reservations/mo',
    metricColor: 'text-blue-600',
  },
  {
    name: 'Vijay Rao',
    shop: 'TechZone Mobile, Laxmi Nagar',
    avatar: 'VR',
    rating: 5,
    quote: 'The demand intelligence feature showed me that people near my shop were searching for phone cases daily but finding nothing locally. I stocked up and sold out in a week.',
    metric: 'Stock Sold in 7 Days',
    metricColor: 'text-purple-600',
  },
];

const COMPARISON = [
  { feature: 'Customer Reach', growlocal: true, offline: false, instagram: 'partial' },
  { feature: 'Real-Time Demand Insights', growlocal: true, offline: false, instagram: false },
  { feature: 'Direct Customer Chat', growlocal: true, offline: false, instagram: 'partial' },
  { feature: 'Product Reservation System', growlocal: true, offline: false, instagram: false },
  { feature: 'Verified Business Badge', growlocal: true, offline: false, instagram: false },
  { feature: 'Analytics & Reporting', growlocal: true, offline: false, instagram: 'partial' },
  { feature: 'Cost', growlocal: 'Free to start', offline: 'High overhead', instagram: 'Paid ads' },
];

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/ month',
    badge: 'Free Forever',
    badgeColor: 'bg-[#EAF7EE] text-[#138A36]',
    color: 'border-[#E5E7E5]',
    headerBg: 'bg-white',
    features: ['Live shop listing', 'Up to 20 products', 'Customer enquiries', 'Basic analytics', 'GrowLocal verified badge'],
    cta: 'Get Started Free',
    ctaStyle: 'bg-[#138A36] text-white hover:bg-[#0B6B2B]',
    popular: false,
  },
  {
    name: 'Growth',
    price: '₹999',
    period: '/ month',
    badge: 'Most Popular',
    badgeColor: 'bg-[#138A36] text-white',
    color: 'border-[#138A36] ring-2 ring-[#138A36]/20',
    headerBg: 'bg-gradient-to-br from-[#138A36] to-[#1aad44]',
    features: ['Everything in Starter', 'Unlimited products', 'Priority in search results', 'Demand intelligence alerts', 'Custom offer quotes', 'Creator campaign access', 'Priority support'],
    cta: 'Start 14-Day Free Trial',
    ctaStyle: 'bg-white text-[#138A36] hover:bg-[#EAF7EE] border-2 border-[#138A36]',
    popular: true,
  },
  {
    name: 'Pro',
    price: '₹2,499',
    period: '/ month',
    badge: 'Max Power',
    badgeColor: 'bg-purple-100 text-purple-700',
    color: 'border-purple-200',
    headerBg: 'bg-white',
    features: ['Everything in Growth', 'Featured homepage placement', 'Dedicated account manager', 'Multi-location support', 'API access & integrations', 'Custom branding', 'Revenue reports & exports'],
    cta: 'Contact Sales',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700',
    popular: false,
  },
];

const FAQS = [
  { q: 'Is it really free to list my shop?', a: 'Yes. The Starter plan is completely free — no credit card, no hidden fees. List your shop, add products, and start receiving customer enquiries today.' },
  { q: 'How quickly can I go live?', a: 'Most merchants are live within 5 minutes. Just fill your shop name, category, address, and a photo. Your listing goes live immediately on the Customer Home.' },
  { q: 'Do I need to deliver products to customers?', a: 'No! GrowLocal is a discovery and reservation platform. Customers find you, reserve products, and come to your store. You keep the in-store experience — we just drive the foot traffic.' },
  { q: 'How does the reservation system work?', a: 'Customers reserve an item via the app and receive a unique QR code. They bring it to your store, you scan or note the code, and complete the sale as usual. Simple.' },
  { q: 'What kind of shops can join?', a: 'Any local retail business — clothing, electronics, jewellery, groceries, footwear, home goods, mobile accessories, optical, health & wellness, and more. If you sell it in-store, you belong on GrowLocal.' },
];

/* ─── COMPONENT ─────────────────────────────────────────────── */
export default function MerchantMarketingPage({ onJoinAsMerchant, onSwitchToCustomer }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const Cell = ({ val }) => {
    if (val === true) return <CheckCircle2 className="w-5 h-5 text-[#138A36] mx-auto" />;
    if (val === false) return <X className="w-4 h-4 text-gray-300 mx-auto" />;
    if (val === 'partial') return <span className="text-xs font-bold text-amber-500 mx-auto block text-center">Partial</span>;
    return <span className="text-xs font-semibold text-[#666] block text-center">{val}</span>;
  };

  return (
    <div className="font-sans overflow-x-hidden">

      {/* ── NAV BAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E7E5] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#138A36] rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-[#111111] text-sm">GrowLocal</span>
            <span className="text-[#138A36] text-[9px] font-bold tracking-widest uppercase block leading-none">For Merchants</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToCustomer}
            className="text-xs text-[#666] font-semibold hover:text-[#138A36] transition-colors hidden sm:block"
          >
            I'm a Shopper →
          </button>
          <button
            onClick={onJoinAsMerchant}
            className="bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            List My Shop
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20"
        style={{ background: 'linear-gradient(135deg, #0B6B2B 0%, #138A36 45%, #1aad44 80%, #22c55e 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Nagpur's #1 Local Commerce Platform for Merchants
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Turn Local Demand<br />
            Into <span className="text-yellow-300">Real Sales.</span>
          </h1>

          <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto leading-relaxed">
            2,400+ local merchants use GrowLocal to get discovered by nearby customers,
            receive instant enquiries, and drive foot traffic to their stores — for free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onJoinAsMerchant}
              className="group w-full sm:w-auto bg-white text-[#138A36] hover:bg-yellow-300 hover:text-[#0B6B2B] font-black text-base px-10 py-4 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              List My Shop
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onSwitchToCustomer}
              className="w-full sm:w-auto text-white border-2 border-white/40 hover:border-white hover:bg-white/10 font-bold text-base px-8 py-4 rounded-2xl transition-all backdrop-blur-sm flex items-center justify-center gap-2"
            >
              I'm Shopping Instead
            </button>
          </div>

          <p className="text-green-200 text-sm">No credit card · No commission · No delivery required</p>

          {/* Hero Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <Icon className="w-5 h-5 text-yellow-300 mx-auto mb-1.5" />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-green-200 text-[11px] font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ── */}
      <div className="bg-[#111111] py-3 overflow-hidden">
        <div className="flex gap-12 animate-pulse whitespace-nowrap text-xs font-bold text-gray-400 px-8">
          {['🏪 Trendy Wear just got 8 enquiries', '💬 Customer reserved Nike shoes at Shoe Palace', '📈 TechZone sales up 45% this month', '🎯 Arya Jewellers: 12 walk-ins from GrowLocal today', '🔥 Sitabuldi area: 240 product searches today'].map((t, i) => (
            <span key={i} className="shrink-0">{t}</span>
          ))}
        </div>
      </div>

      {/* ── WHY GROWLOCAL IS DIFFERENT ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EAF7EE] text-[#138A36] text-xs font-black px-4 py-1.5 rounded-full mb-4">Why GrowLocal</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111111] leading-tight">
              Your shop, in front of<br />
              <span className="text-[#138A36]">the right customers.</span>
            </h2>
            <p className="text-[#666] text-lg mt-4 max-w-xl mx-auto">Not followers. Not algorithms. Real buyers walking down your street who are actively searching for what you sell.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group bg-white border border-[#E5E7E5] rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[#111111] mb-2">{title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-[#F7F8F7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#111111] text-white text-xs font-black px-4 py-1.5 rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111111]">
              From listing to first sale<br />
              <span className="text-[#138A36]">in under an hour.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, color }, i) => (
              <div key={step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#E5E7E5] to-transparent z-0" />
                )}
                <div className="relative bg-white rounded-3xl p-6 border border-[#E5E7E5] hover:shadow-lg transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 text-white font-black text-lg shadow-lg`}>
                    {step}
                  </div>
                  <h3 className="font-black text-[#111111] text-base mb-2">{title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={onJoinAsMerchant}
              className="bg-[#138A36] hover:bg-[#0B6B2B] text-white font-black text-base px-10 py-4 rounded-2xl transition-all shadow-lg inline-flex items-center gap-2 group"
            >
              Start Your Free Listing Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EAF7EE] text-[#138A36] text-xs font-black px-4 py-1.5 rounded-full mb-4">GrowLocal vs Others</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111111]">
              Stop depending on<br />
              <span className="text-[#138A36]">platforms that don't know your city.</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-[#E5E7E5] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7E5]">
                  <th className="text-left p-5 font-bold text-[#666] bg-[#F7F8F7]">Feature</th>
                  <th className="p-5 text-center bg-[#138A36]/5">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-7 h-7 bg-[#138A36] rounded-lg flex items-center justify-center"><Store className="w-4 h-4 text-white" /></span>
                      <span className="font-black text-[#138A36] text-xs">GrowLocal</span>
                    </div>
                  </th>
                  <th className="p-5 text-center bg-[#F7F8F7]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">🏪</span>
                      <span className="font-black text-gray-500 text-xs">Offline Only</span>
                    </div>
                  </th>
                  <th className="p-5 text-center bg-[#F7F8F7]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 text-xs">📸</span>
                      <span className="font-black text-gray-500 text-xs">Instagram</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-[#F0F0F0] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                    <td className="p-4 font-semibold text-[#333] text-sm">{row.feature}</td>
                    <td className="p-4 bg-[#138A36]/5"><Cell val={row.growlocal} /></td>
                    <td className="p-4"><Cell val={row.offline} /></td>
                    <td className="p-4"><Cell val={row.instagram} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        className="py-24 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B6B2B 0%, #138A36 60%, #1aad44 100%)' }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/15 text-white text-xs font-black px-4 py-1.5 rounded-full mb-4 border border-white/20">Real Merchant Stories</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Merchants who grew<br />with GrowLocal.
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-10">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`transition-all duration-500 ${i === activeTestimonial ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-black text-white text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-black text-white text-sm">{t.name}</p>
                      <p className="text-green-200 text-xs">{t.shop}</p>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${t.metricColor} bg-white px-4 py-1.5 rounded-full`}>{t.metric}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`transition-all rounded-full ${i === activeTestimonial ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-4 bg-[#F7F8F7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#111111] text-white text-xs font-black px-4 py-1.5 rounded-full mb-4">Pricing</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111111]">
              Start free.<br />
              <span className="text-[#138A36]">Scale when you're ready.</span>
            </h2>
            <p className="text-[#666] mt-4 max-w-md mx-auto">No hidden fees, no commission on sales. Pay only for growth tools when you need them.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border-2 ${plan.color} bg-white overflow-hidden flex flex-col ${plan.popular ? 'shadow-2xl scale-[1.02]' : 'shadow-sm'} transition-all`}
              >
                {/* Header */}
                <div className={`${plan.popular ? plan.headerBg : 'bg-[#F7F8F7]'} p-6`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-[#111111] text-lg">{plan.name}</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-[#111111]'}`}>{plan.price}</span>
                    <span className={`text-sm font-semibold pb-1 ${plan.popular ? 'text-green-100' : 'text-[#666]'}`}>{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 flex-1 space-y-3">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#333] font-medium">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  <button
                    onClick={onJoinAsMerchant}
                    className={`w-full font-bold text-sm py-3.5 rounded-xl transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#EAF7EE] text-[#138A36] text-xs font-black px-4 py-1.5 rounded-full mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">Questions from merchants like you.</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-[#E5E7E5] rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[#F7F8F7] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-[#111111] text-sm">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#138A36] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-[#666] leading-relaxed border-t border-[#F0F0F0] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="py-28 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B6B2B 0%, #138A36 50%, #22c55e 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            2,400+ merchants already growing with GrowLocal
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
            Your next customer<br />
            is <span className="text-yellow-300">already searching.</span>
          </h2>
          <p className="text-green-100 text-lg max-w-xl mx-auto">
            Don't let them find your competitor instead. List your shop for free and start capturing local demand today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onJoinAsMerchant}
              className="group w-full sm:w-auto bg-white text-[#138A36] hover:bg-yellow-300 hover:text-[#0B6B2B] font-black text-lg px-12 py-5 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              List My Shop — Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onSwitchToCustomer}
              className="text-white/70 hover:text-white text-sm font-semibold underline underline-offset-4 transition-colors"
            >
              Just browsing as a customer →
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-4">
            {['No credit card', 'No commission', 'Go live in 5 min'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-green-100 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111111] py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#138A36] rounded-lg flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-white text-sm">GrowLocal</span>
            <span className="text-gray-500 text-xs">For Merchants</span>
          </div>
          <p className="text-gray-500 text-xs text-center">
            © 2026 GrowLocal · Find Local. Buy Local. Grow Local.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={onSwitchToCustomer} className="text-gray-400 hover:text-white text-xs transition-colors">Customer App</button>
            <button onClick={onJoinAsMerchant} className="bg-[#138A36] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#0B6B2B] transition-colors">Join as Merchant</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
