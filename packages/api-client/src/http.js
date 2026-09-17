export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = undefined } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Thin fetch wrapper: base URL, auth header injection, error normalization
 * (§4 packages/api-client). All requests send credentials so the httpOnly
 * refresh cookie flows to /api/auth/* (§8.2).
 *
 * @param {{ baseUrl: string, getAccessToken?: () => string | null }} options
 */
export function createHttpClient({ baseUrl, getAccessToken }) {
  async function request(method, path, { body, query, signal } = {}) {
    let url = `${baseUrl.replace(/\/$/, '')}${path}`;
    if (query) {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          search.append(key, String(value));
        }
      }
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }

    const headers = { Accept: 'application/json' };
    const token = getAccessToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let response;
    try {
      response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new ApiError('Network error — is the API running?', { code: 'NETWORK_ERROR' });
    }

    if (response.status === 204) return null;

    let data = null;
    try {
      data = await response.json();
    } catch {
      // non-JSON body
    }

    if (!response.ok) {
      throw new ApiError(data?.error?.message || `Request failed (${response.status})`, {
        status: response.status,
        code: data?.error?.code || 'HTTP_ERROR',
        details: data?.error?.details,
      });
    }
    return data;
  }

  return {
    get: (path, options) => request('GET', path, options),
    post: (path, body, options) => request('POST', path, { ...options, body }),
    patch: (path, body, options) => request('PATCH', path, { ...options, body }),
    put: (path, body, options) => request('PUT', path, { ...options, body }),
    delete: (path, options) => request('DELETE', path, options),
  };
}
