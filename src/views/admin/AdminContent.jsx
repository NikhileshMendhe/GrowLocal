import React, { useState } from 'react';
import { Layout, FileText, Megaphone, CheckCircle2, Save, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

export default function AdminContent({
  cmsContent,
  onUpdateCMSContent,
  onShowToast
}) {
  const [headline, setHeadline] = useState(cmsContent.heroHeadline);
  const [subtitle, setSubtitle] = useState(cmsContent.heroSubtitle);
  const [bannerText, setBannerText] = useState(cmsContent.communityBannerText);
  const [announcement, setAnnouncement] = useState(cmsContent.announcementText);

  const handleSaveCMS = () => {
    onUpdateCMSContent({
      ...cmsContent,
      heroHeadline: headline,
      heroSubtitle: subtitle,
      communityBannerText: bannerText,
      announcementText: announcement
    });
    onShowToast("✓ Customer Website Homepage content updated live!");
  };

  return (
    <div className="space-y-6">
      
      {/* HERO SECTION BUILDER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
          <Layout className="w-5 h-5 text-[#138A36]" /> Customer Homepage Hero & Banner CMS
        </h2>
        <p className="text-xs text-gray-500">Changes made here update the live customer website instantly without redeployment</p>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-500 block mb-1">Hero Main Tagline Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Hero Subtitle Description</label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={2}
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Community Growth Banner Text</label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-medium text-[#111111] focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Top Bar Announcement Banner</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-medium text-[#111111] focus:outline-none focus:border-[#138A36]"
            />
          </div>
        </div>

        <button
          onClick={handleSaveCMS}
          className="py-3 px-6 bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save & Update Customer Website Live
        </button>
      </div>
    </div>
  );
}
