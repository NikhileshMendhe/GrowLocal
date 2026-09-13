import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Store, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function MerchantAuthPage({ onLoginSuccess, onSwitchToCustomer }) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle Merchant Sign Up (Direct Email & Password - No OTP)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes('@')) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!phone || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const { data, error } = await authService.signUp({
      email,
      password,
      fullName: fullName || email.split('@')[0],
      phone: phone.trim(),
      role: 'merchant'
    });
    setLoading(false);

    if (error) {
      const msg = error.message || "";
      if (msg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg("Unable to connect to the server. Please check your network connection and try again.");
      } else if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('over_email_send_rate_limit')) {
        setErrorMsg("Supabase email rate limit exceeded (max 3-4 emails/hr on default SMTP). Please wait a while before requesting another email, or confirm your user in the Supabase dashboard.");
      } else {
        setErrorMsg(msg || "Failed to create merchant account.");
      }
      return;
    }

    if (data?.requiresEmailConfirmation) {
      setSuccessMsg(`Account created! A confirmation email has been sent to ${email}. Please click the link in the email to activate your account, then log in.`);
      setIsSignUp(false);
      return;
    }

    onLoginSuccess(data?.profile, true);
  };

  // Handle Merchant Log In
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { data, error } = await authService.login({
      email,
      password,
      targetRole: 'merchant'
    });

    setLoading(false);
    if (error) {
      const msg = error.message || "";
      if (msg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg("Unable to connect to the server. Please check your network connection and try again.");
      } else {
        setErrorMsg(msg || "Invalid email or password.");
      }
      return;
    }

    onLoginSuccess(data?.profile, false);
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
          <div className="w-13 h-13 bg-[#EAF7EE] border border-[#DDF3E3] rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Store className="w-6 h-6 text-[#138A36]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#111111] font-poppins">
            {isSignUp ? "Create Merchant Account" : "Merchant Portal Login"}
          </h3>
          <p className="text-xs text-[#666666] mt-1.5 max-w-xs mx-auto">
            {isSignUp
              ? "Register your business to reach nearby customers, manage orders, and grow local."
              : "Sign in with your merchant credentials to manage your store and inventory."}
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium leading-relaxed space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
              <p className="font-semibold">{successMsg}</p>
            </div>
            <p className="text-[11px] text-emerald-700">Once confirmed, enter your email and password below to access your Merchant Dashboard.</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold leading-relaxed space-y-1 animate-in fade-in">
            <p>{errorMsg}</p>
            {errorMsg.toLowerCase().includes('already exists') && isSignUp && (
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMsg(""); }}
                className="text-xs text-[#138A36] underline hover:text-[#0B6B2B] font-extrabold cursor-pointer block mt-1"
              >
                👉 Click here to Log In with this email
              </button>
            )}
            {errorMsg.toLowerCase().includes('no account found') && !isSignUp && (
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMsg(""); }}
                className="text-xs text-[#138A36] underline hover:text-[#0B6B2B] font-extrabold cursor-pointer block mt-1"
              >
                👉 Click here to create a Merchant Account
              </button>
            )}
          </div>
        )}

        {/* Form (Sign Up or Log In) */}
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Full Name / Business Owner *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Aman Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#138A36] focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Phone / Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="e.g. 9823011223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#138A36] focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="merchant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#138A36] focus:bg-white font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#138A36] focus:bg-white font-medium transition-all"
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
            className="w-full bg-[#138A36] hover:bg-[#0B6B2B] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#138A36]/20 text-xs sm:text-sm mt-2 cursor-pointer disabled:opacity-60"
          >
            <span>
              {loading
                ? "Processing..."
                : isSignUp
                ? "Create Merchant Account"
                : "Log In to Merchant Portal"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 space-y-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
              className="text-xs text-[#138A36] hover:underline font-bold cursor-pointer"
            >
              {isSignUp ? "Already have a merchant account? Log In" : "First time merchant? Create New Account"}
            </button>

            {isSignUp && (
              <p className="text-[10px] text-center text-gray-500 pt-1">
                By creating a merchant account, you agree to GrowLocal's Vendor Terms of Service.
              </p>
            )}

            <div className="pt-2 border-t border-gray-100">
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

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#138A36]" />
          <span>Encrypted & Secured by Supabase Cloud</span>
        </div>
      </div>
    </div>
  );
}
