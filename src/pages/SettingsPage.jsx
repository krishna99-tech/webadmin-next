import React, { useState, useContext } from 'react';
import {
    Button, 
    Input, 
    Tabs, 
    Tab, 
    Switch, 
    Divider,
    Tooltip,
} from '@heroui/react';
import {
    Settings as SettingsIcon,
    Shield,
    Database,
    Save,
    Palette,
    Key,
    Activity,
    Trash2,
    RefreshCw,
    Zap,
    Globe,
    Lock,
    Cpu,
    ExternalLink,
    Terminal,
    Bell,
    Smartphone,
    UserCircle,
    HardDrive,
    Info,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useWebSocket from '../hooks/useWebSocket';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

const SettingRow = ({ label, info, enabled, icon: Icon }) => (
  <div className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl hover:bg-white/[0.02] transition-colors">
    <div className="flex items-center gap-5">
        {Icon && (
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.6 }}>
                <Icon size={18} />
            </div>
        )}
        <div>
            <p style={{ fontSize: '0.925rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '0.01em' }}>{label}</p>
            {info && <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.3, marginTop: '2px' }}>{info.toUpperCase()}</p>}
        </div>
    </div>
    <Switch defaultSelected={enabled} color="primary" size="sm" classNames={{ wrapper: "bg-white/10" }} />
  </div>
);

