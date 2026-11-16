const STORAGE_KEY = 'growlocal_admin_token';

export function parseTokenPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const payload = parseTokenPayload(token);
  if (!payload || payload.type !== 'admin') return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
}

let inMemoryToken = null;
try {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isAdminToken(stored)) {
      inMemoryToken = stored;
    } else if (stored) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
} catch {
  inMemoryToken = null;
}

export function getToken() {
  if (inMemoryToken && !isAdminToken(inMemoryToken)) {
    clearToken();
    return null;
  }
  return inMemoryToken;
}

export function setToken(token) {
  if (typeof token === 'string' && token.length > 0) {
    if (!isAdminToken(token)) {
      console.warn('Attempted to store a non-admin token in Admin Console');
      clearToken();
      return;
    }
    inMemoryToken = token;
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {}
  } else {
    clearToken();
  }
}

export function clearToken() {
  inMemoryToken = null;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}
