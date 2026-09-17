let accessToken = null;

export function getToken() {
  return accessToken;
}

export function setToken(token) {
  accessToken = typeof token === 'string' && token.length > 0 ? token : null;
}

export function clearToken() {
  accessToken = null;
}
