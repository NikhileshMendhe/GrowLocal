import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, MessageSquare, Clock, ChevronRight, 
  BellRing, VolumeX, Volume2, ShoppingBag, MapPin, Phone, 
  CheckCircle2, Zap, Package, Sparkles
} from 'lucide-react';
import { orderNotificationService } from '../services/orderNotificationService';

export default function MerchantEnquiries({ enquiries = [], onOpenChat, onShowToast }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRinging, setIsRinging] = useState(() => orderNotificationService.isRinging());
  const [activeOrder, setActiveOrder] = useState(() => orderNotificationService.getActiveOrder());

  useEffect(() => {
    // Keep in perfect sync with orderNotificationService ringtone state
    const unsubStatus = orderNotificationService.onStatusChange(({ isPlaying, activeOrder: order }) => {
      setIsRinging(isPlaying);
      if (order) setActiveOrder(order);
    });

    const unsubOrder = orderNotificationService.subscribe((order) => {
      setActiveOrder(order);
      setIsRinging(true);
    });

    const unsubDismiss = orderNotificationService.onDismiss(() => {
      setActiveOrder(null);
      setIsRinging(false);
    });

    return () => {
      unsubStatus();
      unsubOrder();
      unsubDismiss();
    };
  }, []);

  const handleStopSiren = () => {
    orderNotificationService.stopRingtone();
    setIsRinging(false);
    setActiveOrder(null);
    if (onShowToast) {
      onShowToast("🔕 Order siren / ringtone silenced successfully.");
    }
  };

  const handleTestSiren = () => {
    if (isRinging) {
      handleStopSiren();
    } else {
      orderNotificationService.notifyNewOrder({
        id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        productName: 'Sample Nagpur Cotton Kurti',
        customerName: 'Aarav Deshmukh (Test Order)',
        customerPhone: '+91 98230 45678',
        price: '₹1,299',
        totalAmount: 1299,
        size: 'L',
        quantity: 1,
        fulfillmentType: 'delivery',
        deliveryAddress: 'Dharampeth, Nagpur - 440010',
        paymentMethod: 'Pay on Delivery / UPI',
        status: 'Pending',
        isOrder: true,
        orderType: 'Express Delivery Order'
      });
      if (onShowToast) {
        onShowToast("🔊 Order ringtone playing! Click 'Stop Siren' anytime to silence it.");
      }
    }
  };

  const ordersCount = (enquiries || []).filter(e => e.isOrder || e.orderType).length;
  const pendingCount = (enquiries || []).filter(e => e.status === 'Pending' || e.status === 'pending' || e.status === 'Pending Quotes').length;
  const offerSentCount = (enquiries || []).filter(e => e.status === 'Offer Sent' || e.status === 'Offer Received').length;
  const interestedCount = (enquiries || []).filter(e => e.status === 'Interested').length;
  const completedCount = (enquiries || []).filter(e => e.status === 'Completed').length;

  const TABS = [
    { label: "All", count: (enquiries || []).length },
    { label: "Orders 🛒", count: ordersCount, isOrderTab: true },
    { label: "Pending", count: pendingCount },
    { label: "Offer Sent", count: offerSentCount },
    { label: "Interested", count: interestedCount },
    { label: "Completed", count: completedCount }
  ];

  const filteredEnquiries = (enquiries || []).filter(enq => {
    if (activeTab === "Orders 🛒" && !enq.isOrder && !enq.orderType) return false;
    if (activeTab !== "All" && activeTab !== "Orders 🛒" && enq.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = enq.customerName?.toLowerCase().includes(q);
      const matchProd = enq.productName?.toLowerCase().includes(q) || enq.productRequested?.toLowerCase().includes(q);
      const matchId = enq.id?.toLowerCase().includes(q) || enq.reservationCode?.toLowerCase().includes(q);
      if (!matchName && !matchProd && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER WITH DEDICATED SIREN STOP OPTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E5E7E5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111111] font-poppins">Customer Enquiries & Orders</h1>
            {ordersCount > 0 && (
              <span className="bg-emerald-100 text-[#138A36] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                {ordersCount} {ordersCount === 1 ? 'Order' : 'Orders'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Real-time customer orders and demand requests from shoppers across Nagpur
          </p>
        </div>

        {/* SIREN STOP & CONTROLLER OPTION IN ENQUIRY HEADER */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isRinging ? (
            <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 p-1.5 sm:p-2 rounded-2xl animate-pulse shadow-md">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white rounded-xl text-xs font-black">
                <BellRing className="w-4 h-4 animate-bounce" />
                <span className="hidden xs:inline">SIREN RINGING!</span>
              </div>
              
              {/* PRIMARY SIREN STOP BUTTON */}
              <button
                type="button"
                onClick={handleStopSiren}
                id="stop-siren-enquiry-header-btn"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ring-2 ring-white"
                title="Stop the continuous siren / ringtone immediately"
              >
                <VolumeX className="w-4 h-4" />
                <span>🔕 STOP SIREN NOW</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#F7F8F7] border border-[#E5E7E5] p-1.5 sm:p-2 rounded-2xl">
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-gray-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline text-emerald-800">Siren Ready</span>
              </div>

              {/* Stop Siren button (always available) */}
              <button
                type="button"
                onClick={handleStopSiren}
                id="stop-siren-standby-btn"
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Mute / Stop audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Siren</span>
              </button>

              {/* Test siren button */}
              <button
                type="button"
                onClick={handleTestSiren}
                id="test-siren-enquiry-btn"
                className="px-3 py-1.5 bg-[#138A36] hover:bg-[#0F752C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Test the lovely melodic ringtone sound"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Ringtone</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── REALTIME ACTIVE RINGING ORDER BANNER WITH DIRECT STOP BUTTON ── */}
      {(isRinging || activeOrder) && (
        <div className="bg-gradient-to-r from-emerald-600 via-[#138A36] to-emerald-700 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-emerald-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 text-2xl shrink-0 shadow-sm border border-white/30">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-[#138A36] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Active Customer Order Alert
                </span>
                <span className="text-xs font-mono font-bold text-emerald-100">
                  {activeOrder?.id || 'GL-ORDER'}
                </span>
              </div>
              <p className="font-extrabold text-base text-white mt-1">
                {activeOrder?.productName || 'Customer Purchase'} · <span className="text-amber-300">{activeOrder?.price || (activeOrder?.totalAmount ? `₹${activeOrder.totalAmount}` : '')}</span>
              </p>
              <p className="text-xs text-emerald-100 font-medium">
                Customer: <strong className="text-white">{activeOrder?.customerName || 'Nagpur Shopper'}</strong> {activeOrder?.customerPhone ? `(${activeOrder.customerPhone})` : ''} · Playing continuous chime ringtone until stopped
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleStopSiren}
              id="stop-siren-banner-btn"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ring-2 ring-white active:scale-95"
            >
              <VolumeX className="w-4 h-4 text-white" />
              <span>🔕 STOP SIREN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleStopSiren();
                setActiveTab("Orders 🛒");
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#138A36] font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View In Orders</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TABS BAR (INCLUDING ORDERS 🛒 TAB) ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#E5E7E5]">
        {TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === t.label
                ? (t.isOrderTab ? "bg-emerald-700 text-white shadow-xs" : "bg-[#138A36] text-white shadow-xs")
                : "bg-white text-[#666666] hover:text-[#111111] border border-[#E5E7E5]"
            }`}
          >
            <span>{t.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === t.label ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── CONTROLS: SEARCH BAR & INLINE SIREN CONTROL ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enquiries & customer orders by customer name, product, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        {/* Direct Siren Stop button in toolbar */}
        {isRinging && (
          <button
            type="button"
            onClick={handleStopSiren}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 animate-pulse"
          >
            <VolumeX className="w-4 h-4" />
            <span>Stop Siren</span>
          </button>
        )}
      </div>

      {/* ── ENQUIRIES & CUSTOMER ORDERS LIST ── */}
      {filteredEnquiries.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-[#111111] mb-1">
            {searchQuery 
              ? "No matching enquiries or orders found" 
              : (activeTab === "Orders 🛒" ? "No Customer Orders Yet" : (activeTab === "All" ? "No Customer Enquiries or Orders Yet" : `No ${activeTab} Enquiries`))}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? "Try searching with a different product name, order code, or customer name."
              : "When customers in Nagpur place Buy Now orders or ask questions about size and availability, they will appear right here with a musical chime alert."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleTestSiren}
              className="px-4 py-2 bg-[#138A36] hover:bg-[#0F752C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Simulate Customer Order & Siren</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => {
            const isOrder = Boolean(enq.isOrder || enq.orderType);
            const isCurrentRingingOrder = isRinging && (activeOrder?.id === enq.id || activeOrder?.reservationCode === enq.id);

            return (
              <div 
                key={enq.id}
                onClick={() => onOpenChat && onOpenChat(enq)}
                className={`bg-white rounded-2xl p-5 card-shadow-hover cursor-pointer space-y-4 transition-all ${
                  isOrder 
                    ? (isCurrentRingingOrder 
                        ? 'border-2 border-red-500 ring-4 ring-red-100 shadow-xl' 
                        : 'border-2 border-emerald-500/80 shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20')
                    : 'border border-[#E5E7E5]'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#E5E7E5] pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={enq.customerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                      alt={enq.customerName} 
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E7E5] shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#111111]">{enq.customerName}</h3>
                        {enq.customerPhone && (
                          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {enq.customerPhone}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#666666]">{enq.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ORDER BADGE */}
                    {isOrder && (
                      <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <ShoppingBag className="w-3 h-3" />
                        <span>CUSTOMER ORDER</span>
                      </span>
                    )}

                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      enq.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'bg-[#EAF7EE] text-[#138A36]'
                    }`}>
                      {enq.status}
                    </span>

                    {/* Inline Siren Stop button if this card is ringing */}
                    {isRinging && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopSiren();
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg shadow-sm flex items-center gap-1 animate-bounce"
                        title="Silence Siren"
                      >
                        <VolumeX className="w-3 h-3" />
                        <span>Silence Siren</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#666666] block">
                      {isOrder ? 'Ordered Product' : 'Requested Product'}
                    </span>
                    <span className="font-bold text-[#111111]">{enq.productName || enq.productRequested}</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block">Size & Quantity</span>
                    <span className="font-bold text-[#111111]">
                      {enq.size || 'Standard'} {enq.quantity ? `· Qty: ${enq.quantity}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666] block">
                      {isOrder ? 'Order Total Amount' : 'Customer Budget'}
                    </span>
                    <span className="font-black text-[#138A36] text-sm">
                      {enq.price || enq.budget}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666] block">Fulfillment / Activity</span>
                    <span className="font-bold text-[#111111]">
                      {enq.fulfillmentType === 'delivery' 
                        ? '🚚 Home Delivery' 
                        : (enq.fulfillmentType === 'pickup' ? '🏪 In-Store Pickup' : (enq.timestamp || 'Just now'))}
                    </span>
                  </div>
                </div>

                {/* Delivery Address (if applicable) */}
                {enq.deliveryAddress && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-gray-900">Delivery Address:</strong> {enq.deliveryAddress}
                    </div>
                  </div>
                )}

                {/* Footer Message & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#E5E7E5] gap-3">
                  <p className="text-xs text-[#666666] italic truncate max-w-md">"{enq.lastMessage}"</p>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* STOP SIREN OPTION ON ORDER CARD */}
                    {isRinging && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopSiren();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Siren</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenChat) onOpenChat(enq);
                      }}
                      className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isOrder ? 'Chat with Customer' : 'Reply with Price Offer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
