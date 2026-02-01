/**
 * ThingsNXT - Unified API Layer (single file, use globally)
 *
 * Usage:
 *   import api, { APIs } from '@/services/api';
 *   // or: import { APIs } from '@/services';
 *
 *   api.get('/custom')           → axios instance
 *   APIs.auth.login(u, p)        → auth
 *   APIs.auth.logout()
 *   APIs.auth.getCurrentUser()
 *   APIs.admin.getUsers()        → admin
 *   APIs.admin.getAllDevices()
 *   APIs.admin.getActivity()
 *   APIs.devices.getDevices()    → user devices
 *   APIs.iot.createDevice()     → IoT CRUD
 *   APIs.webhooks.getWebhooks()  → webhooks
 */
import axios from 'axios';
import config from '../config';

// ─── Axios client ─────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

client.interceptors.request.use(
  (cfg) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (typeof window !== 'undefined' && err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          const { data } = await axios.post(`${config.API_BASE_URL}/refresh`, null, {
            params: { refresh_token: refresh },
          });
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            original.headers['Authorization'] = `Bearer ${data.access_token}`;
            return client(original);
          }
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────
const unwrap = (res) => res.data?.data ?? (Array.isArray(res.data) ? res.data : res.data);

// ─── Auth APIs ───────────────────────────────────────────────────────────
const auth = {
  async login(username, password) {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    const res = await client.post('/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (res.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async logout() {
    try {
      await client.post('/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },
};

// ─── Admin APIs ───────────────────────────────────────────────────────────
const admin = {
  getUsers: () => client.get('/admin/users').then((res) => unwrap(res)),
  getUserDetail: (id) => client.get(`/admin/users/${id}`).then((res) => res.data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`).then((res) => res.data),

  getAllDevices: () => client.get('/admin/devices').then((res) => unwrap(res)),
  getDeviceDetail: (id) => client.get(`/admin/devices/${id}`).then((res) => res.data),
  createDeviceAdmin: (data) => client.post('/admin/devices', data).then((res) => res.data),
  transferDeviceOwnership: (deviceId, userId) =>
    client.patch(`/admin/devices/${deviceId}/transfer`, { user_id: userId }).then((res) => res.data),

  getActivity: (params = {}) => client.get('/admin/activity', { params }).then((res) => unwrap(res)),
  sendBroadcast: (subject, message, recipients = null) =>
    client.post('/admin/broadcast', { subject, message, recipients }).then((res) => res.data),

  getAnalytics: () => client.get('/admin/analytics').then((res) => res.data),
  getNotifications: () => client.get('/admin/notifications').then((res) => res.data).catch(() => []),

  getSecurityRules: () => client.get('/admin/security-rules').then((res) => res.data),
  updateSecurityRules: (rules) => client.post('/admin/security-rules', rules).then((res) => res.data),

  getDeviceTelemetry: (deviceId) =>
    client.get(`/admin/devices/${deviceId}/telemetry`).then((res) => res.data),
  getDashboards: (deviceId) => client.get(`/admin/dashboards/${deviceId}`).then((res) => res.data),
  getWidgets: (dashboardId) => client.get(`/widgets/${dashboardId}`).then((res) => res.data),

  updateProfile: (data) => client.put('/auth/me', data).then((res) => res.data),

  exportUsers: () => client.get('/admin/export/users').then((res) => res.data),
  exportDevices: () => client.get('/admin/export/devices').then((res) => res.data),
  exportActivity: () => client.get('/admin/export/activity').then((res) => res.data),
};

// ─── Device APIs (user scope) ─────────────────────────────────────────────
const devices = {
  getDevices: () => client.get('/devices').then((res) => res.data),
  addDevice: (data) => client.post('/devices', data).then((res) => res.data),
  deleteDevice: (id) => client.delete(`/devices/${id}`).then((res) => res.data),
  getDeviceTelemetry: (id) =>
    client.get(`/devices/${id}/telemetry`).then((res) => res.data).catch(() => []),
};

// ─── IoT / CRUD APIs (admin devices & users) ──────────────────────────────
const iot = {
  getDevices: (params = {}) => client.get('/admin/devices', { params }).then((res) => unwrap(res)),
  getDevice: (id) => client.get(`/admin/devices/${id}`).then((res) => res.data),
  createDevice: (data) => client.post('/admin/devices', data).then((res) => res.data),
  updateDevice: (id, data) => client.put(`/admin/devices/${id}`, data).then((res) => res.data),
  deleteDevice: (id) => client.delete(`/admin/devices/${id}`).then((res) => res.data),
  controlDevice: (id, command, params = {}) =>
    client.post(`/admin/devices/${id}/control`, { command, params }).then((res) => res.data),

  getUsers: (params = {}) => client.get('/admin/users', { params }).then((res) => unwrap(res)),
  createUser: (data) => client.post('/admin/users', data).then((res) => res.data),
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data).then((res) => res.data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`).then((res) => res.data),
  updateUserRole: (id, role) => client.patch(`/admin/users/${id}/role`, { role }).then((res) => res.data),

  getDeviceMetrics: (id, range = '24h') =>
    client.get(`/admin/analytics/devices/${id}/metrics`, { params: { range } }).then((res) => res.data),
  getSystemStats: () => client.get('/admin/analytics').then((res) => res.data),
  getAlerts: (params = {}) => client.get('/admin/alerts', { params }).then((res) => res.data),
  bulkUpdateDevices: (ids, updates) =>
    client.post('/admin/devices/bulk-update', { deviceIds: ids, updates }).then((res) => res.data),
  bulkDeleteDevices: (ids) =>
    client.post('/admin/devices/bulk-delete', { deviceIds: ids }).then((res) => res.data),
};

// ─── Webhook APIs ───────────────────────────────────────────────────────
const webhooks = {
  getWebhooks: () =>
    client.get('/webhooks').then((res) => res.data),
  getWebhook: (id) => client.get(`/webhooks/${id}`).then((res) => res.data),
  createWebhook: (data) => client.post('/webhooks', data).then((res) => res.data),
  updateWebhook: (id, data) => client.patch(`/webhooks/${id}`, data).then((res) => res.data),
  deleteWebhook: (id) => client.delete(`/webhooks/${id}`).then((res) => res.data),
};

// ─── Exports ─────────────────────────────────────────────────────────────
/** Axios instance for custom requests */
export default client;

/** All API methods grouped: APIs.auth, APIs.admin, APIs.devices, APIs.iot, APIs.webhooks */
export const APIs = {
  auth,
  admin,
  devices,
  iot,
  webhooks,
};
