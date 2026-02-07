import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Input,
    Select,
    SelectItem,
} from '@heroui/react';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Info,
    RefreshCw,
    Filter,
    Search,
    Trash2,
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';
import adminService from '../services/adminService';
import { inputClassNames } from '../constants/uiClasses';

const severityConfig = {
    critical: { color: 'danger', icon: AlertCircle },
    warning: { color: 'warning', icon: AlertTriangle },
    info: { color: 'primary', icon: Info },
    resolved: { color: 'success', icon: CheckCircle },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('all');

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const data = await adminService.getNotifications();
            const list = Array.isArray(data) ? data : [];
            setAlerts(list.map((a, i) => ({
                id: a.id || `alert-${i}`,
                title: a.title || a.message || 'System Alert',
                message: a.message || a.detail || '',
                severity: a.severity || (a.read ? 'resolved' : 'info'),
                timestamp: a.timestamp || a.created_at || new Date().toISOString(),
                read: a.read ?? false,
                source: a.source || 'SYSTEM',
            })));
        } catch {
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const filtered = alerts.filter(a => {
        const matchSearch = !searchQuery || 
            (a.title + a.message).toLowerCase().includes(searchQuery.toLowerCase());
        const matchSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
        return matchSearch && matchSeverity;
    });

    const unreadCount = alerts.filter(a => !a.read).length;

    return (
        <PageShell>
            <PageHeader
                icon={Bell}
                title="Alerts & Notifications"
                subtitle="Real-time system alerts and operational notifications."
                actions={
                    <div className="flex items-center gap-3">
                        <Chip size="sm" variant="flat" color={unreadCount > 0 ? 'warning' : 'success'}>
                            {unreadCount} Unread
                        </Chip>
                        <Button
                            variant="flat"
                            onPress={fetchAlerts}
                            isLoading={loading}
                            startContent={<RefreshCw size={16} />}
                            classNames={{ base: "admin-input-wrapper" }}
                        >
                            Sync
                        </Button>
                    </div>
                }
            />

            <Card className="admin-card">
                <CardHeader className="admin-card-header flex flex-wrap gap-4 p-5">
                    <div style={{ flex: 1, minWidth: '240px' }}>
                        <Input
                            placeholder="Search alerts..."
                            startContent={<Search size={16} />}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            variant="bordered"
                            classNames={inputClassNames}
                        />
                    </div>
                    <Select
                        size="sm"
                        placeholder="Severity"
                        selectedKeys={[filterSeverity]}
                        onSelectionChange={(k) => setFilterSeverity(Array.from(k)[0] || 'all')}
                        className="w-40"
                        classNames={{ trigger: "admin-input-wrapper" }}
                    >
                        <SelectItem key="all">All</SelectItem>
                        <SelectItem key="critical">Critical</SelectItem>
                        <SelectItem key="warning">Warning</SelectItem>
                        <SelectItem key="info">Info</SelectItem>
                        <SelectItem key="resolved">Resolved</SelectItem>
                    </Select>
                </CardHeader>
                <CardBody className="p-0">
                    {loading && !alerts.length ? (
                        <div className="flex items-center justify-center py-24">
                            <RefreshCw className="animate-spin text-primary" size={32} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 opacity-40">
                            <CheckCircle size={48} className="mb-4" />
                            <p className="text-tactical">No alerts match your filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.03]">
                            {filtered.map((alert) => {
                                const config = severityConfig[alert.severity] || severityConfig.info;
                                const Icon = config.icon;
                                const iconBg = { danger: 'rgba(239,68,68,0.1)', warning: 'rgba(245,158,11,0.1)', primary: 'rgba(59,130,246,0.1)', success: 'rgba(16,185,129,0.1)' }[config.color] || 'rgba(59,130,246,0.1)';
                                const iconColor = { danger: 'var(--danger)', warning: 'var(--warning)', primary: 'var(--primary)', success: 'var(--success)' }[config.color] || 'var(--primary)';
                                return (
                                    <div
                                        key={alert.id}
                                        className={`flex items-start gap-4 p-6 hover:bg-white/[0.02] transition-colors ${!alert.read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="p-2 rounded-lg" style={{ background: iconBg }}>
                                            <Icon size={20} style={{ color: iconColor }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-sm">{alert.title}</h4>
                                                <Chip size="sm" variant="flat" color={config.color}>
                                                    {alert.severity}
                                                </Chip>
                                            </div>
                                            <p className="text-sm text-default-500">{alert.message}</p>
                                            <p className="text-tactical mt-2 opacity-50">
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardBody>
            </Card>
        </PageShell>
    );
}
