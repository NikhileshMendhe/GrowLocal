import React, { useState } from 'react';
import { 
  ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2, 
  Smartphone, MapPin, Database, Trash2, Download, AlertTriangle, 
  KeyRound, RefreshCw, ChevronRight, ShieldCheck
} from 'lucide-react';

export default function CustomerPrivacySecurity({ onBack, currentUser, onShowToast }) {
  const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'data' | 'security'
  const [preciseLocation, setPreciseLocation] = useState(true);
  const [personalizedOffers, setPersonalizedOffers] = useState(true);
  const [merchantContactVisible, setMerchantContactVisible] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExportData = () => {
    setShowExportModal(false);
    const exportData = {
      user: currentUser || { name: 'Guest Customer', email: 'guest@growlocal.in' },
      timestamp: new Date().toISOString(),
      platform: 'GrowLocal Nagpur',
      savedShops: JSON.parse(localStorage.getItem('growlocal_saved_shops') || '[]'),
      enquiries: JSON.parse(localStorage.getItem('growlocal_enquiries') || '[]'),
      reservations: JSON.parse(localStorage.getItem('growlocal_reservations') || '[]')
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growlocal-user-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onShowToast) onShowToast('📥 Personal data exported successfully.');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    localStorage.removeItem('growlocal_saved_shops');
    localStorage.removeItem('growlocal_enquiries');
    localStorage.removeItem('growlocal_reservations');
    if (onShowToast) onShowToast('⚠️ Account data cleared from this browser session.');
    setTimeout(() => {
      onBack();
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 bg-white border border-[#E5E7E5] rounded-2xl hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111111]" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#111111] font-poppins">
              Privacy & Security
            </h1>
            <span className="bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#DDF3E3]">
              Active Protection
            </span>
          </div>
          <p className="text-xs text-[#666666] font-medium">
            Manage your personal data, privacy preferences, and security controls on GrowLocal.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E5E7E5] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'policy'
              ? 'bg-[#138A36] text-white shadow-sm'
              : 'bg-white text-[#666666] border border-[#E5E7E5] hover:text-[#111111]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'data'
              ? 'bg-[#138A36] text-white shadow-sm'
              : 'bg-white text-[#666666] border border-[#E5E7E5] hover:text-[#111111]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Data & Permissions</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#138A36] text-white shadow-sm'
              : 'bg-white text-[#666666] border border-[#E5E7E5] hover:text-[#111111]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Account Security</span>
        </button>
      </div>

      {/* Tab 1: Privacy Policy */}
      {activeTab === 'policy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E7E5] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#111111]">GrowLocal Privacy Commitment</h2>
                <p className="text-xs text-[#666666]">Last Updated: September 2026 • Applicable to Nagpur Marketplace</p>
              </div>
            </div>

            <div className="prose prose-sm text-xs text-[#555555] space-y-4 leading-relaxed">
              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-1">1. Information We Collect</h3>
                <p>
                  GrowLocal collects minimal information necessary to connect customers with nearby verified merchants in Nagpur:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li><strong>Account Information:</strong> Name, email address, contact phone number provided during registration or checkout.</li>
                  <li><strong>Location Data:</strong> Approximate or GPS locality (e.g., Sitabuldi, Dharampeth, Butibori) to calculate distances to nearby local shops.</li>
                  <li><strong>Enquiry & Reservation Records:</strong> Messages exchanged with merchants, product availability checks, and store reservation codes.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-1">2. How We Use Your Information</h3>
                <p>
                  Your information is strictly used to facilitate local commerce discovery and verified merchant transactions:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>To display shops and products within your selected radius (1 km, 3 km, 5 km, 10 km).</li>
                  <li>To route your availability inquiries to the relevant local shopkeeper.</li>
                  <li>To generate offline store visit reservation confirmations and verification QR codes.</li>
                  <li>We <strong>do not sell</strong> your personal information or contact details to third-party ad networks.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-1">3. Communication Between Customers and Merchants</h3>
                <p>
                  When you send an enquiry or reserve a product, the merchant receives your customer name, selected item, and chosen pickup time. 
                  Direct contact details are only shared upon your confirmation to facilitate local in-store visits.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-1">4. Data Storage & Security</h3>
                <p>
                  GrowLocal utilizes encrypted data transmission (SSL/HTTPS) and industry-standard security protocols powered by Supabase with Row Level Security (RLS). 
                  Access to sensitive data is strictly restricted.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-1">5. Contact Our Privacy Officer</h3>
                <p>
                  For privacy inquiries, data corrections, or regulatory queries in Maharashtra, India, reach out to:
                  <br />
                  <strong>Email:</strong> privacy@growlocal.in • <strong>Helpline:</strong> +91 712 298 4400
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data & Permissions */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-[#111111]">Privacy Controls & Permissions</h2>
              <p className="text-xs text-[#666666]">Customize how your location and data are handled across GrowLocal.</p>
            </div>

            <div className="space-y-4 divide-y divide-[#E5E7E5]">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between pt-4 first:pt-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#EAF7EE] text-[#138A36] mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111111]">High-Precision Location</h3>
                    <p className="text-[11px] text-[#666666]">
                      Allows accurate kilometer distance calculations to nearby Nagpur shops.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPreciseLocation(!preciseLocation);
                    if (onShowToast) onShowToast(preciseLocation ? 'Approximate location mode active' : 'Precise GPS location enabled');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    preciseLocation ? 'bg-[#138A36]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preciseLocation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#EAF7EE] text-[#138A36] mt-0.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111111]">Personalized Local Recommendations</h3>
                    <p className="text-[11px] text-[#666666]">
                      Suggest shops and product categories based on your search history.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPersonalizedOffers(!personalizedOffers);
                    if (onShowToast) onShowToast('Preference updated.');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    personalizedOffers ? 'bg-[#138A36]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      personalizedOffers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#EAF7EE] text-[#138A36] mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111111]">Merchant Direct Messaging</h3>
                    <p className="text-[11px] text-[#666666]">
                      Allow verified shopkeepers to respond directly to your product enquiries.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMerchantContactVisible(!merchantContactVisible);
                    if (onShowToast) onShowToast('Messaging preferences saved.');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    merchantContactVisible ? 'bg-[#138A36]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      merchantContactVisible ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Management Buttons */}
            <div className="pt-6 border-t border-[#E5E7E5] flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex-1 py-3 px-4 bg-white border border-[#E5E7E5] hover:border-[#138A36] text-[#111111] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#138A36]" />
                <span>Export My Data (JSON)</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Local Data & Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Account Security */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-[#111111]">Account & Session Security</h2>
              <p className="text-xs text-[#666666]">Overview of your current sign-in status and security controls.</p>
            </div>

            {/* Current Session Card */}
            <div className="p-4 rounded-2xl bg-[#F7F8F7] border border-[#E5E7E5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#138A36] animate-pulse" />
                  <span className="text-xs font-black text-[#111111]">Active Web Session</span>
                </div>
                <span className="text-[10px] font-bold bg-[#EAF7EE] text-[#138A36] px-2 py-0.5 rounded-full border border-[#DDF3E3]">
                  Protected with TLS 1.3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-bold">Account</span>
                  <span className="font-bold text-[#111111]">{currentUser?.email || 'Guest Session'}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-bold">Role</span>
                  <span className="font-bold text-[#138A36] uppercase">{currentUser?.role || 'Customer'}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-bold">Node Region</span>
                  <span className="font-bold text-[#111111]">Nagpur, IN (AP-South)</span>
                </div>
              </div>
            </div>

            {/* Security checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Security Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-[#DDF3E3] bg-[#EAF7EE]/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Row Level Security (RLS)</h4>
                    <p className="text-[11px] text-[#666666]">Your enquiries and reservations cannot be viewed by other customers.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#DDF3E3] bg-[#EAF7EE]/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Offline In-Store Payment</h4>
                    <p className="text-[11px] text-[#666666]">No bank card details are stored or charged online. Pay in person.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#E5E7E5] shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111111]">Export Personal Data?</h3>
              <p className="text-xs text-[#666666] mt-1">
                You will download a structured JSON file with your bookmarks, reservations, and enquiry records.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#111111] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExportData}
                className="flex-1 py-2.5 px-4 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#E5E7E5] shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111111]">Clear Stored Data?</h3>
              <p className="text-xs text-[#666666] mt-1">
                This will clear your locally cached reservations, saved shops, and enquiry history from this browser.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#111111] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
