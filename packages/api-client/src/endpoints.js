/**
 * Path constants — one per API route (§4 endpoints.js).
 * This file is THE shared API contract: backend modules and frontend apps
 * both derive their paths from it. Keep in sync with
 * the per-module .routes.js files under services/api/src/modules.
 */
export const AUTH = {
  CUSTOMER_SIGNUP: '/auth/customer/signup',
  CUSTOMER_LOGIN: '/auth/customer/login',
  MERCHANT_SIGNUP: '/auth/merchant/signup',
  MERCHANT_LOGIN: '/auth/merchant/login',
  ADMIN_LOGIN: '/auth/admin/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

export const CUSTOMERS = {
  ME: '/customers/me',
};

export const MERCHANTS = {
  ME: '/merchants/me',
  MY_SHOP: '/merchants/me/shop',
};

export const SHOPS = {
  LIST: '/shops',
  DETAIL: (id) => `/shops/${id}`,
  CREATE: '/shops',
  UPDATE: (id) => `/shops/${id}`,
  DELETE: (id) => `/shops/${id}`,
};

export const PRODUCTS = {
  LIST: '/products',
  DETAIL: (id) => `/products/${id}`,
  CREATE: '/products',
  UPDATE: (id) => `/products/${id}`,
  DELETE: (id) => `/products/${id}`,
  STOCK: (id) => `/products/${id}/stock`,
};

export const CATEGORIES = {
  LIST: '/categories',
  DETAIL: (id) => `/categories/${id}`,
};

export const LOCATIONS = {
  LIST: '/locations',
};

export const ORDERS = {
  CREATE: '/orders',
  MINE: '/orders/mine',
  SHOP: '/orders/shop',
  DETAIL: (id) => `/orders/${id}`,
  STATUS: (id) => `/orders/${id}/status`,
  CANCEL: (id) => `/orders/${id}/cancel`,
};

export const ENQUIRIES = {
  CREATE: '/enquiries',
  MINE: '/enquiries/mine',
  SHOP: '/enquiries/shop',
  STATUS: (id) => `/enquiries/${id}/status`,
};

export const OFFERS = {
  LIST: '/offers',
  CREATE: '/offers',
  DETAIL: (id) => `/offers/${id}`,
  ACCEPT: (id) => `/offers/${id}/accept`,
  REJECT: (id) => `/offers/${id}/reject`,
};

export const CONVERSATIONS = {
  LIST: '/conversations',
  CREATE: '/conversations',
  DETAIL: (id) => `/conversations/${id}`,
  MESSAGES: (id) => `/conversations/${id}/messages`,
};

export const REVIEWS = {
  LIST: '/reviews',
  CREATE: '/reviews',
  MINE: '/reviews/mine',
  REPORT: (id) => `/reviews/${id}/report`,
};

export const SAVED_SHOPS = {
  MINE: '/saved-shops/mine',
  SAVE: (shopId) => `/saved-shops/${shopId}`,
};

export const SEARCH = {
  RUN: '/search',
  POPULAR: '/search/popular',
  DEMAND_GAPS: '/search/demand-gaps',
};

export const DEMAND_REQUESTS = {
  CREATE: '/demand-requests',
  MINE: '/demand-requests/mine',
  NEARBY: '/demand-requests/nearby',
  DETAIL: (id) => `/demand-requests/${id}`,
  RESPONSES: (id) => `/demand-requests/${id}/responses`,
};

export const NOTIFICATIONS = {
  MINE: '/notifications/mine',
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
};

export const UPLOADS = {
  PRESIGN: '/uploads/presign',
};

export const SUBSCRIPTIONS = {
  PLANS: '/subscriptions/plans',
  ME: '/subscriptions/me',
  SUBSCRIBE: '/subscriptions',
};

export const PAYMENTS = {
  CREATE: '/payments',
  MINE: '/payments/mine',
};

export const CREATORS = {
  LIST: '/creators',
  DETAIL: (id) => `/creators/${id}`,
};

export const CAMPAIGNS = {
  MINE: '/campaigns/mine',
  CREATE: '/campaigns',
  DETAIL: (id) => `/campaigns/${id}`,
  CREATORS: (id) => `/campaigns/${id}/creators`,
  METRICS: (id) => `/campaigns/${id}/metrics`,
};

export const ADMIN = {
  DASHBOARD: '/admin/dashboard',
  AUDIT_LOGS: '/admin/audit-logs',
  SHOPS: '/admin/shops',
  SHOP_STATUS: (id) => `/admin/shops/${id}/status`,
  SHOP_VERIFICATIONS: '/admin/shop-verifications',
  REVIEW_VERIFICATION: (id) => `/admin/shop-verifications/${id}`,
  PRODUCTS: '/admin/products',
  PRODUCT_APPROVAL: (id) => `/admin/products/${id}/approval`,
  MERCHANTS: '/admin/merchants',
  MERCHANT_STATUS: (id) => `/admin/merchants/${id}/status`,
  CUSTOMERS: '/admin/customers',
  CUSTOMER_STATUS: (id) => `/admin/customers/${id}/status`,
};
