/**
 * Advanced Category-Aware NLP Search & Match Engine for GrowLocal
 * Automatically detects category intent from natural queries (e.g. "black shoes" -> Category: Footwear, Attribute: "black"),
 * routes the search into the exact category, scores attributes, and isolates relevant products.
 */

// Comprehensive Category Ontology with triggers and aliases
export const CATEGORY_DEFINITIONS = [
  {
    id: 'footwear',
    canonicalName: 'Footwear',
    triggers: [
      'shoes', 'shoe', 'footwear', 'sneakers', 'sneaker', 'kicks',
      'running shoes', 'sports shoes', 'formal shoes', 'casual shoes',
      'boots', 'boot', 'sandals', 'sandal', 'slippers', 'slipper',
      'loafers', 'loafer', 'oxford', 'oxfords', 'heels', 'crocs', 'chappal',
      'flats', 'slides', 'clogs', 'jooti', 'leather shoes'
    ],
    descriptors: [
      'black', 'white', 'brown', 'tan', 'blue', 'red', 'grey', 'gray',
      'leather', 'running', 'casual', 'formal', 'sports', 'canvas', 'mesh',
      'flat', 'lightweight', 'breathable', 'cushioned', 'waterproof',
      'uk 6', 'uk 7', 'uk 8', 'uk 9', 'uk 10', 'uk 11', 'mens', 'womens'
    ]
  },
  {
    id: 'clothes',
    canonicalName: 'Clothes',
    triggers: [
      'clothes', 'clothing', 'apparel', 'wear', 'garments',
      'shirt', 'shirts', 't-shirt', 'tshirt', 't-shirts', 'tshirts',
      'tee', 'tees', 'chinos', 'chino', 'pants', 'pant', 'trousers',
      'trouser', 'jeans', 'denim', 'kurti', 'kurtis', 'dress', 'polo',
      'jacket', 'hoodie', 'shorts', 'suit', 'blazer', 'oversized',
      'pyjama', 'trackpants', 'joggers', 'sweater', 'sweatshirt'
    ],
    descriptors: [
      'black', 'white', 'blue', 'green', 'beige', 'grey', 'cotton', 'oversized',
      'slim fit', 'regular fit', 'resort', 'printed', 'formal', 'casual',
      'summer', 'plain', 'drop shoulder', 'solid', 'striped', 'checkered',
      's', 'm', 'l', 'xl', 'xxl', '30', '32', '34', '36', '38'
    ]
  },
  {
    id: 'electronics',
    canonicalName: 'Electronics',
    triggers: [
      'electronics', 'gadgets', 'electronic', 'gadget',
      'headphones', 'headphone', 'earphones', 'earphone', 'earbuds',
      'airpods', 'speakers', 'speaker', 'audio', 'sound', 'anc',
      'phone', 'smartphone', 'mobile', 'charger', 'cable', 'laptop', 'tablet'
    ],
    descriptors: [
      'wireless', 'bluetooth', 'noise cancelling', 'bass', 'black', 'white',
      'fast charging', 'portable', 'usb', 'type c', 'over ear', 'in ear'
    ]
  },
  {
    id: 'eyewear',
    canonicalName: 'Eyewear',
    triggers: [
      'eyewear', 'sunglasses', 'sunglass', 'glasses', 'glass',
      'goggles', 'goggle', 'spectacles', 'specs', 'frames', 'shades', 'rayban'
    ],
    descriptors: [
      'polarized', 'uv protection', 'aviator', 'wayfarer', 'black', 'gold', 'silver', 'round'
    ]
  },
  {
    id: 'accessories',
    canonicalName: 'Accessories',
    triggers: [
      'accessories', 'accessory',
      'watch', 'watches', 'smartwatch', 'smart watch', 'timepiece',
      'belt', 'belts', 'wallet', 'wallets', 'cap', 'caps', 'hat', 'tie'
    ],
    descriptors: [
      'leather', 'black', 'brown', 'digital', 'analog', 'fitness', 'smart', 'water resistant'
    ]
  },
  {
    id: 'beauty',
    canonicalName: 'Beauty',
    triggers: [
      'beauty', 'cosmetics', 'makeup', 'skincare', 'perfume', 'fragrance',
      'lotion', 'lipstick', 'serum', 'shampoo', 'cream', 'face wash'
    ],
    descriptors: [
      'natural', 'organic', 'glowing', 'matte', 'hydrating', 'daily'
    ]
  },
  {
    id: 'grocery',
    canonicalName: 'Grocery',
    triggers: [
      'grocery', 'food', 'snacks', 'organic', 'spices', 'tea', 'coffee',
      'oil', 'dry fruits', 'rice', 'wheat', 'dal', 'provisions'
    ],
    descriptors: [
      'fresh', 'daily', 'local', 'pure', 'organic'
    ]
  },
  {
    id: 'jewellery',
    canonicalName: 'Jewellery',
    triggers: [
      'jewellery', 'jewelry', 'ring', 'rings', 'necklace', 'chain',
      'bracelet', 'earrings', 'pendant', 'bangles'
    ],
    descriptors: [
      'gold', 'silver', 'diamond', 'traditional', 'wedding', 'imitation'
    ]
  }
];

