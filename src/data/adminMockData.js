// GrowLocal Super Admin Master Dataset — Production Quality Mock Data

export const INITIAL_ADMIN_USERS = [
  {
    id: "admin-1",
    name: "Siddhant Shinde",
    email: "siddhant.shinde@growlocal.in",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    phone: "+91 98230 11223",
    status: "Active",
    lastLogin: "Today, 2:31 PM",
    permissions: ["all"]
  },
  {
    id: "admin-2",
    name: "Priya Kulkarni",
    email: "priya.kulkarni@growlocal.in",
    role: "Operations Admin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    phone: "+91 98230 44556",
    status: "Active",
    lastLogin: "Today, 11:45 AM",
    permissions: ["customers", "merchants", "shops", "enquiries", "reservations"]
  },
  {
    id: "admin-3",
    name: "Rajesh Raut",
    email: "rajesh.raut@growlocal.in",
    role: "Content Admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    phone: "+91 98230 77889",
    status: "Active",
    lastLogin: "Yesterday, 4:20 PM",
    permissions: ["content", "categories", "offers", "banners"]
  },
  {
    id: "admin-4",
    name: "Meera Joshi",
    email: "meera.joshi@growlocal.in",
    role: "Finance Admin",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    phone: "+91 98230 99001",
    status: "Active",
    lastLogin: "2 days ago",
    permissions: ["subscriptions", "payments", "revenue"]
  },
  {
    id: "admin-5",
    name: "Amitabh Sen",
    email: "amitabh.sen@growlocal.in",
    role: "Moderation Admin",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
    phone: "+91 98230 33445",
    status: "Active",
    lastLogin: "Today, 1:10 PM",
    permissions: ["reviews", "reports", "chats", "complaints"]
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Aman Verma",
    email: "aman.verma@gmail.com",
    phone: "+91 98765 12345",
    location: "Butibori, Nagpur",
    regDate: "12 Jan 2026",
    enquiriesCount: 14,
    reservationsCount: 6,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    savedShopsCount: 4,
    reviewsCount: 3,
    internalNotes: "Frequent buyer in men's apparel. Very responsive to offers."
  },
  {
    id: "cust-2",
    name: "Neha Singh",
    email: "neha.singh@yahoo.com",
    phone: "+91 98765 23456",
    location: "Sitabuldi, Nagpur",
    regDate: "18 Jan 2026",
    enquiriesCount: 9,
    reservationsCount: 4,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    savedShopsCount: 7,
    reviewsCount: 5,
    internalNotes: "Prefers instant pick-up options."
  },
  {
    id: "cust-3",
    name: "Rohit Sharma",
    email: "rohit.sharma@outlook.com",
    phone: "+91 98765 34567",
    location: "Civil Lines, Nagpur",
    regDate: "02 Feb 2026",
    enquiriesCount: 22,
    reservationsCount: 11,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    savedShopsCount: 9,
    reviewsCount: 8,
    internalNotes: "High value customer in footwear & electronics."
  },
  {
    id: "cust-4",
    name: "Pooja Mehta",
    email: "pooja.m@gmail.com",
    phone: "+91 98765 45678",
    location: "Wardha Road, Nagpur",
    regDate: "14 Feb 2026",
    enquiriesCount: 5,
    reservationsCount: 2,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    savedShopsCount: 3,
    reviewsCount: 2,
    internalNotes: "Regular buyer of ethnic wear."
  },
  {
    id: "cust-5",
    name: "Karan Malhotra",
    email: "karan.malhotra@gmail.com",
    phone: "+91 98765 56789",
    location: "Sadar, Nagpur",
    regDate: "28 Feb 2026",
    enquiriesCount: 1,
    reservationsCount: 0,
    status: "Suspended",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    savedShopsCount: 1,
    reviewsCount: 0,
    internalNotes: "Suspended for repeated fake enquiry spamming."
  },
  {
    id: "cust-6",
    name: "Ananya Deshmukh",
    email: "ananya.deshmukh@gmail.com",
    phone: "+91 98765 43210",
    location: "Model Town, Nagpur",
    regDate: "05 Mar 2026",
    enquiriesCount: 18,
    reservationsCount: 9,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    savedShopsCount: 12,
    reviewsCount: 6,
    internalNotes: "VIP customer with verified pickup history."
  }
];

