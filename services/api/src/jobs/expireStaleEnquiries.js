import { query } from '../db/pool.js';

/**
 * Marks enquiries/offers 'expired' past their expiry (§7.6).
 * Offers expire at their explicit expires_at; enquiries have no expires_at
 * column, so they expire on a 7-day TTL unless already resolved.
 */
export async function expireStaleEnquiries() {
  const enquiries = await query(
    `UPDATE enquiries
        SET status = 'expired'
      WHERE status IN ('pending', 'responded')
        AND created_at < NOW() - INTERVAL '7 days'`
  );
  const offers = await query(
    `UPDATE offers
        SET status = 'expired'
      WHERE status = 'sent'
        AND expires_at IS NOT NULL
        AND expires_at < NOW()`
  );
  return { enquiries: enquiries.rowCount, offers: offers.rowCount };
}
