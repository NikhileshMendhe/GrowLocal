import React, { useState } from 'react';
import { Star, ShieldAlert, CheckCircle2, Eye, XCircle, Trash2, Filter } from 'lucide-react';

export default function AdminReviews({
  reviews,
  onUpdateReviewStatus,
  onShowToast
}) {
  const [filterTab, setFilterTab] = useState("All");

  const filteredReviews = reviews.filter(r => {
    if (filterTab === "Reported") return r.flagged || r.status === "Reported";
    if (filterTab === "Published") return r.status === "Published";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Customer Reviews & Moderation ({reviews.length})
          </h2>
          <p className="text-xs text-gray-500">Automated spam filters flag duplicate reviews, suspicious external links, and rating anomalies</p>
        </div>

        <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-2xl border border-[#E5E7E5] text-xs font-bold">
          {["All", "Published", "Reported"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl transition-colors ${
                filterTab === tab ? "bg-[#138A36] text-white" : "text-gray-600 hover:text-[#111111]"
              }`}
            >
              {tab} Reviews
            </button>
          ))}
        </div>
      </div>

      {/* REVIEWS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Target Shop</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Review Content</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Auto-Moderation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className={`hover:bg-[#F7F8F7] transition-colors ${rev.flagged ? "bg-red-50/30" : ""}`}>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{rev.customer}</td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">{rev.shop}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">
                    ⭐ {rev.rating}/5
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 max-w-sm leading-relaxed">{rev.comment}</td>
                  <td className="py-3.5 px-4 text-gray-500">{rev.date}</td>
                  <td className="py-3.5 px-4">
                    {rev.flagged ? (
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3" /> {rev.flagReason || "Flagged"}
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Clean
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {rev.flagged ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onUpdateReviewStatus(rev.id, "Published", false);
                            onShowToast(`Review restored & published.`);
                          }}
                          className="px-2.5 py-1 bg-green-600 text-white font-bold rounded-lg text-[10px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            onUpdateReviewStatus(rev.id, "Removed", true);
                            onShowToast(`Spam review permanently removed.`);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onUpdateReviewStatus(rev.id, "Hidden", true);
                          onShowToast(`Review hidden.`);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Hide Review"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
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
