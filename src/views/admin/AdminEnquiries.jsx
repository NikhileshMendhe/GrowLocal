import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, Filter, Eye, CheckCircle2, 
  Clock, AlertTriangle, X, Tag, User, Store, ArrowRight,
  BellRing, VolumeX, Volume2, ShoppingBag, MapPin, Phone
} from 'lucide-react';
import { orderNotificationService } from '../../services/orderNotificationService';

export default function AdminEnquiries({
  enquiries = [],
  onUpdateEnquiryStatus,
  onShowToast
}) {
  const [activeStatusTab, setActiveStatusTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isRinging, setIsRinging] = useState(() => orderNotificationService.isRinging());
  const [activeOrder, setActiveOrder] = useState(() => orderNotificationService.getActiveOrder());

  useEffect(() => {
    const unsubStatus = orderNotificationService.onStatusChange(({ isPlaying, activeOrder: order }) => {
      setIsRinging(isPlaying);
      if (order) setActiveOrder(order);
    });

    const unsub = orderNotificationService.subscribe((order) => {
      setActiveOrder(order);
      setIsRinging(true);
    });

    const unsubDismiss = orderNotificationService.onDismiss(() => {
      setActiveOrder(null);
      setIsRinging(false);
    });

    return () => {
      unsubStatus();
      unsub();
      unsubDismiss();
    };
  }, []);

  const handleStopSiren = () => {
    orderNotificationService.stopRingtone();
    setIsRinging(false);
    setActiveOrder(null);
    if (onShowToast) {
      onShowToast("🔕 Siren / Ringtone stopped.");
    }
  };

  const handleTestSiren = () => {
    if (isRinging) {
      handleStopSiren();
    } else {
      orderNotificationService.notifyNewOrder({
        id: `TEST-ADM-${Math.floor(1000 + Math.random() * 9000)}`,
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
        onShowToast("🔊 Order ringtone playing! Click 'Stop Siren' to silence.");
      }
    }
  };

  const ordersCount = (enquiries || []).filter(e => e.isOrder || e.orderType).length;

  const filteredEnquiries = (enquiries || []).filter(e => {
    if (activeStatusTab === "Orders 🛒" && !e.isOrder && !e.orderType) return false;
    if (activeStatusTab !== "All" && activeStatusTab !== "Orders 🛒" && !e.status?.toLowerCase().includes(activeStatusTab.toLowerCase())) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (e.id || '').toLowerCase().includes(q) || 
                            (e.customerName || '').toLowerCase().includes(q) || 
                            (e.shopName || '').toLowerCase().includes(q) || 
                            (e.productName || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER WITH SIREN CONTROLLER ── */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5E7E5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#111111] font-poppins">Customer Enquiries & Orders Master</h1>
            {ordersCount > 0 && (
              <span className="bg-emerald-100 text-[#138A36] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                {ordersCount} Orders
              </span>
            )}
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Central real-time monitor for customer inquiries, express buy orders, and shop quotes
          </p>
        </div>

        {/* Top Siren Stop / Controller widget */}
        <div className="flex items-center gap-2 shrink-0">
          {isRinging ? (
            <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 p-1.5 rounded-2xl animate-pulse shadow-md">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white rounded-xl text-xs font-black">
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                <span>SIREN ACTIVE!</span>
              </div>
              <button
                type="button"
                onClick={handleStopSiren}
                id="admin-stop-siren-header-btn"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                title="Stop Continuous Siren"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>🔕 STOP SIREN NOW</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#F7F8F7] border border-[#E5E7E5] p-1.5 rounded-2xl">
              <span className="text-xs font-bold text-emerald-800 px-2 py-1 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Siren Ready
              </span>
              <button
                type="button"
                onClick={handleStopSiren}
                className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="Stop Audio"
              >
                <VolumeX className="w-3 h-3" />
                <span>Stop</span>
              </button>
              <button
                type="button"
                onClick={handleTestSiren}
                className="px-2.5 py-1 bg-[#138A36] hover:bg-[#0F752C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="Test Siren Ringtone"
              >
                <Volume2 className="w-3 h-3" />
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
                Customer: <strong className="text-white">{activeOrder?.customerName || 'Nagpur Shopper'}</strong>
                {activeOrder?.shopName ? ` · Store: ${activeOrder.shopName}` : ''} · Smooth chime ringtone playing continuously until stopped
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleStopSiren}
              id="admin-stop-siren-banner-btn"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ring-2 ring-white active:scale-95"
            >
              <VolumeX className="w-4 h-4 text-white" />
              <span>🔕 STOP SIREN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleStopSiren();
                setActiveStatusTab("Orders 🛒");
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#138A36] font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View In Orders</span>
            </button>
          </div>
        </div>
      )}
      
      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enquiry ID, customer name, shop name, product..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-2xl border border-[#E5E7E5] text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto">
          {["All", "Orders 🛒", "Pending", "Offer Sent", "Interested", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatusTab(status)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                activeStatusTab === status ? "bg-[#138A36] text-white shadow-xs" : "text-gray-600 hover:text-[#111111]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── ENQUIRIES & ORDERS MASTER TABLE ── */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Type & ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Shop</th>
                <th className="py-3.5 px-4">Product / Item</th>
                <th className="py-3.5 px-4">Amount / Budget</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No enquiries or customer orders match the current filter.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const isOrder = Boolean(enq.isOrder || enq.orderType);
                  return (
                    <tr 
                      key={enq.id} 
                      className={`hover:bg-[#F7F8F7] transition-colors ${
                        isOrder ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          {isOrder ? (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              ORDER
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              ENQ
                            </span>
                          )}
                          <span className="text-[#138A36]">{enq.id}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#111111]">
                        <div>{enq.customerName}</div>
                        {enq.customerPhone && (
                          <div className="text-[10px] text-gray-500 font-normal">{enq.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">{enq.shopName || 'Nagpur Retailer'}</td>
                      <td className="py-3.5 px-4 text-gray-600 truncate max-w-xs">
                        <div className="font-semibold text-gray-900">{enq.productName || enq.productRequested}</div>
                        <div className="text-[10px] text-gray-500">{enq.size || 'Standard'} {enq.quantity ? `· Qty: ${enq.quantity}` : ''}</div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#138A36]">{enq.price || enq.budget}</td>
                      <td className="py-3.5 px-4 text-gray-600 text-[11px]">
                        {enq.fulfillmentType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          enq.status === "Completed" ? "bg-green-100 text-green-800" :
                          enq.status === "Offer Received" || enq.status === "Interested" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRinging && (
                            <button
                              onClick={handleStopSiren}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black"
                              title="Stop Siren"
                            >
                              🔕 Stop
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                            title="View Detailed Information"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAILED ENQUIRY / ORDER MODAL ── */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#138A36]">{selectedEnquiry.id}</span>
                  {selectedEnquiry.isOrder && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                      CUSTOMER ORDER
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-[#111111] mt-0.5">{selectedEnquiry.productName || selectedEnquiry.productRequested}</h3>
                <p className="text-xs text-gray-500">{selectedEnquiry.size} • Amount: {selectedEnquiry.price || selectedEnquiry.budget}</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5]">
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Customer</span>
                <span className="font-bold text-[#111111]">{selectedEnquiry.customerName}</span>
                {selectedEnquiry.customerPhone && (
                  <span className="text-[11px] text-gray-500 block">{selectedEnquiry.customerPhone}</span>
                )}
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Target Shop</span>
                <span className="font-bold text-[#111111]">{selectedEnquiry.shopName}</span>
              </div>
            </div>

            {selectedEnquiry.deliveryAddress && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-gray-900 block font-bold">Delivery Address:</strong>
                  {selectedEnquiry.deliveryAddress}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Order / Enquiry Notes</h4>
              <div className="p-3 bg-[#EAF7EE] border border-[#DDF3E3] rounded-2xl text-xs text-[#0B6B2B] italic">
                "{selectedEnquiry.lastMessage}"
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              {isRinging && (
                <button 
                  onClick={handleStopSiren}
                  className="py-2 px-4 bg-red-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Siren</span>
                </button>
              )}
              <button onClick={() => setSelectedEnquiry(null)} className="py-2 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