export const INITIAL_MERCHANTS = [
  {
    id: "merch-1",
    ownerName: "Vikram Shinde",
    businessName: "Trendy Wear",
    email: "trendywear.ngp@gmail.com",
    phone: "+91 98222 11111",
    city: "Nagpur",
    address: "Shop #14, Main Market, Model Town, Butibori, Nagpur",
    shopStatus: "Open",
    verificationStatus: "Verified",
    productsCount: 42,
    enquiriesCount: 156,
    revenue: "₹1,84,500",
    joinedDate: "10 Jan 2026",
    plan: "Pro Plan",
    gstin: "27AAACW1234F1Z5",
    documents: [
      { type: "GST Registration Certificate", url: "#", status: "Verified" },
      { type: "Shop Establishment License", url: "#", status: "Verified" },
      { type: "Aadhaar Card of Owner", url: "#", status: "Verified" }
    ]
  },
  {
    id: "merch-2",
    ownerName: "Sanjay Agrawal",
    businessName: "Shoe Point",
    email: "shoepoint.ngp@gmail.com",
    phone: "+91 98222 22222",
    city: "Nagpur",
    address: "Plot 42, Civil Lines Road, Butibori, Nagpur",
    shopStatus: "Open",
    verificationStatus: "Verified",
    productsCount: 38,
    enquiriesCount: 112,
    revenue: "₹1,42,000",
    joinedDate: "15 Jan 2026",
    plan: "Grow Plan",
    gstin: "27BBBCA5678G2Z1",
    documents: [
      { type: "GST Registration", url: "#", status: "Verified" },
      { type: "Trade License", url: "#", status: "Verified" }
    ]
  },
  {
    id: "merch-3",
    ownerName: "Preeti Chaudhari",
    businessName: "Style Hub",
    email: "stylehub.ngp@gmail.com",
    phone: "+91 98222 33333",
    city: "Nagpur",
    address: "Block B, Wardha Road Junction, Nagpur",
    shopStatus: "Open",
    verificationStatus: "Verified",
    productsCount: 55,
    enquiriesCount: 198,
    revenue: "₹2,15,400",
    joinedDate: "20 Jan 2026",
    plan: "Pro Plan",
    gstin: "27CCCCB8910H3Z9",
    documents: [
      { type: "GST Certificate", url: "#", status: "Verified" }
    ]
  },
  {
    id: "merch-4",
    ownerName: "Harshvardhan Kapoor",
    businessName: "Urban Closet",
    email: "urbancloset.ngp@gmail.com",
    phone: "+91 98222 44444",
    city: "Nagpur",
    address: "Near Central Square, Butibori Industrial Zone, Nagpur",
    shopStatus: "Open",
    verificationStatus: "Verified",
    productsCount: 29,
    enquiriesCount: 84,
    revenue: "₹98,600",
    joinedDate: "01 Feb 2026",
    plan: "Grow Plan",
    gstin: "27DDDCD1112I4Z3",
    documents: [
      { type: "Shop License", url: "#", status: "Verified" }
    ]
  },
  {
    id: "merch-5",
    ownerName: "Ramesh Tandon",
    businessName: "TechZone Electronics",
    email: "techzone.ngp@gmail.com",
    phone: "+91 98222 55555",
    city: "Nagpur",
    address: "Electronic Plaza, Sitabuldi, Nagpur",
    shopStatus: "Open",
    verificationStatus: "Verified",
    productsCount: 88,
    enquiriesCount: 310,
    revenue: "₹4,12,000",
    joinedDate: "12 Feb 2026",
    plan: "Pro Plan",
    gstin: "27EEEEE3334J5Z7",
    documents: [
      { type: "GST Registration", url: "#", status: "Verified" }
    ]
  }
];

