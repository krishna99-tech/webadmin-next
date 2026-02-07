import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, 
    CardBody, 
    Button, 
    Tabs, 
    Tab, 
    Chip, 
    Divider,
    Progress,
    Avatar,
} from '@heroui/react';
import adminService from '../services/adminService';
import {
    Smartphone, 
    Plus, 
    Trash2, 
    Edit2, 
    Activity, 
    Layout,
    Settings, 
    Globe, 
    Shield, 
    Zap, 
    Clock, 
    RefreshCw, 
    ArrowLeft, 
    Terminal,
    Cpu,
    Database,
    Signal,
    MoreHorizontal
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

export default function DeviceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [device, setDevice] = useState(null);
    const [dashboards, setDashboards] = useState([]);
    const [activeDashboard, setActiveDashboard] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        loadAllData();
    }, [id]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const deviceData = await adminService.getDeviceDetail(id);
            setDevice(deviceData);

            const dashboardsData = await adminService.getDashboards(id);
            setDashboards(dashboardsData);

            const telemetryData = await adminService.getDeviceTelemetry(id);
            setTelemetry(telemetryData);

            if (dashboardsData && dashboardsData.length > 0) {
                const firstDashboard = dashboardsData[0];
                setActiveDashboard(firstDashboard);
                const widgetsData = await adminService.getWidgets(firstDashboard.id);
                setWidgets(widgetsData);
            }
        } catch (err) {
            console.error('Error loading device details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshTelemetry = async () => {
        try {
            const data = await adminService.getDeviceTelemetry(id);
            setTelemetry(data);
        } catch (err) {
            console.error('Refresh failed', err);
        }
    };

    if (loading && !device) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Cpu className="text-primary animate-pulse" size={64} style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }} />
                <p className="text-tactical" style={{ fontSize: '10px', letterSpacing: '0.3em' }}>Syncing with Node Assets...</p>
            </div>
        );
    }

    if (!device) return <div className="text-center animate-pulse" style={{ padding: '4rem', color: 'var(--danger)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Device Node Not Accessible</div>;

    return (
        <PageShell gap="2rem" paddingBottom="5rem">
            <PageHeader
                icon={Smartphone}
                title={device.name}
                subtitle={
                    <span className="inline-flex items-center gap-3 flex-wrap">
                        <code style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-dim)', background: 'rgba(255, 255, 255, 0.03)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-dim)' }}>ID: {device.id}</code>
                        <span style={{ width: '1px', height: '0.75rem', background: 'var(--border-dim)' }} />
                        <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.5 }}>Provisioned Node</span>
                    </span>
                }
                badge={
                    <Chip 
                        variant="flat" 
                        style={{ 
                            fontWeight: 800, 
                            fontSize: '9px', 
                            letterSpacing: '0.1em', 
                            border: 'none',
                            background: device.status === 'online' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: device.status === 'online' ? 'var(--success)' : 'var(--danger)'
                        }}
                        startContent={<div className="status-dot" style={{ background: device.status === 'online' ? 'var(--success)' : 'var(--danger)', width: '6px', height: '6px', margin: '0 4px' }} />}
                    >
                        {device.status?.toUpperCase()}
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
                        <Button variant="flat" style={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', height: '3rem' }} startContent={<Edit2 size={16}/>}>Modify Node</Button>
                        <Button color="danger" variant="flat" style={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', height: '3rem' }} startContent={<Trash2 size={16}/>}>Decommission</Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <Tabs 
                        aria-label="Device details" 
                        variant="underlined"
                        classNames={{
                            tabList: "gap-8 border-b border-divider/5",
                            cursor: "bg-blue-500 w-full",
                            tab: "max-w-fit px-0 h-12 font-black uppercase tracking-widest text-[10px]",
                            tabContent: "group-data-[selected=true]:text-blue-500"
                        }}
                    >
                        <Tab
                            key="interface"
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layout size={14}/>
                                    <span>Signal Interface</span>
                                </div>
                            }
                        >
                            <div style={{ marginTop: '2rem' }}>
                                <div className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                                    <div className="elite-card-body" style={{ padding: '2.5rem' }}>
                                        <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
                                            <div>
                                                <h4 className="text-tactical" style={{ color: 'var(--text-main)', fontSize: '12px' }}>Dynamic UI Matrix</h4>
                                                <p className="text-dim" style={{ fontSize: '11px', marginTop: '0.5rem', fontStyle: 'italic', fontWeight: 500 }}>Managed structural widgets for this individual asset</p>
                                            </div>
                                            <Button color="primary" variant="flat" style={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} startContent={<Plus size={14}/>}>Deploy Widget</Button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                            {widgets.map((w, idx) => (
                                                <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1.25rem', border: '1px solid var(--border-dim)', transition: 'all 0.3s ease' }} className="hover-lift group">
                                                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                                        <div style={{ 
                                                            width: '3rem', 
                                                            height: '3rem', 
                                                            borderRadius: '0.75rem', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                                            background: w.type === 'led' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                            color: w.type === 'led' ? '#a855f7' : 'var(--primary)'
                                                        }}>
                                                            {w.type === 'led' ? <Zap size={20} /> : <Activity size={20} />}
                                                        </div>
                                                        <Button isIconOnly variant="light" size="sm" style={{ opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100"><MoreHorizontal size={16}/></Button>
                                                    </div>
                                                    <h5 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{w.label || w.type}</h5>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        <Chip size="sm" variant="flat" style={{ height: '1.25rem', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255, 255, 255, 0.03)', border: 'none' }}>{w.type}</Chip>
                                                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-dim)', opacity: 0.5 }}>PIN_{w.config?.virtual_pin?.toUpperCase()}</span>
                                                    </div>
                                                    <Divider style={{ margin: '1rem 0', opacity: 0.05 }} />
                                                    <div className="flex-between">
                                                        <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.4 }}>Current Amplitude</span>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{w.value ?? 'INERT'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {widgets.length === 0 && (
                                                <div style={{ gridColumn: 'span 2', padding: '5rem 0', textAlign: 'center', border: '1px dashed var(--border-dim)', borderRadius: '2rem', opacity: 0.2 }}>
                                                    <Layout size={40} style={{ margin: '0 auto 1rem' }} />
                                                    <p className="text-tactical" style={{ fontSize: '10px' }}>Zero Functional Widgets Detected</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key="telemetry"
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Signal size={14}/>
                                    <span>Signal Telemetry</span>
                                </div>
                            }
                        >
                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="elite-card" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                                    <h4 className="text-tactical" style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '11px' }}>Live Telemetry Snapshot</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                                        {telemetry?.data ? Object.entries(telemetry.data).map(([key, val]) => (
                                            <div key={key} style={{ textAlign: 'center' }}>
                                                <p className="text-tactical" style={{ fontSize: '8px', marginBottom: '0.5rem', opacity: 0.4 }}>{key}</p>
                                                <p style={{ fontSize: '2rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.04em', color: 'var(--primary)', margin: 0 }}>{typeof val === 'number' ? val.toFixed(1) : val}</p>
                                                <Progress value={75} size="sm" color="primary" style={{ marginTop: '1rem', height: '3px' }} />
                                            </div>
                                        )) : (
                                            <div style={{ gridColumn: 'span 4', padding: '5rem 0', textAlign: 'center', opacity: 0.1 }}>
                                                <Signal size={40} style={{ margin: '0 auto 1rem' }} />
                                                <p className="text-tactical" style={{ fontSize: '10px' }}>Waiting for incoming signal pulse...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="elite-card" style={{ background: 'rgba(2, 6, 23, 0.6)' }}>
                                    <div className="elite-card-body" style={{ padding: '2rem' }}>
                                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Terminal size={18} style={{ opacity: 0.4 }} />
                                                <h4 className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>Asynchronous Logic Log</h4>
                                            </div>
                                            <Button isIconOnly variant="flat" size="sm" style={{ height: '2rem', width: '2rem', background: 'rgba(255, 255, 255, 0.03)' }} onPress={handleRefreshTelemetry}><RefreshCw size={14}/></Button>
                                        </div>
                                        <div style={{ 
                                            background: 'rgba(0, 0, 0, 0.4)', 
                                            borderRadius: '1.25rem', 
                                            padding: '1.5rem', 
                                            fontFamily: 'monospace', 
                                            fontSize: '11px', 
                                            color: '#60a5fa', 
                                            height: '300px', 
                                            overflowY: 'auto', 
                                            border: '1px solid rgba(255, 255, 255, 0.03)',
                                            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)'
                                        }}>
                                            <p style={{ opacity: 0.4 }}>[{new Date().toLocaleTimeString()}] TRACE: Initializing telemetry hook...</p>
                                            <p style={{ color: 'var(--success)' }}>[{new Date().toLocaleTimeString()}] SUCCESS: Authenticated node 0x{id.slice(-6)}</p>
                                            {telemetry ? (
                                                <pre style={{ color: '#a78bfa', marginTop: '1rem', whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(telemetry, null, 2)}</pre>
                                            ) : (
                                                <p style={{ fontStyle: 'italic', opacity: 0.3, marginTop: '1rem' }}>// Standby for nodal pulse data stream...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key="system"
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Database size={14}/>
                                    <span>Nodal Schema</span>
                                </div>
                            }
                        >
                            <div style={{ marginTop: '2rem' }}>
                                <div className="elite-card" style={{ padding: '2.5rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                                    <h4 className="text-tactical" style={{ marginBottom: '2.5rem', fontSize: '12px' }}>Hardware Topology</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            <div className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, fontStyle: 'italic' }}>Protocol Version</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 900 }}>v5.2.4-STABLE</span>
                                            </div>
                                            <div className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, fontStyle: 'italic' }}>Encryption Layer</span>
                                                <Chip size="sm" variant="flat" style={{ fontSize: '8px', fontWeight: 900, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: 'none' }}>AES_256_GCM</Chip>
                                            </div>
                                            <div className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4, fontStyle: 'italic' }}>Signal Cluster</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>EU_NORTH_08</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1.5rem', border: '1px solid var(--border-dim)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Shield size={16} style={{ color: 'var(--primary)' }} />
                                                <span className="text-tactical" style={{ fontSize: '10px' }}>Identity Perimeter</span>
                                            </div>
                                            <Divider style={{ opacity: 0.05 }} />
                                            <div>
                                                <p className="text-tactical" style={{ fontSize: '7px', opacity: 0.4, marginBottom: '0.75rem' }}>Private Secure Token</p>
                                                <div style={{ background: '#020617', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="group">
                                                    <span style={{ fontFamily: 'monospace', fontSize: '10px', opacity: 0.3, letterSpacing: '0.2rem' }}>●●●●●●●●●●●●●●●●●●●</span>
                                                    <Button isIconOnly variant="light" size="sm" style={{ height: '1.5rem', width: '1.5rem' }}><Settings size={12}/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                        <Button variant="flat" style={{ fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }} startContent={<RefreshCw size={14}/>}>Rotate Credentials</Button>
                                        <Button color="primary" style={{ fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', height: '2.5rem' }} startContent={<RefreshCw size={14}/>}>Force Provisioning</Button>
                                    </div>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="elite-card" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                        <h4 className="text-tactical" style={{ marginBottom: '2.5rem', fontSize: '12px' }}>Administrative Context</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4, marginBottom: '1rem', fontStyle: 'italic' }}>Nodal Principal</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1.5rem', border: '1px solid var(--border-dim)', cursor: 'pointer', transition: 'all 0.3s ease' }} className="hover-lift">
                                    <Avatar 
                                        src={`https://i.pravatar.cc/150?u=${device.user_id}`} 
                                        style={{ height: '3rem', width: '3rem', border: '1px solid var(--border-dim)' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 900, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.owner_name || 'Anonymous Principal'}</p>
                                        <p style={{ fontSize: '9px', fontFamily: 'monospace', opacity: 0.3, letterSpacing: '-0.2px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.owner_email || 'HIDDEN_VECTOR'}</p>
                                    </div>
                                </div>
                            </div>

                            <Divider style={{ opacity: 0.05 }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="flex-between">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                            <Globe size={16} />
                                        </div>
                                        <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>Global Reach</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>99.8%</span>
                                </div>

                                <div className="flex-between">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                                            <Shield size={16} />
                                        </div>
                                        <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>Integrity Shift</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--success)' }}>+12%</span>
                                </div>

                                <div className="flex-between">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                                            <Clock size={16} />
                                        </div>
                                        <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>Pulse Latency</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>44ms</span>
                                </div>
                            </div>

                            <Divider style={{ opacity: 0.05 }} />

                            <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.04)', borderRadius: '1.5rem', border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.5, fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
                                    This asset is currently part of the global monitoring cluster. All interactions are securely logged in the administrative audit vault.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="elite-card group" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0) 50%, rgba(59, 130, 246, 0.1) 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-1rem', top: '-1rem', opacity: 0.05, transition: 'transform 0.7s ease' }} className="group-hover:scale-110">
                            <Cpu size={120} />
                        </div>
                        <h4 className="text-tactical" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>Provisioning State</h4>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.4 }}>Vector Capacity</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>84%</span>
                            </div>
                            <Progress value={84} size="md" color="primary" style={{ height: '4px' }} />
                            <p className="text-dim" style={{ fontSize: '9px', marginTop: '1.5rem', fontStyle: 'italic', fontWeight: 500 }}>Synchronizing assets with neural cloud infrastructure...</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
