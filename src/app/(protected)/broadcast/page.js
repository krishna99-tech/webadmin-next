'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/UI/Card';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { useToast } from '@/context/ToastContext';
import adminService from '@/services/adminService';
import { Mail, Send, Users, CheckCircle, AlertCircle, Clock, Tag } from 'lucide-react';

/* ===============================
   BROADCAST PAGE CONTENT
================================ */
function BroadcastPageContent() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState('');
    const [sendToAll, setSendToAll] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);

    // Pre-fill from query params
    useEffect(() => {
        const prefillEmails = searchParams.get('recipients');
        if (prefillEmails) {
            setRecipients(prefillEmails);
            setSendToAll(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const logs = await adminService.getActivity();
            const broadcasts = logs.filter(log => log.action === 'broadcast_email').slice(0, 10);
            setHistory(broadcasts);
        } catch (error) {
            console.error('Failed to fetch broadcast history', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!subject.trim() || !message.trim()) {
            toast.warning('Subject and message are required');
            return;
        }

        if (!sendToAll && !recipients.trim()) {
            toast.warning('Enter recipient emails or select Send to All');
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const recipientList = sendToAll ? null : recipients.split(',').map(e => e.trim()).filter(Boolean);
            const result = await adminService.sendBroadcast(subject, message, recipientList);

            toast.success(result.message || 'Broadcast sent successfully');
            setStatus({ type: 'success', message: result.message || 'Message dispatched' });

            setSubject('');
            setMessage('');
            setRecipients('');
            fetchHistory();
        } catch (error) {
            const errMsg = error.response?.data?.detail || 'Failed to dispatch broadcast';
            toast.error(errMsg);
            setStatus({ type: 'error', message: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="broadcast-page animate-fadeInUp">
            {/* Main Form Section */}
            <div className="broadcast-column">
                <Card noPadding className="broadcast-form-card">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">New Notification</h3>
                                <p className="text-xs text-dim">Compose and send messages to platform users</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="broadcast-form">
                        {status && (
                            <div className={`status-message status-${status.type}`}>
                                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{status.message}</span>
                            </div>
                        )}

                        <div className="msg-form-group">
                            <label className="msg-form-label"><Tag size={14} /> Subject</label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter a descriptive subject"
                                disabled={loading}
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <div className="msg-form-group">
                            <label className="msg-form-label"><Send size={14} /> Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                className="msg-textarea"
                                disabled={loading}
                            />
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="sendToAll"
                                    checked={sendToAll}
                                    onChange={(e) => setSendToAll(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <label htmlFor="sendToAll" className="text-sm font-medium cursor-pointer">
                                    Broadcast to all active users
                                </label>
                            </div>
                            <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                                <Users size={12} />
                                GLOBAL MODE
                            </div>
                        </div>

                        {!sendToAll && (
                            <div className="msg-form-group animate-slideDown">
                                <label className="msg-form-label"><Users size={14} /> Direct Recipients</label>
                                <Input
                                    value={recipients}
                                    onChange={(e) => setRecipients(e.target.value)}
                                    placeholder="user1@example.com, user2@example.com"
                                    disabled={loading}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="btn-broadcast-premium h-12"
                        >
                            <Send size={18} className="mr-2" />
                            {loading ? 'Dispatching...' : 'Dispatch Message'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* History Section */}
            <div className="broadcast-sidebar space-y-6">
                <Card>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={16} className="text-purple-400" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Dispatch History</h3>
                    </div>

                    <div className="broadcast-timeline">
                        {history.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-xs text-dim italic">No recent dispatches</p>
                            </div>
                        ) : (
                            history.map((log, index) => (
                                <div key={log.id || index} className="timeline-item">
                                    <div className="timeline-content">
                                        <p className="timeline-subject">{log.subject}</p>
                                        <div className="timeline-meta">
                                            <span className="timeline-recipient">
                                                <Users size={10} /> {log.recipient || 'Global'}
                                            </span>
                                            <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 text-center">
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                        Notifications use secure SMTP tunnels. <br />
                        Daily quota: ✨ Unlimited (Admin)
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ===============================
   MAIN BROADCAST PAGE
================================ */
export default function BroadcastPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-dim animate-pulse">Initializing Messaging Hub...</div>}>
            <div className="dashboard-header mb-8">
                <h2 className="dashboard-title text-3xl font-bold tracking-tight">Messaging Hub</h2>
                <p className="dashboard-subtitle">Engage your platform users with high-fidelity notifications</p>
            </div>
            <BroadcastPageContent />
        </Suspense>
    );
}
