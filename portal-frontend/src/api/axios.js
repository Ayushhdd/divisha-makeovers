import axios from 'axios';
import { getPortalRole, loadSession, clearSession } from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || '/backend-api';
const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
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
