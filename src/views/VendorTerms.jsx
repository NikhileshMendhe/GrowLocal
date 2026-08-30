import React, { useState } from 'react';
import { 
  FileText, ArrowLeft, Search, CheckCircle2, ShieldCheck, 
  HelpCircle, ChevronRight, Phone, Mail, Globe, Printer 
} from 'lucide-react';

export default function VendorTerms({ onNavigate, onOpenMerchantAuth, onShowToast }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("all");

  const sections = [
    {
      id: "sec-1",
      num: 1,
      title: "1. About GrowLocal",
      content: `GrowLocal is a local-commerce discovery and connection platform that helps customers discover products and businesses available near them.

GrowLocal may allow customers to:
• Search for products and local businesses;
• Discover nearby shops;
• Submit product requirements;
• Upload product images or references;
• Send enquiries to relevant Vendors;
• Communicate with Vendors; and
• Connect with local businesses for potential purchases.

Unless expressly stated otherwise, GrowLocal does not own, manufacture, stock or directly sell the products listed by Vendors.

The Vendor remains responsible for the products and services offered through their business, including their quality, authenticity, availability, pricing, warranties, returns, refunds and after-sales support, as applicable.`
    },
    {
      id: "sec-2",
      num: 2,
      title: "2. Vendor Eligibility",
      content: `To register and operate as a Vendor on GrowLocal, you must:

1. Operate a genuine business, shop or commercial establishment;
2. Be legally capable of entering into a binding agreement;
3. Have the authority to represent the business being registered;
4. Provide accurate and complete information about your business; and
5. Comply with all laws, licences, registrations and regulatory requirements applicable to your business and products.

GrowLocal may request additional information or documents where reasonably required for verification, compliance, security or platform operations.`
    },
    {
      id: "sec-3",
      num: 3,
      title: "3. Vendor Registration",
      content: `During registration, you may be required to provide information including:

• Business/shop name;
• Owner or authorised representative's name;
• Contact number;
• WhatsApp number;
• Business address;
• Locality;
• Business category;
• Products or services offered;
• Business hours;
• Product photographs;
• Google Maps/location information; and
• Other information reasonably required by GrowLocal.

You are responsible for ensuring that all information submitted to GrowLocal is accurate, current and complete.
You must update your information when there is a material change.`
    },
    {
      id: "sec-4",
      num: 4,
      title: "4. Business and Product Listings",
      content: `The Vendor is solely responsible for the information submitted for its business and product listings.

All information must be:
• Accurate;
• Genuine;
• Clear and not misleading;
• Consistent with the actual product or service;
• Lawful; and
• Updated when material changes occur.

This includes, where applicable:
• Product name, description & photographs;
• Price, size/specifications & availability;
• Offers, discounts & brand information.

A Vendor must not knowingly advertise a product as available when it is unavailable. GrowLocal may review, edit, restrict, reject or remove listings that it reasonably believes are inaccurate, misleading, unlawful, infringe third-party rights, or violate these Terms.`
    },
    {
      id: "sec-5",
      num: 5,
      title: "5. Product Prices and Availability",
      content: `Vendors are responsible for maintaining accurate information regarding product prices and availability.

Because product availability may change in physical stores, information displayed on GrowLocal may require confirmation from the Vendor before a purchase.

Unless GrowLocal expressly provides otherwise, a product listing or customer enquiry does not by itself constitute a completed sale or binding purchase transaction.

The Vendor must clearly communicate the final price, applicable charges, taxes, availability and other material transaction details to the customer before completing a sale.`
    },
    {
      id: "sec-6",
      num: 6,
      title: "6. Customer Enquiries",
      content: `GrowLocal may send customer requirements or enquiries to Vendors based on factors such as:
• Product relevance & category match;
• Location & customer requirements;
• Availability & Vendor responsiveness;
• Listing information & matching factors.

Vendors agree to respond to customer enquiries honestly, professionally and in a reasonably timely manner.

Vendors must not:
• Provide false or misleading information;
• Claim that a product is available when it is not;
• Misrepresent prices or offers;
• Harass, threaten or abuse customers;
• Send spam or misuse customer information; or
• Use GrowLocal enquiries for unlawful or unrelated purposes.`
    },
    {
      id: "sec-7",
      num: 7,
      title: "7. Vendor-Customer Transactions",
      content: `Unless GrowLocal expressly states otherwise, GrowLocal is not a party to the sale or purchase transaction between a Vendor and a customer.

The Vendor is responsible for all aspects of transactions conducted directly with customers, including:
• Product quality, authenticity & availability;
• Final pricing, billing, invoicing & applicable taxes;
• Delivery or pickup arrangements & installation (where applicable);
• Warranty, guarantee, returns, refunds, exchanges & after-sales service; and
• Compliance with applicable laws.

Customers and Vendors are responsible for verifying transaction details before completing a purchase. Nothing in these Terms excludes or restricts consumer rights that cannot lawfully be excluded.`
    },
    {
      id: "sec-8",
      num: 8,
      title: "8. Returns, Refunds and Warranties",
      content: `The Vendor must comply with all applicable laws relating to consumer rights, returns, refunds, warranties and guarantees. Where applicable, Vendors must clearly communicate their relevant policies to customers.

If a product purchased directly from a Vendor is defective, misrepresented, unavailable, or otherwise gives rise to a valid consumer complaint, the Vendor shall be responsible for addressing the matter in accordance with applicable law and its communicated policies.

GrowLocal may assist in communication between the customer and Vendor where reasonably possible. Such assistance does not make GrowLocal the seller or manufacturer of the product.`
    },
    {
      id: "sec-9",
      num: 9,
      title: "9. Vendor Content and Intellectual Property",
      content: `Vendors may provide GrowLocal with business names, logos, photographs, product images, descriptions, videos and other content (“Vendor Content”). The Vendor retains ownership of its Vendor Content.

By submitting Vendor Content to GrowLocal, you grant GrowLocal a non-exclusive, royalty-free licence to host, reproduce, display, format, resize, adapt and use that content for operating GrowLocal, displaying your business, promoting listings, and marketing the platform.

You represent that you have the necessary rights and permissions to submit the Vendor Content. You must not upload or submit content that infringes copyright, trademark, privacy, or legal rights.`
    },
    {
      id: "sec-10",
      num: 10,
      title: "10. Vendor Verification",
      content: `GrowLocal may provide verification or “Verified Vendor” status to eligible businesses based on information, documents or checks performed by GrowLocal.

Verification does not constitute:
• A guarantee of product quality or authenticity of every product;
• A guarantee of sales or business performance;
• An endorsement of every product or service offered; or
• A guarantee that the Vendor will comply with every legal requirement.

GrowLocal may suspend or remove verification if the supporting information becomes inaccurate or if the Vendor violates these Terms.`
    },
    {
      id: "sec-11",
      num: 11,
      title: "11. Prohibited Products and Activities",
      content: `Vendors must not use GrowLocal to list, promote, sell or facilitate products or services that are unlawful or prohibited under applicable law or GrowLocal policies.

This includes, without limitation:
• Counterfeit, unauthorised or stolen goods;
• Fraudulent products or services;
• Illegal drugs, substances, weapons or restricted items;
• Products requiring a licence where the Vendor does not hold the required licence;
• Content that infringes intellectual property rights.

GrowLocal may remove such listings and suspend or terminate the relevant Vendor account.`
    },
    {
      id: "sec-12",
      num: 12,
      title: "12. Customer Information and Privacy",
      content: `A Vendor may receive certain customer information through GrowLocal for the purpose of responding to legitimate enquiries and facilitating permitted customer interactions.

Vendors must:
• Use customer information only for legitimate enquiry/transaction purposes;
• Keep customer information confidential & take reasonable security measures;
• Not sell, rent, or unlawfully disclose customer information;
• Not misuse customer information for unrelated marketing; and
• Comply with applicable privacy and data-protection laws.

Vendor access to customer information may be suspended if GrowLocal reasonably believes it is being misused.`
    },
    {
      id: "sec-13",
      num: 13,
      title: "13. Vendor Account Security",
      content: `The Vendor is responsible for maintaining the confidentiality of its account credentials and for activity conducted through its account.

The Vendor must promptly notify GrowLocal if it becomes aware of:
• Unauthorised access;
• Loss or compromise of account credentials; or
• Unauthorised use of the Vendor account.`
    },
    {
      id: "sec-14",
      num: 14,
      title: "14. Ratings, Reviews and Feedback",
      content: `GrowLocal may allow customers to submit ratings, reviews or feedback about Vendors.

Vendors must not:
• Create fake reviews or manipulate ratings;
• Submit reviews pretending to be customers;
• Pay or improperly incentivise customers for misleading reviews; or
• Threaten or harass customers because of reviews.

GrowLocal may moderate, restrict or remove content that violates applicable law or platform policies.`
    },
    {
      id: "sec-15",
      num: 15,
      title: "15. Vendor Plans and Fees",
      content: `GrowLocal may offer free and paid Vendor plans, subscriptions or promotional services. Any applicable fee will be communicated to the Vendor before activation.

Payment for a GrowLocal subscription or promotional service does not guarantee:
• A specific number of enquiries, customers, sales or revenue;
• A particular search position or customer visits.`
    },
    {
      id: "sec-16",
      num: 16,
      title: "16. Search Ranking and Visibility",
      content: `GrowLocal may determine the order or visibility of Vendors based on relevance, location, category match, availability, listing completeness, Vendor responsiveness, verification status, and applicable promotional features.

GrowLocal does not guarantee a specific ranking, visibility level, number of impressions or number of enquiries.`
    },
    {
      id: "sec-17",
      num: 17,
      title: "17. Promotions and Marketing",
      content: `GrowLocal may promote participating Vendors through search results, discovery pages, social media, digital ads, email, and marketing campaigns.

By using GrowLocal as a Vendor, you agree that GrowLocal may use your business name, listing information and permitted Vendor Content for legitimate platform and marketing purposes.`
    },
    {
      id: "sec-18",
      num: 18,
      title: "18. Vendor Conduct",
      content: `Vendors must interact with customers and GrowLocal representatives professionally.

Vendors must not engage in fraud, deception, harassment, discriminatory conduct, manipulation of enquiries, fake listings, fake reviews, or any conduct that may materially harm customers, other Vendors or GrowLocal.`
    },
    {
      id: "sec-19",
      num: 19,
      title: "19. Suspension and Termination",
      content: `GrowLocal may suspend, restrict, hide or terminate a Vendor account or listing if the Vendor violates these Terms, provides materially false information, lists prohibited products, misuses customer data, or repeatedly receives legitimate complaints.

Vendors may request account removal by contacting GrowLocal. GrowLocal may retain certain records where required by law or necessary for security, legal compliance, or dispute resolution.`
    },
    {
      id: "sec-20",
      num: 20,
      title: "20. Platform Availability",
      content: `GrowLocal will make reasonable efforts to maintain platform functionality. However, GrowLocal does not guarantee uninterrupted, error-free, or completely secure platform availability due to maintenance, updates, or circumstances beyond control.`
    },
    {
      id: "sec-21",
      num: 21,
      title: "21. GrowLocal's Role and Responsibility",
      content: `GrowLocal primarily provides technology and discovery services intended to connect customers with local businesses.

Unless expressly stated otherwise, GrowLocal does not manufacture products, own Vendor inventory, set Vendor prices, guarantee product quality/availability, or become a party to direct customer-vendor sales transactions.`
    },
    {
      id: "sec-22",
      num: 22,
      title: "22. Indemnification",
      content: `The Vendor agrees to indemnify and hold harmless GrowLocal, its founders, employees, and representatives from claims, losses, liabilities, and expenses arising from breach of these Terms, false information, products supplied, IP infringement, or customer disputes.`
    },
    {
      id: "sec-23",
      num: 23,
      title: "23. Changes to These Terms",
      content: `GrowLocal may update these Terms from time to time. Updated versions will be published on the GrowLocal website with a revised Effective Date. Continued use of GrowLocal after updates become effective constitutes acceptance.`
    },
    {
      id: "sec-24",
      num: 24,
      title: "24. Governing Law and Jurisdiction",
      content: `These Terms shall be governed by and interpreted in accordance with the laws of India. Disputes that cannot be resolved amicably through good-faith communication shall be subject to competent courts in India.`
    },
    {
      id: "sec-25",
      num: 25,
      title: "25. Contact Us",
      content: `For questions, Vendor support, account-related concerns or complaints regarding these Terms, please contact:

GrowLocal Commercial Operations
Email: support@growlocal.in / compliance@growlocal.in
Phone / WhatsApp: +91 98765 43210
Website: https://growlocal.in`
    }
  ];

  const filteredSections = sections.filter(sec => {
    const matchesSearch = searchQuery === "" || 
                          sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sec.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeSection === "all" || sec.id === activeSection;
    return matchesSearch && matchesTab;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleAgreeAndRegister = () => {
    if (onShowToast) onShowToast("✓ Vendor Terms & Conditions acknowledged. Redirecting to Business Registration...");
    if (onOpenMerchantAuth) {
      onOpenMerchantAuth();
    } else if (onNavigate) {
      onNavigate("home");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-16">
      
      {/* NAVIGATION BACK BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate ? onNavigate("home") : window.history.back()}
          className="bg-white hover:bg-gray-100 border border-[#E5E7E5] text-[#111111] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#138A36]" />
          <span>Back to GrowLocal</span>
        </button>

        <button
          onClick={handlePrint}
          className="bg-white hover:bg-gray-100 border border-[#E5E7E5] text-[#111111] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-gray-600" />
          <span>Print / Save Terms PDF</span>
        </button>
      </div>

      {/* DOCUMENT HERO HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-extrabold text-green-400 border border-white/10">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Commercial Governance Document</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-poppins tracking-tight">
              GrowLocal Vendor Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Governing shopkeeper, retailer, seller and commercial business registrations, product listings, customer enquiries, data privacy, and platform compliance.
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-right text-xs shrink-0 space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Effective Date</span>
            <span className="text-green-400 font-extrabold text-sm block">29 August 2026</span>
            <span className="text-slate-300 block text-[11px]">Applicable to all Registered Vendors</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms, policies (e.g. returns, privacy, fees, verification)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#138A36]"
            />
          </div>
        </div>
      </div>

      {/* MAIN DOCUMENT BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* QUICK INDEX SIDEBAR */}
        <div className="lg:col-span-1 space-y-3 hidden lg:block sticky top-20 h-fit max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
          <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider px-2 font-mono">
            Sections (1 – 25)
          </h3>
          <div className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveSection("all")}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors font-bold ${
                activeSection === "all" ? "bg-[#138A36] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Sections
            </button>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  const el = document.getElementById(sec.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors truncate ${
                  activeSection === sec.id ? "bg-[#EAF7EE] text-[#138A36] font-extrabold" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* CLAUSES LIST */}
        <div className="lg:col-span-3 space-y-6">
          
          {filteredSections.length === 0 ? (
            <div className="bg-white border border-[#E5E7E5] rounded-3xl p-8 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No matching section found for "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveSection("all"); }}
                className="text-xs text-[#138A36] font-bold hover:underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div 
                key={sec.id} 
                id={sec.id}
                className="bg-white border border-[#E5E7E5] rounded-3xl p-6 sm:p-7 shadow-xs hover:border-[#138A36] transition-colors space-y-3 scroll-mt-24"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#111111] font-poppins">
                    {sec.title}
                  </h2>
                  <span className="text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2.5 py-1 rounded-full border border-[#DDF3E3]">
                    Clause {sec.num}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-[#444444] leading-relaxed whitespace-pre-line font-normal">
                  {sec.content}
                </div>
              </div>
            ))
          )}

          {/* VENDOR ACCEPTANCE BANNER & ACTION BUTTON */}
          <div className="bg-[#EAF7EE] border-2 border-[#138A36] rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-md">
            <div className="max-w-2xl mx-auto space-y-2">
              <span className="bg-[#138A36] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Vendor Acceptance & Confirmation
              </span>
              <h3 className="text-xl font-extrabold text-[#111111] font-poppins">
                Ready to Grow Your Business Local?
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                By registering your business or using GrowLocal as a Vendor, you confirm that you have read, understood, and agree to these Vendor Terms & Conditions and applicable Indian consumer governance laws.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={handleAgreeAndRegister}
                className="w-full sm:w-auto bg-[#138A36] hover:bg-[#0B6B2B] text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I AGREE & REGISTER MY BUSINESS</span>
              </button>

              <button
                onClick={() => onNavigate ? onNavigate("home") : window.history.back()}
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-700 font-bold px-6 py-3.5 rounded-2xl border border-[#E5E7E5] text-xs cursor-pointer"
              >
                Cancel / Return
              </button>
            </div>
          </div>

          {/* CONTACT INFO FOOTER CARD */}
          <div className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-[#138A36] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Vendor Operations</span>
                <span className="font-bold text-[#111111]">support@growlocal.in</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-[#138A36] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Phone / WhatsApp</span>
                <span className="font-bold text-[#111111]">+91 98765 43210</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-[#138A36] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Platform Website</span>
                <span className="font-bold text-[#111111]">https://growlocal.in</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
