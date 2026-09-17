/**
 * Event name constants (§4 realtime/events.js). Services emit these; the
 * frontends listen for them. Never emit string literals from services.
 */
export const EVENTS = {
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  SHOP_UPDATED: 'shop:updated',
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  MESSAGE_CREATED: 'message:created',
  NOTIFICATION_CREATED: 'notification:created',
  ENQUIRY_CREATED: 'enquiry:created',
  ENQUIRY_STATUS_CHANGED: 'enquiry:status_changed',
  OFFER_CREATED: 'offer:created',
  OFFER_STATUS_CHANGED: 'offer:status_changed',
  REVIEW_CREATED: 'review:created',
  DEMAND_RESPONSE_CREATED: 'demand_response:created',
};
