'use client';

import '../../globals.css';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import {
    Trash2,
    Mail,
    Loader2,
    ShieldAlert,
    Download,
    Eye
} from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

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

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;

        try {
            await adminService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert(
                'Failed to delete user: ' +
                (err?.response?.data?.detail || err.message)
            );
        }
    };

    const toggleSelect = (userId) => {
        setSelectedUsers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleSendEmail = () => {
        if (selectedUsers.size === 0) return;
        const recipients = users
            .filter((u) => selectedUsers.has(u.id))
            .map((u) => u.email)
            .filter(Boolean)
            .join(',');

        router.push(`/broadcast?recipients=${encodeURIComponent(recipients)}`);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === users.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map((u) => u.id)));
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await adminService.exportUsers();

            // Convert to CSV
            const headers = ['ID', 'Username', 'Email', 'Full Name', 'Created At', 'Active'];
            const rows = data.map(u => [
                u.id,
                u.username,
                u.email || '',
                u.full_name || '',
                u.created_at || '',
                u.is_active ? 'Yes' : 'No'
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
            a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export users');
        }
    };

    return (
        <div className="users-page animate-fadeInUp">
            {/* Header */}
            <div className="users-header">
                <div>
                    <h2 className="users-title">User Management</h2>
                    <p className="users-subtitle">
                        Manage registered users and permissions
                    </p>
                </div>

                <div className="flex gap-2">
                    {selectedUsers.size > 0 && (
                        <Button onClick={handleSendEmail} className="users-refresh-btn btn-primary">
                            <Mail size={16} className="mr-2" />
                            Send Email ({selectedUsers.size})
                        </Button>
                    )}

                    <Button onClick={handleExport} className="users-refresh-btn" variant="secondary">
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </Button>

                    <Button
                        onClick={fetchUsers}
                        disabled={loading}
                        className="users-refresh-btn"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="users-error">
                    <ShieldAlert size={18} />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="users-loading">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <Card noPadding className="users-table-card">
                    <div className="users-table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            checked={users.length > 0 && selectedUsers.size === users.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => toggleSelect(user.id)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        {/* User */}
                                        <td>
                                            <div className="users-user">
                                                <div className="users-avatar">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.username}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="users-email">
                                            {user.email || '—'}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={`users-status ${user.is_active ? 'active' : 'inactive'
                                                    }`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td className="users-date">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString()
                                                : '—'}
                                        </td>

                                        {/* Actions */}
                                        <td className="users-actions">
                                            <button
                                                title="View Details"
                                                className="users-action-btn"
                                                onClick={() => router.push(`/users/${user.id}`)}
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                title="Send Email"
                                                className="users-action-btn"
                                                onClick={() => {
                                                    router.push(`/broadcast?recipients=${encodeURIComponent(user.email)}`);
                                                }}
                                            >
                                                <Mail size={16} />
                                            </button>

                                            <button
                                                title="Delete User"
                                                onClick={() => handleDelete(user.id)}
                                                className="users-action-btn danger"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="users-empty">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
