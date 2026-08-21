import React, { useState } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, CheckCircle2, ShoppingBag, MapPin, Tag, Sparkles } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

export default function CustomerChat({ 
  shop, 
  messages, 
  onSendMessage, 
  onBack, 
  onReserveFromOffer,
  onShowToast 
}) {
  const [inputText, setInputText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* 1. Header */}
      <div className="bg-white border border-[#E5E7E5] p-3 md:p-4 rounded-2xl shadow-xs flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 text-[#111111] hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E5E7E5] bg-gray-100">
            <img src={shop.logoImage || shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-[#111111]">{shop.name}</h2>
              <VerifiedBadge size="small" />
            </div>
            <p className="text-[11px] text-[#138A36] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#138A36] animate-pulse"></span>
              <span>Active Now · {shop.distance}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onShowToast("Shop location sent: Butibori Market, Nagpur")}
          className="bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#DDF3E3] transition-colors"
        >
          View Map
        </button>
      </div>

      {/* 2. Message History Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 px-1 py-2">
        <div className="text-center my-2">
          <span className="bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#DDF3E3]">
            🔒 Safe In-App Direct Enquiry · Nagpur
          </span>
        </div>

        {messages.map((msg) => {
          const isCustomer = msg.sender === 'customer';

          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl shadow-xs space-y-2 ${
                  isCustomer 
                    ? 'bg-[#138A36] text-white rounded-br-none' 
                    : 'bg-white border border-[#E5E7E5] text-[#111111] rounded-bl-none'
                }`}
              >
                <p className="text-xs md:text-sm leading-relaxed font-medium">{msg.text}</p>

                {/* Offer Card in Chat */}
                {msg.offer && (
                  <div className="bg-[#F7F8F7] border border-[#DDF3E3] p-3.5 rounded-xl text-[#111111] space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3" />
                        <span>Custom Shop Offer</span>
                      </span>
                      <span className="text-[10px] text-gray-500">{msg.offer.validUntil}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-[#111111]">{msg.offer.productName}</h4>
                      <p className="text-[11px] text-[#666666]">Size: {msg.offer.size}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#138A36]">₹{msg.offer.price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{msg.offer.originalPrice}</span>
                    </div>

                    <button
                      onClick={() => onReserveFromOffer(msg.offer)}
                      className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 fill-white" />
                      <span>Reserve & Visit Store</span>
                    </button>
                  </div>
                )}

                <span className={`text-[10px] block text-right ${isCustomer ? 'text-white/80' : 'text-[#666666]'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Chat Composer */}
      <form onSubmit={handleSend} className="bg-white border border-[#E5E7E5] p-2 rounded-2xl shadow-md flex items-center gap-2 mt-2">
        <button 
          type="button" 
          onClick={() => onShowToast("Photo upload attached")}
          className="p-2 text-[#666666] hover:text-[#138A36] rounded-xl hover:bg-gray-100"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder="Ask shop about availability, budget or sizes..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-2 text-xs md:text-sm text-[#111111] focus:outline-none bg-transparent"
        />

        <button
          type="submit"
          className="bg-[#138A36] hover:bg-[#0F752C] text-white p-2.5 rounded-xl transition-colors shadow-xs"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </form>
    </div>
  );
}
