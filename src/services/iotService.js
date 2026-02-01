/**
 * IoT service (admin devices/users CRUD) - re-exports from unified api.js
 */
import { APIs } from './api';

const iot = APIs.iot;

export default {
  getDevices: iot.getDevices,
  getDevice: iot.getDevice,
  createDevice: iot.createDevice,
  updateDevice: iot.updateDevice,
  deleteDevice: iot.deleteDevice,
  controlDevice: iot.controlDevice,
  getUsers: iot.getUsers,
  createUser: iot.createUser,
  updateUser: iot.updateUser,
  deleteUser: iot.deleteUser,
  updateUserRole: iot.updateUserRole,
  getDeviceMetrics: iot.getDeviceMetrics,
  getSystemStats: iot.getSystemStats,
  getAlerts: iot.getAlerts,
  bulkUpdateDevices: iot.bulkUpdateDevices,
  bulkDeleteDevices: iot.bulkDeleteDevices,
};
