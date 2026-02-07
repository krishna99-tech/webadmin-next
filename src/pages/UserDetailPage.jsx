import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Button, 
    Chip, 
    Divider,
    Avatar,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Kbd,
    Breadcrumbs,
    BreadcrumbItem
} from '@heroui/react';
import adminService from '../services/adminService';
import useWebSocket from '../hooks/useWebSocket';
import Modals from '../components/Modals';
import { useToast } from '../context/ToastContext';
import { useIoT } from '../context/IoTContext';
import { AuthContext } from '../context/AuthContext';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    ArrowLeft,
    User,
    Calendar,
    Smartphone,
    Activity,
    Send,
    Wifi,
    Shield,
    Clock,
    Zap,
    Terminal,
    History,
    RefreshCw,
    Edit3,
    Search
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-dim)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
                <p className="text-tactical" style={{ marginBottom: '1rem', opacity: 0.5, fontSize: '8px' }}>{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>{entry.name}:</span>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 900, fontFamily: 'monospace' }}>{entry.value?.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { updateUser } = useIoT();
    const { currentUser } = useContext(AuthContext);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [telemetryData, setTelemetryData] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);

    const { messages, status } = useWebSocket();
    const apiLive = status === 'CONNECTED';
    const profileName = currentUser?.full_name || currentUser?.username || 'System Administrator';
    const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';
    const profileRole = currentUser?.role || (isAdmin ? 'Administrator' : 'Operator');
    const avatarFallback = (currentUser?.username || profileName || 'A').trim().charAt(0).toUpperCase();

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.type === 'telemetry' && user?.devices?.some(d => d.id === lastMessage.device_id)) {
                setTelemetryData(prev => {
                    const newData = [...prev, {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        value: lastMessage.data?.value || 0,
                        key: lastMessage.data?.key || 'unknown'
                    }].slice(-20);
                    return newData;
                });
            }
        }
    }, [messages, user]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const data = await adminService.getUserDetail(id);
            setUser(data);
        } catch (err) {
            console.error('Error loading user details', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchUser();
    }, [id]);

    const handleEditConfirm = async (formData) => {
        try {
            await updateUser(id, formData);
            toast.success('Identity Authority Updated');
            fetchUser(); // Refresh data
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Update failed');
            throw err;
        }
    };

    if (loading && !user) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1.5rem' }}>
                <User className="text-primary animate-pulse" size={64} style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))' }} />
                <p className="text-tactical" style={{ fontSize: '10px', letterSpacing: '0.4em' }}>Synthesizing Identity Segment...</p>
            </div>
        );
    }

    if (!user) return <div className="text-center animate-pulse" style={{ padding: '5rem', color: 'var(--danger)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Principal Identity Missing</div>;

    return (
        <PageShell>
            {/* Command Bar */}
            <div className="elite-card" style={{ background: 'rgba(2, 6, 23, 0.65)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="elite-card-body grid grid-cols-[1fr_minmax(260px,420px)_1fr] items-center gap-6 px-6 py-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Breadcrumbs variant="light" underline="hover">
                            <BreadcrumbItem>
                                <span className="text-tactical" style={{ fontSize: '10px', opacity: 0.45, letterSpacing: '0.15em', fontWeight: 900 }}>ADMIN</span>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)', fontStyle: 'italic' }}>OVERVIEW</span>
                            </BreadcrumbItem>
                        </Breadcrumbs>
                        <Chip
                            variant="flat"
                            style={{ 
                                fontWeight: 900, 
                                fontSize: '9px', 
                                padding: '0 0.75rem',
                                letterSpacing: '0.12em', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: apiLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: apiLive ? 'var(--success)' : 'var(--danger)'
                            }}
                        >
                            {apiLive ? 'API LIVE' : 'API DOWN'}
                        </Chip>
                    </div>

                    <Input
                        style={{ fontSize: '12px', fontWeight: 600 }}
                        classNames={{
                            inputWrapper: "h-11 border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] focus-within:border-blue-500/40 focus-within:bg-blue-500/[0.05] rounded-xl flex transition-all duration-300 group-data-[focus=true]:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                        }}
                        placeholder="Quick Search..."
                        size="sm"
                        startContent={<Search size={16} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />}
                        endContent={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden-mobile">
                                <Kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px', minWidth: '20px', display: 'flex', borderRadius: '6px' }}>Ctrl</Kbd>
                                <Kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px', minWidth: '20px', display: 'flex', borderRadius: '6px' }}>K</Kbd>
                            </div>
                        }
                        type="search"
                    />

                    <div className="flex items-center justify-end gap-4">
                        <div className="hidden-mobile flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                            <div style={{ position: 'relative' }}>
                                <div style={{ background: apiLive ? 'var(--success)' : 'var(--danger)', width: '6px', height: '6px', borderRadius: '50%', boxShadow: `0 0 12px ${apiLive ? 'var(--success)' : 'var(--danger)'}` }} />
                                <div style={{ position: 'absolute', inset: -4, border: `1px solid ${apiLive ? 'var(--success)' : 'var(--danger)'}`, borderRadius: '50%', opacity: 0.2 }} className="animate-pulse" />
                            </div>
                            <span className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.06em' }}>{apiLive ? 'API LIVE' : 'API DOWN'}</span>
                        </div>

                        <Divider orientation="vertical" style={{ height: '1.75rem', opacity: 0.08 }} className="hidden-mobile" />

                        <div className="flex items-center gap-3.5 py-1.5 pl-3 pr-2 rounded-2xl border border-white/[0.05]">
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }} className="hidden-mobile">
                                <p style={{ fontSize: '12px', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.01em' }}>{profileName}</p>
                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.35, fontWeight: 800 }}>{profileRole}</p>
                            </div>
                            <Avatar
                                name={avatarFallback}
                                src={currentUser?.id ? `https://i.pravatar.cc/150?u=${currentUser?.id}` : undefined}
                                style={{ height: '2.25rem', width: '2.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <PageHeader
                icon={User}
                title={user.full_name || user.username}
                subtitle={
                    <span className="inline-flex items-center gap-4 flex-wrap">
                        <span style={{ fontSize: '0.925rem', color: 'var(--text-dim)', fontWeight: 600, fontStyle: 'italic', opacity: 0.8 }}>{user.email || 'NO_VECTOR_IDENTIFIED'}</span>
                        <span style={{ width: '1px', height: '0.875rem', background: 'var(--border-dim)' }} />
                        <span className="text-tactical" style={{ fontSize: '10px', opacity: 0.4 }}>SEC_NODE: {user.id?.slice(-8).toUpperCase()}</span>
                    </span>
                }
                badge={
                    <Chip 
                        variant="flat" 
                        style={{ 
                            fontWeight: 900, 
                            fontSize: '10px', 
                            padding: '0 0.75rem',
                            letterSpacing: '0.12em', 
                            border: 'none',
                            background: user.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: user.is_active ? 'var(--success)' : 'var(--danger)'
                        }}
                    >
                        {user.is_active ? 'PRINCIPAL_ACTIVE' : 'ACCESS_REVOKED'}
                    </Chip>
                }
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            isIconOnly 
                            variant="light" 
                            onPress={() => navigate(-1)}
                            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)', borderRadius: '1rem', height: '3.5rem', width: '3.5rem', minWidth: '3.5rem' }}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <Button 
                            color="primary" 
                            variant="flat" 
                            as={Link}
                            to={`/broadcast?recipients=${encodeURIComponent(user.email)}`}
                            startContent={<Send size={20} />}
                            style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '11px', height: '3.25rem', padding: '0 1.75rem', borderRadius: '1rem', boxShadow: '0 12px 24px rgba(59, 130, 246, 0.2)' }}
                        >
                            Dispatch Message
                        </Button>
                        <Button 
                            variant="flat" 
                            onPress={() => setShowEditModal(true)}
                            startContent={<Edit3 size={18} />}
                            style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', border: '1px solid var(--border-dim)', height: '3.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)' }}
                        >
                            Modify Access
                        </Button>
                    </div>
                }
            />

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Asset Fleet', value: user.device_count || 0, icon: Smartphone, color: 'var(--primary)', trend: 'Deployed' },
                    { label: 'Join Phase', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'TBD', icon: Calendar, color: 'rgb(139, 92, 246)', trend: 'Registered' },
                    { label: 'Last Activity', value: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'NEVER', icon: Activity, color: 'var(--success)', trend: 'Presence' },
                    { label: 'Signal Link', value: status, icon: Wifi, color: status === 'CONNECTED' ? 'var(--success)' : 'var(--danger)', trend: 'Sync_State' }
                ].map((stat, idx) => (
                    <div key={idx} className="elite-card overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        {/* Subtle Glow */}
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', background: stat.color, filter: 'blur(40px)', opacity: 0.08, pointerEvents: 'none' }} />
                        
                        <div className="elite-card-body flex items-center gap-5 p-6 relative z-10">
                            <div style={{ 
                                width: '3.25rem', 
                                height: '3.25rem', 
                                borderRadius: '1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: stat.color,
                                boxShadow: `0 8px 16px ${stat.color}15`
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, marginBottom: '4px' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, fontStyle: 'italic', color: 'var(--text-main)' }}>{stat.value}</h3>
                                <p className="text-tactical" style={{ fontSize: '7px', opacity: 0.2, marginTop: '2px' }}>{stat.trend}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                {/* Linked Hardware */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                         <div className="elite-card-header" style={{ padding: '1.25rem 2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Smartphone className="text-primary" size={20} />
                                <h4 className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '0.2em' }}>Managed Hardware Fleet</h4>
                            </div>
                            <Button variant="light" size="sm" style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5 }}>Expand Registry</Button>
                        </div>
                        <div className="elite-card-body" style={{ padding: 0 }}>
                            <Table 
                                aria-label="User Devices" 
                                removeWrapper 
                                classNames={{
                                    base: "elite-table-container",
                                    table: "min-w-full",
                                    thead: "bg-white/[0.01] border-b border-white/[0.03]",
                                    th: "bg-transparent py-5 px-8 text-tactical text-[9px] text-dim font-black opacity-50",
                                    tbody: "divide-y divide-white/[0.02]",
                                    tr: "elite-table-row",
                                    td: "py-5 px-8"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>ASSET_PROTOCOL</TableColumn>
                                    <TableColumn>NODAL_ID</TableColumn>
                                    <TableColumn>STATE</TableColumn>
                                    <TableColumn align="end">CONTROL_INTERFACE</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent={<div className="text-tactical" style={{ padding: '6rem', opacity: 0.2 }}>Zero assets linked to this security principal.</div>}>
                                    {(user.devices || []).map((device) => (
                                        <TableRow key={device.id}>
                                            <TableCell>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Zap size={16} />
                                                    </div>
                                                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.01em' }}>{device.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '-0.2px', opacity: 0.6 }}>{device.id}</span></TableCell>
                                            <TableCell>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="status-dot" style={{ background: device.status === 'online' ? 'var(--success)' : 'var(--danger)', width: '6px', height: '6px' }} />
                                                    <span className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, color: device.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>{device.status?.toUpperCase()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="flat" style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', height: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)' }} onPress={() => navigate(`/device/${device.id}`)}>Enter Nodal Hub</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Telemetry Visualizer */}
                    <div className="elite-card">
                        <div className="elite-card-body" style={{ padding: '2.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Activity className="text-primary" size={20} />
                                    <h4 className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '0.2em' }}>Signal Pulse Amplitude</h4>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div className="status-dot animate-pulse-soft" style={{ background: 'var(--primary)', width: '8px', height: '8px', boxShadow: '0 0 10px var(--primary)' }} />
                                        <span className="text-tactical" style={{ fontSize: '9px', fontStyle: 'italic', opacity: 0.5 }}>Live_Stream_v4.2</span>
                                    </div>
                                    <Divider orientation="vertical" style={{ height: '1.25rem', opacity: 0.1 }} />
                                    <Button isIconOnly variant="flat" size="sm" style={{ height: '2.25rem', width: '2.25rem', background: 'rgba(255,255,255,0.03)' }}><RefreshCw size={14}/></Button>
                                </div>
                            </div>

                            <div style={{ height: '340px', width: '100%' }}>
                                {telemetryData.length === 0 ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-dim)', borderRadius: '2rem', opacity: 0.15 }}>
                                        <Zap size={48} style={{ marginBottom: '1.5rem' }} />
                                        <p className="text-tactical" style={{ fontSize: '10px', letterSpacing: '0.3em' }}>Awaiting valid nodal frequency...</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={telemetryData}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                                            <ChartTooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" animationDuration={1000} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Registry Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="elite-card" style={{ height: '100%', background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className="elite-card-body" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                                <History className="text-muted" size={20} style={{ opacity: 0.4 }} />
                                <h4 className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '0.2em' }}>Audit Chronology</h4>
                            </div>

                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '1.25rem', width: '1px', background: 'var(--border-dim)', opacity: 0.15 }} />
                                
                                {user.recent_activity?.length ? user.recent_activity.map((log, idx) => (
                                    <div key={idx} style={{ position: 'relative', display: 'flex', gap: '2rem', zIndex: 1 }} className="hover-lift">
                                        <div style={{ 
                                            width: '2.5rem', 
                                            height: '2.5rem', 
                                            borderRadius: '0.875rem', 
                                            background: '#020617', 
                                            border: '1px solid var(--border-dim)', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                        }} className="timeline-icon">
                                            <Zap size={14} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div className="flex-between">
                                                <h5 className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-main)' }}>{log.action || 'INTERACTION'}</h5>
                                                <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, fontFamily: 'monospace' }}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>{log.subject || 'Pulse without detailed payload identified.'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', opacity: 0.3 }}>
                                                <Clock size={10} />
                                                <span className="text-tactical" style={{ fontSize: '8px' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '6rem 0', textAlign: 'center', opacity: 0.1 }}>
                                        <Terminal size={48} style={{ marginBottom: '1.5rem' }} />
                                        <p className="text-tactical" style={{ fontSize: '10px', letterSpacing: '0.2em' }}>Zero interaction history detected</p>
                                    </div>
                                )}
                            </div>

                            <Button variant="flat" style={{ width: '100%', marginTop: '3.5rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-dim)', border: '1px solid var(--border-dim)', height: '3.5rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>Full Sequence Log</Button>
                        </div>
                    </div>

                    <div className="elite-card" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)', borderStyle: 'dashed' }}>
                        <div className="elite-card-body" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1.25rem', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.1)' }}>
                                <Shield size={26} />
                            </div>
                            <div>
                                <h4 className="text-tactical" style={{ fontSize: '10px', color: 'var(--text-main)', letterSpacing: '0.1em' }}>Access Perimeter</h4>
                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4, marginTop: '4px', fontStyle: 'italic' }}>Hierarchy: ADMINISTRATOR_RESERVED</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modals
                showDeviceModal={false}
                showUserModal={showEditModal}
                showBroadcastModal={false}
                onClose={() => setShowEditModal(false)}
                onConfirm={handleEditConfirm}
                selectedDevice={null}
                selectedUser={user}
            />
        </PageShell>
    );
}
