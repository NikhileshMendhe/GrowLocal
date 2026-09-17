import * as repository from './demandRequests.repository.js';
import { NotFoundError, ForbiddenError } from '../../errors/AppError.js';

// §6.8 — customer submits a broadcast demand; 14-day expiry is owned by
// jobs/expireDemandRequests.js (not touched here).

export async function createDemandRequest(auth, input) {
  if (input.categoryId && !(await repository.findCategoryById(input.categoryId))) {
    throw new NotFoundError('Category not found');
  }
  if (input.locationId && !(await repository.findLocationById(input.locationId))) {
    throw new NotFoundError('Location not found');
  }
  const inserted = await repository.insert({ customerId: auth.id, ...input });
  return repository.findById(inserted.id);
}

export async function listMine(auth, { status, limit, offset }) {
  return repository.listByCustomer({ customerId: auth.id, status, limit, offset });
}

export async function listNearby({ lat, lng, radiusKm, limit, offset }) {
  return repository.listNearby({ lat, lng, radiusKm, limit, offset });
}

function assertCanView(demandRequest, auth) {
  if (!demandRequest) throw new NotFoundError('Demand request not found');
  const isOwner = auth.type === 'customer' && demandRequest.customer_id === auth.id;
  const isMerchantOrAdmin = auth.type === 'merchant' || auth.type === 'admin';
  if (!isOwner && !isMerchantOrAdmin) {
    throw new ForbiddenError('This demand request is not yours');
  }
}

export async function getDemandRequest(id, auth) {
  const demandRequest = await repository.findById(id);
  assertCanView(demandRequest, auth);
  const responses = await repository.listResponses({ demandRequestId: id, limit: 100, offset: 0 });
  return { ...demandRequest, responses: responses.rows };
}

export async function listResponses(id, auth, { limit, offset }) {
  const demandRequest = await repository.findById(id);
  assertCanView(demandRequest, auth);
  return repository.listResponses({ demandRequestId: id, limit, offset });
}
