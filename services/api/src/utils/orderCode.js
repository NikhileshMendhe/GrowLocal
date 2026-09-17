import crypto from 'node:crypto';

/**
 * Human-friendly codes shown to users (§4 utils/orderCode.js).
 * e.g. GL-ORD-48213, GL-ENQ-00731. Repositories retry on unique conflicts.
 */
function randomDigits(length) {
  const max = 10 ** length;
  return String(crypto.randomInt(0, max)).padStart(length, '0');
}

export function generateOrderCode() {
  return `GL-ORD-${randomDigits(5)}`;
}

export function generateEnquiryCode() {
  return `GL-ENQ-${randomDigits(5)}`;
}