/* ===============================
   ELITE SYSTEM CONTROL HUB
================================ */
export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('appearance');
    const { currentUser } = useContext(AuthContext);
    const toast = useToast();
    const { isConnected, latency } = useWebSocket();

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1200));
        setSaving(false);
        toast.success('System configuration synchronized');
    };

    return (
        <PageShell>
            <PageHeader
                icon={SettingsIcon}
                title="System Control"
                subtitle="Global orchestration of administrative vectors and security protocols."
                actions={
                    <Button 
                        color="primary" 
                        onPress={handleSave} 
                        isLoading={saving}
                        style={{ height: '3.25rem', borderRadius: '1.25rem', fontWeight: 950, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.2em', padding: '0 2rem', boxShadow: '0 15px 30px rgba(59, 130, 246, 0.2)' }}
                        startContent={!saving && <Save size={18} />}
                    >
                        Save Configuration
                    </Button>
                }
            />

            <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={setActiveTab}
                variant="underlined"
                classNames={{
                    tabList: "gap-10 border-b border-white/[0.05] p-0 mb-8",
                    cursor: "bg-blue-600 w-full",
                    tab: "max-w-fit px-0 h-14 font-black text-[11px] uppercase tracking-[0.15em] opacity-40 data-[selected=true]:opacity-100 transition-opacity",
                    tabContent: "group-data-[selected=true]:text-blue-500"
                }}
            >
                <Tab
                    key="appearance"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Palette size={16}/>
                            <span>Aesthetics</span>
                        </div>
                    }
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2.5rem' }}>
                        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {/* Platform Identity Section */}
                            <div className="elite-card">
                                <div className="elite-card-body" style={{ padding: '2.5rem' }}>
                                    <h4 className="text-tactical" style={{ color: 'var(--text-main)', marginBottom: '2.5rem', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Platform Identity</h4>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                        <SettingRow label="High-Fidelity UI" info="Enables advanced glassmorphism and blur shaders." enabled={true} icon={Zap} />
                                        <SettingRow label="Tactical Micro-Animations" info="Subtle interactions for enhanced feedback cycles." enabled={true} icon={Activity} />
                                        <SettingRow label="Deep Navigation Depth" info="Increases visual hierarchy in complex menus." enabled={false} icon={ChevronRight} />

                                        <Divider style={{ opacity: 0.05 }} />

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            <p className="text-tactical" style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, letterSpacing: '0.2em' }}>DATA_DENSITY_PROTOCOL</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                                {[
                                                    { id: 'compact', label: 'Compact Matrix' },
                                                    { id: 'balanced', label: 'Balanced Hub' },
                                                    { id: 'focus', label: 'Spacious Focus' }
                                                ].map(d => (
                                                    <div 
                                                        key={d.id} 
                                                        style={{ 
                                                            padding: '1.5rem', 
                                                            background: 'rgba(255,255,255,0.015)', 
                                                            border: '1px solid rgba(255,255,255,0.04)', 
                                                            borderRadius: '1.25rem', 
                                                            textAlign: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                        className="hover:border-blue-500/20 transition-all"
                                                    >
                                                        <p className="text-tactical" style={{ fontSize: '11px', fontWeight: 900 }}>{d.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vitality Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="elite-card" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                                <div className="elite-card-body" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <Zap className="text-primary" size={20} />
                                        <h4 className="text-tactical" style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '11px', letterSpacing: '0.1em' }}>LIVE_NODE_TELEMETRY</h4>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div className="status-pill" style={{ padding: '1rem 1.25rem', justifyContent: 'space-between', background: 'rgba(2, 6, 23, 0.4)' }}>
                                            <span className="text-tactical" style={{ fontSize: '10px', opacity: 0.4 }}>Link Latency</span>
                                            <span style={{ fontSize: '13px', fontWeight: 950, color: 'var(--primary)', fontFamily: 'monospace' }}>22ms</span>
                                        </div>
                                        <div className="status-pill" style={{ padding: '1rem 1.25rem', justifyContent: 'space-between', background: 'rgba(2, 6, 23, 0.4)' }}>
                                            <span className="text-tactical" style={{ fontSize: '10px', opacity: 0.4 }}>System Integrity</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                 <span style={{ fontSize: '11px', fontWeight: 900, color: isConnected ? 'var(--success)' : 'var(--danger)' }}>{isConnected ? 'STABLE_SYNC' : 'NODAL_FAIL'}</span>
                                                 <div className={`status-dot ${isConnected ? 'status-dot-on' : 'status-dot-off'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <Divider style={{ opacity: 0.05, margin: '1.75rem 0' }} />
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'rgba(2, 6, 23, 0.4)', border: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <Cpu size={20} />
                                        </div>
                                        <div>
                                            <p className="text-tactical" style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-main)' }}>Kernel Platform</p>
                                            <p style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-dim)', margin: 0, opacity: 0.4 }}>v2.9.1-beta_L3</p>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        variant="flat" 
                                        style={{ width: '100%', height: '3rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginTop: '2rem' }} 
                                        startContent={<ExternalLink size={16}/>}
                                    >
                                        System Integrity Scan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>

                <Tab
                    key="security"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield size={16}/>
                            <span>Security</span>
                        </div>
                    }
                >
                    <div className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className="elite-card-body" style={{ padding: '3rem' }}>
                            <h4 className="text-tactical" style={{ color: 'var(--text-main)', marginBottom: '3rem', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Access Governance Protocols</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <SettingRow label="Multi-Factor Authentication" info="Enforce biometric or MFA for all system principals." enabled={true} icon={Lock} />
                                <SettingRow label="Neural Signal Encryption" info="End-to-end encryption for all nodal transmissions." enabled={true} icon={Zap} />
                                <SettingRow label="Administrative IP Pinning" info="Restrict access to authorized administrative networks." enabled={false} icon={Globe} />
                                <SettingRow label="Autonomous Threat Detection" info="AI-powered heuristic analysis of nodal anomalies." enabled={true} icon={Activity} />
                            </div>

                            <Divider style={{ opacity: 0.05, margin: '3rem 0' }} />

                            <div>
                                <h5 className="text-tactical" style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4, marginBottom: '2rem', letterSpacing: '0.2em' }}>CRITICAL_ACTION_ZONE</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                     <Button variant="flat" color="danger" style={{ height: '4rem', borderRadius: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }} startContent={<Trash2 size={20}/>}>Purge Audit History</Button>
                                     <Button variant="flat" color="danger" style={{ height: '4rem', borderRadius: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }} startContent={<AlertCircle size={20}/>}>Decommission Cluster</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>

                <Tab
                    key="notifications"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Bell size={16}/>
                            <span>Dissemination</span>
                        </div>
                    }
                >
                    <div className="elite-card" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className="elite-card-body" style={{ padding: '3rem' }}>
                            <h4 className="text-tactical" style={{ color: 'var(--text-main)', marginBottom: '3rem', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Signal Dissemination Rules</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <SettingRow label="Critical Nodal Alerts" info="Real-time broadcast for critical hardware failures." enabled={true} icon={AlertCircle} />
                                <SettingRow label="Security Breach Sync" info="Immediate notification on unauthorized access attempts." enabled={true} icon={Shield} />
                                <SettingRow label="Administrative Reports" info="Weekly summary of operational analytics and telemetry." enabled={false} icon={Activity} />
                                <SettingRow label="Mobile Push Signals" info="Direct dissemination to administrative mobile nodes." enabled={true} icon={Smartphone} />
                            </div>
                        </div>
                    </div>
                </Tab>
            </Tabs>

            {/* Tactical Footer */}
            <div className="flex-center" style={{ padding: '3rem 0', opacity: 0.1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ height: '1px', width: '3rem', background: 'var(--text-main)' }} />
                    <span className="text-tactical" style={{ fontSize: '9px', letterSpacing: '0.8em', fontWeight: 900 }}>ORCHESTRATE_OS_STABLE</span>
                    <div style={{ height: '1px', width: '3rem', background: 'var(--text-main)' }} />
                </div>
            </div>
        </PageShell>
    );
}
