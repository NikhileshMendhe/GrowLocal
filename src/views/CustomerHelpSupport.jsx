import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, MessageSquare, Phone, Mail, 
  ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle, 
  ExternalLink, Clock, MapPin, Sparkles, FileQuestion
} from 'lucide-react';

export default function CustomerHelpSupport({ onBack, currentUser, onShowToast }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Issue ticket form
  const [ticketCategory, setTicketCategory] = useState('Reservation / Pickup');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState(null);

  const FAQS = [
    {
      category: 'reservations',
      q: 'How does store visit reservation work on GrowLocal?',
      a: 'When you find an in-stock product or accept a merchant’s price offer, click "Reserve & Visit Store". A unique reservation code and QR verification pass are generated. The merchant holds the product at their physical store for you. You visit the shop in Nagpur, inspect the item in person, and pay directly at the cash counter.'
    },
    {
      category: 'payments',
      q: 'Do I pay online or offline at the shop?',
      a: 'GrowLocal is designed for offline in-store purchases. You do not pay online or enter credit card information. You pay the agreed price directly to the shopkeeper using cash, UPI, or in-store card machine during your visit.'
    },
    {
      category: 'enquiries',
      q: 'How do I check availability or negotiate a price with a shop?',
      a: 'Open any product page and click "Ask About Availability & Negotiate", or visit a shop profile and click "Message Shop". You can ask about size availability, discounts, or special requirements. Verified shopkeepers respond in real time with custom price offers.'
    },
    {
      category: 'reservations',
      q: 'What if a reserved product is sold out or unavailable when I arrive?',
      a: 'Verified merchants on GrowLocal commit to honoring confirmed reservations during the stated pickup window. If any issue arises, you can report it via the form below or contact our Nagpur Support Desk (+91 712 298 4400) for immediate resolution.'
    },
    {
      category: 'general',
      q: 'How are merchants verified on GrowLocal?',
      a: 'Every shop with the green "✓ Verified Shop" badge undergoes physical shopfront verification and business documentation checks by our local Nagpur operations team before being listed.'
    },
    {
      category: 'general',
      q: 'Can I request an item that isn\'t listed on any shop?',
      a: 'Yes! Use the "Tell Shops What You Need" button on Customer Home. Enter your desired item, size, budget, and Nagpur area. Verified shops nearby will be notified and can send you direct offers.'
    }
  ];

  const filteredFaqs = FAQS.filter(f => activeCategory === 'all' || f.category === activeCategory);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      if (onShowToast) onShowToast('Please fill in both subject and description.');
      return;
    }

    const tktId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicketId(tktId);

    // Save ticket locally
    try {
      const stored = JSON.parse(localStorage.getItem('growlocal_support_tickets') || '[]');
      stored.unshift({
        id: tktId,
        category: ticketCategory,
        subject: ticketSubject,
        details: ticketDetails,
        userEmail: currentUser?.email || 'guest@growlocal.in',
        date: new Date().toLocaleDateString('en-GB'),
        status: 'Open'
      });
      localStorage.setItem('growlocal_support_tickets', JSON.stringify(stored));
    } catch (_) {}

    if (onShowToast) onShowToast(`✓ Support ticket #${tktId} created. We will reply within 2 hours!`);
    setTicketSubject('');
    setTicketDetails('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 space-y-6">
      {/* Top Header */}
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
              Help & Support Desk
            </h1>
            <span className="bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#DDF3E3]">
              Nagpur Support Online
            </span>
          </div>
          <p className="text-xs text-[#666666] font-medium">
            Get instant assistance, browse FAQs, or submit an issue report to our local team.
          </p>
        </div>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WhatsApp Card */}
        <a
          href="https://wa.me/919123456789?text=Hi%20GrowLocal%20Support,%20I%20need%20help%20with%20my%20enquiry/reservation."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-4 rounded-3xl border border-[#E5E7E5] card-shadow-hover flex flex-col justify-between hover:border-[#138A36] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#111111]">WhatsApp Support</h3>
              <p className="text-[11px] text-[#666666] mt-0.5">Quick chat with our Nagpur support desk</p>
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs font-bold text-[#138A36]">
            <span>+91 91234 56789</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* Phone Helpline */}
        <a
          href="tel:+917122984400"
          className="bg-white p-4 rounded-3xl border border-[#E5E7E5] card-shadow-hover flex flex-col justify-between hover:border-[#138A36] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#111111]">Direct Phone Call</h3>
              <p className="text-[11px] text-[#666666] mt-0.5">9:00 AM – 8:00 PM IST (Mon–Sat)</p>
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs font-bold text-[#138A36]">
            <span>+91 712 298 4400</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:support@growlocal.in?subject=GrowLocal%20Customer%20Support%20Request"
          className="bg-white p-4 rounded-3xl border border-[#E5E7E5] card-shadow-hover flex flex-col justify-between hover:border-[#138A36] transition-all group cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#111111]">Email Desk</h3>
              <p className="text-[11px] text-[#666666] mt-0.5">Written enquiries & formal reports</p>
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs font-bold text-blue-600">
            <span>support@growlocal.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7E5] pb-4">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-[#138A36]" />
            <h2 className="text-base font-extrabold text-[#111111]">Frequently Asked Questions</h2>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All FAQs' },
              { id: 'reservations', label: 'Reservations' },
              { id: 'payments', label: 'In-Store Pay' },
              { id: 'enquiries', label: 'Shop Enquiries' },
              { id: 'general', label: 'About Us' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#138A36] text-white'
                    : 'bg-[#F7F8F7] text-[#666666] hover:text-[#111111]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#E5E7E5] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-[#111111]">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#138A36] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 bg-[#F8FAF8] text-xs text-[#555555] leading-relaxed border-t border-[#E5E7E5]/50 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Reporting Form */}
      <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-4">
        <div className="flex items-center gap-3 border-b border-[#E5E7E5] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#111111]">Report an Issue / Submit a Ticket</h2>
            <p className="text-xs text-[#666666]">
              Encountered a problem with a reservation, price difference, or shop responsiveness? Let us know.
            </p>
          </div>
        </div>

        {submittedTicketId ? (
          <div className="p-6 bg-[#EAF7EE] border border-[#DDF3E3] rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-150">
            <CheckCircle2 className="w-10 h-10 text-[#138A36] mx-auto" />
            <h3 className="text-base font-extrabold text-[#111111]">Ticket Submitted Successfully!</h3>
            <p className="text-xs text-[#555555] max-w-md mx-auto">
              Your support ticket reference is <strong className="font-mono text-[#138A36]">#{submittedTicketId}</strong>. 
              Our local Nagpur resolution specialist will review this and contact you at {currentUser?.email || 'your registered email'}.
            </p>
            <button
              onClick={() => setSubmittedTicketId(null)}
              className="mt-2 text-xs font-bold text-[#138A36] hover:underline cursor-pointer"
            >
              Submit another query
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111111] mb-1.5 uppercase tracking-wider text-[10px]">
                  Issue Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-medium text-[#111111] outline-none focus:border-[#138A36] cursor-pointer"
                >
                  <option value="Reservation / Pickup">Store Reservation & Pickup</option>
                  <option value="Merchant Response">Merchant Did Not Respond</option>
                  <option value="Pricing / In-Stock Difference">Price or Stock Difference in Shop</option>
                  <option value="Product Authenticity">Product Quality / Verification</option>
                  <option value="Technical Bug">App / Website Issue</option>
                  <option value="Feedback / Suggestion">Feedback or Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1.5 uppercase tracking-wider text-[10px]">
                  Your Email / Phone
                </label>
                <input
                  type="text"
                  readOnly={!!currentUser?.email}
                  defaultValue={currentUser?.email || currentUser?.phone || 'customer@growlocal.in'}
                  className="w-full p-3 bg-gray-100 border border-[#E5E7E5] rounded-xl text-xs font-medium text-[#555555]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1.5 uppercase tracking-wider text-[10px]">
                Subject / Brief Summary
              </label>
              <input
                type="text"
                placeholder="e.g., Shop had different price for black sneakers, or Reservation GL-R-12345 help"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-medium text-[#111111] outline-none focus:border-[#138A36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1.5 uppercase tracking-wider text-[10px]">
                Describe What Happened
              </label>
              <textarea
                rows={4}
                placeholder="Please describe the issue in detail, including shop name or product if relevant..."
                value={ticketDetails}
                onChange={(e) => setTicketDetails(e.target.value)}
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs font-medium text-[#111111] outline-none focus:border-[#138A36] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket to Nagpur Support Team</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