export const INITIAL_PENDING_VERIFICATIONS = [
  {
    id: "verif-1",
    businessName: "Nagpur Saree Palace",
    ownerName: "Sunita Bhandari",
    phone: "+91 98111 88811",
    email: "sunita.bhandari@sareepalace.in",
    businessCategory: "Traditional & Ethnic Wear",
    address: "Shop #8, Dharampeth Main Market, Nagpur, Maharashtra 440010",
    city: "Nagpur",
    submittedDate: "23 Aug 2026, 4:15 PM",
    status: "Pending",
    gstin: "27AAAFK8976L1Z4",
    shopImages: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
    ],
    documents: [
      { title: "GST Certificate", file: "GST_NagpurSareePalace.pdf", status: "Review Required" },
      { title: "Nagpur Municipal Trade License", file: "TradeLicense_NMC.pdf", status: "Valid" },
      { title: "Owner Aadhaar & PAN", file: "KYC_Sunita_Bhandari.pdf", status: "Valid" }
    ]
  },
  {
    id: "verif-2",
    businessName: "Central Spice & Dryfruits",
    ownerName: "Mahesh Chandra",
    phone: "+91 98111 99922",
    email: "chandra.spices@gmail.com",
    businessCategory: "Grocery & Gourmet",
    address: "Plot 19, Itwari Wholesale Market, Nagpur 440002",
    city: "Nagpur",
    submittedDate: "24 Aug 2026, 09:30 AM",
    status: "Pending",
    gstin: "27BBBCL4433M2Z9",
    shopImages: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"
    ],
    documents: [
      { title: "FSSAI License", file: "FSSAI_CentralSpices.pdf", status: "Valid" },
      { title: "GST Certificate", file: "GST_CentralSpices.pdf", status: "Valid" }
    ]
  },
  {
    id: "verif-3",
    businessName: "Royal Jewellers",
    ownerName: "Devendra Kothari",
    phone: "+91 98111 77733",
    email: "kothari.jewels@gmail.com",
    businessCategory: "Jewellery & Gold",
    address: "Main Road, Sarafa Bazaar, Sitabuldi, Nagpur 440012",
    city: "Nagpur",
    submittedDate: "24 Aug 2026, 11:10 AM",
    status: "Pending",
    gstin: "27CCCCK9911N3Z1",
    shopImages: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"
    ],
    documents: [
      { title: "BIS Hallmarking License", file: "BIS_License.pdf", status: "Valid" },
      { title: "GST Certificate", file: "GST_RoyalJewellers.pdf", status: "Valid" }
    ]
  }
];

export const INITIAL_FEATURED_SHOPS = [
  { shopId: "shop-1", priority: 1, startDate: "2026-08-01", endDate: "2026-08-31", placement: "Homepage Banner & Top Nearby" },
  { shopId: "shop-5", priority: 2, startDate: "2026-08-10", endDate: "2026-09-10", placement: "Electronics Spotlight" },
  { shopId: "shop-3", priority: 3, startDate: "2026-08-15", endDate: "2026-08-30", placement: "Fashion Trending" }
];

export const INITIAL_LOCATIONS = [
  { city: "Nagpur", state: "Maharashtra", active: true, radiusDefault: "3 km", localitiesCount: 14, pinCodes: ["440001", "440010", "440012", "441108"] },
  { city: "Mumbai", state: "Maharashtra", active: true, radiusDefault: "5 km", localitiesCount: 45, pinCodes: ["400001", "400050", "400099"] },
  { city: "Pune", state: "Maharashtra", active: true, radiusDefault: "4 km", localitiesCount: 28, pinCodes: ["411001", "411014", "411038"] },
  { city: "Delhi", state: "Delhi NCR", active: false, radiusDefault: "5 km", localitiesCount: 50, pinCodes: ["110001", "110016"] },
  { city: "Bengaluru", state: "Karnataka", active: false, radiusDefault: "5 km", localitiesCount: 38, pinCodes: ["560001", "560034"] }
];

