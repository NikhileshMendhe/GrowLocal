import * as repository from './savedShops.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

// §6.8 — customer_id is always derived from req.auth, never the body (§7.3)

export async function saveShop(auth, shopId) {
  if (!(await repository.findShopById(shopId))) {
    throw new NotFoundError('Shop not found');
  }
  return repository.save({ customerId: auth.id, shopId });
}

export async function removeShop(auth, shopId) {
  const removed = await repository.remove({ customerId: auth.id, shopId });
  if (!removed) throw new NotFoundError('This shop is not in your saved shops');
  return true;
}

export async function listMine(auth, { limit, offset }) {
  return repository.listForCustomer({ customerId: auth.id, limit, offset });
}
