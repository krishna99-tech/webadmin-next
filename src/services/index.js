/**
 * Services - single entry for global API usage
 * import api, { APIs } from '@/services';
 * import { APIs } from '@/services';  // APIs.auth, APIs.admin, APIs.devices, APIs.iot, APIs.webhooks
 */
export { default, APIs } from './api';
export { default as authService } from './authService';
export { default as adminService } from './adminService';
export { default as deviceService } from './deviceService';
export { default as iotService } from './iotService';
export { default as webhookService } from './webhookService';
