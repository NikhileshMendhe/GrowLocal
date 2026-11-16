import { ApiError, createHttpClient, ENDPOINTS } from '@growlocal/api-client';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

let accessToken = null;
let sessionExpiredHandler = null;

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

const http = createHttpClient({ baseUrl: API_BASE_URL, getAccessToken });

const NO_RETRY_PATHS = new Set([
  ENDPOINTS.AUTH.MERCHANT_LOGIN,
  ENDPOINTS.AUTH.MERCHANT_SIGNUP,
  ENDPOINTS.AUTH.REFRESH,
  ENDPOINTS.AUTH.LOGOUT,
]);

let refreshInFlight = null;

export async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = http
      .post(ENDPOINTS.AUTH.REFRESH)
      .then((session) => {
        accessToken = session.accessToken;
        return session;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function attempt(method, path, body, options) {
  if (method === 'get' || method === 'delete') return http[method](path, options);
  return http[method](path, body, options);
}

async function request(method, path, body, options) {
  try {
    return await attempt(method, path, body, options);
  } catch (error) {
    const retryable = error instanceof ApiError && error.status === 401 && !NO_RETRY_PATHS.has(path);
    if (!retryable) throw error;
    try {
      await refreshSession();
    } catch {
      clearAccessToken();
      sessionExpiredHandler?.();
      throw error;
    }
    return attempt(method, path, body, options);
  }
}

export const api = {
  get: (path, options) => request('get', path, undefined, options),
  post: (path, body, options) => request('post', path, body, options),
  patch: (path, body, options) => request('patch', path, body, options),
  delete: (path, options) => request('delete', path, undefined, options),
};

export const authApi = {
  login: async (email, password) => {
    const session = await http.post(ENDPOINTS.AUTH.MERCHANT_LOGIN, { email, password });
    accessToken = session.accessToken;
    return session;
  },
  signup: async (data) => {
    const session = await http.post(ENDPOINTS.AUTH.MERCHANT_SIGNUP, data);
    accessToken = session.accessToken;
    return session;
  },
  logout: () => api.post(ENDPOINTS.AUTH.LOGOUT),
};
