import React, { useState } from 'react';
import { X, Phone, Lock, Store, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ initialMode = "customer", onClose, onLoginSuccess }) {
  const [role, setRole] = useState(initialMode); // customer or merchant
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState("phone"); // phone or otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [shopName, setShopName] = useState("");

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep("otp");
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    onLoginSuccess({
      role,
      name: role === 'merchant' ? (shopName || 'Trendy Wear') : 'Ananya Deshmukh',
      phone
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#E5E7E5] relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#666666] hover:text-[#111111] bg-gray-100 rounded-full">
          <X className="w-5 h-5" />
        </button>

        {/* Role Toggle Selector */}
        <div className="flex bg-[#F7F8F7] p-1 rounded-xl mb-6 border border-[#E5E7E5]">
          <button
            onClick={() => { setRole("customer"); setStep("phone"); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              role === "customer" ? "bg-white text-[#138A36] shadow-xs" : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Login</span>
          </button>
          <button
            onClick={() => { setRole("merchant"); setStep("phone"); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              role === "merchant" ? "bg-[#138A36] text-white shadow-xs" : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Merchant Portal</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[#111111]">
            {role === "merchant" ? "Merchant Login / Registration" : "Welcome to GrowLocal"}
          </h3>
          <p className="text-xs text-[#666666] mt-1">
            {role === "merchant"
              ? "Access your Nagpur shop dashboard, enquiries & live chats"
              : "Find local products, verify availability, and reserve in nearby shops"}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {role === "merchant" && isSignUp && (
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trendy Wear"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
                />
              </div>
            )}

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
                  className="w-full pl-12 pr-4 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm mt-2"
            >
              <span>Get Verification OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-[#138A36] hover:underline font-semibold"
              >
                {isSignUp ? "Already registered? Login" : role === "merchant" ? "New Business? List Your Shop Free" : "First time? Create Account"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center bg-[#EAF7EE] p-3 rounded-xl border border-[#DDF3E3] mb-4">
              <p className="text-xs font-semibold text-[#138A36]">OTP sent to +91 {phone}</p>
              <p className="text-[11px] text-[#666666] mt-0.5">Enter demo OTP 4 3 2 1 to verify</p>
            </div>

            <div className="flex justify-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  defaultValue={idx + 1}
                  className="w-12 h-12 text-center text-lg font-bold bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl focus:border-[#138A36] focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
            >
              <CheckCircle2 className="w-4 h-4 fill-white" />
              <span>Verify & Continue</span>
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-xs text-[#666666] hover:text-[#111111] py-1"
            >
              Edit Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
