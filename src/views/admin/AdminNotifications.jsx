import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Users, Store, Globe, Sparkles } from 'lucide-react';

export default function AdminNotifications({
  notificationCampaigns,
  onSendNotification,
  onShowToast
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("All Customers in Nagpur");
  const [notifType, setNotifType] = useState("Push Notification");

  const handleBroadcast = () => {
    if (!title || !message) {
      alert("Please enter title and message content.");
      return;
    }
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      targetAudience,
      type: notifType,
      sentDate: "Today",
      sentCount: 12500,
      deliveredCount: 12100,
      openedCount: 4200,
      clickedCount: 1800
    };
    onSendNotification(newNotif);
    onShowToast(`📢 Push Broadcast sent to ${targetAudience}!`);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      
      {/* BROADCAST FORM */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#138A36]" /> Create & Send Targeted Broadcast Notification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-500 block mb-1">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl font-semibold text-[#111111]"
            >
              <option value="All Customers in Nagpur">All Customers in Nagpur</option>
              <option value="All Merchants">All Merchants</option>
              <option value="Butibori Customers">Butibori Locality Customers</option>
              <option value="Sitabuldi Customers">Sitabuldi Locality Customers</option>
              <option value="Fashion Category Buyers">Fashion Category Buyers</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Notification Channel</label>
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl font-semibold text-[#111111]"
            >
              <option value="Push Notification">Push Notification (Mobile & Web)</option>
              <option value="In-App Banner">In-App Banner</option>
              <option value="Email Newsletter">Email Newsletter</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Notification Headline Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Local Festive Discounts active near you!"
            className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Message Body</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Check out verified Nagpur shops nearby offering free hold reservations today..."
            className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36]"
          />
        </div>

        <button
          onClick={handleBroadcast}
          className="py-3 px-6 bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Send Broadcast Notification Now
        </button>
      </div>

      {/* CAMPAIGN HISTORY TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <h3 className="font-extrabold text-base text-[#111111] mb-4 font-poppins">Sent Notification Campaign History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Sent</th>
                <th className="py-3.5 px-4">Delivered</th>
                <th className="py-3.5 px-4">Opened</th>
                <th className="py-3.5 px-4 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {notificationCampaigns.map((nc) => (
                <tr key={nc.id} className="hover:bg-[#F7F8F7]">
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{nc.title}</td>
                  <td className="py-3.5 px-4 text-gray-700">{nc.targetAudience}</td>
                  <td className="py-3.5 px-4 text-gray-500">{nc.type}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{nc.sentCount}</td>
                  <td className="py-3.5 px-4 text-gray-600">{nc.deliveredCount}</td>
                  <td className="py-3.5 px-4 text-blue-700 font-bold">{nc.openedCount}</td>
                  <td className="py-3.5 px-4 text-right font-black text-[#138A36]">{nc.clickedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
