'use client';

import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import Card from '@/components/UI/Card';
import deviceService from '@/services/deviceService';
import adminService from '@/services/adminService';
import {
    Server,
    Activity,
    Wifi,
    Plus,
    Mail,
    Users
} from 'lucide-react';

/* ===============================
   STAT CARD
================================ */
const StatCard = ({ title, value, icon: Icon, accent = 'blue' }) => {
    return (
        <Card className="stat-card">
            <div className={`stat-icon stat-${accent}`}>
                <Icon size={28} />
            </div>

            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <span className="stat-value">{value}</span>
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
        activeAlerts: 0
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            if (!currentUser) return; // Wait for auth

            try {
                let devicesPromise;
                if (currentUser.is_admin) {
                    devicesPromise = adminService.getAllDevices();
                } else {
                    devicesPromise = deviceService.getDevices();
                }

                const [devices, activityLogs] = await Promise.all([
                    devicesPromise,
                    adminService.getActivity()
                ]);

                const online = devices.filter(d => d.status === 'online').length;

                setStats({
                    totalDevices: devices.length,
                    onlineDevices: online,
                    activeAlerts: 0
                });

                setActivities((activityLogs || []).slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [currentUser]);

    return (
        <div className="dashboard-page animate-fadeInUp">
            {/* Header */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">Dashboard Overview</h2>
                <p className="dashboard-subtitle">
                    Real-time status of devices and system health
                </p>
            </div>

            {/* KPI GRID */}
            <div className="dashboard-kpi-grid">
                <StatCard
                    title="Total Devices"
                    value={loading ? '—' : stats.totalDevices}
                    icon={Server}
                    accent="blue"
                />

                <StatCard
                    title="Online Systems"
                    value={loading ? '—' : stats.onlineDevices}
                    icon={Wifi}
                    accent="green"
                />

                <StatCard
                    title="Active Alerts"
                    value={loading ? '—' : stats.activeAlerts}
                    icon={Activity}
                    accent="red"
                />
            </div>

            {/* LOWER GRID */}
            <div className="dashboard-lower-grid">
                {/* Quick Actions */}
                <Card>
                    <h3 className="card-title mb-4">Quick Actions</h3>

                    <div className="quick-actions-grid">
                        <Link href="/users" className="quick-action">
                            <Users size={20} className="text-blue-400" />
                            <span>Manage Users</span>
                        </Link>

                        <Link href="/activity" className="quick-action">
                            <Mail size={20} className="text-green-400" />
                            <span>Broadcast</span>
                        </Link>

                        <Link href="/devices" className="quick-action">
                            <Server size={20} className="text-purple-400" />
                            <span>Devices</span>
                        </Link>

                        <div className="quick-action disabled">
                            <Plus size={20} />
                            <span>More Soon</span>
                        </div>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <h3 className="card-title mb-4">Recent Activity</h3>

                    <div className="activity-list">
                        {activities.length === 0 ? (
                            <p className="activity-empty">No recent activity.</p>
                        ) : (
                            activities.map(log => (
                                <div key={log.id} className="activity-item">
                                    <div className="activity-icon">
                                        <Activity size={12} />
                                    </div>

                                    <div className="activity-content">
                                        <p className="activity-text">{log.action}</p>
                                        <p className="activity-meta">
                                            {new Date(log.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {' • '}
                                            {log.recipient || 'System'}
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
