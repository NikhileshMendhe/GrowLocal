import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Store, Edit3, DollarSign, Sparkles } from 'lucide-react';

export default function AdminSubscriptions({
  subscriptionPlans,
  merchants,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* SUBSCRIPTION PLANS SUMMARY */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[#111111] mb-4 font-poppins flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#138A36]" /> GrowLocal Merchant Subscription Tiers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="border border-[#E5E7E5] rounded-3xl p-5 bg-[#F7F8F7] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-[#111111]">{plan.name}</h3>
                  <span className="text-[10px] font-bold bg-[#EAF7EE] text-[#138A36] px-2.5 py-0.5 rounded-full">
                    {plan.merchantsCount} Merchants
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#138A36] font-poppins">{plan.price}</span>
                  <span className="text-xs text-gray-500 font-medium ml-1">/{plan.period}</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-gray-600">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#138A36] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onShowToast(`Modifying pricing config for ${plan.name}`)}
                className="w-full py-2 bg-white hover:bg-gray-100 border border-[#E5E7E5] text-[#111111] text-xs font-bold rounded-xl transition-colors"
              >
                Configure Plan Pricing
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
