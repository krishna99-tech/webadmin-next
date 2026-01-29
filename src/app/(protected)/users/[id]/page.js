'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Smartphone,
    Activity,
    Send
} from 'lucide-react';

export default function UserDetail({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

            {/* ===============================
          DEVICES
      ============================== */}
            <Card>
                <h3 className="section-title">Devices</h3>

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
                                <span className={`device-status ${device.status}`}>
                                    {device.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* ===============================
          ACTIVITY
      ============================== */}
            <Card>
                <h3 className="section-title">Recent Activity</h3>

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
                                        {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
