/**
 * Module registry: every module's router, mounted at /api/<path>.
 * To add a module: create src/modules/<name>/<name>.routes.js and add one
 * entry here. Wave-2 agents replace placeholder routers in-place without
 * touching any other file.
 */
import { Router } from 'express';

import authRoutes from './auth/auth.routes.js';
import customersRoutes from './customers/customers.routes.js';
import merchantsRoutes from './merchants/merchants.routes.js';
import shopsRoutes from './shops/shops.routes.js';
import productsRoutes from './products/products.routes.js';
import categoriesRoutes from './categories/categories.routes.js';
import ordersRoutes from './orders/orders.routes.js';
import enquiriesRoutes from './enquiries/enquiries.routes.js';
import offersRoutes from './offers/offers.routes.js';
import conversationsRoutes from './conversations/conversations.routes.js';
import reviewsRoutes from './reviews/reviews.routes.js';
import savedShopsRoutes from './saved-shops/savedShops.routes.js';
import searchRoutes from './search/search.routes.js';
import locationsRoutes from './locations/locations.routes.js';
import demandRequestsRoutes from './demand-requests/demandRequests.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
import uploadsRoutes from './uploads/uploads.routes.js';
import subscriptionsRoutes from './subscriptions/subscriptions.routes.js';
import paymentsRoutes from './payments/payments.routes.js';
import creatorsRoutes from './creators/creators.routes.js';
import campaignsRoutes from './campaigns/campaigns.routes.js';
import adminRoutes from './admin/admin.routes.js';

export default [
  { path: '/auth', router: authRoutes },
  { path: '/customers', router: customersRoutes },
  { path: '/merchants', router: merchantsRoutes },
  { path: '/shops', router: shopsRoutes },
  { path: '/products', router: productsRoutes },
  { path: '/categories', router: categoriesRoutes },
  { path: '/orders', router: ordersRoutes },
  { path: '/enquiries', router: enquiriesRoutes },
  { path: '/offers', router: offersRoutes },
  { path: '/conversations', router: conversationsRoutes },
  { path: '/reviews', router: reviewsRoutes },
  { path: '/saved-shops', router: savedShopsRoutes },
  { path: '/search', router: searchRoutes },
  { path: '/locations', router: locationsRoutes },
  { path: '/demand-requests', router: demandRequestsRoutes },
  { path: '/notifications', router: notificationsRoutes },
  { path: '/uploads', router: uploadsRoutes },
  { path: '/subscriptions', router: subscriptionsRoutes },
  { path: '/payments', router: paymentsRoutes },
  { path: '/creators', router: creatorsRoutes },
  { path: '/campaigns', router: campaignsRoutes },
  { path: '/admin', router: adminRoutes },
];
