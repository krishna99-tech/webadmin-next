import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Button, 
    Card,
    CardBody,
    CardHeader,
    Divider,
    Progress,
    Tooltip
} from '@heroui/react';
import { AuthContext } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import deviceService from '../services/deviceService';
import adminService from '../services/adminService';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    Server,
    Activity,
    Wifi,
    Users,
    Shield,
    TrendingUp,
    Clock,
    WifiOff,
    RefreshCw,
    LayoutDashboard,
    Zap,
    ChevronRight,
    MousePointer2,
    CheckCircle,
    AlertTriangle,
    Signal,
    Network,
    Send
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

/* ===============================
   PREMIUM ELITE STAT CARD
================================ */
const StatCard = ({ icon: Icon, label, value, subtext, color, loading }) => (
  <Card className="admin-card elite-card-interactive overflow-hidden">
    <CardBody className="relative p-7">
      {/* Background Decorative Glow */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: `var(--${color}, #3b82f6)`, filter: 'blur(50px)', opacity: 0.1, pointerEvents: 'none' }} />
      
      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '0.15em' }}>{label.toUpperCase()}</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 950, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.03em', fontStyle: 'italic' }}>
            {loading ? '---' : value}
          </h3>
          <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.25, marginTop: '2px' }}>{subtext}</p>
        </div>
        <div style={{ 
            width: '3.25rem', 
            height: '3.25rem', 
            borderRadius: '1rem', 
            background: `rgba(255, 255, 255, 0.02)`, 
            border: '1px solid rgba(255, 255, 255, 0.04)',
            color: `var(--${color}, #3b82f6)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px rgba(0,0,0,0.2)`
        }}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
      
      {loading && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `var(--${color}, #3b82f6)`, opacity: 0.2 }} className="animate-pulse" />
      )}
    </CardBody>
  </Card>
);

const HealthMetric = ({ label, value, status, icon: Icon }) => (
  <div className="status-pill" style={{ padding: '0.875rem 1.25rem', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ color: status === 'good' ? 'var(--success)' : 'var(--warning)', opacity: 0.6 }}>
            <Icon size={14} />
        </div>
        <span className="text-tactical" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{label}</span>
    </div>
    <div className="flex-center" style={{ gap: '0.75rem' }}>
      <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'monospace' }}>{value}</span>
      <div className={`status-dot ${status === 'good' ? 'status-dot-on' : 'status-dot-off'}`} style={{ width: '5px', height: '5px' }} />
    </div>
  </div>
);

