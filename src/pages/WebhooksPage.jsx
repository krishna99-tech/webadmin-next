import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardBody, 
    Button, 
    Input, 
    Select, 
    SelectItem, 
    Chip, 
    Switch, 
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react';
import { useToast } from '../context/ToastContext';
import webhookService from '../services/webhookService';
import {
    Webhook as WebhookIcon,
    Plus,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    Globe,
    Zap,
    RefreshCw,
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

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
        setLoading(true);
        try {
            const data = await webhookService.getWebhooks();
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
        try {
            await webhookService.deleteWebhook(id);
            fetchWebhooks();
            toast.success('Webhook removed');
        } catch (error) {
            toast.error('Failed to delete webhook');
        }
    };

    return (
        <PageShell gap="2rem" paddingBottom="5rem">
            <PageHeader
                icon={Zap}
                title="Webhook Nodes"
                subtitle="Secure HTTP callbacks for real-time asynchronous event streaming to external systems."
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="flat" 
                            onPress={fetchWebhooks}
                            isLoading={loading}
                            style={{ height: '2.5rem', borderRadius: '0.75rem', fontWeight: 600, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}
                            startContent={!loading && <RefreshCw size={16} />}
                            className="text-dim"
                        >
                            Sync Nodes
                        </Button>
                        <Button 
                            color="primary" 
                            onPress={() => {
                                if (showForm) {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setFormData({ url: '', events: ['all'], secret: '', active: true });
                                } else {
                                    setShowForm(true);
                                }
                            }}
                            style={{ height: '2.5rem', borderRadius: '0.75rem', fontWeight: 700, boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}
                            startContent={<Plus size={16} />}
                        >
                            Register Webhook
                        </Button>
                    </div>
                }
            />

            {/* Registration Form */}
            {showForm && (
                <div className="elite-card animate-fade-in">
                    <div className="elite-card-body" style={{ padding: '2rem' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{editingId ? 'Modify Subscription' : 'Define New Endpoint'}</h3>
                                <p className="text-dim" style={{ fontSize: '0.75rem', margin: 0 }}>Establish a secure event vector for external consumption.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Destination Endpoint"
                                    placeholder="https://api.external-system.com/hooks"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={formData.url}
                                    onValueChange={v => setFormData({ ...formData, url: v })}
                                    isRequired
                                    classNames={{
                                        label: "text-tactical",
                                        inputWrapper: "h-12 border-white/[0.08] bg-white/[0.02] rounded-xl",
                                    }}
                                />

                                <Select 
                                    label="Event Subscription"
                                    labelPlacement="outside"
                                    variant="bordered"
                                    selectedKeys={formData.events}
                                    onSelectionChange={(keys) => setFormData({ ...formData, events: Array.from(keys) })}
                                    classNames={{
                                        label: "text-tactical",
                                        trigger: "h-12 border-white/[0.08] bg-white/[0.02] rounded-xl px-4",
                                        value: "text-sm font-bold"
                                    }}
                                >
                                    <SelectItem key="all">ALL_SYSTEM_EVENTS</SelectItem>
                                    <SelectItem key="device_added">DEVICE_REGISTRATION</SelectItem>
                                    <SelectItem key="device_removed">DEVICE_DECOMMISSION</SelectItem>
                                    <SelectItem key="status_update">STATUS_CHANGE</SelectItem>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                <Input
                                    label="HMAC Secret Key"
                                    placeholder="Enter verification token..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    type="password"
                                    value={formData.secret}
                                    onValueChange={v => setFormData({ ...formData, secret: v })}
                                    classNames={{
                                        label: "text-tactical",
                                        inputWrapper: "h-12 border-white/[0.08] bg-white/[0.02] rounded-xl",
                                    }}
                                />

                                <div className="flex items-center justify-between h-12 px-6 bg-white/[0.01] rounded-xl border border-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <div className="status-dot" style={{ background: formData.active ? 'var(--success)' : 'var(--text-muted)' }} />
                                        <span className="text-tactical" style={{ color: 'var(--text-main)' }}>Operational State</span>
                                    </div>
                                    <Switch isSelected={formData.active} onValueChange={v => setFormData({ ...formData, active: v })} color="success" size="sm" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="flat" onPress={() => setShowForm(false)} style={{ height: '3rem', borderRadius: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}>Cancel</Button>
                                <Button type="submit" color="primary" style={{ height: '3rem', minWidth: '10rem', borderRadius: '0.75rem', fontWeight: 700, boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}>
                                    {editingId ? 'Update Vector' : 'Establish Link'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Active Nodes Table */}
            <div className="elite-card">
                <div className="elite-card-body" style={{ padding: 0 }}>
                    <Table
                        aria-label="Webhook Cluster" 
                        removeWrapper
                        classNames={{
                            base: "elite-table-container",
                            table: "min-h-[300px]",
                            thead: "bg-white/[0.01]",
                            th: "bg-transparent text-tactical text-[10px] h-14 px-6 border-b border-white/[0.03]",
                            tbody: "divide-y divide-white/[0.02]",
                            tr: "elite-table-row",
                            td: "py-5 px-6"
                        }}
                    >
                        <TableHeader>
                            <TableColumn>ENDPOINT VECTOR</TableColumn>
                            <TableColumn>SUBSCRIPTION</TableColumn>
                            <TableColumn>HEALTH</TableColumn>
                            <TableColumn align="end">OPERATIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={<div className="text-tactical" style={{ padding: '4rem', opacity: 0.3 }}>No active webhook nodes identified in the registry.</div>}>
                            {webhooks.map((webhook) => (
                                <TableRow key={webhook.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{webhook.url}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="status-dot" style={{ background: webhook.active ? 'var(--success)' : 'rgba(255,255,255,0.1)', width: '6px', height: '6px' }} />
                                                <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.4 }}>{webhook.active ? 'Operational' : 'Paused'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1.5">
                                            {webhook.events?.map(e => (
                                                <Chip key={e} size="sm" variant="flat" style={{ height: '1.25rem', fontSize: '9px', fontWeight: 800, background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-dim)', border: 'none' }}>{e}</Chip>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {webhook.last_status === 'success' ? (
                                            <Chip size="sm" variant="flat" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '9px', fontWeight: 800, height: '1.5rem', border: 'none' }} startContent={<CheckCircle size={10} style={{ marginRight: '4px' }} />}>LINK_OK</Chip>
                                        ) : (
                                            <Chip size="sm" variant="flat" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '9px', fontWeight: 800, height: '1.5rem', border: 'none' }} startContent={<XCircle size={10} style={{ marginRight: '4px' }} />}>FAILURE</Chip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button isIconOnly variant="light" size="sm" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} className="text-dim hover:text-primary" onPress={() => handleEdit(webhook)}>
                                                <Edit size={14}/>
                                            </Button>
                                            <Button isIconOnly variant="light" size="sm" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} className="text-dim hover:text-danger" onPress={() => handleDelete(webhook.id)}>
                                                <Trash2 size={14}/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Tactical Footer */}
            <div className="flex justify-center gap-12 opacity-30 pt-8">
                <div className="flex items-center gap-3">
                    <Globe size={14} className="text-primary" />
                    <span className="text-tactical" style={{ color: 'var(--text-main)' }}>Edge_Dispatch_Active</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-success" />
                    <span className="text-tactical" style={{ color: 'var(--text-main)' }}>Kernel_Handshake_Verified</span>
                </div>
            </div>
        </PageShell>
    );
}