export const SEARCH_DEMAND_GAPS = [
  { query: "Black Formal Shirt", searchCount: 84, category: "Clothes", location: "Butibori", status: "Low Merchant Supply", actionSuggested: "Onboard formal menswear shop" },
  { query: "Nike Running Shoes UK 9", searchCount: 63, category: "Footwear", location: "Sitabuldi", status: "No Direct Match", actionSuggested: "Notify Shoe Point" },
  { query: "Kids School Shoes Size 2", searchCount: 47, category: "Footwear", location: "Wardha Road", status: "Out of Stock Locally", actionSuggested: "Broadcast demand to shoe stores" },
  { query: "Linen Kurta White M", searchCount: 39, category: "Clothes", location: "Dharampeth", status: "High Demand", actionSuggested: "Create local offer campaign" },
  { query: "Noise Cancelling Earbuds", searchCount: 35, category: "Electronics", location: "Butibori", status: "Fulfilled by TechZone", actionSuggested: "Feature TechZone offer" }
];

export const POPULAR_SEARCHES = [
  { keyword: "Oversized T-Shirt", volume: 1420, growth: "+28%", category: "Clothes" },
  { keyword: "Leather Sneakers", volume: 980, growth: "+19%", category: "Footwear" },
  { keyword: "Bluetooth Headphones", volume: 850, growth: "+34%", category: "Electronics" },
  { keyword: "Resort Cuban Shirts", volume: 620, growth: "+12%", category: "Clothes" },
  { keyword: "Cotton Chinos 32", volume: 540, growth: "+15%", category: "Clothes" }
];

export const INITIAL_OFFERS = [
  {
    id: "off-1",
    title: "Flat 25% Off on Men's Oversized Tees",
    merchant: "Trendy Wear",
    product: "Black Oversized T-Shirt",
    originalPrice: 899,
    offerPrice: 699,
    discount: "22% OFF",
    startDate: "20 Aug 2026",
    endDate: "31 Aug 2026",
    redemptions: 48,
    status: "Active",
    featured: true
  },
  {
    id: "off-2",
    title: "Monsoon Footwear Sale — Extra ₹300 Off",
    merchant: "Shoe Point",
    product: "Casual White Leather Sneakers",
    originalPrice: 2499,
    offerPrice: 1899,
    discount: "24% OFF",
    startDate: "15 Aug 2026",
    endDate: "28 Aug 2026",
    redemptions: 34,
    status: "Active",
    featured: false
  },
  {
    id: "off-3",
    title: "Festival Combo — Cuban Shirt + Shorts",
    merchant: "Style Hub",
    product: "Printed Resort Cuban Shirt",
    originalPrice: 1499,
    offerPrice: 1099,
    discount: "27% OFF",
    startDate: "01 Aug 2026",
    endDate: "15 Aug 2026",
    redemptions: 62,
    status: "Expired",
    featured: false
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    customer: "Pooja Mehta",
    shop: "Trendy Wear",
    rating: 5,
    comment: "Visited shop after reserving on GrowLocal. Size L fit perfectly and price was ₹699 as quoted in chat!",
    date: "19 Aug 2026",
    status: "Published",
    flagged: false,
    flagReason: null
  },
  {
    id: "rev-2",
    customer: "Rohit Sharma",
    shop: "Shoe Point",
    rating: 4,
    comment: "Great quality white sneakers. Pickup process took only 2 minutes using the reservation QR code.",
    date: "18 Aug 2026",
    status: "Published",
    flagged: false,
    flagReason: null
  },
  {
    id: "rev-3",
    customer: "BotAccount_99",
    shop: "Style Hub",
    rating: 1,
    comment: "Worst shop buy crypto at http://fake-link.com",
    date: "23 Aug 2026",
    status: "Reported",
    flagged: true,
    flagReason: "Spam & External Link"
  }
];

