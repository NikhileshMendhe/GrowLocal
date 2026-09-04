import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, Store, KeyRound, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';

export default function MerchantAuthPage({ onLoginSuccess, onSwitchToCustomer }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle Send OTP for Signup Step 1
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes('@')) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const { data, error } = await authService.sendMerchantEmailOtp(email);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to send verification code.");
      return;
    }

    setOtpNotice(data?.message || "Verification code sent to your email.");
    setStep(2);
    setCountdown(30);
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setErrorMsg("");
    setLoading(true);
    const { data, error } = await authService.sendMerchantEmailOtp(email);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to resend code.");
      return;
    }

    setOtpNotice(data?.message || "New verification code sent!");
    setCountdown(30);
  };

  // Handle Verify OTP & Complete Signup
  const handleVerifyOtpAndSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp || otp.trim().length < 4) {
      setErrorMsg("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setLoading(true);
    const { data, error } = await authService.verifyMerchantEmailOtpAndSignUp({
      email,
      otp: otp.trim(),
      fullName: fullName || email.split('@')[0],
      password
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Invalid or expired verification code.");
      return;
    }

    onLoginSuccess({
      id: data?.user?.id,
      role: 'merchant',
      name: fullName || data?.profile?.full_name || email.split('@')[0],
      email,
      shopName: fullName || `${email.split('@')[0]}'s Store`
    });
  };

  // Handle Standard Merchant Log In
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
            {isSignUp && step === 2 ? (
              <KeyRound className="w-6 h-6 text-[#138A36]" />
            ) : (
              <Store className="w-6 h-6 text-[#138A36]" />
            )}
          </div>
          <h3 className="text-xl font-extrabold text-[#111111] font-poppins">
            {isSignUp
              ? (step === 2 ? "Verify Your Email" : "Create Merchant Account")
              : "Merchant Portal Login"}
          </h3>
          <p className="text-xs text-[#666666] mt-1">
            {isSignUp
              ? (step === 2 
                  ? `Enter the 6-digit code sent to ${email}`
                  : "Register your business to reach nearby customers, manage orders, and grow local.")
              : "Sign in with your merchant credentials to manage your store and inventory."}
          </p>
        </div>

        {/* Dynamic Notice (e.g. OTP code info or rate limit feedback) */}
        {otpNotice && isSignUp && step === 2 && (
          <div className="mb-4 p-3 bg-[#EAF7EE] border border-[#DDF3E3] text-[#138A36] rounded-2xl text-xs font-bold flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span>{otpNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold leading-relaxed space-y-1">
            <p>{errorMsg}</p>
            {errorMsg.toLowerCase().includes('already exists') && isSignUp && (
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setStep(1); setErrorMsg(""); }}
                className="text-xs text-[#138A36] underline hover:text-[#0B6B2B] font-extrabold cursor-pointer block mt-1"
              >
                👉 Click here to Log In with this email
              </button>
            )}
            {errorMsg.toLowerCase().includes('no account found') && !isSignUp && (
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setStep(1); setErrorMsg(""); }}
                className="text-xs text-[#138A36] underline hover:text-[#0B6B2B] font-extrabold cursor-pointer block mt-1"
              >
                👉 Click here to Create New Account
              </button>
            )}
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION FORM */}
        {isSignUp && step === 2 ? (
          <form onSubmit={handleVerifyOtpAndSignUp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#111111]">6-Digit Email OTP *</label>
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMsg(""); }}
                  className="text-[11px] text-[#138A36] hover:underline font-bold cursor-pointer"
                >
                  Change Email
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-[#111111] focus:outline-none focus:border-[#138A36]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-xs cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? "Verifying & Creating Account..." : "Verify & Create Merchant Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => { setStep(1); setErrorMsg(""); }}
                className="text-[#666666] hover:text-[#111111] font-medium cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleResendOtp}
                className={`font-bold cursor-pointer flex items-center gap-1 ${
                  countdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#138A36] hover:underline"
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>{countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Code"}</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 1 OR LOGIN FORM */
          <form onSubmit={isSignUp ? handleSendOtp : handleLogin} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Full Name / Merchant Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
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
                  autoComplete="email"
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
                  autoComplete={isSignUp ? "new-password" : "current-password"}
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
              <span>
                {loading
                  ? "Processing..."
                  : isSignUp
                  ? "Send Verification OTP"
                  : "Log In to Merchant Portal"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 space-y-1">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setStep(1); setErrorMsg(""); }}
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
        )}
      </div>
    </div>
  );
}
