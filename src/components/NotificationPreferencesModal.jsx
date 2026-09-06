import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Volume2, ShieldCheck, Sparkles, MessageSquare, ShoppingBag, Store } from 'lucide-react';

export default function NotificationPreferencesModal({ isOpen, onClose, onShowToast }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('growlocal_notification_prefs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      reservations: true,
      enquiryOffers: true,
      nearbyDeals: false,
      demandReplies: true,
      soundAlerts: true,
      browserPush: false
    };
  });

  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const togglePreference = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('growlocal_notification_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const status = await Notification.requestPermission();
        setPermissionStatus(status);
        if (status === 'granted') {
          togglePreference('browserPush');
          if (onShowToast) onShowToast('🔔 Web push notifications enabled for GrowLocal!');
        } else {
          if (onShowToast) onShowToast('Push notifications were not granted in browser settings.');
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    } else {
      if (onShowToast) onShowToast('Browser notifications not supported on this device.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E5E7E5] shadow-2xl relative animate-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#111111] font-poppins">Notification Preferences</h3>
            <p className="text-xs text-gray-500">Stay updated on in-store reservations and shop offers.</p>
          </div>
        </div>

        {/* List of Toggles */}
        <div className="space-y-3 divide-y divide-[#E5E7E5] text-xs">
          {/* Item 1: Reservations */}
          <div className="flex items-center justify-between pt-3 first:pt-0">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#138A36]" />
              <div>
                <span className="font-bold text-[#111111] block">Store Reservation & Pickup Reminders</span>
                <span className="text-[11px] text-gray-500">Alerts when your reservation code is ready</span>
              </div>
            </div>
            <button
              onClick={() => togglePreference('reservations')}
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                preferences.reservations ? 'bg-[#138A36]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.reservations ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 2: Enquiry Offers */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-[#138A36]" />
              <div>
                <span className="font-bold text-[#111111] block">Merchant Price Offers & Replies</span>
                <span className="text-[11px] text-gray-500">Instant notification when a shop responds with a deal</span>
              </div>
            </div>
            <button
              onClick={() => togglePreference('enquiryOffers')}
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                preferences.enquiryOffers ? 'bg-[#138A36]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.enquiryOffers ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 3: Demand request replies */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#138A36]" />
              <div>
                <span className="font-bold text-[#111111] block">"Tell Shops What You Need" Updates</span>
                <span className="text-[11px] text-gray-500">When nearby shops find matching inventory for your request</span>
              </div>
            </div>
            <button
              onClick={() => togglePreference('demandReplies')}
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                preferences.demandReplies ? 'bg-[#138A36]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.demandReplies ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 4: Sound Alerts */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-[#138A36]" />
              <div>
                <span className="font-bold text-[#111111] block">Sound & Vibration Alerts</span>
                <span className="text-[11px] text-gray-500">Play chime on incoming merchant replies</span>
              </div>
            </div>
            <button
              onClick={() => togglePreference('soundAlerts')}
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                preferences.soundAlerts ? 'bg-[#138A36]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  preferences.soundAlerts ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Browser Push Button */}
        <div className="bg-[#EAF7EE] p-3.5 rounded-2xl border border-[#DDF3E3] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-[#111111] block">Browser Desktop/Mobile Push</span>
            <span className="text-[10px] text-gray-500">
              {permissionStatus === 'granted' ? 'Active in this browser' : 'Receive alerts even when tab is in background'}
            </span>
          </div>
          {permissionStatus === 'granted' ? (
            <span className="bg-[#138A36] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Enabled
            </span>
          ) : (
            <button
              onClick={handleEnablePush}
              className="bg-[#138A36] hover:bg-[#0F752C] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Enable
            </button>
          )}
        </div>

        <button
          onClick={() => {
            onClose();
            if (onShowToast) onShowToast('✓ Notification preferences saved.');
          }}
          className="w-full py-3 bg-[#111111] hover:bg-black text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
