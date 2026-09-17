export function normalizeList(payload) {
  if (Array.isArray(payload)) {
    return { items: payload, total: null };
  }
  const items = payload?.items ?? payload?.data ?? payload?.rows ?? payload?.results ?? [];
  const total =
    payload?.total ?? payload?.count ?? payload?.totalCount ?? payload?.pagination?.total ?? payload?.meta?.total ?? null;
  return {
    items: Array.isArray(items) ? items : [],
    total: total === null || total === undefined ? null : Number(total) || 0,
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
