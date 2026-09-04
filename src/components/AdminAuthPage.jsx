import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, 
  AlertTriangle, CheckCircle2, Store, Sparkles, ArrowLeft, KeyRound 
} from 'lucide-react';
import { authService, SUPER_ADMIN_EMAIL } from '../services/authService';

export default function AdminAuthPage({
  onLoginSuccess,
  onBackToCustomerView,
  onShowToast
}) {
  const [email, setEmail] = useState('nikhileshmendhe07@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await authService.login({
        email,
        password,
        targetRole: 'admin'
      });

      setLoading(false);

      if (error) {
        setErrorMsg(error.message || "Authentication failed. Access restricted to Super Administrator.");
        if (onShowToast) onShowToast("⚠ Access Denied: Invalid Super Admin credentials.");
        return;
      }

      if (onShowToast) {
        onShowToast("✓ Welcome back, Super Administrator Nikhilesh Mendhe!");
      }

      if (onLoginSuccess) {
        onLoginSuccess({
          role: 'super_admin',
          name: data?.profile?.full_name || 'Nikhilesh Mendhe',
          email: data?.user?.email || SUPER_ADMIN_EMAIL
        });
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Security authentication system error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1311] flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-[#138A36] selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#138A36]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand and Back Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <img src="/growlocal-logo.png" alt="GrowLocal Logo" className="h-9 w-auto object-contain brightness-110" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white font-poppins">GrowLocal</span>
              <span className="text-[10px] bg-[#138A36] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-400">Master Control Console</p>
          </div>
        </div>

        <button
          onClick={onBackToCustomerView}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Marketplace View</span>
        </button>
      </div>

      {/* Center Super Admin Login Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-[#161D1A]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)] space-y-6 relative">
          
          {/* Security Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#138A36]/20 border border-[#138A36]/40 text-[#138A36] flex items-center justify-center mx-auto shadow-inner text-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white font-poppins tracking-tight">
              Super Admin Access
            </h1>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Designated Super Administrator portal for GrowLocal platform management.
            </p>
          </div>

          {/* Security Notice Pill */}
          <div className="bg-[#138A36]/10 border border-[#138A36]/30 p-3 rounded-2xl flex items-start gap-2.5 text-left">
            <KeyRound className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-300 space-y-0.5">
              <p className="font-bold text-white">Restricted Single-Administrator Node</p>
              <p className="text-gray-400">
                Only the designated Super Admin (<span className="text-[#138A36] font-bold">nikhileshmendhe07@gmail.com</span>) is authorized. Registration of new admin accounts is disabled.
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form: ONLY User ID (Email) and Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID / Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-300">
                Super Admin User ID / Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nikhileshmendhe07@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:border-[#138A36] focus:bg-white/10 rounded-xl text-xs font-bold text-white placeholder:text-gray-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Master Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-300">
                  Master Password *
                </label>
                <span className="text-[10px] text-[#138A36] font-bold">Encrypted 256-bit</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 focus:border-[#138A36] focus:bg-white/10 rounded-xl text-xs font-bold text-white placeholder:text-gray-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#138A36] hover:bg-[#0B6B2B] active:scale-[0.99] text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-[#138A36]/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? "Verifying Credentials..." : "Authenticate & Access Console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Footer Notice (Confirms no new account creation) */}
          <div className="pt-2 text-center text-[11px] text-gray-500 border-t border-white/5 space-y-1">
            <p>🔒 Master Administrative Access is strictly monitored.</p>
            <p className="text-gray-600">IP & Session Security Audit logging active.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 z-10 py-2">
        <p>© 2026 GrowLocal Technologies Private Limited. All rights reserved.</p>
      </div>
    </div>
  );
}
