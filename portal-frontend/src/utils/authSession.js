export const getPortalRole = (pathname = window.location.pathname) =>
  /^\/(?:portal\/)?admin(?:\/|$)/.test(pathname) ? 'admin' : 'customer';

const key = (role, field) => `divisha.${role}.${field}`;

// Preserve existing sessions in their own portal, then retire shared keys.
export const migrateLegacySession = (storage = localStorage) => {
  try {
    const user = JSON.parse(storage.getItem('user'));
    const token = storage.getItem('token');
    if (token && ['admin', 'customer'].includes(user?.role) && !storage.getItem(key(user.role, 'token'))) {
      storage.setItem(key(user.role, 'token'), token);
      storage.setItem(key(user.role, 'user'), JSON.stringify(user));
    }
  } catch { /* A malformed saved session requires signing in again. */ }
  storage.removeItem('token');
  storage.removeItem('user');
};

export const loadSession = (role, storage = localStorage) => {
  migrateLegacySession(storage);
  try {
    const user = JSON.parse(storage.getItem(key(role, 'user')));
    const token = storage.getItem(key(role, 'token'));
    if (token && user?.role === role) return { user, token };
  } catch { /* Treat an invalid saved session as signed out. */ }
  return { user: null, token: null };
};

export const saveSession = (role, user, storage = localStorage) => {
  if (user?.role !== role || !user.token) throw new Error('Incorrect account type for this portal.');
  storage.setItem(key(role, 'token'), user.token);
  storage.setItem(key(role, 'user'), JSON.stringify(user));
};

export const clearSession = (role, storage = localStorage) => {
  storage.removeItem(key(role, 'token'));
  storage.removeItem(key(role, 'user'));
};
