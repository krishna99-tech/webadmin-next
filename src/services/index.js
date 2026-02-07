/**
 * Services Entry Point
 * 
 * Usage:
 *   import { adminService, authService } from '@/services';
 *   import api from '@/services/api';
 */
import api from './api';
import authService from './authService';
import adminService from './adminService';
import deviceService from './deviceService';
import iotService from './iotService';
import webhookService from './webhookService';

export {
  api,
  authService,
  adminService,
  deviceService,
  iotService,
  webhookService
};

// Compatibility layer for legacy "APIs" pattern
export const APIs = {
  auth: authService,
  admin: adminService,
  devices: deviceService,
  iot: iotService,
  webhooks: webhookService,
};
