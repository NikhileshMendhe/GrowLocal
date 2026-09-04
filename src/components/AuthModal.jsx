import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
  
  // Form fields
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

    // Email & Password Auth via Supabase Service
    if (isSignUp) {
      const { data, error } = await authService.signUp({
        email,
        password,
        fullName: fullName || 'GrowLocal Member',
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

        <div className="text-center mb-6">
          <h3 className="text-xl font-extrabold text-[#111111] font-poppins">
            {customTitle ? customTitle : (isSignUp ? "Create GrowLocal Account" : "Welcome to GrowLocal")}
          </h3>
          <p className="text-xs text-[#666666] mt-1">
            {customDescription ? customDescription : "Find local. Buy local. Grow local. Discover shops and reserve products near you."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Full Name *</label>
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
                placeholder="your.email@gmail.com"
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
            className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-xs mt-3 cursor-pointer"
          >
            <span>{loading ? "Processing..." : isSignUp ? "Create GrowLocal Account" : "Log In to GrowLocal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

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

