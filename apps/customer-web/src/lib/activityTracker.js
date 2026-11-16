import { api } from './apiClient';

// In-memory debounce cache to prevent duplicate activity logging within 3 seconds
const recentEvents = new Map();

/**
 * Tracks business-meaningful customer actions and reports them to the backend / Supabase.
 *
 * @param {Object} params
 * @param {string} params.activityType - 'view_product' | 'add_to_cart' | 'update_cart_quantity' | 'remove_from_cart' | 'whatsapp_inquiry_click' | 'buy_now_click' | 'login' | 'registered' | 'order_placed'
 * @param {Object} [params.product] - Product details ({ id, name, price, ... })
 * @param {number} [params.quantity] - Product quantity
 * @param {Object} [params.customer] - Customer details ({ id, full_name, email, phone })
 * @param {Object} [params.metadata] - Extra metadata object
 */
export async function trackActivity({
  activityType,
  product = null,
  quantity = 1,
  customer = null,
  metadata = {},
}) {
  if (!activityType) return;

  // Deduplicate rapid duplicate events (same type + product within 3 seconds)
  const dedupeKey = `${activityType}_${product?.id || customer?.id || 'gen'}`;
  const now = Date.now();
  const lastTime = recentEvents.get(dedupeKey);
  if (lastTime && now - lastTime < 3000) {
    return;
  }
  recentEvents.set(dedupeKey, now);

  const payload = {
    activityType,
    productId: product?.id || null,
    productName: product?.name || null,
    productPrice: product?.price !== undefined ? Number(product.price) : null,
    quantity: quantity || 1,
    customerId: customer?.id || null,
    customerName: customer?.full_name || customer?.name || null,
    customerEmail: customer?.email || null,
    customerPhone: customer?.phone || null,
    metadata: {
      ...metadata,
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
    },
  };

  try {
    await api.post('/activities', payload, { skipAuthRetry: true });
  } catch (err) {
    // Non-blocking side effect: log warning in development only
    if (import.meta.env.DEV) {
      console.warn('Activity tracking notice:', err?.message);
    }
  }
}
