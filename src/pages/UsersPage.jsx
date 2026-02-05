import React, { useEffect, useState, useMemo } from 'react';
import { useIoT } from '../context/IoTContext';
import { useToast } from '../context/ToastContext';
import UserAccessControl from '../components/IoTConsole/UserAccessControl';
import Modals from '../components/IoTConsole/Modals';
import Button from '../components/UI/Button';
import ConfirmModal from '../components/UI/ConfirmModal';
import EmptyState from '../components/UI/EmptyState';
import adminService from '../services/adminService';
import {
    Users as UsersIcon,
    Download,
    RefreshCw,
    Plus,
    ShieldAlert,
    Search,
} from 'lucide-react';

export default function UsersPage() {
    const {
        users,
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
        <div className="users-page animate-fadeInUp">
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <UsersIcon className="icon-glow text-primary" size={28} />
                        User Directory
                    </h2>
                    <p className="dashboard-subtitle mt-1">
                        Manage identities and access permissions
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline">
                        <Download size={18} />
                        Export
                    </Button>
                    <Button onClick={fetchUsers} disabled={loading} variant="secondary">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button onClick={() => { setSelectedUser(null); setShowModal(true); }} className="btn-glow px-6">
                        <Plus size={18} />
                        Add User
                    </Button>
                </div>
            </div>

            {error && (
                <div className="status-message status-error mb-6 border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3">
                    <ShieldAlert size={20} className="text-red-400" />
                    <span className="text-xs font-medium text-red-200">{error}</span>
                </div>
            )}

            <div className="action-bar mb-6">
                <div className="flex-1 min-w-[200px] max-w-md relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by username, email, name…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field input-glow w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-divider/5 bg-content2/5 focus:border-blue-500/50"
                    />
                </div>
            </div>

            <div className="relative">
                {loading && users.length === 0 && (
                    <div className="absolute inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center rounded-3xl min-h-[200px]">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                {filteredUsers.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title={searchQuery ? 'No users match your search' : 'No users yet'}
                        description={searchQuery ? 'Try a different search.' : 'Onboard your first user to get started.'}
                        actionLabel={searchQuery ? undefined : 'Add User'}
                        onAction={searchQuery ? undefined : () => { setSelectedUser(null); setShowModal(true); }}
                        className="rounded-2xl"
                    />
                ) : (
                    <UserAccessControl
                        users={filteredUsers}
                        onAction={handleAction}
                        onAddRequest={() => { setSelectedUser(null); setShowModal(true); }}
                        onEditRequest={(u) => { setSelectedUser(u); setShowModal(true); }}
                    />
                )}
            </div>

            <ConfirmModal
                open={!!confirmDelete}
                title="Remove user"
                message={confirmDelete ? `Remove "${confirmDelete.username || confirmDelete.full_name}" permanently? This cannot be undone.` : ''}
                variant="danger"
                confirmLabel="Remove"
                cancelLabel="Cancel"
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
        </div>
    );
}
