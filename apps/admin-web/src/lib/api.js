import { ApiError, createHttpClient, ENDPOINTS } from '@growlocal/api-client';
import { clearToken, getToken, isAdminToken, setToken } from './token';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export const http = createHttpClient({ baseUrl, getAccessToken: getToken });

let sessionExpiredHandler = null;

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

let refreshInFlight = null;

async function performRefresh() {
  const data = await http.post(
    `${ENDPOINTS.AUTH.REFRESH}?audience=admin`,
    {},
    { headers: { 'X-Auth-Audience': 'admin' } }
  );
  const token = data?.accessToken || data?.token;
  if (!token) {
    throw new ApiError('Refresh response did not include an access token', { code: 'NO_TOKEN' });
  }
  if (!isAdminToken(token)) {
    clearToken();
    throw new ApiError('Current session does not have admin privileges', { code: 'FORBIDDEN', status: 403 });
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
    if (error instanceof ApiError) {
      if (error.status === 403 && String(error.message || '').includes('role: admin')) {
        clearToken();
        sessionExpiredHandler?.();
        throw error;
      }
      if (error.status === 401) {
        try {
          await refreshSession();
          return await request();
        } catch (refreshErr) {
          clearToken();
          sessionExpiredHandler?.();
          throw refreshErr;
        }
      }
    }
    throw error;
  }
}

export const api = {
  get: (path, options) => withRefreshRetry(() => http.get(path, options)),
  post: (path, body, options) => withRefreshRetry(() => http.post(path, body, options)),
  patch: (path, body, options) => withRefreshRetry(() => http.patch(path, body, options)),
  put: (path, body, options) => withRefreshRetry(() => http.put(path, body, options)),
  delete: (path, options) => withRefreshRetry(() => http.delete(path, options)),
};
