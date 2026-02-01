/**
 * Device service (user scope) - re-exports from unified api.js
 */
import { APIs } from './api';

export default {
  getDevices: APIs.devices.getDevices,
  addDevice: APIs.devices.addDevice,
  deleteDevice: APIs.devices.deleteDevice,
  getDeviceTelemetry: APIs.devices.getDeviceTelemetry,
};
