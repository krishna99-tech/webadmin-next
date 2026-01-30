import api from './api';

/**
 * ===============================
 * Webhook Service API Layer
 * ===============================
 */

/* Get all webhooks */
const getWebhooks = async () => {
    try {
        const response = await api.get('/webhooks');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch webhooks', error);
        throw error;
    }
};

/* Get webhook by ID */
const getWebhook = async (webhookId) => {
    try {
        const response = await api.get(`/webhooks/${webhookId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch webhook: ${webhookId}`, error);
        throw error;
    }
};

/* Create new webhook */
const createWebhook = async (webhookData) => {
    try {
        const response = await api.post('/webhooks', webhookData);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to create webhook', error);
        throw error;
    }
};

/* Update webhook */
const updateWebhook = async (webhookId, webhookData) => {
    try {
        const response = await api.patch(`/webhooks/${webhookId}`, webhookData);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to update webhook: ${webhookId}`, error);
        throw error;
    }
};

/* Delete webhook */
const deleteWebhook = async (webhookId) => {
    try {
        const response = await api.delete(`/webhooks/${webhookId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to delete webhook: ${webhookId}`, error);
        throw error;
    }
};

/* Export service */
const webhookService = {
    getWebhooks,
    getWebhook,
    createWebhook,
    updateWebhook,
    deleteWebhook
};

export default webhookService;