export const CAMPAIGNS_LIST = [
  {
    id: "camp-1",
    campaignName: "Nagpur Street Wear Fest 2026",
    merchant: "Trendy Wear",
    creator: "Rohan & Sakshi (@nagpurvlogs)",
    budget: "₹2,500",
    reach: "18,400",
    clicks: "2,150",
    enquiries: "184",
    reservations: "92",
    visits: "78",
    purchases: "72",
    customersGenerated: 72,
    roi: "4.8x",
    status: "Active"
  },
  {
    id: "camp-2",
    campaignName: "Audio Gadget Spotlight",
    merchant: "TechZone Electronics",
    creator: "Central India Tech (@citech_official)",
    budget: "₹4,500",
    reach: "42,000",
    clicks: "5,300",
    enquiries: "340",
    reservations: "165",
    visits: "142",
    purchases: "128",
    customersGenerated: 128,
    roi: "6.2x",
    status: "Active"
  }
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "plan-free",
    name: "Free Starter",
    price: "₹0",
    period: "Forever",
    features: [
      "Up to 10 product listings",
      "Standard shop page profile",
      "Direct customer enquiries",
      "Standard support"
    ],
    merchantsCount: 420
  },
  {
    id: "plan-grow",
    name: "Grow Plan",
    price: "₹299",
    period: "per month",
    features: [
      "Up to 50 product listings",
      "Verified Merchant Badge",
      "Broadcast demand alerts",
      "Unlimited customer chat & custom offers",
      "Basic Analytics"
    ],
    merchantsCount: 564
  },
  {
    id: "plan-pro",
    name: "Pro Business",
    price: "₹799",
    period: "per month",
    features: [
      "Unlimited product listings",
      "Priority in search & nearby listings",
      "Creator marketing integration",
      "Dedicated account manager",
      "Full demand analytics & heatmap insights"
    ],
    merchantsCount: 300
  }
];

export const PAYMENTS_LOG = [
  { id: "PAY-901", merchant: "Trendy Wear", type: "Subscription (Pro)", amount: "₹799", status: "Successful", date: "20 Aug 2026", gateway: "Razorpay" },
  { id: "PAY-902", merchant: "Shoe Point", type: "Subscription (Grow)", amount: "₹299", status: "Successful", date: "19 Aug 2026", gateway: "Razorpay" },
  { id: "PAY-903", merchant: "Style Hub", type: "Creator Campaign Fee", amount: "₹2,500", status: "Successful", date: "18 Aug 2026", gateway: "UPI Direct" },
  { id: "PAY-904", merchant: "TechZone Electronics", type: "Subscription (Pro)", amount: "₹799", status: "Successful", date: "15 Aug 2026", gateway: "Razorpay" },
  { id: "PAY-905", merchant: "Urban Closet", type: "Reservation Lead Fee", amount: "₹150", status: "Successful", date: "14 Aug 2026", gateway: "UPI Direct" }
];

export const REVENUE_STATS = {
  grossRevenue: "₹4,82,600",
  netRevenue: "₹4,38,100",
  subscriptionRevenue: "₹2,84,500",
  campaignRevenue: "₹1,24,000",
  leadRevenue: "₹48,100",
  offerRevenue: "₹26,000",
  refunds: "₹4,500"
};

export const USER_REPORTS = [
  {
    id: "REP-401",
    reporter: "Rohit Sharma",
    reportedEntity: "Style Hub",
    entityType: "Shop",
    reason: "Incorrect opening hours listed; shop was closed during stated pickup window.",
    date: "22 Aug 2026",
    priority: "Medium",
    status: "Under Review"
  },
  {
    id: "REP-402",
    reporter: "System Auto-Moderator",
    reportedEntity: "BotAccount_99",
    entityType: "Review",
    reason: "Suspicious spam link and external crypto promotion detected.",
    date: "23 Aug 2026",
    priority: "High",
    status: "New"
  }
];

export const REPORTED_CHATS = [
  {
    id: "chat-rep-1",
    customerName: "Karan Malhotra",
    merchantName: "Style Hub",
    lastMessage: "I will come to shop and cause trouble if you don't discount 80%",
    reportedBy: "Merchant",
    reason: "Abusive and threatening language",
    timestamp: "21 Aug 2026, 6:40 PM",
    status: "Flagged for Moderation",
    messagesCount: 12
  }
];

export const NOTIFICATION_CAMPAIGNS = [
  {
    id: "notif-1",
    title: "Monsoon Festive Deals live in Nagpur!",
    targetAudience: "All Customers in Nagpur",
    type: "Push Notification",
    sentDate: "20 Aug 2026",
    sentCount: 12450,
    deliveredCount: 11980,
    openedCount: 4820,
    clickedCount: 1840
  },
  {
    id: "notif-2",
    title: "Grow Plan Merchant Special Renewal Discount",
    targetAudience: "Active Merchants",
    type: "In-App & Email",
    sentDate: "15 Aug 2026",
    sentCount: 1280,
    deliveredCount: 1260,
    openedCount: 950,
    clickedCount: 420
  }
];

