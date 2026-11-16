import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Phone, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AuthModal() {
  const { authModalState, closeAuthModal, login, register, resetPassword } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState(authModalState.mode || 'login'); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!authModalState.isOpen) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast(`Welcome back, ${user?.full_name?.split(' ')[0] || 'friend'}!`);
      closeAuthModal();
      if (typeof authModalState.onSuccessCallback === 'function') {
        authModalState.onSuccessCallback();
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phoneNumber.trim() || undefined,
      });
      toast(`Welcome to GrowLocal, ${user?.full_name?.split(' ')[0] || 'friend'}!`);
      closeAuthModal();
      if (typeof authModalState.onSuccessCallback === 'function') {
        authModalState.onSuccessCallback();
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setForgotSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <img src="/growlocal-logo.png" alt="GrowLocal" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-base text-brand-dark">GrowLocal</span>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1 rounded-lg text-[#999999] hover:text-[#111111] hover:bg-[#F0F2F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        {tab !== 'forgot' ? (
          <div className="grid grid-cols-2 border-b border-[#E5E7E5] px-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`py-2.5 text-center border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-brand text-brand font-bold'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`py-2.5 text-center border-b-2 transition-colors ${
                tab === 'register'
                  ? 'border-brand text-brand font-bold'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              Join GrowLocal
            </button>
          </div>
        ) : null}

        {/* Modal Body */}
        <div className="p-6">
          {error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-4 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#111111] uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setError('');
                    }}
                    className="text-xs text-brand font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Sign In
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                  Phone <span className="normal-case text-[#999999]">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Account
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#111111]">Reset Password</h3>
                <p className="text-xs text-[#666666] mt-1">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Reset link sent!
                  </div>
                  <p>Check your email for the password recovery link.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setForgotSuccess(false);
                    }}
                    className="mt-2 text-brand font-bold hover:underline block"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send Recovery Link
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setError('');
                    }}
                    className="w-full text-center text-xs text-[#666666] font-medium hover:text-[#111111]"
                  >
                    Cancel & Return to Sign In
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
