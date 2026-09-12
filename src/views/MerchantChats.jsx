import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Tag, 
  Plus, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles, 
  MessageSquare,
  Clock,
  User,
  Image as ImageIcon,
  CheckCheck,
  Check
} from 'lucide-react';

export default function MerchantChats({ 
  enquiries = [], 
  messages = [], 
  currentShop = null,
  onSendMessage, 
  onSendCustomOffer, 
  onShowToast 
}) {
  // Merge enquiries and conversations from messages to ensure any direct chat is visible
  const conversationsMap = new Map();

  enquiries.forEach(enq => {
    conversationsMap.set(enq.id, {
      id: enq.id,
      customerName: enq.customerName || "Customer",
      customerAvatar: enq.customerAvatar || "",
      customerId: enq.customerId || enq.customerName,
      shopId: enq.shopId,
      productName: enq.productName || "General Enquiry",
      productImage: enq.productImage || "",
      size: enq.size || "Standard",
      budget: enq.budget || "Flexible",
      status: enq.status || "Active",
      lastMessage: enq.lastMessage || "Started a chat",
      timestamp: enq.timestamp || "Recent"
    });
  });

  // Also include any customer who sent a message to this shop
  messages.forEach(msg => {
    if (msg.shopId && currentShop?.id && msg.shopId === currentShop.id && msg.customerName) {
      const convKey = msg.conversationId || msg.enquiryId || `${msg.shopId}_${msg.customerId || msg.customerName}`;
      if (!conversationsMap.has(convKey)) {
        conversationsMap.set(convKey, {
          id: convKey,
          customerName: msg.customerName || "Customer",
          customerAvatar: msg.senderAvatar || "",
          customerId: msg.customerId || msg.customerName,
          shopId: msg.shopId,
          productName: msg.offer?.productName || "Direct Message",
          productImage: "",
          size: msg.offer?.size || "",
          budget: msg.offer?.price ? `₹${msg.offer.price}` : "Direct Query",
          status: "Active",
          lastMessage: msg.text || "Sent a message",
          timestamp: msg.time || "Recent"
        });
      }
    }
  });

  const chatList = Array.from(conversationsMap.values());

  const [selectedChatId, setSelectedChatId] = useState(chatList[0]?.id || null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("699");
  const [offerSize, setOfferSize] = useState("Standard");
  const [offerProductName, setOfferProductName] = useState("");
  const messagesEndRef = useRef(null);

  // Sync selected chat if chatList changes
  useEffect(() => {
    if (!selectedChatId && chatList.length > 0) {
      setSelectedChatId(chatList[0].id);
    }
  }, [chatList, selectedChatId]);

  const activeEnquiry = chatList.find(e => e.id === selectedChatId) || chatList[0] || null;

  // Filter messages specifically for the selected conversation
  const activeMessages = messages.filter(m => {
    if (!activeEnquiry) return false;
    if (m.conversationId && (m.conversationId === activeEnquiry.id || m.conversationId === `${activeEnquiry.shopId}_${activeEnquiry.customerId}`)) return true;
    if (m.enquiryId && m.enquiryId === activeEnquiry.id) return true;
    if (m.shopId && activeEnquiry.shopId && m.shopId === activeEnquiry.shopId) {
      if (m.customerId && activeEnquiry.customerId && m.customerId === activeEnquiry.customerId) return true;
      if (m.customerName && activeEnquiry.customerName && m.customerName === activeEnquiry.customerName) return true;
    }
    return false;
  });

  // Auto scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  if (chatList.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-12 text-center card-shadow min-h-[440px] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center text-3xl shadow-xs">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#111111] font-poppins mb-1.5">
            No Active Customer Chats Yet
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            When buyers in Nagpur discover your products and enquire about sizing, stock availability, or price negotiation, you will be able to message them here in real time and send custom discounted price quotes.
          </p>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    e?.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim(), activeEnquiry);
      setInputText("");
    }
  };

  const handleQuickReply = (text) => {
    onSendMessage(text, activeEnquiry);
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    const priceNum = parseInt(offerPrice) || 500;
    const prodName = offerProductName || activeEnquiry?.productName || "Selected Item";

    onSendCustomOffer({
      productName: prodName,
      size: offerSize || activeEnquiry?.size || "Standard",
      price: priceNum,
      originalPrice: Math.round(priceNum * 1.25),
      validUntil: "Valid for 24 Hours",
      shopName: currentShop?.name || activeEnquiry?.shopName || "Our Store",
      shopId: currentShop?.id || activeEnquiry?.shopId,
      enquiryId: activeEnquiry?.id
    }, activeEnquiry);

    setShowOfferForm(false);
    if (onShowToast) {
      onShowToast(`✓ Custom offer of ₹${priceNum} broadcasted to ${activeEnquiry.customerName}!`);
    }
  };

  const filteredChatList = chatList.filter(c => 
    c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden card-shadow h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Left Chat List Column */}
      <div className="w-full md:w-80 border-r border-[#E5E7E5] flex flex-col bg-[#F8FAF8]">
        <div className="p-4 border-b border-[#E5E7E5] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-[#111111] font-poppins">Customer Chats</h2>
            <span className="bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-2 py-0.5 rounded-full">
              {chatList.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7E5]">
          {filteredChatList.map((enq) => {
            const isSelected = enq.id === selectedChatId;
            return (
              <div
                key={enq.id}
                onClick={() => {
                  setSelectedChatId(enq.id);
                  setOfferProductName(enq.productName);
                  setOfferSize(enq.size || "Standard");
                }}
                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                  isSelected ? "bg-white border-l-4 border-[#138A36] shadow-xs" : "hover:bg-white"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#E5E7E5] overflow-hidden">
                  {enq.customerAvatar ? (
                    <img src={enq.customerAvatar} alt={enq.customerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(enq.customerName || 'C').charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#111111] truncate">{enq.customerName}</h4>
                    <span className="text-[10px] text-gray-400 font-medium">{enq.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#138A36] truncate">{enq.productName}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5 italic">"{enq.lastMessage}"</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat History & Offer Generator */}
      <div className="flex-1 flex flex-col justify-between bg-white relative">
        {/* Chat Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#E5E7E5] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#E5E7E5] overflow-hidden">
              {activeEnquiry.customerAvatar ? (
                <img src={activeEnquiry.customerAvatar} alt={activeEnquiry.customerName} className="w-full h-full object-cover" />
              ) : (
                <span>{(activeEnquiry.customerName || 'C').charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#111111]">{activeEnquiry.customerName}</h3>
              <p className="text-xs text-[#666666] flex items-center gap-1.5 flex-wrap">
                <span>Enquiry: <span className="font-bold text-[#111111]">{activeEnquiry.productName}</span></span>
                {activeEnquiry.size && <span>({activeEnquiry.size})</span>}
                <span>· Budget: <span className="font-semibold text-[#138A36]">{activeEnquiry.budget}</span></span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setOfferProductName(activeEnquiry.productName);
              setOfferSize(activeEnquiry.size || "Standard");
              setShowOfferForm(!showOfferForm);
            }}
            className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Send Price Offer</span>
          </button>
        </div>

        {/* Offer Form Overlay Drawer */}
        {showOfferForm && (
          <div className="absolute top-16 left-4 right-4 bg-white border-2 border-[#138A36] p-4 rounded-2xl shadow-2xl z-30 space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-[#138A36] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Create Custom Discount Offer for {activeEnquiry.customerName}</span>
              </span>
              <button 
                onClick={() => setShowOfferForm(false)} 
                className="text-xs text-gray-500 font-bold hover:text-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#111111] mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={offerProductName} 
                  onChange={(e) => setOfferProductName(e.target.value)}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-[#E5E7E5] font-medium" 
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1">Size / Variant</label>
                <input 
                  type="text" 
                  value={offerSize} 
                  onChange={(e) => setOfferSize(e.target.value)}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-[#E5E7E5] font-medium" 
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1">Special Discounted Price (₹)</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full p-2 bg-[#F8FAF8] rounded-lg border-2 border-[#138A36] font-extrabold text-[#138A36] text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1">Validity</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Valid for 24 Hours in Store" 
                  className="w-full p-2 bg-gray-100 rounded-lg border border-[#E5E7E5] text-gray-500 font-medium" 
                />
              </div>

              <button
                type="submit"
                className="col-span-1 sm:col-span-2 bg-[#138A36] hover:bg-[#0F752C] text-white font-bold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Broadcast Offer into Chat Stream</span>
              </button>
            </form>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAF8]">
          {/* Top Enquiry Notice */}
          <div className="bg-white border border-[#E5E7E5] rounded-xl p-3 text-xs text-gray-600 flex items-start gap-3 shadow-xs">
            <div className="p-2 bg-[#EAF7EE] text-[#138A36] rounded-lg shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#111111]">
                Customer Enquiry: {activeEnquiry.productName}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Initial note: "{activeEnquiry.lastMessage}"
              </p>
            </div>
          </div>

          {activeMessages.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              <p className="font-medium">No previous chat history with this customer.</p>
              <p className="text-[11px] mt-1">Reply below to discuss availability, pricing, or confirm store visit.</p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isMerchant = msg.sender === 'shop';
              return (
                <div key={msg.id} className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}>
                  <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                    {isMerchant ? 'You (Shop)' : (msg.senderName || activeEnquiry.customerName)}
                  </span>

                  <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl shadow-xs space-y-1.5 ${
                      isMerchant ? 'bg-[#138A36] text-white rounded-br-none' : 'bg-white border border-[#E5E7E5] text-[#111111] rounded-bl-none'
                    }`}
                  >
                    {msg.attachmentUrl && (
                      <div className="rounded-xl overflow-hidden max-w-xs mb-2 border border-black/10">
                        <img src={msg.attachmentUrl} alt="Attachment" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}

                    {msg.text && (
                      <p className="text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                    
                    {msg.offer && (
                      <div className="bg-white text-[#111111] p-3 rounded-xl border border-[#DDF3E3] mt-2 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded">
                            Discount Quote Sent
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{msg.offer.validUntil}</span>
                        </div>
                        <p className="text-xs font-bold text-[#111111]">{msg.offer.productName} ({msg.offer.size})</p>
                        <p className="text-sm font-black text-[#138A36]">₹{msg.offer.price}</p>
                      </div>
                    )}

                    <div className={`flex items-center justify-end gap-1 text-[10px] ${isMerchant ? 'text-white/80' : 'text-gray-400'}`}>
                      <span>{msg.time}</span>
                      {isMerchant && <CheckCheck className="w-3 h-3 text-white/90" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Merchant Reply Chips */}
        <div className="px-3 py-1.5 bg-[#F1F3F1] border-t border-[#E5E7E5] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Quick:</span>
          <button 
            type="button" 
            onClick={() => handleQuickReply("Yes! This item is currently in stock at our store.")}
            className="text-[11px] font-semibold bg-white hover:bg-[#EAF7EE] hover:text-[#138A36] px-2.5 py-1 rounded-lg border border-[#E5E7E5] whitespace-nowrap transition-colors cursor-pointer"
          >
            ✓ In stock right now
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickReply("Yes, we are open today till 9:00 PM. Please feel free to visit!")}
            className="text-[11px] font-semibold bg-white hover:bg-[#EAF7EE] hover:text-[#138A36] px-2.5 py-1 rounded-lg border border-[#E5E7E5] whitespace-nowrap transition-colors cursor-pointer"
          >
            🕒 Open till 9 PM
          </button>
          <button 
            type="button" 
            onClick={() => handleQuickReply("I can offer a special in-store discount if you visit today.")}
            className="text-[11px] font-semibold bg-white hover:bg-[#EAF7EE] hover:text-[#138A36] px-2.5 py-1 rounded-lg border border-[#E5E7E5] whitespace-nowrap transition-colors cursor-pointer"
          >
            🏷️ Special store discount
          </button>
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#E5E7E5] bg-white flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={`Type your response to ${activeEnquiry.customerName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-[#F8FAF8] border border-[#E5E7E5] rounded-xl text-xs md:text-sm text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#138A36] hover:bg-[#0F752C] disabled:bg-gray-200 disabled:text-gray-400 text-white p-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
