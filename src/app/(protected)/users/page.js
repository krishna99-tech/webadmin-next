'use client';

import React, { useEffect, useContext } from 'react';
import { useIoT } from '@/context/IoTContext';
import { useToast } from '@/context/ToastContext';
import UserAccessControl from '@/components/IoTConsole/UserAccessControl';
import Modals from '@/components/IoTConsole/Modals';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import {
    Users as UsersIcon,
    Download,
    RefreshCw,
    Plus,
    ShieldAlert,
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
    const [showModal, setShowModal] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    const handleAction = async (user, action) => {
        const id = user.id || user._id;
        try {
            if (action === 'delete') {
                if (!window.confirm('Remove this user permanently?')) return;
                await deleteUser(id);
                toast.success('User removed');
            } else if (action === 'toggle') {
                const newActiveState = !user.is_active;
                await updateUser(id, { is_active: newActiveState });
                toast.success(newActiveState ? 'Account activated' : 'Account suspended');
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || err.message || 'Operation failed');
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

            <div className="relative">
                {loading && users.length === 0 && (
                    <div className="absolute inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center rounded-3xl min-h-[200px]">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                <UserAccessControl
                    users={users}
                    onAction={handleAction}
                    onAddRequest={() => { setSelectedUser(null); setShowModal(true); }}
                    onEditRequest={(u) => { setSelectedUser(u); setShowModal(true); }}
                />
            </div>

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
