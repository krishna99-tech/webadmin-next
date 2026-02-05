"use client";

import React, { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import useWebSocket from '@/hooks/useWebSocket';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Smartphone,
    Activity,
    Send,
    Wifi
} from 'lucide-react';

export default function UserDetail({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [telemetryData, setTelemetryData] = useState([]);

    // Initialize WebSocket connection
    const { messages, status } = useWebSocket();

    // Handle incoming telemetry via WebSocket
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.type === 'telemetry' && user?.devices?.some(d => d.id === lastMessage.device_id)) {
                setTelemetryData(prev => {
                    const newData = [...prev, {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        value: lastMessage.data?.value || 0,
                        key: lastMessage.data?.key || 'unknown'
                    }].slice(-20); // Keep last 20 points
                    return newData;
                });
            }
        }
    }, [messages, user]);

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            try {
                const data = await adminService.getUserDetail(id);
                setUser(data);
            } catch (err) {
                console.error('Error loading user details', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    /* ===============================
       LOADING / ERROR
    ============================== */
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Loading user details…
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-10 text-center text-red-400">
                User not found.
            </div>
        );
    }

    return (
        <div className="user-detail-page animate-fadeInUp">
            {/* ===============================
          HEADER
      ============================== */}
            <div className="user-detail-header">
                <button
                    onClick={() => router.back()}
                    className="user-back-btn"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="user-header-info">
                    <h1 className="user-title">
                        <User size={20} className="text-blue-400" />
                        {user.username}
                    </h1>
                    <p className="user-subtitle">
                        {user.email || 'No email address'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'CONNECTED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        <Wifi size={12} className={status === 'CONNECTED' ? 'animate-pulse' : ''} />
                        Live: {status}
                    </div>
                    {user.email && (
                        <Button
                            className="user-email-btn"
                            onClick={() =>
                                router.push(
                                    `/activity?recipients=${encodeURIComponent(user.email)}`
                                )
                            }
                        >
                            <Send size={16} />
                            Send Email
                        </Button>
                    )}
                </div>
            </div>

            {/* ===============================
          STATS
      ============================== */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <Smartphone size={18} />
                    <div>
                        <span>Devices</span>
                        <strong>{user.device_count || 0}</strong>
                    </div>
                </div>

                <div className="user-stat-card">
                    <Calendar size={18} />
                    <div>
                        <span>Member Since</span>
                        <strong>
                            {user.created_at
                                ? new Date(user.created_at).toLocaleDateString()
                                : '—'}
                        </strong>
                    </div>
                </div>

                <div className="user-stat-card">
                    <Activity size={18} />
                    <div>
                        <span>Last Login</span>
                        <strong>
                            {user.last_login
                                ? new Date(user.last_login).toLocaleDateString()
                                : 'Never'}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ===============================
                    DEVICES & LIVE MONITORING
                ============================== */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="section-title">Device Fleet</h3>
                        {!user.devices?.length ? (
                            <p className="empty-text">No devices registered.</p>
                        ) : (
                            <div className="device-list">
                                {user.devices.map(device => (
                                    <div key={device.id} className="device-row">
                                        <div>
                                            <p className="device-name">{device.name}</p>
                                            <p className="device-id">{device.id}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`device-status ${device.status}`}>
                                                {device.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="section-title mb-0">Live Telemetry</h3>
                            <span className="text-[10px] text-dim font-mono">Real-time sampling active</span>
                        </div>

                        <div className="h-[250px] w-full">
                            {telemetryData.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-dim border border-dashed border-divider/5 rounded-lg">
                                    <Activity size={32} className="mb-2 opacity-20" />
                                    <p className="text-sm">Waiting for incoming data...</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={telemetryData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="time"
                                            stroke="rgba(255,255,255,0.3)"
                                            fontSize={10}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.3)"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                            itemStyle={{ color: '#60a5fa' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#60a5fa"
                                            strokeWidth={2}
                                            dot={false}
                                            animationDuration={300}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>
                </div>

                {/* ===============================
                    RECENT ACTIONS
                ============================== */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <h3 className="section-title">Interaction History</h3>
                        {!user.recent_activity?.length ? (
                            <p className="empty-text">No recent activity.</p>
                        ) : (
                            <div className="activity-list">
                                {user.recent_activity.map(log => (
                                    <div key={log.id} className="activity-row">
                                        <div className="activity-icon">
                                            <Mail size={12} />
                                        </div>
                                        <div>
                                            <p className="activity-title">{log.action}</p>
                                            <p className="activity-sub">{log.subject}</p>
                                            <p className="activity-time">
                                                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