/**
 * Detect Category Intent and extract Attribute Modifiers
 * e.g., "black shoes" -> category: "Footwear", attribute: "black", trigger: "shoes"
 * e.g., "shoes" -> category: "Footwear", attribute: "", trigger: "shoes"
 */
export function detectCategoryIntent(query = '') {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) {
    return {
      hasCategoryIntent: false,
      categoryId: null,
      categoryName: null,
      matchedTrigger: null,
      attributeQuery: '',
      attributeTokens: [],
      rawQuery: ''
    };
  }

  // Sort triggers by length descending so multi-word phrases match first (e.g. "running shoes" before "shoes")
  for (const cat of CATEGORY_DEFINITIONS) {
    const sortedTriggers = [...cat.triggers].sort((a, b) => b.length - a.length);

    for (const trigger of sortedTriggers) {
      // Check if the query contains the trigger word/phrase
      const regex = new RegExp(`\\b${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(cleanQuery)) {
        // Remove the trigger to isolate the attribute descriptors
        const attributeQuery = cleanQuery.replace(regex, '').replace(/\s+/g, ' ').trim();
        const attributeTokens = attributeQuery.split(/\s+/).filter(Boolean);

        return {
          hasCategoryIntent: true,
          categoryId: cat.id,
          categoryName: cat.canonicalName,
          matchedTrigger: trigger,
          attributeQuery,
          attributeTokens,
          rawQuery: cleanQuery
        };
      }
    }
  }

  // Fallback: Check if query matches category name directly (e.g. "footwear", "clothes")
  for (const cat of CATEGORY_DEFINITIONS) {
    if (cleanQuery.includes(cat.id) || cleanQuery.includes(cat.canonicalName.toLowerCase())) {
      const attributeQuery = cleanQuery.replace(new RegExp(cat.id, 'i'), '').trim();
      return {
        hasCategoryIntent: true,
        categoryId: cat.id,
        categoryName: cat.canonicalName,
        matchedTrigger: cat.canonicalName.toLowerCase(),
        attributeQuery,
        attributeTokens: attributeQuery.split(/\s+/).filter(Boolean),
        rawQuery: cleanQuery
      };
    }
  }

  return {
    hasCategoryIntent: false,
    categoryId: null,
    categoryName: null,
    matchedTrigger: null,
    attributeQuery: cleanQuery,
    attributeTokens: cleanQuery.split(/\s+/).filter(Boolean),
    rawQuery: cleanQuery
  };
}

/**
 * Check if a product belongs to a given category name or alias
 */
export function isProductInCategory(product, targetCategoryName = '') {
  if (!product || !targetCategoryName) return false;

  const target = targetCategoryName.trim().toLowerCase();
  const prodCat = (product.category || '').trim().toLowerCase();
  const prodName = (product.name || '').toLowerCase();
  const prodDesc = (product.description || '').toLowerCase();

  // Direct category string match
  if (prodCat === target || prodCat.includes(target) || target.includes(prodCat)) {
    return true;
  }

  // Ontology match check
  const catDef = CATEGORY_DEFINITIONS.find(c => 
    c.id === target || c.canonicalName.toLowerCase() === target
  );

  if (catDef) {
    // If product's category matches any of the category's aliases
    if (catDef.triggers.some(t => prodCat.includes(t) || t.includes(prodCat))) {
      return true;
    }
    // If product name explicitly has triggers from this category
    if (catDef.triggers.some(t => {
      const re = new RegExp(`\\b${t}\\b`, 'i');
      return re.test(prodName);
    })) {
      return true;
    }
  }

  return false;
}

/**
 * Score a product with Category Intent prioritization
 */
export function scoreProductWithIntent(product, intent) {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const shopName = (product.shopName || '').toLowerCase();
  const sizes = Array.isArray(product.sizes) ? product.sizes.map(s => String(s).toLowerCase()) : [];

  // If category intent was detected (e.g. "Footwear" for "black shoes")
  if (intent.hasCategoryIntent) {
    const inCategory = isProductInCategory(product, intent.categoryName);

    // If the product is NOT in the detected category, give it 0 score so it is excluded!
    if (!inCategory) {
      return 0;
    }

    // Baseline score for belonging to the requested category
    let score = 100;

    // If there is an attribute query (e.g., "black" from "black shoes")
    if (intent.attributeTokens.length > 0) {
      let matchedAttributeCount = 0;

      for (const token of intent.attributeTokens) {
        if (name.includes(token)) {
          score += 150; // Strong match in product name (e.g. "Black" Oxford)
          matchedAttributeCount++;
        }
        if (desc.includes(token)) {
          score += 50; // Match in product description
          matchedAttributeCount++;
        }
        if (sizes.some(s => s === token || s.includes(token))) {
          score += 60; // Match in size
          matchedAttributeCount++;
        }
      }

      // If specific attribute was requested, products that contain it rank much higher
      if (matchedAttributeCount > 0) {
        score += 80;
      }
    }

    return score;
  }

  // If no specific category intent, perform universal fuzzy token scoring
  const cleanQuery = intent.rawQuery;
  if (!cleanQuery) return 100;

  let score = 0;
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  if (name === cleanQuery) score += 200;
  else if (name.includes(cleanQuery)) score += 120;

  for (const token of tokens) {
    if (name.includes(token)) score += 60;
    if (desc.includes(token)) score += 25;
    if (shopName.includes(token)) score += 20;
    if (sizes.some(s => s.includes(token))) score += 30;
  }

  return score;
}

/**
 * Main Advanced Product Search Function
 * Automatically routes search into category, filters attributes, and sorts results.
 */
export function advancedProductSearch(products = [], query = '', options = {}) {
  const {
    priceRange = 'all', // 'all', 'under500', '500-1000', '1000-2000', '2000plus'
    inStockOnly = false,
    selectedCategory = 'all',
    selectedSize = 'all',
    sortBy = 'relevance' // 'relevance', 'price_low', 'price_high', 'name'
  } = options;

  // 1. Detect Category Intent
  const intent = detectCategoryIntent(query);

  let scoredList = (products || [])
    .map(p => {
      const score = scoreProductWithIntent(p, intent);
      return {
        product: p,
        score
      };
    })
    .filter(item => {
      // If query exists, exclude items with 0 score (which includes items filtered out by category intent!)
      if (query && query.trim() && item.score <= 0) {
        return false;
      }

      const p = item.product;

      // Manual Category Filter override (if user selected a category tab in UI)
      if (selectedCategory && selectedCategory !== 'all') {
        if (!isProductInCategory(p, selectedCategory)) {
          return false;
        }
      }

      // In-stock filter
      if (inStockOnly && p.availability !== 'In Stock' && (!p.stockCount || p.stockCount <= 0)) {
        return false;
      }

      // Size filter
      if (selectedSize !== 'all') {
        const sizes = Array.isArray(p.sizes) ? p.sizes.map(s => String(s).toLowerCase()) : [];
        if (!sizes.includes(selectedSize.toLowerCase())) {
          return false;
        }
      }

      // Price range filter
      const price = typeof p.price === 'number' ? p.price : (Number(p.price) || 0);
      if (priceRange === 'under500' && price > 500) return false;
      if (priceRange === '500-1000' && (price < 500 || price > 1000)) return false;
      if (priceRange === '1000-2000' && (price < 1000 || price > 2000)) return false;
      if (priceRange === '2000plus' && price < 2000) return false;

      return true;
    });

  // 2. Sorting
  scoredList.sort((a, b) => {
    if (sortBy === 'price_low') {
      const priceA = typeof a.product.price === 'number' ? a.product.price : (Number(a.product.price) || 0);
      const priceB = typeof b.product.price === 'number' ? b.product.price : (Number(b.product.price) || 0);
      return priceA - priceB;
    }
    if (sortBy === 'price_high') {
      const priceA = typeof a.product.price === 'number' ? a.product.price : (Number(a.product.price) || 0);
      const priceB = typeof b.product.price === 'number' ? b.product.price : (Number(b.product.price) || 0);
      return priceB - priceA;
    }
    if (sortBy === 'name') {
      return (a.product.name || '').localeCompare(b.product.name || '');
    }
    // Default: Sort by relevance score, then discount %
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.product.originalPrice || 0) - (a.product.originalPrice || 0);
  });

  return scoredList.map(item => item.product);
}

/**
 * Filter shops that carry the matching products or match the query
 */
export function getMatchingShopsForSearch(shops = [], matchedProducts = [], query = '') {
  const cleanQuery = (query || '').trim().toLowerCase();
  const shopIdsWithProducts = new Set(matchedProducts.map(p => p.shopId).filter(Boolean));

  return shops.filter(shop => {
    // If the shop owns one of the matched products, keep it!
    if (shopIdsWithProducts.has(shop.id)) return true;

    // If no query, return all shops
    if (!cleanQuery) return true;

    // Direct shop name match
    const sName = (shop.name || '').toLowerCase();
    const sCat = (shop.category || '').toLowerCase();
    const sAbout = (shop.about || '').toLowerCase();

    return sName.includes(cleanQuery) || sCat.includes(cleanQuery) || sAbout.includes(cleanQuery);
  });
}

/**
 * Generate intelligent autocomplete suggestions for live search inputs
 */
export function getSearchSuggestions(products = [], categories = [], query = '') {
  if (!query || query.trim().length < 1) {
    return {
      intent: { hasCategoryIntent: false },
      products: [],
      categories: [],
      terms: [
        'Black Shoes',
        'Casual Sneakers',
        'Black Oversized T-Shirt',
        'Printed Resort Cuban Shirt',
        'Wireless Headphones',
        'Slim-Fit Chinos'
      ]
    };
  }

  const intent = detectCategoryIntent(query);
  const matchedProds = advancedProductSearch(products, query).slice(0, 4);

  // Suggested keywords
  const termSuggestions = [];
  products.forEach(p => {
    const name = p.name;
    if (name.toLowerCase().includes(query.toLowerCase()) && !termSuggestions.includes(name)) {
      termSuggestions.push(name);
    }
  });

  return {
    intent,
    products: matchedProds,
    categories: intent.hasCategoryIntent ? [intent.categoryName] : [],
    terms: termSuggestions.slice(0, 4)
  };
}
