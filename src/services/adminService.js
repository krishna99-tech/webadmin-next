import api from './api';

/**
 * ===============================
 * Admin Service API Layer
 * ===============================
 */

/* Get all users */
const getUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch users', error);
        throw error;
    }
};

/* Delete user by ID */
const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to delete user: ${userId}`, error);
        throw error;
    }
};

/* Get admin activity log */
const getActivity = async () => {
    try {
        const response = await api.get('/admin/activity');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch activity logs', error);
        throw error;
    }
};

/* Get all devices (Admin) */
const getAllDevices = async () => {
    try {
        const response = await api.get('/admin/devices');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch all devices', error);
        throw error;
    }
};

/* Send broadcast message */
const sendBroadcast = async (subject, message, recipients = null) => {
    try {
        const response = await api.post('/admin/broadcast', {
            subject,
            message,
            recipients
        });
        return response.data;
    } catch (error) {
        console.error('❌ Failed to send broadcast message', error);
        throw error;
    }
};

/* Get user detail by ID */
const getUserDetail = async (userId) => {
    try {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch user detail: ${userId}`, error);
        throw error;
    }
};

/* Get analytics data */
const getAnalytics = async () => {
    try {
        const response = await api.get('/admin/analytics');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch analytics', error);
        throw error;
    }
};

/* Export users */
const exportUsers = async () => {
    try {
        const response = await api.get('/admin/export/users');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to export users', error);
        throw error;
    }
};

/* Export devices */
const exportDevices = async () => {
    try {
        const response = await api.get('/admin/export/devices');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to export devices', error);
        throw error;
    }
};

/* Export activity logs */
const exportActivity = async () => {
    try {
        const response = await api.get('/admin/export/activity');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to export activity', error);
        throw error;
    }
};

/* Export service */
const adminService = {
    getUsers,
    deleteUser,
    getActivity,
    sendBroadcast,
    getAllDevices,
    getUserDetail,
    getAnalytics,
    exportUsers,
    exportDevices,
    exportActivity
};

export default adminService;

