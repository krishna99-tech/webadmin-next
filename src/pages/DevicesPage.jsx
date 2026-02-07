import React, { useEffect, useState, useMemo } from 'react';
import { useIoT } from '../context/IoTContext';
import { useToast } from '../context/ToastContext';
import Modals from '../components/Modals';
import adminService from '../services/adminService';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Tabs,
    Tab,
    Chip,
    Tooltip,
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from '@heroui/react';
import {
    Smartphone,
    Download,
    RefreshCw,
    Plus,
    Search,
    Filter,
    Thermometer,
    Zap,
    AlertCircle,
    MapPin,
    Signal,
    Battery,
    Clock,
    Users,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    ExternalLink,
    Cpu,
    Network
} from 'lucide-react';
import ConfirmModal from '../components/UI/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

/* ===============================
   TACTICAL NODE CARD
================================ */
const NodeCard = ({ device, onAction, onEdit, onTransfer, onDetails }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'online': return 'text-emerald-500';
            case 'offline': return 'text-red-500';
            case 'warning': return 'text-amber-500';
            default: return 'text-slate-400';
        }
    };

    const getStatusBg = (status) => {
        switch(status) {
            case 'online': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'offline': return 'bg-red-500/10 border-red-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            default: return 'bg-slate-500/10 border-slate-500/20';
        }
    };

    const getTypeIcon = (type) => {
        switch(type?.toLowerCase()) {
            case 'sensor': return <Thermometer size={20} />;
            case 'actuator': return <Zap size={20} />;
            case 'gateway': return <Network size={20} />;
            default: return <Cpu size={20} />;
        }
    };

    return (
        <div 
            className="elite-card elite-card-interactive" 
            style={{ 
                background: 'rgba(255, 255, 255, 0.01)', 
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '1.5rem'
            }}
        >
            {/* Header Identity */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div style={{ 
                        width: '3.5rem', 
                        height: '3.5rem', 
                        borderRadius: '1.25rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}>
                        {getTypeIcon(device.type)}
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 900, margin: 0, fontStyle: 'italic', color: 'var(--text-main)' }}>{device.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                             <p className="text-tactical flex items-center gap-1" style={{ fontSize: '8px', opacity: 0.4 }}>
                                <MapPin size={10} /> {device.location || 'DEEP_SPACE'}
                             </p>
                             <Divider orientation="vertical" style={{ height: '0.5rem', opacity: 0.1 }} />
                             <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4 }}>{device.id?.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
                <div className={`status-pill ${getStatusBg(device.status)}`} style={{ padding: '0.5rem 1rem' }}>
                    <div className={`status-dot ${device.status === 'online' ? 'status-dot-on' : 'status-dot-off'}`} style={{ width: '4px', height: '4px' }} />
                    <span className={`text-tactical ${getStatusColor(device.status)}`} style={{ fontSize: '9px', fontWeight: 900 }}>{device.status.toUpperCase()}</span>
                </div>
            </div>

            {/* Tactical Telemetry */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-white/[0.01] rounded-2xl border border-white/[0.03] mb-6">
                 <div style={{ textAlign: 'center' }}>
                     <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, marginBottom: '2px' }}>SIGNAL</p>
                     <div className="flex items-center justify-center gap-1">
                         <Signal size={10} className="text-primary" />
                         <span style={{ fontSize: '13px', fontWeight: 900 }}>98%</span>
                     </div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                     <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, marginBottom: '2px' }}>BATTERY</p>
                     <div className="flex items-center justify-center gap-1">
                         <Battery size={10} className="text-success" />
                         <span style={{ fontSize: '13px', fontWeight: 900 }}>87%</span>
                     </div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                     <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, marginBottom: '2px' }}>LAST_PULSE</p>
                     <div className="flex items-center justify-center gap-1">
                         <Clock size={10} style={{ opacity: 0.4 }} />
                         <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.6 }}>JUST_NOW</span>
                     </div>
                 </div>
            </div>

            {/* Governance Actions */}
            <div className="flex items-center gap-3">
                <Button 
                    variant="flat" 
                    onPress={onDetails}
                    style={{ flex: 1, height: '2.75rem', borderRadius: '0.875rem', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.03)' }}
                >
                    Diagnostic
                </Button>
                <Divider orientation="vertical" style={{ height: '1.5rem', opacity: 0.1 }} />
                <div className="flex gap-2">
                    <Tooltip content="Edit Infrastructure"><Button isIconOnly variant="flat" onPress={onEdit} style={{ borderRadius: '0.75rem', width: '2.5rem', height: '2.5rem', background: 'rgba(255,255,255,0.03)' }}><Edit size={16} /></Button></Tooltip>
                    <Tooltip content="Transfer Control"><Button isIconOnly variant="flat" onPress={onTransfer} style={{ borderRadius: '0.75rem', width: '2.5rem', height: '2.5rem', background: 'rgba(255,255,255,0.03)', color: 'var(--primary)' }}><Users size={16} /></Button></Tooltip>
                </div>
            </div>
        </div>
    );
};

