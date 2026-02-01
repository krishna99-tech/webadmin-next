/**
 * Admin service - re-exports from unified api.js
 */
import { APIs } from './api';

const admin = APIs.admin;

export default {
  getUsers: admin.getUsers,
  deleteUser: admin.deleteUser,
  getActivity: admin.getActivity,
  sendBroadcast: admin.sendBroadcast,
  getAllDevices: admin.getAllDevices,
  getUserDetail: admin.getUserDetail,
  getAnalytics: admin.getAnalytics,
  exportUsers: admin.exportUsers,
  exportDevices: admin.exportDevices,
  exportActivity: admin.exportActivity,
  getSecurityRules: admin.getSecurityRules,
  updateSecurityRules: admin.updateSecurityRules,
  getDashboards: admin.getDashboards,
  getWidgets: admin.getWidgets,
  getDeviceDetail: admin.getDeviceDetail,
  getDeviceTelemetry: admin.getDeviceTelemetry,
  updateProfile: admin.updateProfile,
  getNotifications: admin.getNotifications,
  createDeviceAdmin: admin.createDeviceAdmin,
  transferDeviceOwnership: admin.transferDeviceOwnership,
};
