import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Button, 
    Input, 
    Textarea, 
    Checkbox, 
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Chip,
    Avatar,
    Tooltip
} from '@heroui/react';
import { useToast } from '../context/ToastContext';
import adminService from '../services/adminService';
import {
    Send,
    History,
    MessageSquare,
    Zap,
    ChevronRight,
    ZapOff,
    Inbox,
    Star,
    Archive,
    Trash2,
    Search,
    Filter,
    Clock,
    User,
    Shield,
    AlertCircle,
    Bell,
    CheckCircle2,
    RefreshCw,
    X,
    MoreHorizontal
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

export default function BroadcastPage() {
    const [searchParams] = useSearchParams();
    const toast = useToast();

    // Mail Folders Management
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Dispatch History (acting as Inbox)
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Selection & Compose
    const [selectedDispatch, setSelectedDispatch] = useState(null);
    const [showCompose, setShowCompose] = useState(false);
    
    // Compose Form State
    const [composeData, setComposeData] = useState({
        subject: '',
        message: '',
        recipients: '',
        sendToAll: true
    });

    useEffect(() => {
        const prefillEmails = searchParams.get('recipients');
        if (prefillEmails) {
            setComposeData(prev => ({ ...prev, recipients: prefillEmails, sendToAll: false }));
            setShowCompose(true);
        }
    }, [searchParams]);

    const fetchHistory = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const logs = await adminService.getActivity();
            const broadcasts = (logs || [])
                .filter(log => log.action === 'broadcast_email')
                .map(log => ({
                    id: log.id,
                    subject: log.details?.subject || log.subject || 'Administrative Signal',
                    body: log.details?.message || log.message || 'Transmission content not cached.',
                    timestamp: log.timestamp,
                    recipients: log.details?.recipients || 'Global Node Hive',
                    sender: 'SYSTEM_ADMIN',
                    priority: 'HIGH',
                    starred: false
                }));
            setDispatches(broadcasts);
        } catch (err) {
            console.error('History Sync Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredDispatches = useMemo(() => {
        let list = [...dispatches];
        if (activeFolder === 'starred') list = list.filter(d => d.starred);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(d => 
                d.subject.toLowerCase().includes(q) || 
                d.body.toLowerCase().includes(q)
            );
        }
        return list;
    }, [dispatches, activeFolder, searchQuery]);

    const handleDispatch = async () => {
        const { subject, message, recipients, sendToAll } = composeData;
        if (!subject.trim() || !message.trim()) {
            toast.warning('Subject and payload required');
            return;
        }
        if (!sendToAll && !recipients.trim()) {
            toast.warning('Define target principals');
            return;
        }

        setLoading(true);
        try {
            const recipientList = sendToAll
                ? null
                : recipients.split(',').map(e => e.trim()).filter(Boolean);

            await adminService.sendBroadcast(subject, message, recipientList);

            toast.success('Signal broadcasted successfully');
            setComposeData({ subject: '', message: '', recipients: '', sendToAll: true });
            setShowCompose(false);
            fetchHistory(true);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Transmission failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell>
            <PageHeader
                icon={MessageSquare}
                title="Communications Hub"
                subtitle="Deploy high-priority administrative signals across the global edge network."
                actions={
                    <div className="status-pill" style={{ padding: '0.625rem 1.25rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <Zap size={14} className="text-primary animate-pulse-soft" />
                        <span className="text-tactical" style={{ color: 'var(--primary)', fontSize: '9px', fontWeight: 900 }}>TRANSMISSION_IDLE</span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                {/* Tactical Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Button 
                        color="primary" 
                        onPress={() => setShowCompose(true)}
                        startContent={<Send size={18} />}
                        style={{ height: '3.75rem', borderRadius: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.15em', boxShadow: '0 15px 35px rgba(59, 130, 246, 0.25)' }}
                    >
                        NEW DISPATCH
                    </Button>

                    <nav className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '0.75rem' }}>
                        {[
                            { label: 'Signal Logs', icon: Inbox, key: 'inbox', count: dispatches.length },
                            { label: 'Priority Star', icon: Star, key: 'starred', count: dispatches.filter(d => d.starred).length },
                            { label: 'Archived Trace', icon: Archive, key: 'archive', count: 0 },
                            { label: 'Purged Content', icon: Trash2, key: 'trash', count: 0 },
                        ].map(item => (
                            <button
                                key={item.key}
                                onClick={() => setActiveFolder(item.key)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '1rem',
                                    border: 'none',
                                    background: activeFolder === item.key ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: activeFolder === item.key ? 'var(--primary)' : 'var(--text-dim)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                className="nav-item-hover"
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon size={18} strokeWidth={activeFolder === item.key ? 2.5 : 2} />
                                    <span className="text-tactical" style={{ fontSize: '12px', fontWeight: activeFolder === item.key ? 800 : 500 }}>{item.label}</span>
                                </div>
                                {item.count > 0 && (
                                    <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4 }}>{item.count}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.5rem' }}>
                         <h4 className="text-tactical mb-4 opacity-30 text-[9px]">SYSTEM_STATUS</h4>
                         <div className="flex flex-col gap-4">
                             <div className="flex justify-between items-center">
                                 <span className="text-tactical" style={{ fontSize: '10px' }}>Dispatch Node</span>
                                 <div className="flex items-center gap-1.5">
                                     <span className="text-tactical" style={{ fontSize: '9px', color: 'var(--success)' }}>ONLINE</span>
                                     <div className="status-dot status-dot-on" style={{ width: '4px', height: '4px' }} />
                                 </div>
                             </div>
                             <div className="flex-between">
                                 <span className="text-tactical" style={{ fontSize: '10px' }}>Encryption</span>
                                 <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>AES_256_GCM</span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Dispatch Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Interaction Bar */}
                    <div className="elite-card bg-white/[0.01] px-5 py-3">
                        <div className="flex-between">
                            <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                <input 
                                    type="text" 
                                    placeholder="Search signal telemetry..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        height: '2.75rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid rgba(255,255,255,0.04)', 
                                        borderRadius: '0.875rem', 
                                        padding: '0 1rem 0 3rem',
                                        color: 'white',
                                        fontSize: '12px',
                                        outline: 'none'
                                    }} 
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <Button isIconOnly variant="flat" onPress={() => fetchHistory(true)} isLoading={refreshing} style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.03)' }}>
                                    <RefreshCw size={16} />
                                </Button>
                                <Divider orientation="vertical" style={{ height: '1.5rem', opacity: 0.1 }} />
                                <Button isIconOnly variant="flat" style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.03)' }}>
                                    <MoreHorizontal size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Feed List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {loading && !dispatches.length ? (
                            <div style={{ padding: '8rem', textAlign: 'center' }}>
                                <RefreshCw className="animate-spin text-primary" size={32} style={{ opacity: 0.5 }} />
                            </div>
                        ) : filteredDispatches.length === 0 ? (
                            <div className="elite-card" style={{ padding: '8rem', textAlign: 'center', opacity: 0.2 }}>
                                <ZapOff size={40} style={{ marginBottom: '1.5rem' }} />
                                <p className="text-tactical" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>NO_DISPATCH_SIGNALS_FOUND</p>
                            </div>
                        ) : (
                            filteredDispatches.map((signal) => (
                                <div 
                                    key={signal.id} 
                                    className="elite-card elite-card-interactive" 
                                    onClick={() => setSelectedDispatch(signal)}
                                    style={{ 
                                        background: 'rgba(255, 255, 255, 0.01)', 
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="elite-card-body flex items-center gap-8 px-8 py-6">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div style={{ position: 'relative' }}>
                                                <Avatar 
                                                    icon={<Shield size={18} />}
                                                    classNames={{ base: "bg-blue-500/10 text-blue-500", icon: "stroke-[2.5px]" }}
                                                    style={{ width: '3.25rem', height: '3.25rem', borderRadius: '1rem' }}
                                                />
                                                <div className="status-dot status-dot-on" style={{ position: 'absolute', bottom: -2, right: -2, border: '2px solid #020617' }} />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                                                    <h4 style={{ fontSize: '0.925rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', fontStyle: 'italic' }}>{signal.subject}</h4>
                                                    <Chip size="sm" variant="flat" classNames={{ base: "bg-danger/10 text-danger border-none", content: "text-[8px] font-black uppercase tracking-wider" }}>CRITICAL_L3</Chip>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.6 }}>{signal.body}</p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                            <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.3, letterSpacing: '0.05em' }}>
                                                {new Date(signal.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-tactical" style={{ fontSize: '10px', fontWeight: 900, marginTop: '2px' }}>
                                                {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Compose Dispatch Modal */}
            <Modal 
                isOpen={showCompose} 
                onClose={() => setShowCompose(false)} 
                size="2xl" 
                backdrop="blur"
                classNames={{
                    base: "bg-slate-950/90 border border-white/[0.05] backdrop-blur-2xl shadow-2xl rounded-3xl",
                    header: "border-b border-white/[0.03]",
                    footer: "border-t border-white/[0.03]",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                     <div style={{ padding: '0.75rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                        <Send size={22} strokeWidth={2.5} />
                                     </div>
                                     <div>
                                         <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.01em' }}>Construct Dispatch</h3>
                                         <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, marginTop: '2px' }}>Administrative Signal Authoring Tool</p>
                                     </div>
                                </div>
                            </ModalHeader>
                            <ModalBody style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <Input 
                                    label="SIGNAL_SUBJECT"
                                    placeholder="Enter priority header..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={composeData.subject}
                                    onValueChange={(val) => setComposeData(v => ({ ...v, subject: val }))}
                                    classNames={{
                                        label: "text-tactical text-[9px] opacity-40 mb-3 tracking-[0.2em] font-black",
                                        inputWrapper: "h-14 border-white/[0.08] bg-white/[0.02] rounded-1.25rem hover:border-blue-500/20 transition-all",
                                        input: "text-base font-medium"
                                    }}
                                />

                                <Textarea 
                                    label="PAYLOAD_CONTENT"
                                    placeholder="Formal administrative announcement / Emergency broadcast instructions..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    minRows={8}
                                    value={composeData.message}
                                    onValueChange={(val) => setComposeData(v => ({ ...v, message: val }))}
                                    classNames={{
                                        label: "text-tactical text-[9px] opacity-40 mb-3 tracking-[0.2em] font-black",
                                        inputWrapper: "border-white/[0.08] bg-white/[0.02] rounded-1.5rem p-5 hover:border-blue-500/20 transition-all",
                                        input: "text-base font-medium leading-[1.6]"
                                    }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                         <Checkbox 
                                            isSelected={composeData.sendToAll} 
                                            onValueChange={(val) => setComposeData(v => ({ ...v, sendToAll: val }))}
                                            classNames={{ wrapper: "before:border-white/20" }}
                                         />
                                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                                             <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>GLOBAL_BROADCAST</span>
                                             <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.3 }}>Target entire nodal hive</span>
                                         </div>
                                    </div>
                                    
                                    {!composeData.sendToAll && (
                                        <Input 
                                            placeholder="Comma separated emails..."
                                            variant="bordered"
                                            value={composeData.recipients}
                                            onValueChange={(val) => setComposeData(v => ({ ...v, recipients: val }))}
                                            classNames={{
                                                inputWrapper: "h-[62px] border-white/[0.08] bg-white/[0.02] rounded-1.25rem"
                                            }}
                                        />
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter style={{ padding: '2rem', gap: '1rem' }}>
                                <Button variant="flat" onPress={onClose} style={{ height: '3.5rem', borderRadius: '1rem', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>ABORT_DISPATCH</Button>
                                <Button 
                                    color="primary" 
                                    onPress={handleDispatch} 
                                    isLoading={loading}
                                    style={{ height: '3.5rem', flex: 1, borderRadius: '1rem', fontWeight: 950, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.2em', boxShadow: '0 15px 30px rgba(59, 130, 246, 0.2)' }}
                                    endContent={<Send size={18} />}
                                >
                                    EXECUTE_BROADCAST
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Read Dispatch Modal */}
            {selectedDispatch && (
                <Modal 
                    isOpen={!!selectedDispatch} 
                    onClose={() => setSelectedDispatch(null)} 
                    size="3xl" 
                    backdrop="blur"
                    classNames={{
                        base: "bg-slate-950/90 border border-white/[0.05] backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden",
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <div style={{ height: '8px', background: 'var(--primary)', opacity: 0.8 }} />
                                <ModalHeader style={{ padding: '3rem 3.5rem 2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                                        <div className="flex-between">
                                             <Chip size="sm" variant="dot" color="primary" classNames={{ base: "bg-primary/10 border-none", content: "text-[9px] font-black uppercase tracking-[0.15em] text-primary" }}>TRANSMISSION_STATED</Chip>
                                             <div style={{ display: 'flex', gap: '1rem' }}>
                                                 <Tooltip content="Add to Starred"><Button isIconOnly variant="flat" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px' }}><Star size={16} /></Button></Tooltip>
                                                 <Tooltip content="Close Signal"><Button isIconOnly variant="flat" onPress={onClose} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px' }}><X size={16} /></Button></Tooltip>
                                             </div>
                                        </div>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 950, margin: 0, letterSpacing: '-0.02em', fontStyle: 'italic', color: 'var(--text-main)' }}>{selectedDispatch.subject}</h2>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <Avatar icon={<Shield size={16} />} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px' }} className="bg-primary/20 text-primary" />
                                            <div>
                                                <p style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>AUTHOR_PRINCIPAL</p>
                                                <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>SENT_TO: {selectedDispatch.recipients}</p>
                                            </div>
                                            <Divider orientation="vertical" style={{ height: '1.5rem', margin: '0 0.75rem', opacity: 0.1 }} />
                                            <div className="flex-center" style={{ gap: '0.75rem' }}>
                                                <Clock size={12} style={{ opacity: 0.3 }} />
                                                <span className="text-tactical" style={{ fontSize: '10px', opacity: 0.6 }}>{new Date(selectedDispatch.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </ModalHeader>
                                <ModalBody style={{ padding: '2rem 3.5rem 4rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '1.5rem', padding: '2.5rem' }}>
                                        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-main)', opacity: 0.8, whiteSpace: 'pre-wrap', margin: 0 }}>{selectedDispatch.body}</p>
                                    </div>
                                    <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05))' }} />
                                        <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3 }}>END_OF_PAYLOAD</p>
                                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.05))' }} />
                                    </div>
                                </ModalBody>
                                <ModalFooter style={{ padding: '2rem 3.5rem', display: 'flex', gap: '1rem', background: 'white/[0.01]' }}>
                                     <Button variant="flat" style={{ flex: 1, height: '3.5rem', borderRadius: '1rem', fontWeight: 800 }}>TRACE_VECTOR</Button>
                                     <Button color="primary" onPress={onClose} style={{ flex: 1, height: '3.5rem', borderRadius: '1rem', fontWeight: 900 }}>CLOSE_PROTOCOL</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </PageShell>
    );
}
