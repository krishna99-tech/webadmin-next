'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import deviceService from '@/services/deviceService';
import adminService from '@/services/adminService';
import { AuthContext } from '@/context/AuthContext';
import { Smartphone, Plus, Trash2, Download, AlertCircle, Eye, XCircle, Search, RefreshCw } from 'lucide-react';

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.is_admin;

    const [showAddModal, setShowAddModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', user_id: '' });
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFleetTab, setActiveFleetTab] = useState('total'); // total, active, orphaned

    // Transfer Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferDevice, setTransferDevice] = useState(null);
    const [transferUserId, setTransferUserId] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    const fetchDevices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = isAdmin
                ? await adminService.getAllDevices()
                : await deviceService.getDevices();

            setDevices(Array.isArray(data) ? data : []);

            if (isAdmin) {
                const userData = await adminService.getUsers();
                setUsers(userData || []);
            }
        } catch (err) {
            console.error('Failed to fetch devices:', err);
            setError(err.message || 'Failed to connect to backend service');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [isAdmin]);

    const handleCreateDevice = async () => {
        try {
            if (!newDevice.name) return alert('Name is required');
            if (isAdmin && !newDevice.user_id) return alert('Owner is required');

            setLoading(true);
            if (isAdmin) {
                await adminService.createDeviceAdmin(newDevice);
            } else {
                await deviceService.addDevice({ name: newDevice.name });
            }

            setShowAddModal(false);
            setNewDevice({ name: '', user_id: '' });
            fetchDevices();
        } catch (err) {
            alert('Failed to create device: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            await deviceService.deleteDevice(id);
            setDevices(prev => prev.filter(d => (d.id || d._id) !== id));
        } catch (err) {
            alert('Failed to delete device: ' + (err?.response?.data?.detail || err.message));
        }
    };

    const handleTransfer = async () => {
        if (!transferUserId) return alert('Select a new owner');
        setTransferLoading(true);
        try {
            await adminService.transferDeviceOwnership(transferDevice.id || transferDevice._id, transferUserId);
            setShowTransferModal(false);
            setTransferDevice(null);
            setTransferUserId('');
            fetchDevices();
        } catch (err) {
            alert('Transfer failed: ' + (err?.response?.data?.detail || err.message));
        } finally {
            setTransferLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await adminService.exportDevices();

            // Convert to CSV
            const headers = ['ID', 'Name', 'Status', 'Last Active', 'User ID', 'Owner'];
            const rows = data.map(d => [
                d.id,
                d.name,
                d.status,
                d.last_active || '',
                d.user_id || '',
                d.owner_name || ''
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devices_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export devices');
        }
    };

    const filteredDevices = devices.filter(d => {
        const search = searchTerm.toLowerCase();
        return (
            d.name?.toLowerCase().includes(search) ||
            (d.id || d._id)?.toLowerCase().includes(search) ||
            d.owner_name?.toLowerCase().includes(search) ||
            d.owner_email?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="relative">
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title">Device Management</h2>
                    <p className="dashboard-subtitle">Complete registry of active, inactive, and orphaned silicon signatures across the network.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleExport} variant="secondary">
                        <Download size={18} />
                        Export Data
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} className="btn-broadcast-premium shadow-primary group">
                        <Plus size={18} className="group-hover:icon-pulse" />
                        Register Device
                    </Button>
                </div>
            </div>

            {/* Fleet Dimension Tabs */}
            {isAdmin && (
                <div className="flex gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5">
                    {[
                        { id: 'total', label: 'Total Fleet', count: devices.length },
                        { id: 'active', label: 'Active Dimension', count: devices.filter(d => d.status === 'online').length },
                        { id: 'orphaned', label: 'Orphaned Signatures', count: devices.filter(d => !d.user_id || d.owner_name?.includes('Orphaned')).length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFleetTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeFleetTab === tab.id ? 'bg-blue-500 text-white shadow-primary' : 'hover:bg-white/5 text-dim'}`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeFleetTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Global Search Interface */}
            <Card className="mb-8 border-white/5 bg-white/[0.01]">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full text-left">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">Neural Search Pattern</label>
                        <div className="topbar-search w-full bg-slate-900/50 border border-white/5 rounded-xl h-12 px-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-all">
                            <Search size={18} className="text-dim" />
                            <input
                                type="text"
                                placeholder={`Filter ${activeFleetTab} fleet by ID, Name, or Owner...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-dim"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {error && (
                <div className="status-message status-error mb-6">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {loading && !showAddModal ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    <Smartphone size={40} className="text-blue-500/50 animate-pulse" />
                    <p className="text-sm text-dim italic">Synchronizing registry state...</p>
                </div>
            ) : filteredDevices.length === 0 ? (
                <Card className="empty-state py-20 border-white/5 bg-white/[0.01]">
                    <Smartphone size={48} className="empty-state-icon opacity-20" />
                    <h3 className="empty-state-title text-dim">No Signatures Detected</h3>
                    <p className="empty-state-text text-dim">The current neural pattern search yielded no device matches in the active dimension.</p>
                    {searchTerm && (
                        <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>Reset Search</Button>
                    )}
                </Card>
            ) : (
                <div className="device-grid">
                    {filteredDevices
                        .filter(d => {
                            if (activeFleetTab === 'active') return d.status === 'online';
                            if (activeFleetTab === 'orphaned') return !d.user_id || d.owner_name?.includes('Orphaned');
                            return true;
                        })
                        .map((device) => (
                            <Card key={device.id || device._id} className="device-card hover-border-blue transition-colors group">
                                <div className="device-card-header">
                                    <div className="device-icon group-hover-bg-blue !bg-white/5 border-white/5 shadow-inner group-hover:neon-border transition-all">
                                        <Smartphone size={24} className="icon-glow" />
                                    </div>
                                    <div className={`status-badge ${device.status} flex items-center gap-1.5`}>
                                        {device.status === 'online' && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>}
                                        {device.status}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold mb-1 text-white">{device.name}</h3>
                                <p className="text-xs text-dim font-mono mb-2 break-all">ID: {device.id || device._id}</p>

                                {isAdmin && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 relative group/owner">
                                        <p className="text-[10px] text-dim uppercase tracking-wider mb-1">Assigned Owner</p>
                                        <p className={`text-xs font-bold ${device.owner_name?.includes('Orphaned') ? 'text-orange-400' : 'text-blue-400'}`}>
                                            {device.owner_name || 'System'}
                                        </p>
                                        <p className="text-[10px] text-dim">{device.owner_email || 'No email associated'}</p>

                                        <button
                                            onClick={() => {
                                                setTransferDevice(device);
                                                setShowTransferModal(true);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white/5 rounded-lg border border-white/5 opacity-0 group-hover/owner:opacity-100 transition-all hover:bg-white/10 text-white"
                                            title="Transfer Ownership"
                                        >
                                            <RefreshCw size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className="device-footer mt-6 pt-4 border-t border-white/5">
                                    <span className="text-xs text-dim">
                                        {device.last_active ? new Date(device.last_active).toLocaleString() : 'Never Active'}
                                    </span>
                                    <div className="device-actions">
                                        <button
                                            onClick={() => router.push(`/devices/${device.id || device._id}`)}
                                            className="icon-btn primary hover-text-blue"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
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

            {/* Add Device Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <Card className="w-full max-w-md border-blue-500/30">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Register New Device</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-dim hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-dim uppercase tracking-wider mb-2">Device Name</label>
                                <input
                                    type="text"
                                    className="msg-textarea !min-h-[45px]"
                                    placeholder="Enter identifier (e.g. Workspace-01)"
                                    value={newDevice.name}
                                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                />
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="block text-xs text-dim uppercase tracking-wider mb-2">Assign Owner</label>
                                    <select
                                        className="msg-textarea !min-h-[45px] w-full bg-black/50"
                                        value={newDevice.user_id}
                                        onChange={(e) => setNewDevice({ ...newDevice, user_id: e.target.value })}
                                    >
                                        <option value="">Select a user...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.username} ({u.email || 'No email'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                <Button className="flex-1 btn-broadcast-premium" onClick={handleCreateDevice} loading={loading}>
                                    Register Device
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Transfer Ownership Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <Card className="w-full max-w-sm border-purple-500/30">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Transfer Ownership</h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-dim hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-dim uppercase mb-1">Target Device</p>
                            <p className="text-sm font-bold text-white">{transferDevice?.name}</p>
                            <p className="text-[10px] text-dim font-mono">{transferDevice?.id || transferDevice?._id}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-dim uppercase tracking-wider mb-2">New Identity Owner</label>
                                <select
                                    className="msg-textarea !min-h-[45px] w-full bg-black/50"
                                    value={transferUserId}
                                    onChange={(e) => setTransferUserId(e.target.value)}
                                >
                                    <option value="">Select identity...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.username} ({u.email || 'No email'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowTransferModal(false)}>Cancel</Button>
                                <Button className="flex-1 !bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]" onClick={handleTransfer} loading={transferLoading}>
                                    Confirm Transfer
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
