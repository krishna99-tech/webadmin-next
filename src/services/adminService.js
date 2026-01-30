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

/* Get specific device details */
const getDeviceDetail = async (deviceId) => {
    try {
        const response = await api.get(`/admin/devices/${deviceId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch device detail: ${deviceId}`, error);
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

/* Get security rules */
const getSecurityRules = async () => {
    try {
        const response = await api.get('/admin/security-rules');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch security rules', error);
        throw error;
    }
};

/* Update security rules */
const updateSecurityRules = async (rules) => {
    try {
        const response = await api.post('/admin/security-rules', rules);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to update security rules', error);
        throw error;
    }
};

/* Get dashboards for a device */
const getDashboards = async (deviceId) => {
    try {
        const response = await api.get(`/admin/dashboards/${deviceId}`); // Assuming specialized admin route or shared one
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch dashboards for device: ${deviceId}`, error);
        throw error;
    }
};

/* Get widgets for a dashboard */
const getWidgets = async (dashboardId) => {
    try {
        const response = await api.get(`/widgets/${dashboardId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch widgets for dashboard: ${dashboardId}`, error);
        throw error;
    }
};

/* Get latest telemetry for a device (admin only) */
const getDeviceTelemetry = async (deviceId) => {
    try {
        const response = await api.get(`/admin/devices/${deviceId}/telemetry`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch telemetry for device: ${deviceId}`, error);
        throw error;
    }
};

/* Update current admin profile */
const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/auth/me', profileData);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to update profile', error);
        throw error;
    }
};

/* Get system notifications */
const getNotifications = async () => {
    try {
        const response = await api.get('/admin/notifications');
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch notifications', error);
        return [];
    }
};

/* Create device for any user (admin only) */
const createDeviceAdmin = async (deviceData) => {
    try {
        const response = await api.post('/admin/devices', deviceData);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to create device as admin', error);
        throw error;
    }
};

/* Transfer device ownership (admin only) */
const transferDeviceOwnership = async (deviceId, userId) => {
    try {
        const response = await api.patch(`/admin/devices/${deviceId}/transfer`, { user_id: userId });
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to transfer device: ${deviceId}`, error);
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
    exportActivity,
    getSecurityRules,
    updateSecurityRules,
    getDashboards,
    getWidgets,
    getDeviceDetail,
    getDeviceTelemetry,
    updateProfile,
    getNotifications,
    createDeviceAdmin,
    transferDeviceOwnership
};

export default adminService;

