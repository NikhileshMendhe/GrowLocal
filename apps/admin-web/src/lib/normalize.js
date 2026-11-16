export function normalizeList(payload) {
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length };
  }
  const items =
    payload?.items ??
    payload?.data ??
    payload?.rows ??
    payload?.results ??
    payload?.products ??
    payload?.customers ??
    payload?.orders ??
    payload?.enquiries ??
    payload?.shops ??
    payload?.merchants ??
    [];
  const total =
    payload?.total ??
    payload?.count ??
    payload?.totalCount ??
    payload?.pagination?.total ??
    payload?.meta?.total ??
    (Array.isArray(items) ? items.length : null);
  return {
    items: Array.isArray(items) ? items : [],
    total: total === null || total === undefined ? (Array.isArray(items) ? items.length : 0) : Number(total) || 0,
  };
}

export function pick(payload, keys) {
  for (const key of keys) {
    const value = payload?.[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return undefined;
}

export function unwrapEnvelope(payload) {
  return payload?.admin ?? payload?.user ?? payload?.data ?? payload ?? null;
}
