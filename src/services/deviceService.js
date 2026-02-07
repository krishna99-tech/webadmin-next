/**
 * Device Service - User-scoped device operations
 */
import client from './api';

const deviceService = {
  getDevices: () => client.get('/devices').then((res) => res.data),
  addDevice: (data) => client.post('/devices', data).then((res) => res.data),
  deleteDevice: (id) => client.delete(`/devices/${id}`).then((res) => res.data),
  getDeviceTelemetry: (id) => client.get(`/devices/${id}/telemetry`).then((res) => res.data).catch(() => []),
};

export default deviceService;