/* ===============================
   ELITE DASHBOARD ENHANCED
================================ */
export default function Dashboard() {
    const [stats, setStats] = useState({
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        totalUsers: 0
    });
    const [analytics, setAnalytics] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const { isConnected: wsConnected } = useWebSocket();
    const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (!currentUser) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [devicesRaw, activityLogs, analyticsData] = await Promise.all([
                isAdmin ? adminService.getAllDevices() : deviceService.getDevices(),
                adminService.getActivity().catch(() => []),
                isAdmin ? adminService.getAnalytics() : null
            ]);

            // Robust data normalization
            const devices = Array.isArray(devicesRaw) ? devicesRaw : (devicesRaw?.data && Array.isArray(devicesRaw.data) ? devicesRaw.data : []);
            const online = devices.filter(d => d.status === 'online').length;

            setStats({
                totalDevices: devices.length,
                onlineDevices: online,
                offlineDevices: devices.length - online,
                totalUsers: analyticsData?.current_stats?.total_users || 0
            });

            setActivities(Array.isArray(activityLogs) ? activityLogs.slice(0, 6) : []);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Dashboard Sync Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser, isAdmin]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <PageShell>
            <PageHeader
                icon={LayoutDashboard}
                title="Console Overview"
                subtitle="Real-time orchestration of edge hardware and security identities."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="status-pill" style={{ padding: '0.75rem 1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.4 }}>GLOBAL_LINK</span>
                                <span style={{ fontSize: '10px', fontWeight: 900, color: wsConnected ? 'var(--success)' : 'var(--warning)', letterSpacing: '0.05em' }}>
                                    {wsConnected ? 'OPERATIONAL' : 'RECONNECTING'}
                                </span>
                            </div>
                            <div style={{ position: 'relative', marginLeft: '0.75rem' }}>
                                <div className={`status-dot ${wsConnected ? 'status-dot-on' : 'status-dot-off'}`} style={{ width: '8px', height: '8px' }} />
                                {wsConnected && <div className="status-dot animate-pulse-soft" style={{ position: 'absolute', inset: -2, background: 'var(--success)', opacity: 0.4, borderRadius: '50%' }} />}
                            </div>
                        </div>

                        <Button
                            variant="flat"
                            onPress={() => fetchDashboardData(true)}
                            isLoading={refreshing}
                            style={{ height: '3.25rem', borderRadius: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em', padding: '0 1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                            startContent={!refreshing && <RefreshCw size={16} />}
                        >
                            Sync Fleet
                        </Button>
                    </div>
                }
            />

            {/* Core Metrics Tactical Grid */}
            <div className="admin-grid-stats">
                <StatCard label="Nodal Assets" value={stats.totalDevices} icon={Server} color="primary" subtext="Deployed infrastructure" loading={loading} />
                <StatCard label="Link Status" value={stats.onlineDevices} icon={Wifi} color="success" subtext={stats.totalDevices > 0 ? `${Math.round((stats.onlineDevices / stats.totalDevices) * 100)}% reachability` : '0% reachability'} loading={loading} />
                <StatCard label="Lost Packets" value={stats.offlineDevices} icon={WifiOff} color="danger" subtext="Requires diagnostic" loading={loading} />
                <StatCard label="Security Principals" value={stats.totalUsers} icon={Users} color="indigo" subtext="Authorized identities" loading={loading} />
            </div>

            {/* Intelligence and Vitality Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Visualizer Expansion */}
                <Card className="admin-card lg:col-span-8">
                    <CardHeader className="admin-card-header px-8 py-6">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <TrendingUp className="text-primary" size={20} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Nodal Expansion</h3>
                                <p className="text-tactical" style={{ margin: 0, opacity: 0.4, fontSize: '10px' }}>Historical registration velocity (14D Window)</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <div className="status-dot animate-pulse-soft" style={{ background: 'var(--primary)', width: '6px', height: '6px' }} />
                             <span className="text-tactical" style={{ fontSize: '9px', fontStyle: 'italic', opacity: 0.4 }}>ANALYTICS_V4</span>
                        </div>
                    </CardHeader>
                    <CardBody className="px-8 pb-8 pt-0">
                        {analytics && Array.isArray(analytics.device_growth) ? (
                            <div style={{ height: '360px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.device_growth.slice(-14)}>
                                        <defs>
                                            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => (v && typeof v === 'string' ? v.split('-').slice(2).join('/') : v)} />
                                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                        <RechartsTooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(2, 6, 23, 0.9)', 
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(255,255,255,0.05)', 
                                                borderRadius: '1rem',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                                            }} 
                                            itemStyle={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}
                                            labelStyle={{ fontSize: '10px', opacity: 0.4, marginBottom: '8px' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fill="url(#growthGradient)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: '360px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <RefreshCw className="text-muted animate-spin" size={32} style={{ opacity: 0.1 }} />
                                    <p className="text-tactical" style={{ marginTop: '1.25rem', opacity: 0.3, letterSpacing: '0.2em' }}>Syncing intelligence pool...</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* System Vitality Sidebar Enhanced */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <Card className="admin-card">
                        <CardBody className="flex flex-col gap-6 p-8">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <Zap className="text-warning" size={20} />
                                 <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Kernel Vitality</h4>
                            </div>
                            
                            {/* Health Metrics Pattern */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <HealthMetric label="Network Integrity" value="OPTIMAL" status="good" icon={Wifi} />
                                <HealthMetric label="Principal Latency" value="12ms" status="good" icon={Activity} />
                                <HealthMetric label="Asset Allocation" value="38 / 1k" status="good" icon={Server} />
                                <HealthMetric label="Security Fence" value="ACTIVE" status="good" icon={Shield} />
                            </div>

                            <Divider style={{ opacity: 0.05 }} />
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { label: 'Cluster Bandwidth', value: 34, color: 'primary' },
                                    { label: 'Intelligence Depth', value: 68, color: 'indigo' }
                                ].map((v, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div className="flex-between">
                                            <span className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '10px' }}>{v.label}</span>
                                            <span className="text-tactical" style={{ color: `var(--${v.color})`, fontSize: '9px', fontWeight: 900 }}>{v.value}%</span>
                                        </div>
                                        <Progress size="sm" color={v.color} value={v.value} radius="full" style={{ height: '4px' }} />
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    <Button
                        as={Link}
                        to="/broadcast"
                        style={{ height: '5.5rem', borderRadius: '1.75rem', background: 'var(--primary)', color: 'white', fontWeight: 900, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)' }}
                        className="btn-elite"
                    >
                        <div className="flex-between" style={{ width: '100%', padding: '0 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Send size={22} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                    <span className="text-tactical" style={{ color: 'white', fontSize: '12px', letterSpacing: '0.1em' }}>GLOBAL DISPATCH</span>
                                    <span style={{ fontSize: '9px', opacity: 0.7, fontStyle: 'italic' }}>Deploy administrative signal</span>
                                </div>
                            </div>
                            <ChevronRight size={20} />
                        </div>
                    </Button>
                </div>
            </div>

            {/* Audit & Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Audit Registry Chronology */}
                <Card className="admin-card lg:col-span-8">
                    <CardHeader className="admin-card-header flex-between py-6 px-8">
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Clock className="text-muted" size={20} style={{ opacity: 0.4 }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Audit Chronology</h3>
                                <p className="text-tactical" style={{ margin: 0, opacity: 0.4, fontSize: '10px' }}>Recent administrative mutations</p>
                            </div>
                        </div>
                        <Button as={Link} to="/activity" size="sm" variant="flat" style={{ fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>Analyze Vault</Button>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {activities.length === 0 ? (
                                <div style={{ padding: '8rem', textAlign: 'center', opacity: 0.2 }} className="text-tactical">Awaiting nodal stimulus...</div>
                            ) : (
                                activities.map((log, i) => (
                                    <div key={log.id || i} style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="hover:bg-white/[0.01] transition-colors">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                             <div className="flex-center" style={{ width: '2.75rem', height: '2.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <MousePointer2 size={16} style={{ opacity: 0.4 }} />
                                             </div>
                                             <div>
                                                 <p className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '11px', fontWeight: 800 }}>{(log.action || 'system_pulse').replace(/_/g, ' ').toUpperCase()}</p>
                                                 <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, fontStyle: 'italic' }}>VECTOR_NODE: {String(log.id || '').slice(-8).toUpperCase() || 'PULSE'}</p>
                                             </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.3, fontFamily: 'monospace' }}>
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                            </span>
                                            <ChevronRight size={14} style={{ opacity: 0.2 }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Tactical Shortcuts Matrix */}
                <Card className="admin-card lg:col-span-4">
                     <CardHeader className="admin-card-header">
                         <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Tactical Access</h4>
                     </CardHeader>
                     <CardBody className="flex flex-col gap-3 px-8 pb-8">
                        {[
                            { label: 'Hardware Registry', to: '/devices', icon: Server, color: 'primary', info: 'Fleet Ops' },
                            { label: 'Identity Hub', to: '/users', icon: Users, color: 'indigo', info: 'Principals' },
                            { label: 'Access Protocol', to: '/security-rules', icon: Shield, color: 'danger', info: 'Security' },
                            { label: 'Signal Nodes', to: '/webhooks', icon: Zap, color: 'success', info: 'API' }
                        ].map((s, i) => (
                            <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                                <div className="status-pill hover:bg-white/[0.04] transition-all" style={{ padding: '1.25rem', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div className="flex-center" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: `rgba(255,255,255,0.03)`, color: `var(--${s.color})` }}>
                                            <s.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '11px', fontWeight: 800 }}>{s.label}</p>
                                            <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3 }}>{s.info}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-muted" style={{ opacity: 0.2 }} />
                                </div>
                            </Link>
                        ))}
                     </CardBody>
                </Card>
            </div>
        </PageShell>
    );
}
