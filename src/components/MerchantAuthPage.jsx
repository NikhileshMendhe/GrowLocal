import React, { useState } from 'react';
import {
  Store, Mail, Lock, User, ArrowRight, CheckCircle2,
  Key, Eye, EyeOff, ShieldCheck, TrendingUp,
  Users, Package, X
} from 'lucide-react';
import { authService } from '../services/authService';

const FEATURES = [
  { icon: TrendingUp, title: 'Real-Time Demand Insights', desc: 'See exactly what customers near you are searching for' },
  { icon: Users, title: 'Direct Customer Connect', desc: 'Chat, quote, and convert enquiries into store visits' },
  { icon: Package, title: 'Product Catalogue', desc: 'Showcase your inventory and let customers reserve items' },
  { icon: ShieldCheck, title: 'Verified Badge', desc: 'Build trust with GrowLocal verification on your listing' },
];

export default function MerchantAuthPage({ onLoginSuccess, onSwitchToCustomer }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState('email');
  const [step, setStep] = useState('form'); // form | otp

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (authMethod === 'phone') {
      if (step === 'form') {
        const { error } = await authService.signInWithPhoneOtp(phone);
        setLoading(false);
        if (error) { setErrorMsg(error.message || 'Failed to send OTP.'); return; }
        setStep('otp');
        return;
      }
      const { data, error } = await authService.verifyPhoneOtp(phone, otpToken);
      setLoading(false);
      if (error) { setErrorMsg(error.message || 'Invalid OTP.'); return; }
      onLoginSuccess({
        role: 'merchant',
        name: shopName || data?.user?.name || 'My Store',
        phone,
        email: data?.user?.email || `${phone.replace(/\D/g, '')}@growlocal.in`,
        shopName: shopName || 'My Store',
      });
      return;
    }

    if (isSignUp) {
      const { data, error } = await authService.signUp({
        email, password,
        fullName: ownerName || shopName || email.split('@')[0] || 'Merchant',
        role: 'merchant',
      });
      setLoading(false);
      if (error) { setErrorMsg(error.message || 'Failed to create account.'); return; }
      onLoginSuccess({
        role: 'merchant',
        name: ownerName || email.split('@')[0],
        email,
        shopName: shopName || ownerName || email.split('@')[0],
      });
    } else {
      let res = await authService.login({ email, password, targetRole: 'merchant' });
      // If no account exists yet, automatically create merchant account seamlessly
      if (res.error && res.error.message && res.error.message.toLowerCase().includes('no account found')) {
        res = await authService.signUp({
          email, password,
          fullName: email.split('@')[0],
          role: 'merchant',
        });
      }
      setLoading(false);
      if (res.error) { 
        setErrorMsg(res.error.message || 'Invalid email or password.'); 
        return; 
      }
      const displayName = res.data?.profile?.full_name || res.data?.user?.email?.split('@')[0] || email.split('@')[0];
      onLoginSuccess({
        role: 'merchant',
        name: displayName,
        email,
        shopName: displayName,
      });
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Brand Panel */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B6B2B 0%, #138A36 55%, #1aad44 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-10 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-5 h-5 text-[#138A36]" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight tracking-tight">GrowLocal</p>
              <p className="text-green-200 text-[10px] font-semibold tracking-widest uppercase">Merchant Portal</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Grow Your<br />
              <span className="text-green-200">Local Business</span><br />
              Digitally.
            </h1>
            <p className="text-green-100 text-sm mt-4 leading-relaxed max-w-xs">
              Join 2,400+ local merchants who use GrowLocal to get discovered,
              respond to demand, and convert nearby customers into loyal buyers.
            </p>
          </div>
          <div className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{title}</p>
                  <p className="text-green-200 text-[11px] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {[{ v: '2,400+', l: 'Merchants' }, { v: '78%', l: 'Conversion Rate' }, { v: '₹4.2Cr', l: 'Revenue Generated' }].map(({ v, l }) => (
            <div key={l}>
              <p className="text-white text-xl font-black">{v}</p>
              <p className="text-green-200 text-[10px] font-semibold">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#F7F8F7] p-6 sm:p-12 relative">
        <button
          onClick={onSwitchToCustomer}
          className="absolute top-5 right-5 flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#138A36] font-bold transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Exit to Customer App
        </button>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-[#138A36] rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-[#111111] text-base leading-tight">GrowLocal</p>
              <p className="text-[#138A36] text-[9px] font-bold tracking-widest uppercase">Merchant Portal</p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-black text-[#111111]">
              {isSignUp ? 'Register Your Business' : 'Merchant Portal Login'}
            </h2>
            <p className="text-[#666666] text-xs mt-1.5">
              {isSignUp
                ? 'Create your merchant account and go live on GrowLocal today.'
                : 'Enter your email and password to access your Merchant Portal.'}
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex bg-white border border-[#E5E7E5] rounded-xl p-1 mb-5 gap-1">
            {[{ id: 'email', label: 'Email & Password', icon: Mail }, { id: 'phone', label: 'Mobile OTP', icon: Key }].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setAuthMethod(id); setStep('form'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  authMethod === id ? 'bg-[#138A36] text-white shadow-sm' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'form' ? (
              <>
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">Business / Shop Name *</label>
                      <div className="relative">
                        <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="text" required
                          placeholder="e.g. Trendy Wear Nagpur"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">Owner / Manager Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="text" required
                          placeholder="e.g. Rahul Sharma"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                        />
                      </div>
                    </div>
                  </>
                )}

                {authMethod === 'email' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type="email" required
                          placeholder="merchant@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                        <input
                          type={showPassword ? 'text' : 'password'} required
                          placeholder="••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#138A36]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1.5">Mobile Number *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#666]">+91</span>
                      <input
                        type="tel" required
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#138A36] hover:bg-[#0B6B2B] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm mt-2"
                >
                  <span>{loading ? 'Entering Portal...' : isSignUp ? 'Create Account & Enter Portal' : 'Enter Merchant Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#EAF7EE] border border-[#DDF3E3] rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-[#138A36]">OTP sent to +91 {phone}</p>
                  <p className="text-[11px] text-[#666] mt-1">Demo OTP: 4321</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1.5">Enter OTP *</label>
                  <input
                    type="text" required
                    placeholder="e.g. 4321"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E5E7E5] rounded-xl text-sm text-center font-mono font-bold text-[#111111] focus:outline-none focus:border-[#138A36]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#138A36] hover:bg-[#0B6B2B] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Dashboard'}</span>
                </button>
                <button type="button" onClick={() => setStep('form')} className="w-full text-xs text-[#666] hover:text-[#138A36] font-bold py-1">
                  ← Back
                </button>
              </div>
            )}

            <div className="text-center pt-2 space-y-2">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setStep('form'); }}
                className="text-xs text-[#138A36] hover:underline font-bold"
              >
                {isSignUp ? 'Already registered? Sign In instead' : 'New merchant? Create a free account'}
              </button>
              {isSignUp && (
                <p className="text-[10px] text-[#999] max-w-xs mx-auto">
                  By registering, you agree to GrowLocal's Vendor Terms & Conditions.
                </p>
              )}
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E7E5] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#138A36]" />
            <p className="text-[11px] text-[#999] font-semibold">Secure login · SSL encrypted · No hidden charges</p>
          </div>
        </div>
      </div>
    </div>
  );
}
