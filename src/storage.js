const STORAGE_KEY = 'natarajanai.session.v1';

export const loadSession = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const saveSession = (session) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
