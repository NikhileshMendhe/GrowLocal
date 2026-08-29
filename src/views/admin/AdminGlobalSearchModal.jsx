import React, { useState } from 'react';
import { Search, X, User, Store, Package, MessageSquare, ShoppingBag, Sparkles, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminGlobalSearchModal({ 
  onClose, 
  customers, 
  merchants, 
  shops, 
  products, 
  enquiries, 
  reservations, 
  creators, 
  campaigns, 
  onNavigate 
}) {
  const [query, setQuery] = useState("");

  const matchingCustomers = query ? customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())) : [];
  const matchingMerchants = query ? merchants.filter(m => m.businessName.toLowerCase().includes(query.toLowerCase()) || m.ownerName.toLowerCase().includes(query.toLowerCase())) : [];
  const matchingShops = query ? shops.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase())) : [];
  const matchingProducts = query ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())) : [];
  const matchingEnquiries = query ? enquiries.filter(e => e.id.toLowerCase().includes(query.toLowerCase()) || e.customerName.toLowerCase().includes(query.toLowerCase()) || e.productName.toLowerCase().includes(query.toLowerCase())) : [];
  const matchingReservations = query ? reservations.filter(r => r.id.toLowerCase().includes(query.toLowerCase()) || r.customerName.toLowerCase().includes(query.toLowerCase())) : [];

  const hasResults = matchingCustomers.length > 0 || matchingMerchants.length > 0 || matchingShops.length > 0 || matchingProducts.length > 0 || matchingEnquiries.length > 0 || matchingReservations.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#E5E7E5] flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Header */}
        <div className="p-4 border-b border-[#E5E7E5] flex items-center gap-3 bg-[#F7F8F7]">
          <Search className="w-5 h-5 text-[#138A36]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global Search: Customer, Merchant, Shop, Product, Enquiry ID, Reservation ID..."
            className="flex-1 bg-transparent border-none text-base text-[#111111] focus:outline-none font-medium placeholder:text-gray-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-[#111111] px-2 py-1 bg-gray-200 rounded-lg">
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!query && (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#138A36]" />
              <p>Type anything to search across the entire GrowLocal platform</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="bg-[#EAF7EE] text-[#138A36] px-2.5 py-1 rounded-full font-medium cursor-pointer" onClick={() => setQuery("Trendy Wear")}>Trendy Wear</span>
                <span className="bg-[#EAF7EE] text-[#138A36] px-2.5 py-1 rounded-full font-medium cursor-pointer" onClick={() => setQuery("Aman Verma")}>Aman Verma</span>
                <span className="bg-[#EAF7EE] text-[#138A36] px-2.5 py-1 rounded-full font-medium cursor-pointer" onClick={() => setQuery("Oversized")}>Oversized T-Shirt</span>
                <span className="bg-[#EAF7EE] text-[#138A36] px-2.5 py-1 rounded-full font-medium cursor-pointer" onClick={() => setQuery("#GL1256")}>#GL1256</span>
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="py-12 text-center text-gray-500 text-sm">
              No matching records found for "{query}".
            </div>
          )}

          {/* Merchants & Shops */}
          {matchingMerchants.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#138A36]" /> Merchants & Businesses
              </h4>
              <div className="space-y-1.5">
                {matchingMerchants.map(m => (
                  <div
                    key={m.id}
                    onClick={() => { onNavigate("merchants"); onClose(); }}
                    className="p-2.5 hover:bg-[#EAF7EE] rounded-xl flex items-center justify-between cursor-pointer group border border-transparent hover:border-[#DDF3E3] transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm text-[#111111] group-hover:text-[#138A36]">{m.businessName}</p>
                      <p className="text-xs text-gray-500">Owner: {m.ownerName} • {m.city} • {m.plan}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#138A36] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {matchingCustomers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Customers
              </h4>
              <div className="space-y-1.5">
                {matchingCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { onNavigate("customers"); onClose(); }}
                    className="p-2.5 hover:bg-blue-50 rounded-xl flex items-center justify-between cursor-pointer group border border-transparent hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-sm text-[#111111] group-hover:text-blue-600">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.email} • {c.location}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {matchingProducts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-purple-600" /> Products
              </h4>
              <div className="space-y-1.5">
                {matchingProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { onNavigate("products"); onClose(); }}
                    className="p-2.5 hover:bg-purple-50 rounded-xl flex items-center justify-between cursor-pointer group border border-transparent hover:border-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-sm text-[#111111] group-hover:text-purple-600">{p.name}</p>
                        <p className="text-xs text-gray-500">₹{p.price} • {p.shopName} • Stock: {p.stockCount}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enquiries */}
          {matchingEnquiries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Enquiries
              </h4>
              <div className="space-y-1.5">
                {matchingEnquiries.map(e => (
                  <div
                    key={e.id}
                    onClick={() => { onNavigate("enquiries"); onClose(); }}
                    className="p-2.5 hover:bg-amber-50 rounded-xl flex items-center justify-between cursor-pointer group border border-transparent hover:border-amber-100 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm text-[#111111] group-hover:text-amber-600">{e.id} — {e.productName}</p>
                      <p className="text-xs text-gray-500">Customer: {e.customerName} • Shop: {e.shopName} • Status: {e.status}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">{e.budget}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#F7F8F7] border-t border-[#E5E7E5] text-xs text-gray-500 flex items-center justify-between">
          <span>Search GrowLocal Central Command Center Database</span>
          <span className="font-mono text-[10px]">Indexed 24,680 items</span>
        </div>
      </div>
    </div>
  );
}
