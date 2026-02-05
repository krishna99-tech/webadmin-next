import React, { useEffect, useState, useMemo } from 'react';
import { useIoT } from '../context/IoTContext';
import { useToast } from '../context/ToastContext';
import DeviceManager from '../components/IoTConsole/DeviceManager';
import Modals from '../components/IoTConsole/Modals';
import Button from '../components/UI/Button';
import ConfirmModal from '../components/UI/ConfirmModal';
import Select from '../components/UI/Select';
import EmptyState from '../components/UI/EmptyState';
import adminService from '../services/adminService';
import {
    Smartphone,
    Download,
    RefreshCw,
    Plus,
    X,
    Search,
    ArrowUpDown,
    Server,
} from 'lucide-react';

export default function DevicesPage() {
    const {
        devices = [],
        users = [],
        loading,
        error,
        fetchDevices,
        fetchUsers,
        createDevice,
        updateDevice,
        deleteDevice,
        controlDevice,
        transferDeviceOwnership,
        clearError,
    } = useIoT();

    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeFleetTab, setActiveFleetTab] = useState('total');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferDevice, setTransferDevice] = useState(null);
    const [transferUserId, setTransferUserId] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [optimisticUpdates, setOptimisticUpdates] = useState({});

    useEffect(() => {
        fetchDevices();
        fetchUsers();
    }, [fetchDevices, fetchUsers]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    const handleAction = async (device, action) => {
        const id = device.id || device._id;
        try {
            if (action === 'delete') {
                setConfirmDelete(device);
            } else if (action === 'toggle') {
                const newStatus = device.status === 'online' ? 'offline' : 'online';
                setOptimisticUpdates(prev => ({ ...prev, [id]: { status: newStatus } }));

                try {
                    await controlDevice(id, 'toggle_power', { status: newStatus });
                    toast.success(`Device ${newStatus}`);
                } catch (err) {
                    setOptimisticUpdates(prev => {
                        const next = { ...prev };
                        delete next[id];
                        return next;
                    });
                    throw err;
                }
            } else if (action === 'transfer') {
                setTransferDevice(device);
                setShowTransferModal(true);
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Operation failed');
        }
    };

    const handleTransfer = async () => {
        if (!transferUserId) {
            toast.warning('Select a new owner');
            return;
        }
        setTransferLoading(true);
        try {
            await transferDeviceOwnership(transferDevice.id || transferDevice._id, transferUserId);
            setShowTransferModal(false);
            setTransferDevice(null);
            setTransferUserId('');
            toast.success('Ownership transferred');
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Transfer failed');
        } finally {
            setTransferLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await adminService.exportDevices();
            const headers = ['ID', 'Name', 'Status', 'Last Active', 'User ID', 'Owner'];
            const rows = data.map(d => [
                d.id,
                d.name,
                d.status,
                d.last_active || '',
                d.user_id || '',
                d.owner_name || '',
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devices_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Export completed');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const handleModalConfirm = async (formData) => {
        try {
            const id = selectedDevice?.id || selectedDevice?._id;
            if (id) {
                await updateDevice(id, formData);
                toast.success('Device updated');
            } else {
                await createDevice(formData);
                toast.success('Device registered');
            }
            setShowModal(false);
            setSelectedDevice(null);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Operation failed');
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        setDeleteLoading(true);
        try {
            await deleteDevice(confirmDelete.id || confirmDelete._id);
            toast.success('Device removed successfully');
            setConfirmDelete(null);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Operation failed');
        } finally {
            setDeleteLoading(false);
        }
    };

    const displayDevices = useMemo(() => {
        if (!devices) return [];
        const effectiveDevices = devices.map(d => {
            const id = d.id || d._id;
            return optimisticUpdates[id] ? { ...d, ...optimisticUpdates[id] } : d;
        });

        let list = effectiveDevices.filter(d => {
            if (activeFleetTab === 'active') return d.status === 'online';
            if (activeFleetTab === 'orphaned') return !d.user_id || d.owner_name?.includes('Orphaned');
            return true;
        });
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(d =>
                (d.name || '').toLowerCase().includes(q) ||
                (d.type || '').toLowerCase().includes(q) ||
                (d.location || '').toLowerCase().includes(q)
            );
        }
        const statusOrder = { online: 0, warning: 1, offline: 2 };
        list = [...list].sort((a, b) => {
            if (sortBy === 'name') {
                const na = (a.name || '').toLowerCase();
                const nb = (b.name || '').toLowerCase();
                return sortOrder === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
            }
            if (sortBy === 'status') {
                const sa = statusOrder[a.status] ?? 3;
                const sb = statusOrder[b.status] ?? 3;
                return sortOrder === 'asc' ? sa - sb : sb - sa;
            }
            if (sortBy === 'last_active') {
                const ta = new Date(a.last_active || 0).getTime();
                const tb = new Date(b.last_active || 0).getTime();
                return sortOrder === 'asc' ? ta - tb : tb - ta;
            }
            return 0;
        });
        return list;
    }, [devices, activeFleetTab, searchQuery, sortBy, sortOrder, optimisticUpdates]);

    return (
        <div className="devices-page animate-fadeInUp">
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Smartphone className="icon-glow text-primary" size={28} />
                        Device Fleet
                    </h2>
                    <p className="dashboard-subtitle mt-1">
                        Manage IoT devices, sensors, and edge nodes
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline">
                        <Download size={18} />
                        Export
                    </Button>
                    <Button onClick={fetchDevices} disabled={loading} variant="secondary">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button onClick={() => { setSelectedDevice(null); setShowModal(true); }} className="btn-glow px-6">
                        <Plus size={18} />
                        Add Device
                    </Button>
                </div>
            </div>

            {/* Search & Sort */}
            <div className="action-bar mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] max-w-md relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name, type, location…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field input-glow w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-divider/5 bg-content2/5 focus:border-blue-500/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-dim">Sort</span>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field py-2.5 pl-3 pr-8 text-sm rounded-xl border border-divider/5 bg-content2/5 focus:border-blue-500/50"
                        options={[
                            { value: 'name', label: 'Name' },
                            { value: 'status', label: 'Status' },
                            { value: 'last_active', label: 'Last Active' },
                        ]}
                    />
                    <button
                        type="button"
                        onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                        className="p-2.5 rounded-xl border border-divider/5 bg-content2/5 hover:bg-content2/10 transition-colors btn-press"
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        <ArrowUpDown size={18} className="text-dim" />
                    </button>
                </div>
            </div>

            {users.length > 0 && (
                <div className="flex gap-2 mb-6 p-1.5 bg-content2/5 rounded-2xl w-fit border border-divider/5">
                    {[
                        { id: 'total', label: 'All', count: devices.length },
                        { id: 'active', label: 'Online', count: devices.filter(d => d.status === 'online').length },
                        { id: 'orphaned', label: 'Unassigned', count: devices.filter(d => !d.user_id || d.owner_name?.includes('Orphaned')).length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFleetTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeFleetTab === tab.id ? 'bg-blue-500 text-foreground shadow-primary' : 'hover:bg-content2/5 text-dim'}`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeFleetTab === tab.id ? 'bg-content2/20' : 'bg-content2/10'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="relative">
                {loading && (!devices || devices.length === 0) && (
                    <div className="absolute inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center rounded-3xl min-h-[200px]">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                {displayDevices.length === 0 ? (
                    <EmptyState
                        icon={Server}
                        title={searchQuery ? 'No devices match your search' : 'No devices yet'}
                        description={searchQuery ? 'Try a different search or clear filters.' : 'Register your first device to get started.'}
                        actionLabel={searchQuery ? undefined : 'Add Device'}
                        onAction={searchQuery ? undefined : () => { setSelectedDevice(null); setShowModal(true); }}
                        className="rounded-2xl"
                    />
                ) : (
                    <DeviceManager
                        devices={displayDevices}
                        onAction={handleAction}
                        onAddRequest={() => { setSelectedDevice(null); setShowModal(true); }}
                        onEditRequest={(d) => { setSelectedDevice(d); setShowModal(true); }}
                        onTransferRequest={(d) => { setTransferDevice(d); setShowTransferModal(true); }}
                        showTransferButton={users.length > 0}
                    />
                )}
            </div>

            <ConfirmModal
                open={!!confirmDelete}
                title="Remove device"
                message={confirmDelete ? `Remove "${confirmDelete.name}" from the fleet permanently? This cannot be undone.` : ''}
                variant="danger"
                confirmLabel="Remove"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                loading={deleteLoading}
            />

            <Modals
                showDeviceModal={showModal}
                showUserModal={false}
                showBroadcastModal={false}
                onClose={() => { setShowModal(false); setSelectedDevice(null); }}
                onConfirm={handleModalConfirm}
                selectedDevice={selectedDevice}
                selectedUser={null}
                users={users}
            />

            {showTransferModal && transferDevice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="card w-full max-w-sm p-6 border-purple-500/30">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Transfer Ownership</h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-dim hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-6 p-4 bg-content2/5 rounded-xl border border-divider/5">
                            <p className="text-[10px] text-dim uppercase mb-1">Device</p>
                            <p className="text-sm font-bold text-foreground">{transferDevice.name}</p>
                            <p className="text-[10px] text-dim font-mono">{transferDevice.id || transferDevice._id}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-dim uppercase tracking-wider mb-2">New Owner</label>
                                <Select
                                    className="input-field w-full"
                                    value={transferUserId}
                                    onChange={(e) => setTransferUserId(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select user...' },
                                        ...users.map(u => ({
                                            value: u.id || u._id,
                                            label: `${u.username} (${u.email || 'No email'})`
                                        }))
                                    ]}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowTransferModal(false)}>
                                    Cancel
                                </Button>
                                <Button className="flex-1 !bg-purple-600 shadow-lg" onClick={handleTransfer} loading={transferLoading}>
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
