const DEFAULT_API_BASE_URL = 'https://goodgoals-natarajanreformed-backend.hf.space';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

const parseApiResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
};

export const apiRequest = async (path, { token, method = 'GET', body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return parseApiResponse(response);
};

export const authApi = {
  login: (email, password) => apiRequest('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, password) => apiRequest('/api/auth/register', { method: 'POST', body: { email, password } })
};

export const chatApi = {
  sidebar: (token) => apiRequest('/api/chats/sidebar', { token }),
  sync: (token, payload) => apiRequest('/api/chats/sync', { token, method: 'POST', body: payload }),
  resolveReference: (token, pathString) =>
    apiRequest('/api/chats/resolve-reference', { token, method: 'POST', body: { pathString } })
};
