import { query } from '../db/pool.js';

/**
 * Expires broadcasted demand requests older than 14 days (§7.6).
 */
export async function expireDemandRequests() {
  const result = await query(
    `UPDATE demand_requests
        SET status = 'expired'
      WHERE status = 'broadcasted'
        AND created_at < NOW() - INTERVAL '14 days'`
  );
  return result.rowCount;
}