/* ===============================
   HARDWARE FLEET PORTAL
================================ */
export default function DevicesPage() {
    const navigate = useNavigate();
    const {
        devices = [],
        users = [],
        loading,
        fetchDevices,
        fetchUsers,
        createDevice,
        updateDevice,
        deleteDevice,
        controlDevice,
        transferDeviceOwnership,
        error,
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
            const csvData = data.map(d => ({
                ID: d.id,
                Name: d.name,
                Status: d.status,
                Last_Active: d.last_active,
                Owner: d.owner_name
            }));
            const headers = Object.keys(csvData[0]);
            const rows = csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hardware_fleet_audit_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Fleet data exported');
        } catch (err) {
            toast.error('Export protocol failure');
        }
    };

    const handleModalConfirm = async (formData) => {
        try {
            const id = selectedDevice?.id || selectedDevice?._id;
            if (id) {
                await updateDevice(id, formData);
                toast.success('Infrastructure updated');
            } else {
                await createDevice(formData);
                toast.success('Asset registered');
            }
            setShowModal(false);
            setSelectedDevice(null);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Protocol failure');
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        setDeleteLoading(true);
        try {
            await deleteDevice(confirmDelete.id || confirmDelete._id);
            toast.success('Asset decommissioned');
            setConfirmDelete(null);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Decommission failure');
        } finally {
            setDeleteLoading(false);
        }
    };

    const displayDevices = useMemo(() => {
        if (!devices) return [];
        let list = [...devices].filter(d => {
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
        return list.sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || ''));
    }, [devices, activeFleetTab, searchQuery, sortBy]);

    return (
        <PageShell>
            <PageHeader
                icon={Smartphone}
                title="Hardware Registry"
                subtitle="Operational orchestration of all administrative edge nodes and sensors."
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="flat" 
                            onPress={handleExport}
                            startContent={<Download size={18} />}
                            style={{ height: '3.25rem', borderRadius: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em', padding: '0 1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                        >
                            Export Audit
                        </Button>
                        <Button 
                            color="primary" 
                            onPress={() => { setSelectedDevice(null); setShowModal(true); }}
                            startContent={<Plus size={20} />}
                            style={{ height: '3.25rem', borderRadius: '1.25rem', fontWeight: 950, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.15em', padding: '0 2rem', boxShadow: '0 15px 30px rgba(59, 130, 246, 0.2)' }}
                        >
                            Register Node
                        </Button>
                    </div>
                }
            />

            {/* Tactical Control Bar */}
            <div className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="elite-card-body flex items-center gap-8 px-7 py-3">
                    <Tabs 
                        selectedKey={activeFleetTab} 
                        onSelectionChange={setActiveFleetTab}
                        variant="underlined"
                        classNames={{
                            cursor: "bg-blue-500",
                            tab: "h-12 font-black text-[10px] uppercase tracking-[0.15em]",
                            tabContent: "group-data-[selected=true]:text-blue-500 opacity-40 group-data-[selected=true]:opacity-100"
                        }}
                    >
                         <Tab key="total" title="Fleet Registry" />
                         <Tab key="active" title="Operational" />
                         <Tab key="orphaned" title="Unassigned" />
                    </Tabs>

                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Filter nodes via deep telemetry..."
                            startContent={<Search size={16} style={{ opacity: 0.3 }} />}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "h-12 border-white/[0.05] bg-white/[0.01] rounded-1.25rem",
                                input: "text-sm font-medium",
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Select 
                            size="sm"
                            selectedKeys={[sortBy]}
                            onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
                            variant="bordered"
                            className="w-40"
                            classNames={{
                                trigger: "h-12 border-white/[0.05] bg-white/[0.01] rounded-1.25rem",
                                value: "text-tactical font-black text-[9px] uppercase tracking-widest text-blue-500"
                            }}
                        >
                            <SelectItem key="name">Sort: Name</SelectItem>
                            <SelectItem key="status">Sort: Status</SelectItem>
                            <SelectItem key="last_active">Sort: Pulse</SelectItem>
                        </Select>
                        <Button isIconOnly variant="flat" onPress={fetchDevices} isLoading={loading} style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)' }}><RefreshCw size={18} /></Button>
                    </div>
                </div>
            </div>

            {/* Node Grid Visualization */}
            {loading && !devices.length ? (
                <div style={{ padding: '10rem', textAlign: 'center' }}>
                    <RefreshCw className="animate-spin text-primary" size={40} style={{ opacity: 0.4 }} />
                </div>
            ) : displayDevices.length === 0 ? (
                <div className="elite-card" style={{ padding: '10rem', textAlign: 'center', opacity: 0.15 }}>
                    <AlertCircle size={48} style={{ marginBottom: '1.5rem' }} />
                    <p className="text-tactical" style={{ fontSize: '14px', letterSpacing: '0.2em' }}>NO_HARDWARE_RESOURCES_DETECTED</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {displayDevices.map(device => (
                        <NodeCard 
                            key={device.id || device._id}
                            device={device}
                            onAction={handleAction}
                            onEdit={() => { setSelectedDevice(device); setShowModal(true); }}
                            onTransfer={() => { setTransferDevice(device); setShowTransferModal(true); }}
                            onDetails={() => navigate(`/devices/${device.id || device._id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Governance Modals */}
            <ConfirmModal
                open={!!confirmDelete}
                title="Purge Node Infrastructure"
                message={confirmDelete ? `Are you certain you wish to completely decommission hardware node "${confirmDelete.name}"? This action is irreversible and will purge all telemetry history.` : ''}
                variant="danger"
                confirmLabel="Execute Purge"
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

            {/* Ownership Transfer Protocol */}
            {showTransferModal && transferDevice && (
                <Modal 
                    isOpen={showTransferModal} 
                    onClose={() => setShowTransferModal(false)}
                    size="md"
                    backdrop="blur"
                    classNames={{
                        base: "bg-slate-950/90 border border-white/[0.05] backdrop-blur-2xl shadow-2xl rounded-3xl",
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader style={{ padding: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ padding: '0.75rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                            <Shield size={22} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', fontStyle: 'italic' }}>Transfer Control</h3>
                                            <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.3, marginTop: '2px' }}>Identity Reassignment Protocol</p>
                                        </div>
                                    </div>
                                </ModalHeader>
                                <ModalBody style={{ padding: '0 2.5rem 2.5rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '1.25rem', marginBottom: '2rem' }}>
                                        <p className="text-tactical" style={{ fontSize: '8px', color: 'var(--primary)', fontWeight: 900, marginBottom: '4px' }}>OPERATIONAL_ASSET</p>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white', margin: 0 }}>{transferDevice.name}</p>
                                    </div>

                                    <Select
                                        label="TARGET_PRINCIPAL"
                                        placeholder="Select new identity..."
                                        labelPlacement="outside"
                                        variant="bordered"
                                        selectedKeys={transferUserId ? [transferUserId] : []}
                                        onSelectionChange={(keys) => setTransferUserId(Array.from(keys)[0])}
                                        classNames={{
                                            label: "text-tactical text-[9px] opacity-40 mb-3 tracking-[0.2em] font-black",
                                            trigger: "h-14 border-white/[0.08] bg-white/[0.02] rounded-1.25rem",
                                        }}
                                    >
                                        {users.map(u => (
                                            <SelectItem key={u.id || u._id} textValue={u.username}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.925rem', fontWeight: 800 }}>{u.username}</span>
                                                    <span style={{ fontSize: '10px', opacity: 0.4 }}>{u.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </ModalBody>
                                <ModalFooter style={{ padding: '2rem 2.5rem', gap: '1rem' }}>
                                    <Button variant="flat" onPress={onClose} style={{ height: '3.5rem', borderRadius: '1rem', fontWeight: 800 }}>ABORT_PROTOCOL</Button>
                                    <Button 
                                        color="primary" 
                                        onPress={handleTransfer} 
                                        isLoading={transferLoading}
                                        style={{ flex: 1, height: '3.5rem', borderRadius: '1rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    >
                                        EXECUTE_TRANSFER
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </PageShell>
    );
}
