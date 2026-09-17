import { io } from 'socket.io-client';

/**
 * Event names — mirrors services/api/src/realtime/events.js exactly.
 */
export const SOCKET_EVENTS = {
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

/**
 * Socket.IO client factory (§4 sockets.js). `getAccessToken` is a function so
 * the token is read at connection time — call `socket.auth` re-connection or
 * manage re-init after login. Anonymous connections (no token yet) still
 * receive public catalog events (§7.5).
 *
 * @param {{ wsUrl: string, getAccessToken?: () => string | null }} options
 */
export function createSocketClient({ wsUrl, getAccessToken }) {
  return io(wsUrl, {
    auth: (cb) => cb({ token: getAccessToken?.() || null }),
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
}
