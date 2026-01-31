'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import adminService from '@/services/adminService';
import iotService from '@/services/iotService';
import {
    ShieldAlert,
    Download,
    RefreshCw,
    Users as UsersIcon,
    Plus,
    Edit,
    Trash2,
    Lock,
    Unlock,
    X,
    User,
    Info
} from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const router = useRouter();

    // Modal form state
    const [formData, setFormData] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getUsers();
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setError('Failed to load users. Ensure you have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Initialize form data when modal opens
    useEffect(() => {
        if (selectedUser) {
            setFormData({
                username: selectedUser.username || '',
                full_name: selectedUser.full_name || '',
                email: selectedUser.email || '',
                role: selectedUser.role || 'User',
                is_active: selectedUser.is_active ?? true
            });
        } else {
            setFormData({
                username: '',
                full_name: '',
                email: '',
                password: '',
                role: 'User',
                is_active: true
            });
        }
    }, [selectedUser, showModal]);

    const handleAction = async (user, action) => {
        try {
            if (action === 'delete') {
                if (!window.confirm('Delete this user permanently?')) return;
                await iotService.deleteUser(user.id || user._id);
                setUsers(prev => prev.filter(u => (u.id || u._id) !== (user.id || user._id)));
            } else if (action === 'toggle') {
                const newActiveState = !user.is_active;
                await iotService.updateUser(user.id || user._id, { is_active: newActiveState });
                setUsers(prev => prev.map(u => 
                    (u.id || u._id) === (user.id || user._id) ? { ...u, is_active: newActiveState } : u
                ));
            }
        } catch (err) {
            alert('Operation failed: ' + (err?.response?.data?.detail || err.message));
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await adminService.exportUsers();
            const headers = ['ID', 'Username', 'Email', 'Full Name', 'Created At', 'Active'];
            const rows = data.map(u => [
                u.id, u.username, u.email || '', u.full_name || '', u.created_at || '', u.is_active ? 'Yes' : 'No'
            ]);
            const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export users');
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (selectedUser) {
                await iotService.updateUser(selectedUser.id || selectedUser._id, formData);
            } else {
                await iotService.createUser(formData);
            }
            setShowModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            alert('Operation failed: ' + (err?.response?.data?.detail || err.message));
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="users-page animate-fadeInUp">
            {/* Header */}
            <div className="users-header mb-8">
                <div>
                    <h2 className="users-title flex items-center gap-3">
                        <UsersIcon className="icon-glow text-primary" size={28} />
                        User Directory
                    </h2>
                    <p className="users-subtitle mt-1">
                        Comprehensive identity registry and access control layer.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline">
                        <Download size={18} />
                        Export Registry
                    </Button>
                    <Button onClick={fetchUsers} disabled={loading} variant="secondary">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Sync Data
                    </Button>
                    <Button onClick={() => { setSelectedUser(null); setShowModal(true); }} className="btn-primary shadow-primary">
                        <Plus size={18} />
                        Onboard New User
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="status-message status-error mb-6 border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3">
                    <ShieldAlert size={20} className="text-red-400" />
                    <span className="text-xs font-medium text-red-200">{error}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center rounded-3xl min-h-[200px]">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
                
                {/* User Table */}
                <div className="space-y-6 animate-fadeIn">
                    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="iot-table">
                                <thead>
                                    <tr>
                                        <th>Identity</th>
                                        <th>Communications</th>
                                        <th>System Role</th>
                                        <th>Access Rights</th>
                                        <th>Last Presence</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id || user._id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {(user.full_name || user.username || '?')[0]}
                                                    </div>
                                                    <span className="font-medium text-white">{user.full_name || user.username}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm text-dim">{user.email}</td>
                                            <td>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.is_active ? 'status-badge-online' : 'status-badge-offline'}`}>
                                                    {user.is_active ? 'Active Access' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="text-sm text-dim font-mono">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => handleAction(user, 'toggle')} 
                                                        title={user.is_active ? "Lock Account" : "Unlock Account"}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_active ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-green-500/10 text-green-400'}`}
                                                    >
                                                        {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedUser(user); setShowModal(true); }} 
                                                        title="Modify Permissions"
                                                        className="p-2 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(user, 'delete')} 
                                                        title="Revoke Identity"
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-dim italic">
                                                No registered users found in the identity provider.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn p-4">
                    <Card className="w-full max-w-md border-white/10 bg-slate-950/90 backdrop-blur-xl p-0 shadow-2xl relative overflow-hidden border-glow">
                        {/* Header */}
                        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight">
                                        {selectedUser ? 'Edit User' : 'Onboard New User'}
                                    </h3>
                                    <p className="text-[10px] text-dim uppercase tracking-wider">Identity Management</p>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Username</label>
                                    <input 
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        placeholder="johndoe"
                                        value={formData.username || ''}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Full Name</label>
                                    <input 
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="John Doe"
                                        value={formData.full_name || ''}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    className="input-field w-full"
                                    placeholder="john@example.com"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            {!selectedUser && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Initial Password</label>
                                    <input 
                                        type="password"
                                        required
                                        className="input-field w-full"
                                        placeholder="••••••••"
                                        value={formData.password || ''}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Security Role</label>
                                    <select 
                                        className="input-field w-full bg-slate-800"
                                        value={formData.role || 'User'}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="User">User</option>
                                        <option value="Admin">Administrator</option>
                                        <option value="Technician">Technician</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Status</label>
                                    <select 
                                        className="input-field w-full bg-slate-800"
                                        value={formData.is_active ? 'active' : 'inactive'}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Locked</option>
                                    </select>
                                </div>
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
                                    {selectedUser ? 'Update Entity' : 'Create Entity'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
