'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import adminService from '@/services/adminService';
import { Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Activity() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActivityContent />
        </Suspense>
    );
}

function ActivityContent() {
    const [activities, setActivities] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const searchParams = useSearchParams();
    const recipientsParam = searchParams.get('recipients');
    const recipients = recipientsParam ? recipientsParam.split(',') : [];

    // Load activity logs
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await adminService.getActivity();
                setActivities(data);
            } catch (err) {
                console.error("Failed to load activity", err);
            }
        };
        fetchActivity();
    }, [sending]); // Refresh log after sending

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        setSending(true);
        setFeedback(null);

        try {
            const result = await adminService.sendBroadcast(subject, message, recipients.length > 0 ? recipients : null);
            setFeedback({ type: 'success', msg: result.message });
            setSubject('');
            setMessage('');
        } catch (err) {
            setFeedback({ type: 'error', msg: 'Failed to send broadcast.' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeInUp">
            {/* Compose Broadcast Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500" style={{ backgroundImage: 'linear-gradient(to right, #4ade80, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Broadcast Center
                </h2>
                <Card>
                    <div className="flex items-center gap-3 mb-6 text-gray-300">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-white">Send Announcement</h3>
                            <p className="text-xs text-gray-500">
                                {recipients.length > 0
                                    ? `Sending to ${recipients.length} selected recipients.`
                                    : 'Email all registered users instantly.'}
                            </p>
                            {recipients.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {recipients.slice(0, 3).map(email => (
                                        <span key={email} className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                                            {email}
                                        </span>
                                    ))}
                                    {recipients.length > 3 && (
                                        <span className="text-[10px] text-gray-500">+{recipients.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {feedback && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {feedback.msg}
                        </div>
                    )}

                    <form onSubmit={handleSendBroadcast}>
                        <Input
                            label="Subject Line"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. System Maintenance Update"
                            required
                        />

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Message Body</label>
                            <textarea
                                className="input-field min-h-[150px] resize-y font-sans"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                required
                            />
                        </div>

                        <Button type="submit" loading={sending} className="w-full gap-2 justify-center">
                            <Send size={18} />
                            Send Broadcast
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Activity Log Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500" style={{ backgroundImage: 'linear-gradient(to right, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Recent Activity
                </h2>
                <Card className="h-[500px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No recent activity logs.</p>
                        ) : (
                            activities.map((log) => (
                                <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-mono text-gray-500">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                            {log.action}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-200">{log.subject}</p>
                                    <p className="text-xs text-gray-400 mt-1 truncate">
                                        To: {log.recipient}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
