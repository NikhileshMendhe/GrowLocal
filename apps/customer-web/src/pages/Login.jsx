import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const from = location.state?.from || '/';

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast(`Welcome back, ${user?.full_name?.split(' ')[0] || 'friend'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot(event) {
    event.preventDefault();
    setForgotError('');
    setForgotSubmitting(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err?.message || 'Failed to send reset link.');
    } finally {
      setForgotSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-8">
        <div className="text-center mb-8">
          <img src="/growlocal-logo.png" alt="" className="w-14 h-14 rounded-xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#111111]">Welcome back</h1>
          <p className="text-sm text-[#666666] mt-1">Sign in to discover products and manage orders.</p>
        </div>

        {location.state?.reason === 'expired' ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            Your session expired — please sign in again.
          </p>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#111111] uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#E5E7E5] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#111111] uppercase tracking-wide">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotModal(true);
                }}
                className="text-xs text-brand font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#E5E7E5] rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Sign in
          </button>
        </form>

        <p className="text-sm text-center text-[#666666] mt-6">
          New to GrowLocal?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-[#111111]">Reset Password</h3>
            <p className="text-xs text-[#666666]">
              Enter your registered email address to receive password recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Reset instructions sent!
                </div>
                <p>Please check your inbox to reset your password.</p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(false);
                    setForgotSuccess(false);
                  }}
                  className="mt-2 text-brand font-bold hover:underline block"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                {forgotError ? (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{forgotError}</p>
                ) : null}
                <div>
                  <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-[#E5E7E5] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#666666] hover:bg-[#F0F2F0] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-xl inline-flex items-center gap-1.5"
                  >
                    {forgotSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
