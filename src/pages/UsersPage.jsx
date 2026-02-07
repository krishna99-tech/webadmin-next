import React, { useEffect, useState, useMemo } from 'react';
import { useIoT } from '../context/IoTContext';
import { useToast } from '../context/ToastContext';
import UserAccessControl from '../components/UserAccessControl';
import Modals from '../components/Modals';
import adminService from '../services/adminService';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Divider,
} from '@heroui/react';
import {
    Users as UsersIcon,
    Download,
    RefreshCw,
    Plus,
    Search,
    Shield,
    Activity,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import ConfirmModal from '../components/UI/ConfirmModal';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';
import { inputClassNames, tableClassNames } from '../constants/uiClasses';

export default function UsersPage() {
    const {
        users = [],
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        clearError,
    } = useIoT();

    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.is_active).length;
        const admins = users.filter(u => u.is_admin || u.role === 'Admin').length;
        return { total, active, admins, suspended: total - active };
    }, [users]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase().trim();
        return users.filter(u =>
            (u.username || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.full_name || '').toLowerCase().includes(q)
        );
    }, [users, searchQuery]);

    const handleAction = async (user, action) => {
        const id = user.id || user._id;
        try {
            if (action === 'delete') {
                setConfirmDelete(user);
                return;
            }
            if (action === 'toggle') {
                const newActiveState = !user.is_active;
                await updateUser(id, { is_active: newActiveState });
                toast.success(newActiveState ? 'Account activated' : 'Account suspended');
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Operation failed');
        }
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        setDeleteLoading(true);
        try {
            await deleteUser(confirmDelete.id || confirmDelete._id);
            toast.success('User removed');
            setConfirmDelete(null);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Delete failed');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await adminService.exportUsers();
            const headers = ['ID', 'Username', 'Email', 'Full Name', 'Created', 'Active'];
            const rows = data.map(u => [
                u.id,
                u.username,
                u.email || '',
                u.full_name || '',
                u.created_at || '',
                u.is_active ? 'Yes' : 'No',
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Export completed');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const handleModalConfirm = async (formData) => {
        try {
            const id = selectedUser?.id || selectedUser?._id;
            if (id) {
                await updateUser(id, formData);
                toast.success('User updated');
            } else {
                await createUser(formData);
                toast.success('User created');
            }
            setShowModal(false);
            setSelectedUser(null);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Operation failed');
            throw err;
        }
    };

    return (
        <PageShell>
            <PageHeader
                icon={UsersIcon}
                title="Identity Context"
                subtitle="Secure orchestration of all administrative principals and security identities."
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="flat" 
                            onPress={handleExport}
                            startContent={<Download size={18} />}
                            style={{ height: '3.25rem', borderRadius: '1rem', fontWeight: 800, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em', padding: '0 1.5rem' }}
                        >
                            Export Directory
                        </Button>
                        <Button 
                            color="primary" 
                            onPress={() => { setSelectedUser(null); setShowModal(true); }}
                            startContent={<Plus size={20} />}
                            style={{ height: '3.25rem', borderRadius: '1rem', fontWeight: 900, boxShadow: '0 15px 30px rgba(59, 130, 246, 0.25)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.15em', padding: '0 2rem' }}
                        >
                            Initialize Identity
                        </Button>
                    </div>
                }
            />

            {/* Tactical Intelligence Cards */}
            <div className="admin-grid-stats">
                {[
                    { label: 'Total Principals', value: stats.total, icon: UsersIcon, color: 'var(--primary)', trend: 'Nodes Registry' },
                    { label: 'Authorized Sync', value: stats.active, icon: UserCheck, color: 'var(--success)', trend: 'Active Identity' },
                    { label: 'Security Admin', value: stats.admins, icon: Shield, color: '#a855f7', trend: 'L3 Persistence' },
                    { label: 'Access Suspended', value: stats.suspended, icon: AlertCircle, color: 'var(--danger)', trend: 'De-Auth State' }
                ].map((stat, idx) => (
                    <Card key={idx} className="admin-card elite-card-interactive overflow-hidden">
                        {/* Decorative Glow */}
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: stat.color, filter: 'blur(50px)', opacity: 0.1, pointerEvents: 'none' }} />
                        
                        <CardBody className="flex items-center gap-6 p-7 relative z-10">
                            <div style={{ 
                                width: '3.5rem', 
                                height: '3.5rem', 
                                borderRadius: '1.25rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                border: '1px solid rgba(255, 255, 255, 0.03)',
                                background: 'rgba(255, 255, 255, 0.015)',
                                color: stat.color,
                                boxShadow: `0 8px 16px ${stat.color}15`
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4, marginBottom: '4px', letterSpacing: '0.15em', fontWeight: 950 }}>{stat.label.toUpperCase()}</p>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.02em' }}>{stat.value}</h3>
                                <div className="flex items-center gap-1 mt-1.5">
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: stat.color, opacity: 0.5 }} />
                                    <p className="text-tactical" style={{ fontSize: '7px', opacity: 0.3, fontWeight: 800 }}>{stat.trend}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Management Matrix */}
            <Card className="admin-card">
                <CardHeader className="admin-card-header flex flex-wrap items-center gap-8 p-5 border-b border-white/[0.05]">
                    <div style={{ flex: 1, minWidth: '280px' }}>
                            <Input
                                placeholder="Filter identities..."
                                startContent={<Search size={18} style={{ color: 'var(--text-muted)' }} />}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                variant="bordered"
                                classNames={inputClassNames}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3">
                                 <div className="status-dot animate-pulse-soft" style={{ background: '#3b82f6', width: '6px', height: '6px', boxShadow: '0 0 10px #3b82f6' }} />
                                 <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, fontStyle: 'italic' }}>SYNCHRONIZING_DIRECTORY</span>
                             </div>
                             <Divider orientation="vertical" style={{ height: '1.5rem', opacity: 0.1 }} />
                             <Button 
                                isIconOnly 
                                variant="flat" 
                                onPress={fetchUsers}
                                isLoading={loading}
                                style={{ height: '2.75rem', width: '2.75rem', borderRadius: '0.875rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-dim)' }}
                            >
                                <RefreshCw size={18} />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Data Visualization Grid */}
                    <CardBody className="p-0">
                    <div style={{ minHeight: '480px' }}>
                        <UserAccessControl
                            users={filteredUsers}
                            onAction={handleAction}
                            onEditRequest={(u) => { setSelectedUser(u); setShowModal(true); }}
                        />
                    </div>
                    </CardBody>
                </Card>

            <ConfirmModal
                open={!!confirmDelete}
                title="Decommission Principal Identity"
                message={confirmDelete ? `Are you certain you wish to decommission the security principal "${confirmDelete.username}"? All associated access keys and signal credentials will be purged immediately.` : ''}
                variant="danger"
                confirmLabel="Revoke Authority"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                loading={deleteLoading}
            />

            <Modals
                showDeviceModal={false}
                showUserModal={showModal}
                showBroadcastModal={false}
                onClose={() => { setShowModal(false); setSelectedUser(null); }}
                onConfirm={handleModalConfirm}
                selectedDevice={null}
                selectedUser={selectedUser}
                users={[]}
            />
        </PageShell>
    );
}
