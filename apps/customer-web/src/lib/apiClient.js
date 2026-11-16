import { ApiError, createHttpClient, ENDPOINTS } from '@growlocal/api-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

export const SESSION_EXPIRED_EVENT = 'gl:session-expired';

const tokenStore = { current: null };

export function setAccessToken(token) {
  tokenStore.current = token;
}

export function getAccessToken() {
  return tokenStore.current;
}

export { ENDPOINTS, WS_URL };

const http = createHttpClient({ baseUrl: API_BASE_URL, getAccessToken });

let refreshInFlight = null;

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = http
      .post(ENDPOINTS.AUTH.REFRESH)
      .then((data) => {
        setAccessToken(data?.accessToken ?? null);
        return data;
      })
      .catch((error) => {
        setAccessToken(null);
        throw error;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function notifySessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

async function callWithRetry(doCall, options) {
  try {
    return await doCall();
  } catch (error) {
    const retriable =
      error instanceof ApiError &&
      error.status === 401 &&
      getAccessToken() !== null &&
      options?.skipAuthRetry !== true;
    if (!retriable) throw error;
    try {
      await refreshSession();
    } catch {
      notifySessionExpired();
      throw error;
    }
    return doCall();
  }
}

export const api = {
  get: (path, options) => callWithRetry(() => http.get(path, options), options),
  post: (path, body, options) => callWithRetry(() => http.post(path, body, options), options),
  patch: (path, body, options) => callWithRetry(() => http.patch(path, body, options), options),
  put: (path, body, options) => callWithRetry(() => http.put(path, body, options), options),
  delete: (path, options) => callWithRetry(() => http.delete(path, options), options),
};
