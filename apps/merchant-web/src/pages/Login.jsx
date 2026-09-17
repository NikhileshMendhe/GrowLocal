import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, status, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated' && user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center card-shadow">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">GrowLocal</h1>
          <p className="text-sm text-[#666666]">Merchant Console</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-6 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-[#111111]">Sign in</h2>
            <p className="text-xs text-[#666666] mt-0.5">Use your merchant account credentials</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@business.in"
              className="px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]"
            />
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5">
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-[#666666] mt-6">
          Customer or admin? This console is for merchants only.
        </p>
      </div>
    </div>
  );
}
