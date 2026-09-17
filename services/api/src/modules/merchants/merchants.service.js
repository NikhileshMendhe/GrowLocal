import * as repository from './merchants.repository.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom } from '../../realtime/rooms.js';
import { NotFoundError } from '../../errors/AppError.js';

export async function getProfile(merchantId) {
  const merchant = await repository.findMerchantById(merchantId);
  if (!merchant) throw new NotFoundError('Merchant not found');
  return merchant;
}

export async function updateProfile(merchantId, fields) {
  const merchant = await repository.updateMerchant(merchantId, fields);
  if (!merchant) throw new NotFoundError('Merchant not found');
  return merchant;
}

export async function getMyShop(merchantId) {
  const shop = await repository.findFirstShopByMerchantId(merchantId);
  if (!shop) throw new NotFoundError('No shop found for this merchant');
  return shop;
}

export async function updateMyShop(merchantId, fields) {
  const shop = await repository.findFirstShopByMerchantId(merchantId);
  if (!shop) throw new NotFoundError('No shop found for this merchant');
  const updated = await repository.updateShopById(shop.id, fields);
  // §7.5: emit from the same request handler, after the write commits.
  emitToRooms(shopRoom(shop.id), EVENTS.SHOP_UPDATED, updated);
  return updated;
}
