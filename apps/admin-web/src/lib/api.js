import { ApiError, createHttpClient, ENDPOINTS } from '@growlocal/api-client';
import { clearToken, getToken, setToken } from './token';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const http = createHttpClient({ baseUrl, getAccessToken: getToken });

let sessionExpiredHandler = null;

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

let refreshInFlight = null;

async function performRefresh() {
  const data = await http.post(ENDPOINTS.AUTH.REFRESH);
  const token = data?.accessToken || data?.token;
  if (!token) {
    throw new ApiError('Refresh response did not include an access token', { code: 'NO_TOKEN' });
  }
  setToken(token);
  return token;
}

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function withRefreshRetry(request) {
  try {
    return await request();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    try {
      await refreshSession();
    } catch {
      clearToken();
      sessionExpiredHandler?.();
      throw error;
    }
    return request();
  }
}

export const api = {
  get: (path, options) => withRefreshRetry(() => http.get(path, options)),
  post: (path, body, options) => withRefreshRetry(() => http.post(path, body, options)),
  patch: (path, body, options) => withRefreshRetry(() => http.patch(path, body, options)),
  put: (path, body, options) => withRefreshRetry(() => http.put(path, body, options)),
  delete: (path, options) => withRefreshRetry(() => http.delete(path, options)),
};
