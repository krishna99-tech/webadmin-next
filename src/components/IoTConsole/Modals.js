import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import { X, Smartphone, User, Shield, Info } from 'lucide-react';

export default function Modals({ 
    showDeviceModal, 
    showUserModal, 
    showBroadcastModal,
    onClose, 
    onConfirm,
    selectedDevice, 
    selectedUser,
    users = [] // For device owner selection
}) {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedDevice) {
            setFormData({
                name: selectedDevice.name || '',
                user_id: selectedDevice.user_id || '',
                status: selectedDevice.status || 'offline'
            });
        } else if (selectedUser) {
            setFormData({
                username: selectedUser.username || '',
                full_name: selectedUser.full_name || '',
                email: selectedUser.email || '',
                role: selectedUser.role || 'User',
                is_active: selectedUser.is_active ?? true
            });
        } else if (showBroadcastModal) {
            setFormData({
                subject: 'System Announcement',
                message: '',
                recipients: null
            });
        } else {
            setFormData({});
        }
    }, [selectedDevice, selectedUser, showDeviceModal, showUserModal, showBroadcastModal]);

    if (!showDeviceModal && !showUserModal && !showBroadcastModal) return null;

    const isDevice = showDeviceModal;
    const isBroadcast = showBroadcastModal;
    
    const title = isBroadcast
        ? 'Broadcast Notification'
        : isDevice 
            ? (selectedDevice ? 'Modify Device' : 'Register New Device') 
            : (selectedUser ? 'Edit User' : 'Onboard New User');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm(formData);
            onClose();
        } catch (err) {
            console.error('Modal submission failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn p-4">
            <Card className="w-full max-w-md border-divider/10 bg-slate-950/90 backdrop-blur-xl p-0 shadow-2xl relative overflow-hidden border-glow">
                {/* Header */}
                <div className="px-6 py-4 bg-content2/[0.02] border-b border-divider/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {isDevice ? <Smartphone size={20} /> : <User size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
                            <p className="text-[10px] text-dim uppercase tracking-wider">
                                {isDevice ? 'Hardware Registry' : 'Identity Management'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-dim hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {isBroadcast ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Message Subject</label>
                                <input 
                                    type="text"
                                    required
                                    className="input-field w-full"
                                    placeholder="e.g. Scheduled Maintenance"
                                    value={formData.subject || ''}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Notification Body</label>
                                <Textarea 
                                    required
                                    className="input-field w-full resize-none py-3"
                                    placeholder="Enter the broadcast message for all active users..."
                                    value={formData.message || ''}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    minRows={4}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <input 
                                    type="checkbox" 
                                    id="targeted"
                                    className="w-4 h-4 rounded border-divider/10 bg-slate-800"
                                    checked={!!formData.recipients}
                                    onChange={e => setFormData({ ...formData, recipients: e.target.checked ? [] : null })}
                                />
                                <label htmlFor="targeted" className="text-xs text-dim">Target specific recipients only</label>
                            </div>
                            {formData.recipients && (
                                <div className="space-y-1.5 animate-fadeIn">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Recipient Emails (comma separated)</label>
                                    <input 
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="user1@example.com, user2@example.com"
                                        onChange={e => setFormData({ ...formData, recipients: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>
                            )}
                        </>
                    ) : isDevice ? (
                        <>
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
                                <Select 
                                    className="input-field w-full bg-slate-800"
                                    value={formData.user_id || ''}
                                    onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                    options={[
                                        { value: '', label: 'System / Orphaned' },
                                        ...users.map(u => ({
                                            value: u.id,
                                            label: `${u.username} (${u.email || 'No email'})`
                                        }))
                                    ]}
                                />
                            </div>
                        </>
                    ) : (
                        <>
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
                                    <Select 
                                        className="input-field w-full bg-slate-800"
                                        value={formData.role || 'User'}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        options={[
                                            { value: 'User', label: 'User' },
                                            { value: 'Admin', label: 'Administrator' },
                                            { value: 'Technician', label: 'Technician' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-dim ml-1">Status</label>
                                    <Select 
                                        className="input-field w-full bg-slate-800"
                                        value={formData.is_active ? 'active' : 'inactive'}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                        options={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Locked' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </>
                    )}

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
                            onClick={onClose}
                        >
                            Abort
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 btn-primary shadow-lg shadow-primary/20"
                            loading={loading}
                        >
                            {isBroadcast ? 'Dispatch Broadcast' : (selectedDevice || selectedUser ? 'Update Entity' : 'Create Entity')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
