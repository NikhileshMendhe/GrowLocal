import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Store, User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ initialMode = 'login' }) {
  const { user, status, login, signup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupPath = location.pathname === '/signup' || location.pathname === '/register';
  const [mode, setMode] = useState(isSignupPath ? 'signup' : initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode with URL
  useEffect(() => {
    if (isSignupPath) {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname, isSignupPath]);

  function switchMode(newMode) {
    setMode(newMode);
    setError(null);
    if (newMode === 'signup') {
      navigate('/signup', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated' && user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signup') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (phone.replace(/\D/g, '').length < 10) {
          throw new Error('Please enter a valid 10-digit phone number');
        }
        await signup({
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || (mode === 'signup' ? 'Signup failed' : 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-col items-center justify-center p-4 selection:bg-[#EAF7EE] selection:text-[#138A36]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">GrowLocal</h1>
          <p className="text-sm font-medium text-[#666666]">Merchant Portal & Console</p>
        </div>

        <div className="bg-white border border-[#E5E7E5] rounded-3xl shadow-xl p-6 sm:p-7 flex flex-col gap-5">
          {/* Top Segmented Switch: Sign In vs Register Store */}
          <div className="flex bg-[#F1F3F1] p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Register Store (Sign Up)
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#111111]">
              {mode === 'signup' ? 'Create Merchant Account' : 'Merchant Portal Login'}
            </h2>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              {mode === 'signup'
                ? 'Register your local store to list inventory, receive customer enquiries, and accept orders.'
                : 'Sign in to access your shop dashboard, live chats, and order dispatch.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#111111]">Store / Business Name *</span>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#999999] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      placeholder="e.g. Nagpur Electronics & Goods"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE] transition-all"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#111111]">Owner / Contact Name *</span>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#999999] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={ownerName}
                      onChange={(event) => setOwnerName(event.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE] transition-all"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#111111]">Mobile / WhatsApp Number *</span>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#999999] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE] transition-all"
                    />
                  </div>
                </label>
              </>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#111111]">Email Address *</span>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#999999] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="merchant@store.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE] transition-all"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#111111]">Password *</span>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#999999] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#999999] hover:text-[#333333] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5">
                <p className="text-xs font-semibold text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-1 rounded-xl bg-brand hover:bg-[#0B6B2B] text-white text-sm font-bold shadow-md shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {submitting
                  ? mode === 'signup'
                    ? 'Creating Merchant Account…'
                    : 'Signing in…'
                  : mode === 'signup'
                  ? 'Register Store Account'
                  : 'Sign in to Merchant Portal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="pt-3 border-t border-[#E5E7E5] text-center">
            {mode === 'signup' ? (
              <p className="text-xs text-[#666666]">
                Already have a merchant account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-brand hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#666666]">
                Want to sell on GrowLocal?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-bold text-brand hover:underline cursor-pointer"
                >
                  Register your store (Sign Up)
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security badge and customer storefront redirect */}
        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="flex items-center gap-1.5 text-xs text-[#888888]">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Encrypted & Secured by Supabase Cloud</span>
          </div>
          <p className="text-center text-xs text-[#666666]">
            Looking for local products? Visit the{' '}
            <a href="http://localhost:5173" className="text-brand hover:underline font-bold">
              Customer Marketplace (localhost:5173)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
