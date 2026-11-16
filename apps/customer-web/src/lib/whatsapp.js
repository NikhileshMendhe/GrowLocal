import { api } from './apiClient';
import { trackActivity } from './activityTracker';

/**
 * GrowLocal Official WhatsApp Short Link Destination.
 * Common WhatsApp destination across the entire Customer Storefront.
 */
export const OFFICIAL_WHATSAPP_SHORT_LINK = 'https://wa.me/message/YYPIT2XYSY5WD1';

/**
 * Triggers the official WhatsApp inquiry workflow:
 * 1. Records the WhatsApp inquiry click in Supabase (enquiries + customer_activities).
 * 2. Records customer information if logged in.
 * 3. Records product name, product ID, product price, quantity, and timestamp.
 * 4. Seamlessly redirects/opens the customer to the official GrowLocal WhatsApp link.
 *
 * @param {Object} options
 * @param {Object} [options.product] - Product being inquired about
 * @param {number} [options.quantity=1] - Product quantity
 * @param {Object} [options.customer] - Logged in customer object
 * @param {Array} [options.items] - Cart items if inquiring about cart
 * @param {number} [options.totalAmount] - Estimated total amount
 * @returns {Promise<string>} Destination URL
 */
export async function triggerWhatsAppInquiry({
  product = null,
  quantity = 1,
  customer = null,
  items = null,
  totalAmount = null,
} = {}) {
  const destination = OFFICIAL_WHATSAPP_SHORT_LINK;

  // Immediately open the destination window/tab to prevent browser popup blocking
  const newWindow = typeof window !== 'undefined'
    ? window.open(destination, '_blank', 'noopener,noreferrer')
    : null;

  // Async recording to backend / Supabase in background
  const payload = {
    productId: product?.id || null,
    productName: product?.name || null,
    productPrice: product?.price !== undefined ? Number(product.price) : null,
    quantity: quantity || 1,
    customerName: customer?.full_name || customer?.name || null,
    customerEmail: customer?.email || null,
    customerPhone: customer?.phone || null,
    items: items || undefined,
    totalAmount: totalAmount !== null ? Number(totalAmount) : undefined,
  };

  try {
    await Promise.allSettled([
      api.post('/enquiries/whatsapp', payload, { skipAuthRetry: true }),
      trackActivity({
        activityType: 'whatsapp_inquiry_click',
        product,
        quantity,
        customer,
        metadata: {
          destination,
          isCart: Boolean(items && items.length > 0),
        },
      }),
    ]);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('WhatsApp inquiry click tracking notice:', err?.message);
    }
  }

  // Fallback if window.open was blocked by the browser
  if (newWindow === null && typeof window !== 'undefined') {
    window.location.href = destination;
  }

  return destination;
}

/**
 * Generates formatted WhatsApp inquiry message for a single product.
 */
export function buildProductInquiryMessage(product, quantity = 1) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const price = Number(product?.price) || 0;
  const total = price * quantity;

  return [
    `👋 Hello GrowLocal Team!`,
    `I am interested in this product:`,
    `📦 *${product?.name || 'Product'}*`,
    `💵 Price: ₹${price.toLocaleString('en-IN')}`,
    `🔢 Quantity: ${quantity}`,
    `💰 Total: ₹${total.toLocaleString('en-IN')}`,
    currentUrl ? `🔗 Link: ${currentUrl}` : '',
    `Could you please let me know availability and ordering details?`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Generates formatted WhatsApp inquiry message for multiple cart items.
 */
export function buildCartInquiryMessage(cartItems = [], subtotal = 0) {
  const lines = [
    `👋 Hello GrowLocal Team!`,
    `I would like to inquire about the items in my shopping cart:`,
    '',
  ];

  cartItems.forEach((item, index) => {
    const itemPrice = Number(item.product?.price) || 0;
    const itemTotal = itemPrice * (item.quantity || 1);
    lines.push(
      `${index + 1}. *${item.product?.name || 'Item'}* (Qty: ${item.quantity}) - ₹${itemTotal.toLocaleString('en-IN')}`
    );
  });

  lines.push('');
  lines.push(`💰 *Total Estimated Value:* ₹${Number(subtotal).toLocaleString('en-IN')}`);
  lines.push(`Please confirm stock availability and how I can place this order.`);

  return lines.join('\n');
}
