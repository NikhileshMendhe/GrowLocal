import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/StateViews';

export default function Login() {
  const { admin, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F7]">
        <Spinner className="w-8 h-8 text-brand" />
      </div>
    );
  }

  const isAdmin = Boolean(
    admin &&
    (admin.role_name === 'admin' || admin.role === 'admin' || admin.type === 'admin')
  );

  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8F7] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-[#111111]">GrowLocal Admin</h1>
            <p className="mt-1 text-sm text-[#666666]">Sign in with your admin account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#111111] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#138A36] focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#111111] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#138A36] focus:border-brand"
                />
              </div>
            </div>
            {error ? (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner className="w-4 h-4" /> : null}
              Sign in
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E5E7E5] flex items-center justify-between text-xs text-[#666666]">
            <span>Need admin access?</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@growlocal.in');
                setPassword('Password123!');
              }}
              className="text-brand font-medium hover:underline"
            >
              Fill Admin Credentials
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-[#999999]">
          Admin accounts are provisioned by the platform team. Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
