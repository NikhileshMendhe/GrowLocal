import React, { useState } from 'react';
import { Search, Send, Tag, Plus, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

export default function MerchantChats({ enquiries, messages, onSendMessage, onSendCustomOffer, onShowToast }) {
  const [selectedChatId, setSelectedChatId] = useState(enquiries[0]?.id || "#GL1256");
  const [inputText, setInputText] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("699");
  const [offerSize, setOfferSize] = useState("L");

  const activeEnquiry = enquiries.find(e => e.id === selectedChatId) || enquiries[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    onSendCustomOffer({
      productName: activeEnquiry.productName,
      size: offerSize,
      price: parseInt(offerPrice),
      originalPrice: 899,
      validUntil: "Valid Today",
      shopName: "Trendy Wear"
    });
    setShowOfferForm(false);
    onShowToast(`Custom offer of ₹${offerPrice} sent to ${activeEnquiry.customerName}!`);
  };

  return (
    <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden card-shadow h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Left Chat List Column */}
      <div className="w-full md:w-80 border-r border-[#E5E7E5] flex flex-col bg-[#F7F8F7]">
        <div className="p-4 border-b border-[#E5E7E5] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-[#111111] font-poppins">Customer Chats</h2>
            <span className="bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-2 py-0.5 rounded-full">
              {enquiries.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer chats..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7E5]">
          {enquiries.map((enq) => {
            const isSelected = enq.id === selectedChatId;
            return (
              <div
                key={enq.id}
                onClick={() => setSelectedChatId(enq.id)}
                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                  isSelected ? "bg-white border-l-4 border-[#138A36]" : "hover:bg-white"
                }`}
              >
                <img
                  src={enq.customerAvatar}
                  alt={enq.customerName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E5E7E5]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#111111] truncate">{enq.customerName}</h4>
                    <span className="text-[10px] text-[#666666]">{enq.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#138A36] truncate">{enq.productName}</p>
                  <p className="text-[11px] text-[#666666] truncate mt-0.5">"{enq.lastMessage}"</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat History & Offer Generator */}
      <div className="flex-1 flex flex-col justify-between bg-white relative">
        {/* Chat Top Header */}
        <div className="p-4 border-b border-[#E5E7E5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img
              src={activeEnquiry.customerAvatar}
              alt={activeEnquiry.customerName}
              className="w-10 h-10 rounded-full object-cover border border-[#E5E7E5]"
            />
            <div>
              <h3 className="font-bold text-sm text-[#111111]">{activeEnquiry.customerName}</h3>
              <p className="text-xs text-[#666666]">
                Enquiry: <span className="font-bold text-[#111111]">{activeEnquiry.productName}</span> ({activeEnquiry.size}) · Budget: {activeEnquiry.budget}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Send Price Offer</span>
          </button>
        </div>

        {/* Offer Form Overlay Drawer */}
        {showOfferForm && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-[#138A36] p-4 rounded-2xl shadow-2xl z-30 space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#138A36] flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>Create Custom Price Offer for Customer</span>
              </span>
              <button onClick={() => setShowOfferForm(false)} className="text-xs text-gray-500">Cancel</button>
            </div>

            <form onSubmit={handleCreateOffer} className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#111111] mb-1">Product</label>
                <input type="text" readOnly value={activeEnquiry.productName} className="w-full p-2 bg-gray-100 rounded-lg border border-[#E5E7E5]" />
              </div>
              <div>
                <label className="block font-bold text-[#111111] mb-1">Offer Price (₹)</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full p-2 bg-[#F7F8F7] rounded-lg border border-[#138A36] font-bold text-[#138A36]"
                />
              </div>
              <button
                type="submit"
                className="col-span-2 bg-[#138A36] hover:bg-[#0F752C] text-white font-bold py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Broadcast Offer into Chat Stream
              </button>
            </form>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F8F7]">
          {messages.map((msg) => {
            const isMerchant = msg.sender === 'shop';
            return (
              <div key={msg.id} className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] p-3.5 rounded-2xl shadow-xs space-y-1 ${
                    isMerchant ? 'bg-[#138A36] text-white rounded-br-none' : 'bg-white border border-[#E5E7E5] text-[#111111] rounded-bl-none'
                  }`}
                >
                  <p className="text-xs md:text-sm font-medium">{msg.text}</p>
                  
                  {msg.offer && (
                    <div className="bg-white text-[#111111] p-3 rounded-xl border border-[#DDF3E3] mt-2 space-y-1">
                      <p className="text-[10px] font-bold text-[#138A36]">Sent Offer: ₹{msg.offer.price}</p>
                      <p className="text-xs font-bold">{msg.offer.productName} ({msg.offer.size})</p>
                    </div>
                  )}

                  <span className={`text-[10px] block text-right ${isMerchant ? 'text-white/80' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#E5E7E5] bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your response to customer..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs md:text-sm text-[#111111] focus:outline-none focus:border-[#138A36]"
          />
          <button
            type="submit"
            className="bg-[#138A36] hover:bg-[#0F752C] text-white p-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Send className="w-4 h-4 fill-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
