/**
 * Room name helpers (§4 realtime/rooms.js).
 * - 'catalog' is public: every connected socket joins it (§7.5).
 * - shop/customer/conversation rooms are joined based on verified JWT identity.
 */
export const CATALOG_ROOM = 'catalog';

export const shopRoom = (shopId) => `shop:${shopId}`;

export const customerRoom = (customerId) => `customer:${customerId}`;

export const merchantRoom = (merchantId) => `merchant:${merchantId}`;

export const adminRoom = (adminId) => `admin:${adminId}`;

export const conversationRoom = (conversationId) => `conversation:${conversationId}`;
