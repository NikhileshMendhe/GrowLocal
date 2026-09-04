import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, Store, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function MerchantAuthPage({ onLoginSuccess, onSwitchToCustomer }) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields matching user login
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (isSignUp) {
      const { data, error } = await authService.signUp({
        email,
        password,
        fullName: fullName || email.split('@')[0],
        role: 'merchant'
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message || "Failed to create merchant account.");
        return;
      }

      onLoginSuccess({
        id: data?.user?.id,
        role: 'merchant',
        name: fullName || data?.profile?.full_name || email.split('@')[0],
        email,
        shopName: fullName || `${email.split('@')[0]}'s Store`
      });
    } else {
      const { data, error } = await authService.login({
        email,
        password,
        targetRole: 'merchant'
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message || "Invalid email or password.");
        return;
      }

      const displayName = data?.profile?.full_name || data?.user?.user_metadata?.full_name || email.split('@')[0];
      onLoginSuccess({
        id: data?.user?.id,
        role: 'merchant',
        name: displayName,
        email,
        shopName: displayName
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex items-center justify-center p-4 selection:bg-[#EAF7EE] selection:text-[#138A36]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#E5E7E5] relative">
        {/* Close / Exit Button */}
        <button
          type="button"
          onClick={onSwitchToCustomer}
          className="absolute top-4 right-4 p-2 text-[#666666] hover:text-[#111111] bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"
          title="Exit to Customer App"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#EAF7EE] border border-[#DDF3E3] rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Store className="w-6 h-6 text-[#138A36]" />
          </div>
          <h3 className="text-xl font-extrabold text-[#111111] font-poppins">
            {isSignUp ? "Create Merchant Account" : "Merchant Portal Login"}
          </h3>
          <p className="text-xs text-[#666666] mt-1">
            {isSignUp
              ? "Register your business to reach nearby customers, manage orders, and grow local."
              : "Sign in with your merchant credentials to manage your store and inventory."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Full Name / Merchant Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="merchant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-xs mt-3 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? "Processing..." : isSignUp ? "Create Merchant Account" : "Log In to Merchant Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 space-y-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
              className="text-xs text-[#138A36] hover:underline font-bold cursor-pointer"
            >
              {isSignUp ? "Already have an account? Log In" : "First time merchant? Create New Account"}
            </button>

            {isSignUp && (
              <p className="text-[10px] text-center text-gray-500 pt-1">
                By creating a merchant account, you agree to GrowLocal's Vendor Terms of Service.
              </p>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onSwitchToCustomer}
                className="text-xs text-[#666666] hover:text-[#138A36] font-medium cursor-pointer transition-colors"
              >
                ← Return to Customer Marketplace
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
