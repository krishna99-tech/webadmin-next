/**
 * Admin Service - Platform-wide management and analytics
 */
import client, { unwrap } from './api';

const adminService = {
  // User Management
  getUsers: () => client.get('/admin/users').then(unwrap),
  getUserDetail: (id) => client.get(`/admin/users/${id}`).then((res) => res.data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`).then((res) => res.data),
  exportUsers: () => client.get('/admin/export/users').then((res) => res.data),

  // Device Management (Global)
  getAllDevices: () => client.get('/admin/devices').then(unwrap),
  getDeviceDetail: (id) => client.get(`/admin/devices/${id}`).then((res) => res.data),
  createDeviceAdmin: (data) => client.post('/admin/devices', data).then((res) => res.data),
  transferDeviceOwnership: (deviceId, userId) =>
    client.patch(`/admin/devices/${deviceId}/transfer`, { user_id: userId }).then((res) => res.data),
  exportDevices: () => client.get('/admin/export/devices').then((res) => res.data),

  // System Activity & Audit
  getActivity: (params = {}) => client.get('/admin/activity', { params }).then(unwrap),
  exportActivity: () => client.get('/admin/export/activity').then((res) => res.data),
  sendBroadcast: (subject, message, recipients = null) =>
    client.post('/admin/broadcast', { subject, message, recipients }).then((res) => res.data),

  // Analytics
  getAnalytics: () => client.get('/admin/analytics').then((res) => res.data),
  getDeviceTelemetry: (deviceId) => client.get(`/admin/devices/${deviceId}/telemetry`).then((res) => res.data),

  // Security & Content
  getSecurityRules: () => client.get('/admin/security-rules').then((res) => res.data),
  updateSecurityRules: (rules) => client.post('/admin/security-rules', rules).then((res) => res.data),
  getDashboards: (deviceId) => client.get(`/admin/dashboards/${deviceId}`).then((res) => res.data),
  getWidgets: (dashboardId) => client.get(`/widgets/${dashboardId}`).then((res) => res.data),
  
  // Profile & System
  updateProfile: (data) => client.put('/auth/me', data).then((res) => res.data),
  getNotifications: () => client.get('/admin/notifications').then((res) => res.data).catch(() => []),
};

export default adminService;
