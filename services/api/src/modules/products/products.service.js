import * as repository from './products.repository.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { CATALOG_ROOM, shopRoom } from '../../realtime/rooms.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../errors/AppError.js';

// §6.4/§7.5 — catalog business rules; every write emits its event to the
// catalog + owning shop rooms right after the statement commits.

function roomsFor(shopId) {
  return [CATALOG_ROOM, shopRoom(shopId)];
}

function slugify(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
  return slug || 'product';
}

function discountPercentage(price, originalPrice) {
  if (originalPrice === null || originalPrice === undefined || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function assertPriceConsistency(price, originalPrice) {
  if (originalPrice !== null && originalPrice !== undefined && originalPrice < price) {
    throw new ValidationError('originalPrice must be greater than or equal to price');
  }
}

// §7.3 — ownership is always derived from the verified JWT (req.auth.id),
// never from a client-supplied merchantId.
async function loadOwnedProduct(caller, id) {
  const product = await repository.findById(id);
  if (!product) throw new NotFoundError('Product not found');
  if (product.shop_merchant_id !== caller.id) {
    throw new ForbiddenError('You do not own this shop');
  }
  return product;
}

async function persistAndEmit(existing, fields) {
  const price = fields.price !== undefined ? fields.price : existing.price;
  const originalPrice =
    fields.originalPrice !== undefined ? fields.originalPrice : existing.original_price;
  assertPriceConsistency(price, originalPrice);

  const updates = { ...fields };
  if (fields.price !== undefined || fields.originalPrice !== undefined) {
    updates.discountPercentage = discountPercentage(price, originalPrice);
  }

  await repository.update(existing.id, updates);
  const product = await repository.findById(existing.id);
  emitToRooms(roomsFor(product.shop_id), EVENTS.PRODUCT_UPDATED, product);
  return product;
}

// Merchant callers list their own shops' products (all approval statuses);
// everyone else gets the approved-only public catalog (§6.4).
export async function listProducts(caller, filters, pagination) {
  if (caller?.type === 'merchant') {
    if (filters.shopId) {
      const shop = await repository.findShopById(filters.shopId);
      if (!shop || shop.merchant_id !== caller.id) {
        throw new ForbiddenError('You do not own this shop');
      }
      return repository.list({ ...filters, ...pagination });
    }
    const shopIds = await repository.findShopIdsByMerchantId(caller.id);
    return repository.list({ ...filters, ...pagination, shopIds });
  }
  return repository.list({ ...filters, ...pagination, publicOnly: true });
}

export async function getProduct(caller, id) {
  const product = await repository.findById(id);
  if (!product) throw new NotFoundError('Product not found');
  if (caller?.type === 'merchant' && product.shop_merchant_id === caller.id) {
    return product;
  }
  if (product.approval_status === 'approved' && product.shop_status !== 'suspended') {
    return product;
  }
  throw new NotFoundError('Product not found');
}

export async function createProduct(caller, input) {
  const shop = await repository.findShopById(input.shopId);
  if (!shop || shop.merchant_id !== caller.id) {
    throw new ForbiddenError('You do not own this shop');
  }
  assertPriceConsistency(input.price, input.originalPrice ?? null);

  // approval_status is not set: new products take the §3.2 DDL default 'approved'.
  const inserted = await repository.create({
    ...input,
    slug: slugify(input.name),
    discountPercentage: discountPercentage(input.price, input.originalPrice ?? null),
  });
  const product = await repository.findById(inserted.id);
  emitToRooms(roomsFor(product.shop_id), EVENTS.PRODUCT_CREATED, product);
  return product;
}

export async function updateProduct(caller, id, input) {
  const existing = await loadOwnedProduct(caller, id);
  return persistAndEmit(existing, input);
}

export async function updateStock(caller, id, input) {
  const existing = await loadOwnedProduct(caller, id);
  return persistAndEmit(existing, input);
}

export async function deleteProduct(caller, id) {
  const product = await loadOwnedProduct(caller, id);
  await repository.remove(id);
  emitToRooms(roomsFor(product.shop_id), EVENTS.PRODUCT_DELETED, product);
}
