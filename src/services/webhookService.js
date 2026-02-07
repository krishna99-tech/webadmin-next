/**
 * Webhook Service - Integration endpoint management
 */
import client from './api';

const webhookService = {
  getWebhooks: () => client.get('/webhooks').then((res) => res.data),
  getWebhook: (id) => client.get(`/webhooks/${id}`).then((res) => res.data),
  createWebhook: (data) => client.post('/webhooks', data).then((res) => res.data),
  updateWebhook: (id, data) => client.patch(`/webhooks/${id}`, data).then((res) => res.data),
  deleteWebhook: (id) => client.delete(`/webhooks/${id}`).then((res) => res.data),
};

export default webhookService;
