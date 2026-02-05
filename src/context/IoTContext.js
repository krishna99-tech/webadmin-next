import React, { createContext, useContext, useState, useCallback } from 'react';
import iotService from '@/services/iotService';
import adminService from '@/services/adminService';
import deviceService from '@/services/deviceService';

const IoTContext = createContext(null);

export function IoTProvider({ children, isAdmin = false }) {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isAdmin
        ? await adminService.getAllDevices()
        : await deviceService.getDevices();
      setDevices(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to fetch devices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
      return data || [];
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const createDevice = useCallback(async (deviceData) => {
    const result = await iotService.createDevice(deviceData);
    await fetchDevices();
    return result;
  }, [fetchDevices]);

  const updateDevice = useCallback(async (deviceId, deviceData) => {
    const result = await iotService.updateDevice(deviceId, deviceData);
    await fetchDevices();
    return result;
  }, [fetchDevices]);

  const deleteDevice = useCallback(async (deviceId) => {
    await iotService.deleteDevice(deviceId);
    setDevices(prev => prev.filter(d => (d.id || d._id) !== deviceId));
  }, []);

  const controlDevice = useCallback(async (deviceId, command, params = {}) => {
    const result = await iotService.controlDevice(deviceId, command, params);
    setDevices(prev => prev.map(d =>
      (d.id || d._id) === deviceId
        ? { ...d, status: params.status ?? d.status }
        : d
    ));
    return result;
  }, []);

  const createUser = useCallback(async (userData) => {
    const result = await iotService.createUser(userData);
    await fetchUsers();
    return result;
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId, userData) => {
    const result = await iotService.updateUser(userId, userData);
    setUsers(prev => prev.map(u =>
      (u.id || u._id) === userId ? { ...u, ...userData } : u
    ));
    await fetchUsers();
    return result;
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId) => {
    await iotService.deleteUser(userId);
    setUsers(prev => prev.filter(u => (u.id || u._id) !== userId));
  }, []);

  const transferDeviceOwnership = useCallback(async (deviceId, userId) => {
    await adminService.transferDeviceOwnership(deviceId, userId);
    await fetchDevices();
  }, [fetchDevices]);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    devices,
    users,
    loading,
    error,
    fetchDevices,
    fetchUsers,
    createDevice,
    updateDevice,
    deleteDevice,
    controlDevice,
    createUser,
    updateUser,
    deleteUser,
    transferDeviceOwnership,
    setDevices,
    setUsers,
    clearError,
  };

  return <IoTContext.Provider value={value}>{children}</IoTContext.Provider>;
}

export function useIoT() {
  const ctx = useContext(IoTContext);
  if (!ctx) {
    throw new Error('useIoT must be used within IoTProvider');
  }
  return ctx;
}
