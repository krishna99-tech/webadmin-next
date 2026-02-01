/**
 * Webhook service - re-exports from unified api.js
 */
import { APIs } from './api';

export default {
  getWebhooks: APIs.webhooks.getWebhooks,
  getWebhook: APIs.webhooks.getWebhook,
  createWebhook: APIs.webhooks.createWebhook,
  updateWebhook: APIs.webhooks.updateWebhook,
  deleteWebhook: APIs.webhooks.deleteWebhook,
};
