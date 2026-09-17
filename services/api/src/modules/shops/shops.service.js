import * as repository from './shops.repository.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom } from '../../realtime/rooms.js';
import { NotFoundError, ForbiddenError } from '../../errors/AppError.js';

// §6.3 — public shop browsing. Non-public shops 404 rather than 403 so their
// existence is not leaked to anonymous callers.

export async function listShops(filters, pagination) {
  return repository.listPublic({ ...filters, ...pagination });
}

export async function getShop(id) {
  const shop = await repository.findPublicById(id);
  if (!shop) throw new NotFoundError('Shop not found');
  const [hours, photos] = await Promise.all([
    repository.findHoursByShopId(id),
    repository.findPhotosByShopId(id),
  ]);
  return { ...shop, hours, photos };
}

export async function listShopProducts(shopId, filters, pagination) {
  const shop = await repository.findPublicById(shopId);
  if (!shop) throw new NotFoundError('Shop not found');
  return repository.listApprovedProductsByShop(shopId, filters, pagination.limit, pagination.offset);
}

// §6.3 POST /shops — merchant creates their own shop; merchant_id comes from
// the verified JWT (§7.3), never from the body. status keeps its §3.2 DDL
// default 'open'. No SHOP_* event exists for creation in the events contract,
// so nothing is emitted.
export async function createShop(merchantId, input) {
  return repository.insert({ ...input, merchantId });
}

// §6.3 PATCH /shops/:id — merchant (owner) only, per the doc row: the role
// gate admits merchants, ownership is enforced here. §7.5: the write emits
// SHOP_UPDATED to the owning shop room, same as PATCH /merchants/me/shop.
export async function updateShop(merchantId, id, patch) {
  const shop = await repository.findById(id);
  if (!shop) throw new NotFoundError('Shop not found');
  if (shop.merchant_id !== merchantId) {
    throw new ForbiddenError('You do not own this shop');
  }
  const updated = await repository.update(id, patch);
  emitToRooms(shopRoom(shop.id), EVENTS.SHOP_UPDATED, updated);
  return updated;
}

// §6.3 DELETE /shops/:id — admin only (role gate in routes); 404 on unknown id.
// No SHOP_* deletion event exists in the events contract, so nothing is emitted.
export async function deleteShop(id) {
  const removed = await repository.remove(id);
  if (!removed) throw new NotFoundError('Shop not found');
}
