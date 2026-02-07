/**
 * IoT Service - Admin-scoped device and user control operations
 */
import client, { unwrap } from './api';

const iotService = {
  // Device CRUD
  getDevices: (params = {}) => client.get('/admin/devices', { params }).then(unwrap),
  getDevice: (id) => client.get(`/admin/devices/${id}`).then((res) => res.data),
  createDevice: (data) => client.post('/admin/devices', data).then((res) => res.data),
  updateDevice: (id, data) => client.put(`/admin/devices/${id}`, data).then((res) => res.data),
  deleteDevice: (id) => client.delete(`/admin/devices/${id}`).then((res) => res.data),
  controlDevice: (id, command, params = {}) =>
    client.post(`/admin/devices/${id}/control`, { command, params }).then((res) => res.data),

  // User Administration
  getUsers: (params = {}) => client.get('/admin/users', { params }).then(unwrap),
  createUser: (data) => client.post('/admin/users', data).then((res) => res.data),
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data).then((res) => res.data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`).then((res) => res.data),
  updateUserRole: (id, role) => client.patch(`/admin/users/${id}/role`, { role }).then((res) => res.data),

  // Metrics & Stats
  getDeviceMetrics: (id, range = '24h') =>
    client.get(`/admin/analytics/devices/${id}/metrics`, { params: { range } }).then((res) => res.data),
  getSystemStats: () => client.get('/admin/analytics').then((res) => res.data),
  getAlerts: (params = {}) => client.get('/admin/alerts', { params }).then((res) => res.data),

  // Bulk Operations
  bulkUpdateDevices: (ids, updates) =>
    client.post('/admin/devices/bulk-update', { deviceIds: ids, updates }).then((res) => res.data),
  bulkDeleteDevices: (ids) =>
    client.post('/admin/devices/bulk-delete', { deviceIds: ids }).then((res) => res.data),
};

export default iotService;
