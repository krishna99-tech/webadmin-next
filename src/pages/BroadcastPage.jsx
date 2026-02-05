import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import {
    Card as HeroCard,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Link,
    Image
} from '@heroui/react';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Textarea from '../components/UI/Textarea';
import { useToast } from '../context/ToastContext';
import adminService from '../services/adminService';
import {
    Mail,
    Send,
    Users,
    CheckCircle,
    AlertCircle,
    Clock,
    Tag
} from 'lucide-react';

export default function BroadcastPage() {
    const [searchParams] = useSearchParams();
    const toast = useToast();

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState('');
    const [sendToAll, setSendToAll] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);

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
            const broadcasts = logs
                .filter(log => log.action === 'broadcast_email')
                .slice(0, 10);
            setHistory(broadcasts);
        } catch (err) {
            console.error('Failed to fetch broadcast history', err);
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
            const recipientList = sendToAll
                ? null
                : recipients.split(',').map(e => e.trim()).filter(Boolean);

            const result = await adminService.sendBroadcast(
                subject,
                message,
                recipientList
            );

            toast.success(result.message || 'Broadcast sent successfully');
            setStatus({
                type: 'success',
                message: result.message || 'Message dispatched'
            });

            setSubject('');
            setMessage('');
            setRecipients('');
            fetchHistory();
        } catch (error) {
            const errMsg =
                error.response?.data?.detail ||
                'Failed to dispatch broadcast';

            toast.error(errMsg);
            setStatus({ type: 'error', message: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="broadcast-page animate-fadeInUp">
            <div className="max-w-[1650px] mx-auto">

                {/* HEADER */}
                <div className="dashboard-header mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Messaging Hub
                    </h2>
                    <p className="text-foreground/80">
                        Engage your platform users with high-fidelity notifications
                    </p>
                </div>

                {/* MAIN GRID – MORE GAP */}
                <div className="grid gap-14 items-start grid-cols-1 xl:grid-cols-[2.2fr_1.4fr]">

                    {/* LEFT CONTAINER */}
                    <div className="w-full order-1">
                        <Card
                            noPadding
                            className="
                                w-full min-h-[700px]
                                border border-divider
                                bg-content1
                                shadow-lg
                            "
                        >
                            {/* HEADER */}
                            <div className="p-8 border-b border-divider flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/15 text-primary">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        New Notification
                                    </h3>
                                    <p className="text-xs text-foreground/80">
                                        Compose and send messages to platform users
                                    </p>
                                </div>
                            </div>

                            {/* FORM */}
                            <form
                                onSubmit={handleSend}
                                className="p-10 space-y-8"
                            >
                                {status && (
                                    <div className={`status-message status-${status.type}`}>
                                        {status.type === 'success'
                                            ? <CheckCircle size={18} />
                                            : <AlertCircle size={18} />}
                                        <span>{status.message}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="msg-form-label flex items-center gap-2">
                                        <Tag size={14} /> Subject
                                    </label>
                                    <Input
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        disabled={loading}
                                        placeholder="Enter a descriptive subject"
                                        className="h-12 bg-content2 border-divider text-foreground"
                                    />
                                </div>

                                <div>
                                    <label className="msg-form-label flex items-center gap-2">
                                        <Send size={14} /> Message Content
                                    </label>
                                    <Textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        isDisabled={loading}
                                        minRows={10}
                                        classNames={{
                                            inputWrapper: 'min-h-[300px]',
                                            input: 'min-h-[300px] text-base'
                                        }}
                                    />
                                </div>

                                <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 flex justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={sendToAll}
                                            onChange={e => setSendToAll(e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-foreground">
                                            Broadcast to all active users
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-primary font-mono flex items-center gap-1">
                                        <Users size={12} /> GLOBAL MODE
                                    </span>
                                </div>

                                {!sendToAll && (
                                    <Input
                                        value={recipients}
                                        onChange={e => setRecipients(e.target.value)}
                                        placeholder="user1@example.com, user2@example.com"
                                        className="h-12 bg-content2 border-divider text-foreground"
                                    />
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 text-base"
                                >
                                    <Send size={18} className="mr-2" />
                                    {loading ? 'Dispatching...' : 'Dispatch Message'}
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* RIGHT CONTAINER */}
                    <div className="w-full space-y-6 order-2">
                        <Card className="border border-divider bg-content1 shadow-lg">
                            <div className="flex items-center gap-2 mb-6">
                                <Clock size={16} className="text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                    Dispatch History
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {history.map((log, index) => (
                                    <HeroCard
                                        key={index}
                                        className="w-full border border-divider bg-content2"
                                    >
                                        <CardHeader className="flex gap-3">
                                            <Image
                                                alt="email"
                                                width={40}
                                                height={40}
                                                radius="sm"
                                                src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                                            />
                                            <div>
                                                <p className="text-md text-foreground">
                                                    {log.subject || 'Broadcast Email'}
                                                </p>
                                                <p className="text-small text-foreground/80">
                                                    {log.recipient || 'Global Audience'}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                            <p className="text-sm text-foreground/80">
                                                {log.message}
                                            </p>
                                        </CardBody>
                                        <Divider />
                                        <CardFooter className="flex justify-between">
                                            <span className="text-xs text-foreground/80">
                                                {new Date(log.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <Link isExternal showAnchorIcon>
                                                Open
                                            </Link>
                                        </CardFooter>
                                    </HeroCard>
                                ))}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
