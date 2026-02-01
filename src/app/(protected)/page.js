'use client';

import React, { useEffect, useState, useCallback, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket from '@/hooks/useWebSocket';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import SkeletonCard from '@/components/UI/SkeletonCard';
import deviceService from '@/services/deviceService';
import adminService from '@/services/adminService';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Server,
    Activity,
    Wifi,
    Plus,
    Mail,
    Users,
    Shield,
    TrendingUp,
    Clock,
    WifiOff,
    RefreshCw
} from 'lucide-react';

/* ===============================
   STAT CARD
================================ */
const StatCard = ({ title, value, icon: Icon, accent = 'blue', subtext, loading }) => {
    return (
        <Card className={`stat-card card-hover-glow group ${loading ? 'loading' : ''}`}>
            <div className={`stat-icon stat-${accent} !bg-${accent}-500/5 !border-${accent}-500/10 shadow-inner group-hover:neon-border transition-all`}>
                <Icon size={28} className="icon-glow" />
            </div>

            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <span className="stat-value">{loading ? '—' : value}</span>
                {subtext && <span className="text-[10px] text-dim mt-1">{subtext}</span>}
            </div>

            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={48} />
            </div>
        </Card>
    );
};

/* ===============================
   DASHBOARD PAGE
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
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const { isConnected: wsConnected } = useWebSocket();
    const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (!currentUser) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [devices, activityLogs, analyticsData] = await Promise.all([
                isAdmin ? adminService.getAllDevices() : deviceService.getDevices(),
                adminService.getActivity().catch(() => []),
                isAdmin ? adminService.getAnalytics() : null
            ]);

            const online = devices.filter(d => d.status === 'online').length;

            setStats({
                totalDevices: devices.length,
                onlineDevices: online,
                offlineDevices: devices.length - online,
                totalUsers: analyticsData?.current_stats?.total_users || 0
            });

            setActivities((activityLogs || []).slice(0, 8));
            setAnalytics(analyticsData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser, isAdmin]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchDashboardData(true), 60000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchDashboardData]);

    return (
        <div className="dashboard-page animate-fadeIn">
            {/* Header */}
            <div className="section-header flex-wrap gap-4 mb-8">
                <div>
                    <h2 className="dashboard-title mb-1">System Overview</h2>
                    <p className="dashboard-subtitle">
                        Real-time analytics and platform health metrics
                        {lastUpdated && (
                            <span className="text-dim text-xs ml-2">
                                · Updated {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>
                <div className="action-bar !mb-0 flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="btn-press"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </Button>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all btn-press ${autoRefresh ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-dim border-white/10 hover:border-white/20'}`}
                        >
                            {autoRefresh ? 'Auto 1m ✓' : 'Auto-refresh'}
                        </button>
                    )}
                    {isAdmin && (
                        <div className="flex gap-2 items-center flex-wrap">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse border border-white" />
                                API
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                                v1.2.4
                            </span>
                            {wsConnected && (
                                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Live
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* KPI GRID */}
            <div className="dashboard-kpi-grid stagger-list">
                <StatCard
                    title="Total Fleet"
                    value={stats.totalDevices}
                    icon={Server}
                    accent="blue"
                    subtext="Instruments registered"
                    loading={loading}
                />

                <StatCard
                    title="Active Now"
                    value={stats.onlineDevices}
                    icon={Wifi}
                    accent="green"
                    subtext={stats.totalDevices > 0 ? `${Math.round((stats.onlineDevices / stats.totalDevices) * 100)}% online` : '—'}
                    loading={loading}
                />

                <StatCard
                    title="Offline"
                    value={stats.offlineDevices}
                    icon={WifiOff}
                    accent="red"
                    subtext="Requiring attention"
                    loading={loading}
                />

                {isAdmin && (
                    <StatCard
                        title="User Base"
                        value={stats.totalUsers}
                        icon={Users}
                        accent="purple"
                        subtext="Registrations"
                        loading={loading}
                    />
                )}
            </div>

            {/* CHARTS ROW */}
            {isAdmin && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card className="!bg-black/40 !backdrop-blur-xl border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="card-title text-sm flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-400" />
                                Device Registration Trend
                            </h3>
                        </div>
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.device_growth.slice(-14)}>
                                    <defs>
                                        <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6B7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#3b82f6' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorDevices)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="!bg-black/40 !backdrop-blur-xl border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="card-title text-sm flex items-center gap-2">
                                <Users size={16} className="text-purple-400" />
                                User Growth Stream
                            </h3>
                        </div>
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.user_growth.slice(-14)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6B7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#c084fc' }}
                                    />
                                    <Line
                                        type="stepAfter"
                                        dataKey="count"
                                        stroke="#c084fc"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#c084fc', strokeWidth: 2, stroke: '#111' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* System Health (Admin) */}
            {isAdmin && (
                <Card className="mb-8 border-white/5 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                    <h3 className="card-title mb-4 flex items-center gap-2">
                        <Shield size={16} className="text-blue-400" />
                        System Health
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="admin-health-item p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-dim">API Gateway</span>
                            <span className="block text-lg font-bold text-green-400 mt-1">Operational</span>
                        </div>
                        <div className="admin-health-item p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-dim">WebSocket</span>
                            <span className={`block text-lg font-bold mt-1 ${wsConnected ? 'text-green-400' : 'text-amber-400'}`}>
                                {wsConnected ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                        <div className="admin-health-item p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-dim">Uptime</span>
                            <span className="block text-lg font-bold text-white mt-1">
                                {stats.totalDevices > 0
                                    ? `${Math.round((stats.onlineDevices / stats.totalDevices) * 100)}%`
                                    : '—'}
                            </span>
                        </div>
                        <div className="admin-health-item p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-dim">Alerts</span>
                            <span className="block text-lg font-bold text-white mt-1">
                                {stats.offlineDevices > 0 ? stats.offlineDevices : 'None'}
                            </span>
                        </div>
                    </div>
                </Card>
            )}

            {/* LOWER GRID */}
            <div className="dashboard-lower-grid">
                {/* Quick Actions */}
                <Card className="border-white/5 card-hover-glow">
                    <h3 className="card-title mb-6 flex items-center gap-2">
                        <Plus size={16} className="text-dim" />
                        Quick Command Hub
                    </h3>

                    <div className="quick-actions-grid !grid-cols-1 sm:!grid-cols-2">
                        <Link href="/users" className="quick-action group">
                            <Users size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="font-bold">Identity Center</p>
                                <p className="text-[10px] text-dim">Manage account permissions</p>
                            </div>
                        </Link>

                        <Link href="/broadcast" className="quick-action group">
                            <Mail size={20} className="text-green-400 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="font-bold">Dispatch Hub</p>
                                <p className="text-[10px] text-dim">Global blast & messaging</p>
                            </div>
                        </Link>

                        <Link href="/devices" className="quick-action group">
                            <Server size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="font-bold">Fleet Manager</p>
                                <p className="text-[10px] text-dim">Device lifecycle & logs</p>
                            </div>
                        </Link>

                        <Link href="/settings" className="quick-action group">
                            <Shield size={20} className="text-red-400 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="font-bold">Security & Sys</p>
                                <p className="text-[10px] text-dim">System level configs</p>
                            </div>
                        </Link>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="border-white/5 card-hover-glow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="card-title flex items-center gap-2">
                            <Activity size={16} className="text-green-400" />
                            Live System Event Log
                        </h3>
                        <Link href="/activity" className="text-[10px] text-blue-400 hover:underline uppercase tracking-widest font-bold">View Audit Trail</Link>
                    </div>

                    <div className="activity-list space-y-4 stagger-list">
                        {activities.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="activity-empty text-dim italic">Awaiting platform events...</p>
                            </div>
                        ) : (
                            activities.map((log, i) => (
                                <div key={log.id || i} className="activity-item !bg-white/5 !border-white/5 hover:!bg-white/10 transition-colors rounded-xl p-3 border border-transparent">
                                    <div className="activity-icon">
                                        <Clock size={12} className="text-blue-400" />
                                    </div>

                                    <div className="activity-content">
                                        <div className="flex justify-between items-start">
                                            <p className="activity-text font-bold text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                                            <span className="text-[9px] text-gray-500 font-mono">
                                                {new Date(log.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="activity-meta text-dim italic">
                                            Recipient: {log.recipient || 'Platform Kernel'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
