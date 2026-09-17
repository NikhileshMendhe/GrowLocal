import * as repository from './search.repository.js';

// §6.8 — unified ranked search across shops + products. Every run is recorded
// in search_history first (drives /popular and /demand-gaps), then executed.

const DEFAULT_SEARCH_RADIUS_KM = 10;

function likeEscape(value) {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}

export async function run(auth, input) {
  const pattern = likeEscape(input.query);
  const limit = input.limit ?? 20;
  const offset = input.offset ?? 0;
  const hasGeo = input.lat !== undefined && input.lng !== undefined;
  const radiusKm = input.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM;
  const customerId = auth?.type === 'customer' ? auth.id : null;

  await repository.recordSearch({
    customerId,
    searchQuery: input.query,
    categoryId: input.categoryId,
    locationId: input.locationId,
  });

  const shops = await repository.searchShops({
    pattern,
    categoryId: input.categoryId,
    lat: hasGeo ? input.lat : undefined,
    lng: hasGeo ? input.lng : undefined,
    radiusKm,
    limit,
    offset,
  });
  const products = await repository.searchProducts({
    pattern,
    categoryId: input.categoryId,
    lat: hasGeo ? input.lat : undefined,
    lng: hasGeo ? input.lng : undefined,
    radiusKm,
    limit,
    offset,
  });

  return {
    query: input.query,
    shops: shops.rows,
    shopTotal: shops.total,
    products: products.rows,
    productTotal: products.total,
    limit,
    offset,
  };
}

export async function popular({ limit = 10 }) {
  return repository.popularSearches({ limit });
}

export async function demandGaps({ limit = 10 }) {
  return repository.demandGaps({ limit });
}
