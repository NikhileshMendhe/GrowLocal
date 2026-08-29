import React from 'react';
import { DollarSign, PieChart, CreditCard, ArrowUpRight, CheckCircle2, Download } from 'lucide-react';

export default function AdminPayments({
  paymentsLog,
  revenueStats,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* REVENUE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase">Gross Platform Revenue</span>
          <p className="text-2xl font-black text-[#138A36] font-poppins mt-1">{revenueStats.grossRevenue}</p>
        </div>
        <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase">Subscriptions Revenue</span>
          <p className="text-2xl font-black text-blue-700 font-poppins mt-1">{revenueStats.subscriptionRevenue}</p>
        </div>
        <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase">Campaign Commission</span>
          <p className="text-2xl font-black text-purple-700 font-poppins mt-1">{revenueStats.campaignRevenue}</p>
        </div>
        <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase">Net Margin</span>
          <p className="text-2xl font-black text-[#0B6B2B] font-poppins mt-1">{revenueStats.netRevenue}</p>
        </div>
      </div>

      {/* PAYMENTS LOG TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#111111] font-poppins flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#138A36]" /> Commercial Payments Ledger
          </h3>
          <button
            onClick={() => onShowToast("Exporting financial statement...")}
            className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Export Financial PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Payment ID</th>
                <th className="py-3.5 px-4">Merchant / Client</th>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {paymentsLog.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#F7F8F7]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#138A36]">{pay.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{pay.merchant}</td>
                  <td className="py-3.5 px-4 text-gray-700">{pay.type}</td>
                  <td className="py-3.5 px-4 font-black text-[#111111]">{pay.amount}</td>
                  <td className="py-3.5 px-4 text-gray-500">{pay.gateway}</td>
                  <td className="py-3.5 px-4 text-gray-500">{pay.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
