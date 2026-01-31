import api from './api';

/**
 * IoT Service
 * Handles all API communications with the IoT backend.
 * Adapted from IoTAPIClient and integrated with existing axios instance.
 */
class IoTService {
  // Device Management APIs
  async getDevices(filters = {}) {
    const response = await api.get('/admin/devices', { params: filters });
    return response.data?.data || (Array.isArray(response.data) ? response.data : []);
  }

  async getDevice(deviceId) {
    const response = await api.get(`/admin/devices/${deviceId}`);
    return response.data;
  }

  async createDevice(deviceData) {
    const response = await api.post('/admin/devices', deviceData);
    return response.data;
  }

  async updateDevice(deviceId, deviceData) {
    const response = await api.put(`/admin/devices/${deviceId}`, deviceData);
    return response.data;
  }

  async deleteDevice(deviceId) {
    const response = await api.delete(`/admin/devices/${deviceId}`);
    return response.data;
  }

  async controlDevice(deviceId, command, params = {}) {
    const response = await api.post(`/admin/devices/${deviceId}/control`, { command, params });
    return response.data;
  }

  // User Management APIs
  async getUsers(filters = {}) {
    const response = await api.get('/admin/users', { params: filters });
    return response.data?.data || (Array.isArray(response.data) ? response.data : []);
  }

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  // Analytics and Monitoring
  async getDeviceMetrics(deviceId, timeRange = '24h') {
    const response = await api.get(`/admin/analytics/devices/${deviceId}/metrics`, { params: { range: timeRange } });
    return response.data;
  }

  async getSystemStats() {
    const response = await api.get('/admin/analytics');
    return response.data;
  }

  async getAlerts(filters = {}) {
    const response = await api.get('/admin/alerts', { params: filters });
    return response.data;
  }

  // Bulk Operations
  async bulkUpdateDevices(deviceIds, updates) {
    const response = await api.post('/admin/devices/bulk-update', { deviceIds, updates });
    return response.data;
  }

  async bulkDeleteDevices(deviceIds) {
    const response = await api.post('/admin/devices/bulk-delete', { deviceIds });
    return response.data;
  }

  // Export data
  async exportDeviceData(deviceId, format = 'csv', dateRange = {}) {
    const response = await api.post(`/admin/export/device/${deviceId}`, { format, dateRange }, {
        responseType: format === 'csv' || format === 'excel' ? 'blob' : 'json'
    });
    return response.data;
  }
}

const iotService = new IoTService();
export default iotService;
