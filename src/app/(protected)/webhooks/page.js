'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/UI/Card';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { useToast } from '@/context/ToastContext';
import webhookService from '@/services/webhookService';
import {
    Webhook as WebhookIcon,
    Plus,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    AlertCircle,
    Activity,
    Shield,
    Globe
} from 'lucide-react';

/* ===============================
   WEBHOOKS PAGE
================================ */
export default function WebhooksPage() {
    const toast = useToast();
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        url: '',
        events: ['all'],
        secret: '',
        active: true
    });

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const data = await webhookService.getWebhooks();
            // Handle both direct array and wrapped object responses
            const webhooksList = Array.isArray(data) ? data : (data?.webhooks || []);
            setWebhooks(webhooksList);
        } catch (error) {
            console.error('Failed to fetch webhooks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await webhookService.updateWebhook(editingId, formData);
            } else {
                await webhookService.createWebhook(formData);
            }

            setFormData({ url: '', events: ['all'], secret: '', active: true });
            setShowForm(false);
            setEditingId(null);
            fetchWebhooks();
            toast.success(editingId ? 'Webhook updated' : 'Webhook created');
        } catch (error) {
            console.error('Failed to save webhook', error);
            toast.error(error.response?.data?.detail || error.message || 'Failed to save webhook');
        }
    };

    const handleEdit = (webhook) => {
        setFormData({
            url: webhook.url,
            events: webhook.events || ['all'],
            secret: webhook.secret || '',
            active: webhook.active !== false
        });
        setEditingId(webhook.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;

        try {
            await webhookService.deleteWebhook(id);
            fetchWebhooks();
            toast.success('Webhook removed');
        } catch (error) {
            console.error('Failed to delete webhook', error);
            toast.error('Failed to delete webhook');
        }
    };

    const handleCancel = () => {
        setFormData({ url: '', events: ['all'], secret: '', active: true });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <div className="webhooks-page animate-fadeInUp">
            {/* Header */}
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <WebhookIcon className="icon-glow text-primary" size={28} />
                        Webhook Management
                    </h2>
                    <p className="dashboard-subtitle mt-1">
                        Configure HTTP callbacks to receive real-time event notifications
                    </p>
                </div>
                <Button
                    variant="primary"
                    className="btn-broadcast-premium"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={18} />
                    {showForm ? 'Cancel Operation' : 'Register New Webhook'}
                </Button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <Card className="mb-8 border-white/10 animate-fadeInUp">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Plus size={20} className="text-blue-400" />
                        </div>
                        <h3 className="card-title mb-0">
                            {editingId ? 'Modify Endpoint' : 'Define New Callback'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="webhook-form space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group text-left">
                                <label htmlFor="url" className="form-label font-bold text-xs uppercase tracking-widest text-dim mb-2 block">
                                    <Globe size={12} className="inline mr-1" /> Destination URL *
                                </label>
                                <Input
                                    id="url"
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://your-api.com/webhooks"
                                    className="msg-textarea"
                                    required
                                />
                            </div>

                            <div className="form-group text-left">
                                <label htmlFor="events" className="form-label font-bold text-xs uppercase tracking-widest text-dim mb-2 block">
                                    <Activity size={12} className="inline mr-1" /> Event Subscription
                                </label>
                                <select
                                    id="events"
                                    className="input-field msg-textarea"
                                    value={formData.events[0]}
                                    onChange={(e) => setFormData({ ...formData, events: [e.target.value] })}
                                >
                                    <option value="all">All Ecosystem Events</option>
                                    <option value="device_added">Device Registration</option>
                                    <option value="device_removed">Device Decommissioning</option>
                                    <option value="status_update">Status Perturbations</option>
                                    <option value="telemetry_update">Telemetry Pulse</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group text-left">
                            <label htmlFor="secret" className="form-label font-bold text-xs uppercase tracking-widest text-dim mb-2 block">
                                <Shield size={12} className="inline mr-1" /> Verification Secret (Optional)
                            </label>
                            <Input
                                id="secret"
                                type="text"
                                value={formData.secret}
                                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                                placeholder="Signature token for HMAC verification"
                                className="msg-textarea"
                            />
                            <p className="text-[10px] text-dim mt-2 italic px-1">Used to verify that payloads originated from ThingsNXT</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="checkbox-group flex items-center gap-3">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    <span className="slider round" />
                                </label>
                                <span className="text-sm font-medium">Channel Active</span>
                            </div>

                            <div className="form-actions flex gap-3">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Discard
                                </Button>
                                <Button type="submit" variant="primary" className="btn-broadcast-premium">
                                    {editingId ? 'Update Endpoint' : 'Establish Webhook'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            )}

            {/* Webhooks List */}
            <Card className="border-white/5">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h3 className="card-title mb-0">Active Channels</h3>
                    {!loading && webhooks.length > 0 && (
                        <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-dim font-mono tracking-widest">
                            {webhooks.length} CONFIGURED
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <Activity className="mx-auto mb-4 text-blue-400 animate-spin" size={32} />
                        <p className="text-dim italic">Polling configured endpoints...</p>
                    </div>
                ) : webhooks.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <WebhookIcon size={48} className="mx-auto mb-4 text-dim opacity-10" />
                        <p className="text-dim italic">No active webhooks found in your ecosystem.</p>
                    </div>
                ) : (
                    <div className="webhooks-list grid gap-4">
                        {webhooks.map((webhook) => (
                            <div key={webhook.id} className="webhook-item bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/5 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="webhook-icon p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                        <WebhookIcon size={20} className="text-blue-400" />
                                    </div>

                                    <div className="webhook-content flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="webhook-url font-mono text-sm text-white truncate max-w-[400px]">
                                                {webhook.url}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${webhook.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                {webhook.active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>

                                        <div className="webhook-meta flex items-center gap-4 text-[11px] text-dim">
                                            <span className="flex items-center gap-1">
                                                <Activity size={12} />
                                                {webhook.events?.join(', ') || 'all'}
                                            </span>
                                            {webhook.trigger_count > 0 && (
                                                <span className="flex items-center gap-1 px-3 py-0.5 bg-white/5 rounded-full">
                                                    <Globe size={10} />
                                                    {webhook.trigger_count} TRIGGERS
                                                </span>
                                            )}
                                        </div>

                                        {webhook.last_status && (
                                            <div className="webhook-status mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                {webhook.last_status === 'success' ? (
                                                    <div className="flex items-center gap-1.5 text-green-400">
                                                        <CheckCircle size={12} />
                                                        HEALTHY: 200 OK
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-red-400">
                                                        <XCircle size={12} />
                                                        FAILING: {webhook.last_error_code || 'ERROR'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="webhook-actions flex gap-2 self-center">
                                        <button
                                            onClick={() => handleEdit(webhook)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-dim hover:text-white transition-colors"
                                            title="Edit Endpoint"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(webhook.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-dim hover:text-red-400 transition-colors"
                                            title="Delete Endpoint"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
