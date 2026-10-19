import axios from 'axios';
import { getPortalRole, loadSession, clearSession } from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || '/backend-api';
const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  // Render Free can need over 50 seconds to wake. Still bound the wait so
  // every loading state can finish and offer a retry if the service is down.
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.portalRole = getPortalRole();
  const { token } = loadSession(config.portalRole);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    let message = error.response?.data?.message;
    if (status === 429) {
      const seconds = Number(error.response.headers?.['retry-after']);
      message = Number.isFinite(seconds) && seconds > 0
        ? `Too many requests. Please try again in ${Math.ceil(seconds / 60)} minute(s).`
        : message || 'Too many requests. Please wait a few minutes and try again.';
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'The server is taking longer than expected. Please try again shortly.';
    } else if (!error.response || status >= 500) {
      message = 'The server is temporarily unavailable. Please try again shortly.';
    }
    // Existing screens read response.data.message; also cover network errors
    // and HTML gateway responses without losing the original status/code.
    if (message) {
      error.response = { ...error.response, data: { ...(
        typeof error.response?.data === 'object' ? error.response.data : {}
      ), message } };
    }
    const authRequest = /^\/auth\/(login|register|forgot-password|reset-password)$/.test(error.config?.url || '');
    const sentToken = error.config?.headers?.Authorization;
    const role = error.config?.portalRole || getPortalRole();
    const { token: currentToken } = loadSession(role);
    const staleResponse = sentToken && sentToken !== `Bearer ${currentToken}`;
    if (error.response?.status === 401 && !authRequest && !staleResponse) {
      clearSession(role);
      if (getPortalRole() === role && !window.location.pathname.includes('/login')) {
        window.location.href = `${APP_BASE}${role === 'admin' ? '/admin/login' : '/divisha/login'}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
