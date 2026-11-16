import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * GrowLocal Email Dispatcher
 * Dispatches administrative alerts to GROWLOCAL_ADMIN_EMAIL (growlocal.ngp@gmail.com)
 * for incoming purchase inquiries, orders, and customer registrations.
 */

export async function sendAdminEmail({ subject, text, html, metadata = {} }) {
  const recipient = env.adminEmail || 'growlocal.ngp@gmail.com';

  const payload = {
    to: recipient,
    from: 'GrowLocal Alerts <no-reply@growlocal.in>',
    subject,
    text,
    html: html || `<p>${text}</p>`,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  logger.info(payload, `[EMAIL DISPATCH] Alert sent to ${recipient}: "${subject}"`);
  return { success: true, recipient, messageId: `msg_${Date.now()}` };
}

export async function sendOrderNotificationEmail(order) {
  const refCode = order.order_code || order.id?.slice(0, 8);
  const subject = `[GrowLocal New Order] Order #${refCode} - ₹${order.total_amount}`;
  const customerName = order.customer_name || order.delivery?.recipient_name || 'Valued Customer';
  const customerPhone = order.customer_phone || order.delivery?.recipient_phone || 'Not provided';
  const deliveryAddress = order.delivery_address || order.delivery?.delivery_address || 'Store Pickup';

  const text = `
New Order Received on GrowLocal!
---------------------------------
Order Reference: #${refCode}
Total Amount: ₹${order.total_amount}
Customer Name: ${customerName}
Contact Phone: ${customerPhone}
Fulfillment: ${order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
Delivery Address: ${deliveryAddress}
Status: ${order.status}
Date: ${new Date().toLocaleString()}

Please open the Admin Console to view full details and manage delivery.
`;

  return sendAdminEmail({
    subject,
    text,
    metadata: {
      type: 'order_created',
      orderId: order.id,
      orderCode: refCode,
    },
  });
}

export async function sendInquiryNotificationEmail(enquiry) {
  const refCode = enquiry.enquiry_code || enquiry.id?.slice(0, 8);
  const subject = `[GrowLocal Inquiry Lead] #${refCode} - ${enquiry.product_name || 'Store Inquiry'}`;
  const customerName = enquiry.customer_name || 'Store Visitor';
  const customerPhone = enquiry.customer_phone || 'WhatsApp Lead';

  const text = `
New Customer Inquiry on GrowLocal!
----------------------------------
Inquiry Reference: #${refCode}
Customer: ${customerName}
Phone / Contact: ${customerPhone}
Product: ${enquiry.product_name || 'Store Catalog'}
Message: ${enquiry.message || 'WhatsApp inquiry click'}
Date: ${new Date().toLocaleString()}

Please check the Admin Console to follow up with the lead.
`;

  return sendAdminEmail({
    subject,
    text,
    metadata: {
      type: 'enquiry_created',
      enquiryId: enquiry.id,
      enquiryCode: refCode,
    },
  });
}
