// GrowLocal Master Mock Dataset — Nagpur & Central India Focus

export const INITIAL_LOCATION = {
  city: "Nagpur",
  area: "Butibori, Nagpur",
  radius: "3 km",
  coords: { lat: 21.1458, lng: 79.0882 }
};

export const CATEGORIES = [
  { id: "clothes", name: "Clothes", icon: "Shirt", count: 42 },
  { id: "footwear", name: "Footwear", icon: "Footprints", count: 28 },
  { id: "eyewear", name: "Eyewear", icon: "Glasses", count: 15 },
  { id: "accessories", name: "Accessories", icon: "Watch", count: 34 },
  { id: "electronics", name: "Electronics", icon: "Smartphone", count: 50 },
  { id: "beauty", name: "Beauty", icon: "Sparkles", count: 19 },
  { id: "grocery", name: "Grocery", icon: "ShoppingBag", count: 65 },
  { id: "home", name: "Home", icon: "Home", count: 22 },
  { id: "sports", name: "Sports", icon: "Dumbbell", count: 12 },
  { id: "jewellery", name: "Jewellery", icon: "Gem", count: 18 }
];

export const INITIAL_SHOPS = [
  {
    id: "shop-1",
    name: "Trendy Wear",
    category: "Men's Clothing Store",
    verified: true,
    rating: 4.7,
    reviewsCount: 128,
    distance: "1.2 km away",
    address: "Shop #14, Main Market, Model Town, Butibori, Nagpur, Maharashtra 441108",
    status: "Open",
    closingTime: "Closes 9 PM",
    openHours: "10:00 AM – 9:00 PM",
    openDays: "Mon – Sun (Open All Days)",
    priceRange: "₹299 – ₹19,999",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    logoImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80",
    about: "We provide trendy and premium quality clothing for men. Visit our store for the latest collections at best prices in Nagpur. Specializing in oversized tees, formal shirts, denim, and festival wear.",
    photos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80"
    ],
    reviewsRecommendation: 98,
    ratingsBreakdown: { 5: 92, 4: 26, 3: 8, 2: 2, 1: 0 }
  },
  {
    id: "shop-2",
    name: "Shoe Point",
    category: "Footwear Store",
    verified: true,
    rating: 4.5,
    reviewsCount: 96,
    distance: "1.6 km away",
    address: "Plot 42, Civil Lines Road, Butibori, Nagpur",
    status: "Open",
    closingTime: "Closes 8:30 PM",
    openHours: "10:30 AM – 8:30 PM",
    openDays: "Mon – Sat",
    priceRange: "₹499 – ₹8,999",
    coverImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
    logoImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=200&q=80",
    about: "Authorized retailer for top footwear brands. Sneakers, formal leather shoes, boots, and casual sandals with instant local size availability.",
    photos: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
    ],
    reviewsRecommendation: 95,
    ratingsBreakdown: { 5: 65, 4: 20, 3: 8, 2: 3, 1: 0 }
  },
  {
    id: "shop-3",
    name: "Style Hub",
    category: "Fashion Store",
    verified: true,
    rating: 4.6,
    reviewsCount: 112,
    distance: "1.9 km away",
    address: "Block B, Wardha Road Junction, Nagpur",
    status: "Open",
    closingTime: "Closes 9 PM",
    openHours: "11:00 AM – 9:00 PM",
    openDays: "Mon – Sun",
    priceRange: "₹399 – ₹12,999",
    coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
    logoImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80",
    about: "Unisex clothing, ethnic wear, and modern street fashion with instant tailor fitting available on-site.",
    photos: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"
    ],
    reviewsRecommendation: 96,
    ratingsBreakdown: { 5: 80, 4: 22, 3: 7, 2: 3, 1: 0 }
  },
  {
    id: "shop-4",
    name: "Urban Closet",
    category: "Men's Fashion Store",
    verified: true,
    rating: 4.4,
    reviewsCount: 72,
    distance: "1.8 km away",
    address: "Near Central Square, Butibori Industrial Zone, Nagpur",
    status: "Open",
    closingTime: "Closes 9 PM",
    openHours: "10:00 AM – 9:00 PM",
    openDays: "Mon – Sun",
    priceRange: "₹599 – ₹7,999",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    logoImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80",
    about: "Curated men's casualwear, linen shirts, oversized hoodies, and cargo pants.",
    photos: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"],
    reviewsRecommendation: 92,
    ratingsBreakdown: { 5: 45, 4: 18, 3: 6, 2: 3, 1: 0 }
  },
  {
    id: "shop-5",
    name: "TechZone Electronics",
    category: "Electronics & Gadgets",
    verified: true,
    rating: 4.8,
    reviewsCount: 215,
    distance: "2.1 km away",
    address: "Electronic Plaza, Sitabuldi, Nagpur",
    status: "Open",
    closingTime: "Closes 9:30 PM",
    openHours: "10:00 AM – 9:30 PM",
    openDays: "Mon – Sun",
    priceRange: "₹199 – ₹89,999",
    coverImage: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80",
    logoImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80",
    about: "Smartphones, laptops, noise-cancelling headphones, smartwatches, and accessories with instant store warranty.",
    photos: ["https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80"],
    reviewsRecommendation: 99,
    ratingsBreakdown: { 5: 180, 4: 25, 3: 8, 2: 2, 1: 0 }
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    shopId: "shop-1",
    shopName: "Trendy Wear",
    shopVerified: true,
    shopDistance: "1.2 km away",
    name: "Black Oversized T-Shirt",
    category: "Clothes",
    price: 699,
    originalPrice: 899,
    sizes: ["S", "M", "L", "XL", "XXL"],
    availability: "In Stock",
    stockCount: 32,
    enquiriesCount: 14,
    description: "Premium heavy-weight 240 GSM cotton oversized T-shirt with drop shoulders. Perfect for everyday casual wear.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "prod-2",
    shopId: "shop-1",
    shopName: "Trendy Wear",
    shopVerified: true,
    shopDistance: "1.2 km away",
    name: "Premium Slim-Fit Chinos",
    category: "Clothes",
    price: 1299,
    originalPrice: 1699,
    sizes: ["30", "32", "34", "36"],
    availability: "In Stock",
    stockCount: 18,
    enquiriesCount: 8,
    description: "Stretchable cotton chinos for formal and smart-casual occasions.",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "prod-3",
    shopId: "shop-2",
    shopName: "Shoe Point",
    shopVerified: true,
    shopDistance: "1.6 km away",
    name: "Casual White Leather Sneakers",
    category: "Footwear",
    price: 1899,
    originalPrice: 2499,
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
    availability: "In Stock",
    stockCount: 12,
    enquiriesCount: 19,
    description: "Clean minimalist white leather sneakers with cushioned insoles for all-day comfort.",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "prod-4",
    shopId: "shop-5",
    shopName: "TechZone Electronics",
    shopVerified: true,
    shopDistance: "2.1 km away",
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: 3499,
    originalPrice: 4999,
    sizes: ["Standard"],
    availability: "In Stock",
    stockCount: 9,
    enquiriesCount: 22,
    description: "Active noise cancellation, 40-hour battery life, and deep bass sound tuning.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "prod-5",
    shopId: "shop-3",
    shopName: "Style Hub",
    shopVerified: true,
    shopDistance: "1.9 km away",
    name: "Printed Resort Cuban Shirt",
    category: "Clothes",
    price: 899,
    originalPrice: 1199,
    sizes: ["M", "L", "XL"],
    availability: "Low Stock",
    stockCount: 4,
    enquiriesCount: 11,
    description: "Breathable rayon fabric with modern botanical print for summer outings.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const INITIAL_ENQUIRIES = [
  {
    id: "#GL1256",
    customerName: "Aman Verma",
    customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    shopId: "shop-1",
    shopName: "Trendy Wear",
    productName: "Black Oversized T-Shirt",
    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80",
    size: "Size: L",
    budget: "₹700",
    status: "Offer Received",
    lastMessage: "We can offer it for ₹699. Size L is available.",
    timestamp: "10:30 AM",
    date: "Today"
  },
  {
    id: "#GL1257",
    customerName: "Neha Singh",
    customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    shopId: "shop-1",
    shopName: "Trendy Wear",
    productName: "Premium Slim-Fit Chinos",
    productImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=150&q=80",
    size: "Size: 32",
    budget: "₹1,200",
    status: "Pending",
    lastMessage: "Thanks! Please share the location.",
    timestamp: "11:15 AM",
    date: "Today"
  },
  {
    id: "#GL1258",
    customerName: "Rohit Sharma",
    customerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    shopId: "shop-2",
    shopName: "Shoe Point",
    productName: "Casual White Leather Sneakers",
    productImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80",
    size: "Size: UK 9",
    budget: "₹1,800",
    status: "Interested",
    lastMessage: "Do you have other color options in UK 9?",
    timestamp: "Yesterday",
    date: "Yesterday"
  },
  {
    id: "#GL1259",
    customerName: "Pooja Mehta",
    customerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    shopId: "shop-1",
    shopName: "Trendy Wear",
    productName: "Black Oversized T-Shirt",
    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80",
    size: "Size: M",
    budget: "₹650",
    status: "Completed",
    lastMessage: "Visited shop and purchased. Great service!",
    timestamp: "2 days ago",
    date: "19 Aug"
  }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: "msg-1",
    sender: "customer",
    text: "Hi, do you have this in size L?",
    time: "10:28 AM"
  },
  {
    id: "msg-2",
    sender: "shop",
    text: "Yes! We have it available. What is your budget?",
    time: "10:29 AM"
  },
  {
    id: "msg-3",
    sender: "customer",
    text: "My budget is ₹700.",
    time: "10:30 AM"
  },
  {
    id: "msg-4",
    sender: "shop",
    text: "Great! We can offer it for ₹699. Size L is available in stock right now.",
    time: "10:31 AM",
    offer: {
      productName: "Black Oversized T-Shirt",
      size: "L",
      price: 699,
      originalPrice: 899,
      validUntil: "Valid Today",
      shopName: "Trendy Wear"
    }
  },
  {
    id: "msg-5",
    sender: "customer",
    text: "That's perfect. I will visit your store by evening.",
    time: "10:32 AM"
  },
  {
    id: "msg-6",
    sender: "shop",
    text: "Sure! We look forward to seeing you. You can reserve it so we keep it held for you.",
    time: "10:33 AM"
  }
];

