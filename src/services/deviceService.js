import api from './api';

const getDevices = async () => {
    const response = await api.get('/devices');
    return response.data;
};

const addDevice = async (deviceData) => {
    const response = await api.post('/devices', deviceData);
    return response.data;
};

const deleteDevice = async (deviceId) => {
    const response = await api.delete(`/devices/${deviceId}`);
    return response.data;
};

// Toggle LED or other simple controls
const setDeviceState = async (deviceId, state) => {
    return null;
};

const getDeviceTelemetry = async (deviceId) => {
    try {
        const response = await api.get(`/devices/${deviceId}/telemetry`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch telemetry', error);
        return [];
    }
};

const deviceService = {
    getDevices,
    addDevice,
    deleteDevice,
    setDeviceState,
    getDeviceTelemetry
};

export default deviceService;