export const INITIAL_CMS_CONTENT = {
  heroHeadline: "Support local. Strengthen your community.",
  heroSubtitle: "Discover verified Nagpur shops nearby, check live inventory, request what you need, and pick up in store instantly.",
  searchPlaceholder: "Search for oversized tees, white sneakers, noise cancelling headphones in Nagpur...",
  communityBannerText: "🌱 Over 1,200 local Nagpur businesses are growing with GrowLocal this month!",
  announcementActive: true,
  announcementText: "🎉 Festive Special: Zero reservation fee on all verified Nagpur stores!",
  sectionsOrder: ["hero", "categories", "demandBanner", "nearbyShops", "featuredProducts", "offers", "creators"]
};

export const DEMAND_HEATMAP_CLUSTERS = [
  { locality: "Butibori", lat: 21.0112, lng: 79.0024, demandScore: 94, topCategory: "Men's Apparel", enquiriesToday: 142 },
  { locality: "Sitabuldi", lat: 21.1458, lng: 79.0882, demandScore: 88, topCategory: "Electronics & Shoes", enquiriesToday: 118 },
  { locality: "Civil Lines", lat: 21.1528, lng: 79.0700, demandScore: 76, topCategory: "Footwear & Eyewear", enquiriesToday: 84 },
  { locality: "Wardha Road", lat: 21.1000, lng: 79.0500, demandScore: 82, topCategory: "Unisex Fashion", enquiriesToday: 95 },
  { locality: "Dharampeth", lat: 21.1400, lng: 79.0600, demandScore: 90, topCategory: "Sarees & Jewellery", enquiriesToday: 128 }
];

export const SYSTEM_HEALTH_SERVICES = [
  { name: "Core API Gateway", category: "API", status: "Operational", uptime: "99.98%", latency: "42ms" },
  { name: "Supabase PostgreSQL DB", category: "Database", status: "Operational", uptime: "99.99%", latency: "18ms" },
  { name: "Authentication Service", category: "Auth", status: "Operational", uptime: "100%", latency: "25ms" },
  { name: "Cloud Image Processing & CDN", category: "Storage", status: "Operational", uptime: "99.95%", latency: "65ms" },
  { name: "Push & In-App Notifications", category: "Notifications", status: "Operational", uptime: "99.90%", latency: "110ms" },
  { name: "Elastic Search Index", category: "Search", status: "Operational", uptime: "99.99%", latency: "14ms" },
  { name: "Payment Gateway (Razorpay)", category: "Payment Gateway", status: "Operational", uptime: "99.95%", latency: "180ms" },
  { name: "Local Geocoding & Maps", category: "Maps", status: "Operational", uptime: "99.97%", latency: "52ms" }
];

export const INITIAL_AUDIT_LOGS = [
  { id: "LOG-501", admin: "Siddhant Shinde", role: "Super Admin", action: "Approved Merchant Verification", entity: "Trendy Wear", timestamp: "24 Aug 2026, 2:31 PM", ip: "103.44.112.5" },
  { id: "LOG-502", admin: "Priya Kulkarni", role: "Operations Admin", action: "Updated Product Price", entity: "Black Oversized T-Shirt", timestamp: "24 Aug 2026, 1:45 PM", ip: "103.44.112.9" },
  { id: "LOG-503", admin: "Rajesh Raut", role: "Content Admin", action: "Updated Homepage Hero Text", entity: "CMS Content", timestamp: "24 Aug 2026, 11:20 AM", ip: "103.44.112.12" },
  { id: "LOG-504", admin: "Amitabh Sen", role: "Moderation Admin", action: "Accessed Reported Conversation", entity: "Chat #chat-rep-1", timestamp: "23 Aug 2026, 4:15 PM", ip: "103.44.112.18" }
];
