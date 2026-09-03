import React, { useState } from 'react';
import { X, Mail, Lock, Store, User, ArrowRight, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { authService } from '../services/authService';

export default function AuthModal({ 
  initialMode = "customer", 
  interceptNotice, 
  customTitle, 
  customDescription,
  onClose, 
  onOpenTerms, 
  onLoginSuccess 
}) {
  const [role, setRole] = useState(initialMode); // customer, merchant, admin
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState("email"); // email or phone
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [step, setStep] = useState("form"); // form or otp
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [otpToken, setOtpToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (authMethod === "phone") {
      if (step === "form") {
        const { error } = await authService.signInWithPhoneOtp(phone);
        setLoading(false);
        if (error) {
          setErrorMsg(error.message || "Failed to send OTP to mobile number.");
          return;
        }
        setStep("otp");
        return;
      }
      // Verify OTP step
      const { data, error } = await authService.verifyPhoneOtp(phone, otpToken);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || "Invalid OTP code entered.");
        return;
      }

      onLoginSuccess({
        role,
        name: data?.user?.name || fullName || (role === 'merchant' ? (shopName || 'Trendy Wear Store') : 'Customer'),
        phone,
        email: data?.user?.email || `${phone.replace(/[^0-9]/g, '')}@growlocal.in`
      });
      onClose();
      return;
    }

    // Email & Password Auth via Supabase Service
    if (isSignUp) {
      const { data, error } = await authService.signUp({
        email,
        password,
        fullName: fullName || (role === 'merchant' ? shopName : 'GrowLocal Member'),
        role
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message || "Failed to create account.");
        return;
      }

      onLoginSuccess({
        role,
        name: fullName || email.split('@')[0],
        email
      });
      onClose();
    } else {
      const { data, error } = await authService.login({ email, password, targetRole: role });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message || "Invalid email or password.");
        return;
      }

      onLoginSuccess({
        role: data?.profile?.role || role,
        name: data?.profile?.full_name || email.split('@')[0],
        email
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#E5E7E5] relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#666666] hover:text-[#111111] bg-gray-100 rounded-full cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {/* Intercept / Dynamic Notice */}
        {interceptNotice && (
          <div className="mb-4 p-3 bg-[#EAF7EE] border border-[#DDF3E3] text-[#138A36] rounded-2xl text-xs font-bold flex items-center gap-2">
            <User className="w-4 h-4 shrink-0" />
            <span>{interceptNotice}</span>
          </div>
        )}


        <div className="text-center mb-5">
          <h3 className="text-xl font-extrabold text-[#111111] font-poppins">
            {customTitle ? customTitle : (isSignUp ? "Create GrowLocal Account" : "Welcome to GrowLocal")}
          </h3>
          <p className="text-xs text-[#666666] mt-1">
            {customDescription ? customDescription : "Find local. Buy local. Grow local. Discover shops and reserve products near you."}
          </p>
        </div>

        {/* Auth Method Switcher (Email vs Phone) */}
        <div className="flex justify-center gap-4 mb-4 text-xs font-bold border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => { setAuthMethod("email"); setStep("form"); }}
            className={`pb-1 flex items-center gap-1 transition-colors ${authMethod === "email" ? "text-[#138A36] border-b-2 border-[#138A36]" : "text-gray-400"}`}
          >
            <Mail className="w-3.5 h-3.5" /> Email & Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod("phone"); setStep("form"); }}
            className={`pb-1 flex items-center gap-1 transition-colors ${authMethod === "phone" ? "text-[#138A36] border-b-2 border-[#138A36]" : "text-gray-400"}`}
          >
            <Key className="w-3.5 h-3.5" /> Mobile OTP
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {step === "form" ? (
            <>
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                  />
                </div>
              )}

              {authMethod === "email" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#666666]">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36] font-medium"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-xs mt-3 cursor-pointer"
              >
                <span>{loading ? "Processing..." : isSignUp ? "Create GrowLocal Account" : "Log In to GrowLocal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center bg-[#EAF7EE] p-3 rounded-2xl border border-[#DDF3E3]">
                <p className="text-xs font-semibold text-[#138A36]">OTP sent to +91 {phone}</p>
                <p className="text-[11px] text-[#666666] mt-0.5">Demo OTP 4 3 2 1 (or SMS token) to verify instantly</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Enter Verification Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4321"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs text-center font-mono text-[#111111] font-bold focus:outline-none focus:border-[#138A36]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Log In</span>
              </button>
            </div>
          )}

          <div className="text-center pt-2 space-y-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
              className="text-xs text-[#138A36] hover:underline font-bold cursor-pointer"
            >
              {isSignUp ? "Already have an account? Log In" : "First time user? Create New Account"}
            </button>

            {isSignUp && (
              <p className="text-[10px] text-center text-gray-500 pt-1">
                By creating an account, you agree to GrowLocal's Terms of Service.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
