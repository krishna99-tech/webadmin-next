import React, { useEffect, useState, useMemo } from 'react';
import { 
    Card, 
    CardBody, 
    Button, 
    Tabs, 
    Tab, 
    Chip, 
    Progress,
} from '@heroui/react';
import adminService from '../services/adminService';
import {
    TrendingUp,
    Users,
    Server,
    Activity,
    Download,
    RefreshCw,
    BarChart3,
    Zap,
    CheckCircle2,
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-dim)', borderRadius: '1rem', padding: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <p className="text-tactical" style={{ fontSize: '9px', marginBottom: '0.75rem' }}>{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', fontSize: '11px', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>{entry.name}:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{entry.value?.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState('area');

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const analytics = await adminService.getAnalytics();
            setData(analytics);
        } catch (err) {
            console.error('Analytics Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleExport = () => {
        const exportData = JSON.stringify(data, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `intelligence_report_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    const metrics = useMemo(() => {
        if (!data) return null;
        const totalUsers = data.current_stats?.total_users || 0;
        const totalDevices = data.current_stats?.total_devices || 0;
        const onlineDevices = data.current_stats?.online_devices || 0;
        const uptime = totalDevices > 0 ? ((onlineDevices / totalDevices) * 100).toFixed(1) : 0;
        
        return {
            totalUsers,
            totalDevices,
            onlineDevices,
            uptime,
            avgDevicesPerUser: totalUsers > 0 ? (totalDevices / totalUsers).toFixed(1) : 0,
        };
    }, [data]);

    if (loading && !data) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
                <RefreshCw className="text-primary animate-spin" size={32} />
                <p className="text-tactical" style={{ letterSpacing: '0.3em' }}>Aggregating Intelligence...</p>
            </div>
        );
    }

    const activityData = data?.activity_by_type ? Object.entries(data.activity_by_type).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
    })) : [];

    return (
        <PageShell gap="2rem" paddingBottom="5rem">
            <PageHeader
                icon={TrendingUp}
                title="Intelligence Terminal"
                subtitle="Heuristic analysis of platform metadata and nodal expansion trajectory."
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="flat" 
                            onPress={handleExport}
                            startContent={<Download size={16} />}
                            style={{ height: '2.75rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}
                        >
                            Export Report
                        </Button>
                        <Button 
                            variant="flat" 
                            onPress={fetchAnalytics}
                            isLoading={loading}
                            style={{ height: '2.75rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}
                            className="text-dim"
                            startContent={!loading && <RefreshCw size={16} />}
                        >
                            Sync
                        </Button>
                    </div>
                }
            />

            {/* Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Principals', value: metrics?.totalUsers, icon: Users, color: 'primary' },
                    { label: 'Nodal Assets', value: metrics?.totalDevices, icon: Server, color: 'indigo' },
                    { label: 'Flow Pulse', value: metrics?.onlineDevices, icon: Activity, color: 'success' },
                    { label: 'System Uptime', value: `${metrics?.uptime}%`, icon: CheckCircle2, color: 'emerald' }
                ].map((kpi, idx) => (
                    <div key={idx} className="elite-card">
                        <div className="elite-card-body" style={{ padding: '1.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: `var(--${kpi.color}-bg, rgba(59, 130, 246, 0.05))`, color: `var(--${kpi.color}, var(--primary))` }}>
                                    <kpi.icon size={18} />
                                </div>
                                <Chip size="sm" variant="flat" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 700, fontSize: '10px', height: '1.25rem', border: 'none' }}>+12.5%</Chip>
                            </div>
                            <p className="text-tactical" style={{ fontSize: '9px' }}>{kpi.label}</p>
                            <h3 className="text-value" style={{ marginTop: '0.25rem' }}>{kpi.value || 0}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* In-depth Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Primary Growth Vector */}
                <div className="lg:col-span-8 elite-card">
                    <div className="elite-card-body" style={{ padding: '2rem' }}>
                        <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <BarChart3 className="text-primary" size={18} />
                                <h3 className="text-tactical" style={{ fontSize: '11px', color: 'var(--text-main)' }}>Nodal Growth Analysis</h3>
                            </div>
                            <Tabs 
                                size="sm" 
                                variant="flat" 
                                selectedKey={chartType} 
                                onSelectionChange={setChartType}
                                classNames={{
                                    tabList: "bg-white/[0.03] rounded-xl border border-white/[0.05]",
                                    cursor: "bg-blue-600",
                                    tab: "px-6 font-bold text-[10px] uppercase tracking-wider h-8"
                                }}
                            >
                                <Tab key="area" title="Linear" />
                                <Tab key="pie" title="Distribution" className="lg:hidden" />
                            </Tabs>
                        </div>
                        
                        <div style={{ height: '360px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={Array.isArray(data?.user_growth) ? data.user_growth : []}>
                                    <defs>
                                        <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="var(--text-muted)" 
                                        fontSize={10} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                                    />
                                    <YAxis stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#primaryGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Event Distribution */}
                <div className="lg:col-span-4 elite-card">
                    <div className="elite-card-body" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                            <Activity className="text-indigo" size={18} />
                            <h3 className="text-tactical" style={{ fontSize: '11px', color: 'var(--text-main)' }}>Event Taxonomy</h3>
                        </div>
                        
                        <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={activityData}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {activityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                            {activityData.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex-between">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.6 }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 elite-card">
                    <div className="elite-card-body" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                 <Zap size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Nodal Reachability</h4>
                                <p className="text-dim" style={{ fontSize: '0.75rem', margin: 0 }}>Real-time link integrity audit.</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '1.5rem', border: '1px solid var(--border-dim)' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.05em' }}>78<span style={{ fontSize: '1.125rem', opacity: 0.6 }}>%</span></span>
                                <span className="text-tactical" style={{ fontSize: '9px', marginTop: '0.5rem' }}>Utilization</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="flex-between" style={{ fontSize: '11px', fontWeight: 700 }}>
                                        <span style={{ color: 'var(--text-dim)' }}>Packet Latency</span>
                                        <span style={{ color: 'var(--primary)' }}>84ms</span>
                                    </div>
                                    <Progress value={84} size="sm" color="primary" radius="full" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="flex-between" style={{ fontSize: '11px', fontWeight: 700 }}>
                                        <span style={{ color: 'var(--text-dim)' }}>Data Integrity</span>
                                        <span style={{ color: 'var(--success)' }}>99.9%</span>
                                    </div>
                                    <Progress value={99.9} size="sm" color="success" radius="full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 elite-card">
                    <div className="elite-card-body" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.005)', borderStyle: 'dashed', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.1)' }}>
                                <CheckCircle2 size={28} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Protocol Nominal</h4>
                                <p className="text-dim" style={{ fontSize: '0.75rem', fontWeight: 500, fontStyle: 'italic', margin: 0 }}>High-fidelity intelligence link active.</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p className="text-tactical" style={{ fontSize: '9px', marginBottom: '0.25rem' }}>Health Index</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>98.4</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
