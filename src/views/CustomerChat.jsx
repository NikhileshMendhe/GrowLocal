import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Check, 
  CheckCheck, 
  ShoppingBag, 
  MapPin, 
  Tag, 
  Sparkles, 
  Clock, 
  Store, 
  Phone,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

export default function CustomerChat({ 
  shop, 
  messages = [], 
  onSendMessage, 
  onBack, 
  onReserveFromOffer,
  onShowToast 
}) {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend && !selectedImage) return;

    onSendMessage(textToSend || "Sent an image", selectedImage);
    setInputText("");
    setSelectedImage(null);
  };

  const handleQuickPrompt = (promptText) => {
    onSendMessage(promptText);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target.result);
      if (onShowToast) onShowToast("Photo attached! Add your note and hit send.");
    };
    reader.readAsDataURL(file);
  };

  const isShopOpen = shop?.isOpen !== false && shop?.status !== 'Closed';

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-3 sm:py-4 h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* 1. Header */}
      <div className="bg-white border border-[#E5E7E5] p-3 sm:p-4 rounded-2xl shadow-xs flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 text-[#111111] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Back to store"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Shop Avatar / Branded Tile */}
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#E5E7E5] bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
            {shop?.logoImage ? (
              <img src={shop.logoImage} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-poppins font-black uppercase text-emerald-100">
                {(shop?.name || 'S').charAt(0)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-sm text-[#111111]">{shop?.name || 'Nagpur Local Store'}</h2>
              {shop?.verified && <VerifiedBadge size="small" />}
            </div>
            
            <div className="flex items-center gap-2 text-[11px] font-semibold mt-0.5">
              {isShopOpen ? (
                <span className="text-[#138A36] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#138A36] animate-pulse"></span>
                  <span>Open Now</span>
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Closed</span>
                </span>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 font-normal">{shop?.distance || 'Nagpur, MH'}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            if (onShowToast) onShowToast(`Store Address: ${shop?.address || 'Nagpur, Maharashtra'}`);
          }}
          className="bg-[#EAF7EE] text-[#138A36] hover:bg-[#DDF3E3] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Store Location</span>
        </button>
      </div>

      {/* 2. Message History Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-1 py-2">
        <div className="text-center my-1">
          <span className="bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#DDF3E3] inline-flex items-center gap-1">
            <span>🔒 Safe In-App Direct Enquiry · Nagpur Verified Store</span>
          </span>
        </div>

        {/* Clean Slate Empty State when there are no messages yet */}
        {messages.length === 0 ? (
          <div className="bg-white border border-[#E5E7E5] rounded-2xl p-6 my-auto text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <MessageCircle className="w-7 h-7" />
            </div>
            
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#111111] font-poppins">
                Direct Chat with {shop?.name || 'Store Owner'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Connect directly with store staff in Nagpur. Ask about live in-store stock, size availability, store visit timings, or discuss custom discounts.
              </p>
            </div>

            {/* Quick suggested prompt chips */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Quick Questions to Ask:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Hi! Is this item available in stock right now?")}
                  className="p-2.5 bg-[#F8FAF8] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#138A36] rounded-xl text-xs text-[#111111] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-base">📦</span>
                  <span className="font-medium group-hover:text-[#138A36]">Is this item available in stock?</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("What are your store hours today in Nagpur?")}
                  className="p-2.5 bg-[#F8FAF8] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#138A36] rounded-xl text-xs text-[#111111] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-base">🕒</span>
                  <span className="font-medium group-hover:text-[#138A36]">What are your store hours today?</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Can you offer any discount or special price for this?")}
                  className="p-2.5 bg-[#F8FAF8] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#138A36] rounded-xl text-xs text-[#111111] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-base">🏷️</span>
                  <span className="font-medium group-hover:text-[#138A36]">Can you offer any discount?</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Where exactly is your store located?")}
                  className="p-2.5 bg-[#F8FAF8] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#138A36] rounded-xl text-xs text-[#111111] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-base">📍</span>
                  <span className="font-medium group-hover:text-[#138A36]">Where is your shop located?</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender === 'customer';

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                {/* Sender label */}
                <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                  {isCustomer ? 'You' : (msg.senderName || shop?.name || 'Shop Owner')}
                </span>

                <div 
                  className={`max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl shadow-xs space-y-2 ${
                    isCustomer 
                      ? 'bg-[#138A36] text-white rounded-br-none' 
                      : 'bg-white border border-[#E5E7E5] text-[#111111] rounded-bl-none'
                  }`}
                >
                  {/* Attached photo if any */}
                  {msg.attachmentUrl && (
                    <div className="rounded-xl overflow-hidden max-w-xs mb-2 border border-black/10">
                      <img src={msg.attachmentUrl} alt="Attachment" className="w-full h-auto object-cover max-h-48" />
                    </div>
                  )}

                  {msg.text && (
                    <p className="text-xs md:text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Offer Card in Chat */}
                  {msg.offer && (
                    <div className="bg-[#F7F8F7] border border-[#DDF3E3] p-3.5 rounded-xl text-[#111111] space-y-2.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded">
                          <Sparkles className="w-3 h-3" />
                          <span>Special In-Store Offer</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">{msg.offer.validUntil || 'Valid Today'}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-[#111111]">{msg.offer.productName}</h4>
                        {msg.offer.size && <p className="text-[11px] text-[#666666]">Size: {msg.offer.size}</p>}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-[#138A36]">₹{msg.offer.price}</span>
                        {msg.offer.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{msg.offer.originalPrice}</span>
                        )}
                      </div>

                      <button
                        onClick={() => onReserveFromOffer(msg.offer)}
                        className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 fill-white" />
                        <span>Reserve & Visit Store</span>
                      </button>
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-1 text-[10px] ${isCustomer ? 'text-white/80' : 'text-gray-400'}`}>
                    <span>{msg.time}</span>
                    {isCustomer && (
                      <CheckCheck className="w-3 h-3 text-white/90 inline" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview if selected */}
      {selectedImage && (
        <div className="bg-white border border-[#E5E7E5] rounded-xl p-2 mb-2 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <img src={selectedImage} alt="Selected preview" className="w-10 h-10 object-cover rounded-lg border" />
            <span className="text-xs text-gray-600 font-medium">Image attached ready to send</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSelectedImage(null)}
            className="text-xs text-red-500 font-bold hover:underline px-2"
          >
            Remove
          </button>
        </div>
      )}

      {/* 3. Chat Composer */}
      <form onSubmit={handleSend} className="bg-white border border-[#E5E7E5] p-2 rounded-2xl shadow-md flex items-center gap-2 mt-2 shrink-0">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-[#666666] hover:text-[#138A36] rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          title="Attach photo"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder={`Ask ${shop?.name || 'shop'} about availability, budget or sizes...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-2 text-xs md:text-sm text-[#111111] focus:outline-none bg-transparent font-medium"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedImage}
          className="bg-[#138A36] hover:bg-[#0F752C] disabled:bg-gray-200 disabled:text-gray-400 text-white p-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </form>
    </div>
  );
}
