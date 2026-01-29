'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import deviceService from '@/services/deviceService';
import adminService from '@/services/adminService';
import { AuthContext } from '@/context/AuthContext';
import { Smartphone, Plus, Trash2 } from 'lucide-react';

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.is_admin;

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = isAdmin
                ? await adminService.getAllDevices()
                : await deviceService.getDevices();
            setDevices(data || []);
        } catch (err) {
            console.error('Failed to fetch devices', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [isAdmin]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            await deviceService.deleteDevice(id);
            setDevices(prev => prev.filter(d => (d.id || d._id) !== id));
        } catch (err) {
            alert('Failed to delete device: ' + (err?.response?.data?.detail || err.message));
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Device Management</h2>
                <Button>
                    <Plus size={18} className="mr-2" />
                    Add Device
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading devices...</div>
            ) : devices.length === 0 ? (
                <Card className="empty-state">
                    <Smartphone size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">No Devices Found</h3>
                    <p className="empty-state-text">Get started by adding your first device.</p>
                    <Button>Add New Device</Button>
                </Card>
            ) : (
                <div className="device-grid">
                    {devices.map((device) => (
                        <Card key={device.id || device._id} className="device-card hover-border-blue transition-colors group">
                            <div className="device-card-header">
                                <div className="device-icon group-hover-bg-blue">
                                    <Smartphone size={24} />
                                </div>
                                <div className={`status-badge ${device.status}`}>
                                    {device.status}
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-1 text-white">{device.name}</h3>
                            <p className="text-xs text-gray-500 font-mono mb-2 break-all">ID: {device.id || device._id}</p>

                            {isAdmin && device.user_id && (
                                <p className="text-xs text-blue-400 mb-2">Owner ID: {device.user_id}</p>
                            )}

                            <div className="device-footer">
                                <span className="text-xs text-gray-400">
                                    {device.last_active ? new Date(device.last_active).toLocaleString() : 'Never'}
                                </span>
                                <div className="device-actions">
                                    <button
                                        onClick={() => router.push(`/devices/${device.id || device._id}`)}
                                        className="icon-btn primary hover-text-blue"
                                        title="View Details"
                                    >
                                        <Smartphone size={18} />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(device.id || device._id);
                                        }}
                                        className="icon-btn danger hover-text-red"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
