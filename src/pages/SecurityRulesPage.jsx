import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardBody, 
    Button, 
    Textarea, 
    Divider,
    Chip,
} from '@heroui/react';
import { useToast } from '../context/ToastContext';
import adminService from '../services/adminService';
import {
    Shield,
    Save,
    RotateCcw,
    AlertTriangle,
    CheckCircle,
    Code,
    Eye,
    Terminal,
    Zap,
    X,
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

export default function SecurityRulesPage() {
    const toast = useToast();
    const [rules, setRules] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.getSecurityRules();
            if (data && typeof data === 'object') {
                setRules(JSON.stringify(data, null, 2));
            } else {
                setRules('{}');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setError('Heuristic decoding failed. Terminal unreachable.');
            setRules('{}');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            let parsedRules;
            try {
                parsedRules = JSON.parse(rules);
            } catch (jsonErr) {
                throw new Error('MALFORMED_JSON: ' + jsonErr.message);
            }

            await adminService.updateSecurityRules(parsedRules);
            setSuccess(true);
            toast.success('Security vectors deployed successfully');
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            const msg = err.message || 'Deployment rejected by kernel.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        fetchRules();
    };

    return (
        <PageShell gap="2rem" paddingBottom="5rem">
            <PageHeader
                icon={Shield}
                title="Security Protocols"
                subtitle="Programmable access control logic for the ThingsNXT edge ecosystem."
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="flat" 
                            onPress={handleReset}
                            startContent={<RotateCcw size={16} />}
                            style={{ height: '2.75rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}
                        >
                            Revert Changes
                        </Button>
                        <Button 
                            color="primary" 
                            onPress={handleSave} 
                            isLoading={saving}
                            style={{ height: '2.75rem', borderRadius: 'var(--radius-lg)', fontWeight: 700, px: '2rem', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}
                            startContent={!saving && <Save size={16} />}
                        >
                            Deploy Protocol
                        </Button>
                    </div>
                }
            />

            {/* Critical Warning */}
            <div className="elite-card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="elite-card-body" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 className="text-tactical" style={{ color: 'var(--danger)', fontSize: '10px' }}>Kernel Configuration Zone</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', margin: 0 }}>
                            Modifying the ruleset instantly alters the security perimeter. 
                            Logical errors will destabilize administrative and nodal transmissions.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <Chip size="sm" variant="flat" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '9px', fontWeight: 800, height: '1.5rem', border: 'none' }}>LIVE_DEPLOYMENT</Chip>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div style={{ padding: '1rem 1.5rem', borderRadius: '1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="animate-fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Terminal size={14} className="text-danger" />
                        <p className="text-tactical" style={{ color: 'var(--danger)', fontSize: '9px' }}>{error}</p>
                    </div>
                    <Button isIconOnly variant="light" size="sm" onPress={() => setError(null)} style={{ opacity: 0.5, color: 'var(--danger)' }}><X size={14}/></Button>
                </div>
            )}

            {success && (
                <div style={{ padding: '1rem 1.5rem', borderRadius: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="animate-fade-in">
                    <CheckCircle size={14} className="text-success" />
                    <p className="text-tactical" style={{ color: 'var(--success)', fontSize: '9px' }}>Security Vectors Synchronized</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Editor Module */}
                <div className="lg:col-span-8">
                    <div className="elite-card" style={{ height: '640px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '3.5rem', padding: '0 1.5rem', borderBottom: '1px solid var(--border-dim)', background: 'rgba(255, 255, 255, 0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Code size={16} className="text-primary" />
                                <span className="text-tactical" style={{ fontSize: '9px', fontStyle: 'italic' }}>rules_definition.json</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }} />
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: 0 }}>
                            <Textarea
                                variant="flat"
                                value={rules}
                                onValueChange={setRules}
                                disableAutosize
                                classNames={{
                                    base: "h-full",
                                    inputWrapper: "h-full bg-transparent p-6",
                                    input: "font-mono text-sm text-primary placeholder-slate-700 leading-relaxed custom-scrollbar",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Reference Module */}
                <div className="lg:col-span-4">
                    <div className="elite-card">
                        <div className="elite-card-body" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                                <Eye className="text-muted" size={18} style={{ opacity: 0.4 }} />
                                <h4 className="text-tactical" style={{ color: 'var(--text-main)' }}>Protocol Ref</h4>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4, borderBottom: '1px solid var(--border-dim)', paddingBottom: '0.5rem' }}>Environment Variables</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[
                                            { key: 'auth.uid', desc: 'Principal ID' },
                                            { key: 'data', desc: 'Payload' },
                                            { key: 'root', desc: 'Platform Index' }
                                        ].map(item => (
                                            <div key={item.key} className="flex-between">
                                                <code style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: 700, background: 'rgba(59, 130, 246, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>.{item.key}</code>
                                                <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.3 }}>{item.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'rgba(2, 6, 23, 0.5)', borderRadius: '1rem', border: '1px solid var(--border-dim)' }}>
                                    <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4, marginBottom: '1rem' }}>Syntax Pattern</p>
                                    <pre style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(59, 130, 246, 0.4)', margin: 0, lineHeight: 1.6 }}>
{`"devices": {
  "$id": {
    ".read": "auth.uid == data.user_id"
  }
}`}
                                    </pre>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                    <Zap size={18} className="text-primary" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                                        Heuristic evaluation is performed at the edge. Optimized rules can improve overall link velocity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
