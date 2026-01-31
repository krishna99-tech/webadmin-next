'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import deviceService from '@/services/deviceService';
import adminService from '@/services/adminService';
import iotService from '@/services/iotService';
import { AuthContext } from '@/context/AuthContext';
import { 
    Smartphone, Download, RefreshCw, Plus, Power, Edit, Trash2, 
    Wifi, WifiOff, AlertTriangle, X, Info
} from 'lucide-react';

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeFleetTab, setActiveFleetTab] = useState('total');
    const [users, setUsers] = useState([]);

    // Modal form state
    const [formData, setFormData] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    // Transfer Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferDevice, setTransferDevice] = useState(null);
    const [transferUserId, setTransferUserId] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    const router = useRouter();
    const { currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.is_admin;

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

    // Initialize form data when modal opens
    useEffect(() => {
        if (selectedDevice) {
            setFormData({
                name: selectedDevice.name || '',
                user_id: selectedDevice.user_id || '',
                status: selectedDevice.status || 'offline'
            });
        } else {
            setFormData({
                name: '',
                user_id: '',
                status: 'offline'
            });
        }
    }, [selectedDevice, showModal]);

    const handleAction = async (device, action) => {
        try {
            if (action === 'delete') {
                if (!window.confirm('Delete this device permanently?')) return;
                await iotService.deleteDevice(device.id || device._id);
                setDevices(prev => prev.filter(d => (d.id || d._id) !== (device.id || device._id)));
            } else if (action === 'toggle') {
                const newStatus = device.status === 'online' ? 'offline' : 'online';
                await iotService.controlDevice(device.id || device._id, 'toggle_power', { status: newStatus });
                setDevices(prev => prev.map(d => 
                    (d.id || d._id) === (device.id || device._id) ? { ...d, status: newStatus } : d
                ));
            } else if (action === 'transfer') {
                setTransferDevice(device);
                setShowTransferModal(true);
            }
        } catch (err) {
            alert('Operation failed: ' + (err?.response?.data?.detail || err.message));
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
            const headers = ['ID', 'Name', 'Status', 'Last Active', 'User ID', 'Owner'];
            const rows = data.map(d => [
                d.id, d.name, d.status, d.last_active || '', d.user_id || '', d.owner_name || ''
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
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

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (selectedDevice) {
                await iotService.updateDevice(selectedDevice.id || selectedDevice._id, formData);
            } else {
                await iotService.createDevice(formData);
            }
            setShowModal(false);
            setSelectedDevice(null);
            fetchDevices();
        } catch (err) {
            alert('Operation failed: ' + (err?.response?.data?.detail || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    const displayDevices = devices.filter(d => {
        if (activeFleetTab === 'active') return d.status === 'online';
        if (activeFleetTab === 'orphaned') return !d.user_id || d.owner_name?.includes('Orphaned');
        return true;
    });

    const getStatusBadge = (status) => {
        const classes = {
            online: 'status-badge-online',
            offline: 'status-badge-offline',
            warning: 'status-badge-warning'
        };
        return <span className={`status-badge ${classes[status] || 'status-badge-offline'}`}>{status}</span>;
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'online': return <Wifi className="w-4 h-4 text-green-500" />;
            case 'offline': return <WifiOff className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Wifi className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="devices-page animate-fadeInUp">
            {/* Header */}
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Smartphone className="icon-glow text-primary" size={28} />
                        Hardware Fleet
                    </h2>
                    <p className="dashboard-subtitle mt-1">
                        Silicon identity registry and edge node orchestration.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline">
                        <Download size={18} />
                        Export Registry
                    </Button>
                    <Button onClick={() => { setSelectedDevice(null); setShowModal(true); }} className="btn-primary shadow-primary">
                        <Plus size={18} />
                        Sync New Device
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

            {/* Main Content */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center rounded-3xl min-h-[200px]">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                
                {/* Device Table */}
                <div className="space-y-6 animate-fadeIn">
                    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="iot-table">
                                <thead>
                                    <tr>
                                        <th>Device Name</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Location</th>
                                        <th>Battery</th>
                                        <th>Last Pulse</th>
                                        <th className="text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayDevices.map(device => (
                                        <tr key={device.id || device._id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(device.status)}
                                                    <span className="font-medium text-white">{device.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm text-dim capitalize">{device.type}</td>
                                            <td>{getStatusBadge(device.status)}</td>
                                            <td className="text-sm text-dim">{device.location}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="battery-bar-container">
                                                        <div 
                                                            className={`battery-bar-fill ${device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${device.battery}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] text-dim">{device.battery}%</span>
                                                </div>
                                            </td>
                                            <td className="text-sm text-dim font-mono">
                                                {device.last_active ? new Date(device.last_active).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => handleAction(device, 'toggle')} 
                                                        title="Toggle Power"
                                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400 transition-colors"
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedDevice(device); setShowModal(true); }} 
                                                        title="Edit Config"
                                                        className="p-2 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(device, 'delete')} 
                                                        title="Decommission"
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayDevices.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-dim italic">
                                                No devices registered in your fleet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Device Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn p-4">
                    <Card className="w-full max-w-md border-white/10 bg-slate-950/90 backdrop-blur-xl p-0 shadow-2xl relative overflow-hidden border-glow">
                        {/* Header */}
                        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight">
                                        {selectedDevice ? 'Modify Device' : 'Register New Device'}
                                    </h3>
                                    <p className="text-[10px] text-dim uppercase tracking-wider">Hardware Registry</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-dim hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Device Name</label>
                                <input 
                                    type="text"
                                    required
                                    className="input-field w-full"
                                    placeholder="e.g. Edge-Node-01"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Assign Owner</label>
                                <select 
                                    className="input-field w-full bg-slate-800"
                                    value={formData.user_id || ''}
                                    onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                >
                                    <option value="">System / Orphaned</option>
                                    {users.map(u => (
                                        <option key={u.id || u._id} value={u.id || u._id}>{u.username} ({u.email || 'No email'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-200/70 leading-relaxed italic">
                                    Changes will be synchronized with the edge network and updated in the global registry immediately upon commitment.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="flex-1" 
                                    onClick={() => setShowModal(false)}
                                >
                                    Abort
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1 btn-primary shadow-lg shadow-primary/20"
                                    loading={formLoading}
                                >
                                    {selectedDevice ? 'Update Entity' : 'Create Entity'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Transfer Ownership Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
                    <Card className="w-full max-w-sm border-purple-500/30 bg-slate-900 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Transfer Ownership</h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-dim hover:text-white">
                                <X size={20} />
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
                                    className="input-field w-full bg-slate-800"
                                    value={transferUserId}
                                    onChange={(e) => setTransferUserId(e.target.value)}
                                >
                                    <option value="">Select identity...</option>
                                    {users.map(u => (
                                        <option key={u.id || u._id} value={u.id || u._id}>
                                            {u.username} ({u.email || 'No email'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowTransferModal(false)}>Cancel</Button>
                                <Button className="flex-1 !bg-purple-600 shadow-lg" onClick={handleTransfer} loading={transferLoading}>
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