export const INITIAL_RESERVATIONS = [
  {
    id: "RES-8901",
    customerName: "Ananya Deshmukh",
    customerPhone: "+91 98765 43210",
    shopId: "shop-1",
    shopName: "Trendy Wear",
    shopAddress: "Shop #14, Main Market, Model Town, Butibori, Nagpur",
    productName: "Black Oversized T-Shirt",
    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    size: "L",
    price: 699,
    reservedDate: "Today, 21 Aug 2026",
    pickupTime: "6:00 PM - 8:30 PM",
    status: "Confirmed",
    qrCode: "GL-RES-8901-NGP"
  }
];

export const MERCHANT_STATS = {
  todayEnquiries: 24,
  pendingEnquiries: 6,
  offersSent: 8,
  customerInterested: 5,
  completedEnquiries: 5,
  responseRate: "94%",
  reservations: 18,
  visits: 14,
  conversionRate: "78%",
  revenueGenerated: "₹42,500",
  topSearchedProducts: [
    { query: "Black Oversized T-Shirt", count: 84 },
    { query: "White Sneakers size 9", count: 62 },
    { query: "Cotton Chinos 32", count: 45 },
    { query: "Resort Printed Shirts", count: 39 },
    { query: "Formal Linen Shirt", count: 28 }
  ],
  demandTrends: [
    { day: "Mon", enquiries: 14, reservations: 8 },
    { day: "Tue", enquiries: 18, reservations: 12 },
    { day: "Wed", enquiries: 22, reservations: 15 },
    { day: "Thu", enquiries: 19, reservations: 11 },
    { day: "Fri", enquiries: 28, reservations: 21 },
    { day: "Sat", enquiries: 35, reservations: 27 },
    { day: "Sun", enquiries: 30, reservations: 24 }
  ]
};

export const LOCAL_CREATORS = [
  {
    id: "creator-1",
    name: "Rohan & Sakshi | Nagpur Vlogs",
    handle: "@nagpurvlogs",
    niche: "Fashion & Lifestyle",
    followers: "48.5K",
    avgViews: "12.4K",
    conversionRate: "4.8%",
    location: "Nagpur, MH",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    pricing: "₹2,500 / Reel"
  },
  {
    id: "creator-2",
    name: "Central India Tech",
    handle: "@citech_official",
    niche: "Electronics & Gadgets",
    followers: "92.1K",
    avgViews: "28.0K",
    conversionRate: "6.2%",
    location: "Sitabuldi, Nagpur",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    pricing: "₹4,500 / Reel"
  },
  {
    id: "creator-3",
    name: "Aarti Style Journal",
    handle: "@aarti_style",
    niche: "Ethnic & Casualwear",
    followers: "31.2K",
    avgViews: "8.9K",
    conversionRate: "5.1%",
    location: "Wardha Road, Nagpur",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    pricing: "₹1,800 / Reel"
  }
];
