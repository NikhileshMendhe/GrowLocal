import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle, Eye, 
  Download, Store, MapPin, Phone, Mail, FileCheck, ArrowRight, X 
} from 'lucide-react';

export default function AdminVerificationCenter({
  pendingVerifications,
  onApproveVerification,
  onRejectVerification,
  onRequestMoreInfo,
  onShowToast
}) {
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [infoRequestText, setInfoRequestText] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleApprove = (verif) => {
    onApproveVerification(verif.id, verif.businessName);
    onShowToast(`✓ ${verif.businessName} verified successfully! Verified badge enabled on platform.`);
    setSelectedVerif(null);
  };

  const handleConfirmReject = () => {
    if (!rejectReason) {
      alert("Please enter rejection reason.");
      return;
    }
    onRejectVerification(selectedVerif.id, rejectReason);
    onShowToast(`Verification application for ${selectedVerif.businessName} rejected.`);
    setShowRejectModal(false);
    setSelectedVerif(null);
  };

  const handleConfirmInfoRequest = () => {
    if (!infoRequestText) {
      alert("Please enter information request notes.");
      return;
    }
    onRequestMoreInfo(selectedVerif.id, infoRequestText);
    onShowToast(`More information requested from ${selectedVerif.businessName}`);
    setShowInfoModal(false);
    setSelectedVerif(null);
  };

  return (
    <div className="space-y-6">
      
      {/* VERIFICATION CENTER HERO BANNER */}
      <div className="bg-gradient-to-r from-[#138A36] to-[#0B6B2B] rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Dedicated Merchant Moderation Center</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-poppins">GrowLocal Merchant Verification Center</h2>
          <p className="text-xs text-[#DDF3E3] max-w-2xl leading-relaxed">
            Review submitted GST certificates, municipal trade licenses, owner identity proof, and physical store photos. Approving a business automatically updates its shop status to <strong>✓ Verified Shop</strong> across the entire GrowLocal customer website.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 min-w-44">
          <span className="text-3xl font-black block font-poppins">{pendingVerifications.length}</span>
          <span className="text-xs font-bold text-[#DDF3E3] uppercase tracking-wider">Pending Applications</span>
        </div>
      </div>

      {/* PENDING VERIFICATION APPLICATIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingVerifications.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-[#E5E7E5] text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#138A36] mx-auto opacity-40" />
            <h3 className="font-extrabold text-base text-[#111111]">All Merchant Applications Verified!</h3>
            <p className="text-xs text-gray-500">There are no pending business verification applications right now.</p>
          </div>
        ) : (
          pendingVerifications.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black text-[#138A36] uppercase tracking-wider bg-[#EAF7EE] px-2 py-0.5 rounded-md border border-[#DDF3E3]">
                      {item.businessCategory}
                    </span>
                    <h3 className="font-extrabold text-base text-[#111111] mt-1 font-poppins">{item.businessName}</h3>
                    <p className="text-xs text-gray-500 font-medium">Owner: {item.ownerName}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {item.status}
                  </span>
                </div>

                {/* Shop Cover Preview */}
                <div className="h-32 rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200">
                  <img
                    src={item.shopImages[0]}
                    alt={item.businessName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.city}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.email}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium pt-1">
                    GSTIN: <span className="font-mono text-gray-700 font-bold">{item.gstin}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E5E7E5] flex items-center gap-2">
                <button
                  onClick={() => setSelectedVerif(item)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Review Docs
                </button>
                <button
                  onClick={() => handleApprove(item)}
                  className="flex-1 py-2 bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FULL VERIFICATION REVIEW MODAL */}
      {selectedVerif && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-[#138A36] uppercase tracking-wider bg-[#EAF7EE] px-2 py-0.5 rounded-md">
                  {selectedVerif.businessCategory}
                </span>
                <h3 className="font-extrabold text-lg text-[#111111] mt-1">{selectedVerif.businessName}</h3>
                <p className="text-xs text-gray-500">Submitted on: {selectedVerif.submittedDate}</p>
              </div>
              <button onClick={() => setSelectedVerif(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Business Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#F7F8F7] p-4 rounded-2xl border border-[#E5E7E5]">
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Business Owner</span>
                <span className="font-bold text-[#111111]">{selectedVerif.ownerName}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Phone & Email</span>
                <span className="font-bold text-[#111111]">{selectedVerif.phone} • {selectedVerif.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Full Shop Address</span>
                <span className="font-bold text-[#111111]">{selectedVerif.address}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">GSTIN Number</span>
                <span className="font-mono font-bold text-[#138A36]">{selectedVerif.gstin}</span>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Submitted KYC & Business Documents</h4>
              <div className="space-y-2">
                {selectedVerif.documents.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-white border border-[#E5E7E5] rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#138A36]" />
                      <div>
                        <p className="font-bold text-[#111111]">{doc.title}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{doc.file}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop Photos */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Physical Store Images</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedVerif.shopImages.map((img, i) => (
                  <img key={i} src={img} alt="Shop photo" className="w-full h-36 object-cover rounded-2xl border border-gray-200" />
                ))}
              </div>
            </div>

            {/* Action Workflow Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={() => handleApprove(selectedVerif)}
                className="flex-1 py-2.5 bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Enable Verified Badge
              </button>
              <button
                onClick={() => setShowInfoModal(true)}
                className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                Request Info
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="py-2.5 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Reject Verification Application
            </h3>
            <p className="text-xs text-gray-600">Please state the official reason for rejecting this verification request.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Invalid GST certificate / document unreadable..."
              className="w-full p-3 border border-gray-300 rounded-2xl text-xs focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmReject} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl text-xs">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST MORE INFO MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Request More Information
            </h3>
            <p className="text-xs text-gray-600">Specify what additional documents or information the merchant needs to upload.</p>
            <textarea
              value={infoRequestText}
              onChange={(e) => setInfoRequestText(e.target.value)}
              rows={3}
              placeholder="Please provide clearer trade license document..."
              className="w-full p-3 border border-gray-300 rounded-2xl text-xs focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-3">
              <button onClick={() => setShowInfoModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmInfoRequest} className="flex-1 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
