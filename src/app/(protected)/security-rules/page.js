'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import {
    Shield,
    Save,
    RotateCcw,
    AlertTriangle,
    CheckCircle,
    Code,
    Lock,
    Eye
} from 'lucide-react';

/* ===============================
   SECURITY RULES PAGE
================================ */
export default function SecurityRulesPage() {
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
            console.error('Failed to fetch rules', err);
            setError('Failed to load security rules from server. (Error 404 or backend unresponsive)');
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
            // Validate JSON
            let parsedRules;
            try {
                parsedRules = JSON.parse(rules);
            } catch (jsonErr) {
                throw new Error('Invalid JSON format: ' + jsonErr.message);
            }

            await adminService.updateSecurityRules(parsedRules);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to update rules', err);
            setError(err.message || 'Failed to update security rules.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to discard your recent changes? This will revert to the server-side version.')) {
            fetchRules();
        }
    };

    return (
        <div className="security-rules-page animate-fadeInUp">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">
                        <Lock className="icon-glow mr-2" size={24} />
                        Identity Guard
                    </h2>
                    <p className="dashboard-subtitle">
                        Manage granular platform access control using JSON security definitions
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        disabled={loading || saving}
                    >
                        <RotateCcw size={18} />
                        Discard
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-broadcast-premium"
                        onClick={handleSave}
                        disabled={loading || saving}
                    >
                        <Save size={18} />
                        {saving ? 'Syncing...' : 'Deploy Rules'}
                    </Button>
                </div>
            </div>

            {/* Warning Alert */}
            <div className="status-message status-warning mb-6 border-yellow-500/20 bg-yellow-500/5 py-4 px-6 rounded-2xl animate-pulse-slow">
                <AlertTriangle size={24} className="text-yellow-400 shrink-0" />
                <div className="text-left">
                    <p className="font-bold text-yellow-400 text-sm mb-1 uppercase tracking-widest">CRITICAL CONFIGURATION ZONE</p>
                    <p className="text-xs text-yellow-200/70">
                        Rules are evaluated live. Invalid logic can instantly disrupt platform connectivity for all users and instruments.
                    </p>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="status-message status-error mb-6 border-red-500/20 bg-red-500/5 p-4 rounded-xl">
                    <AlertTriangle size={18} />
                    <span className="text-xs font-medium">{error}</span>
                </div>
            )}
            {success && (
                <div className="status-message status-success mb-6 border-green-500/20 bg-green-500/5 p-4 rounded-xl">
                    <CheckCircle size={18} />
                    <span className="text-xs font-medium">Security protocol successfully synchronized!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="lg:col-span-2">
                    <Card noPadding className="rules-editor-container border-white/5 overflow-hidden">
                        <div className="editor-header bg-white/[0.03] p-4 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Code size={14} className="text-blue-400" />
                                <span className="text-[10px] uppercase font-bold tracking-widest text-dim">security_rules.json</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500/30"></span>
                                <span className="w-2 h-2 rounded-full bg-yellow-500/30"></span>
                                <span className="w-2 h-2 rounded-full bg-green-500/30"></span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center">
                                <Shield className="mx-auto mb-4 text-blue-400 animate-spin" size={32} />
                                <p className="text-dim italic">decrypting ruleset...</p>
                            </div>
                        ) : (
                            <textarea
                                className="rules-textarea w-full h-[500px] bg-transparent text-blue-100 font-mono text-sm p-6 outline-none resize-none msg-textarea"
                                value={rules}
                                onChange={(e) => setRules(e.target.value)}
                                placeholder="Enter structural rules JSON here..."
                                spellCheck="false"
                            />
                        )}
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-white/5 text-left">
                        <h3 className="card-title text-sm flex items-center gap-2 mb-6">
                            <Eye size={16} className="text-dim" />
                            Reference Guide
                        </h3>

                        <div className="space-y-6">
                            <div className="reference-section">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-dim mb-3">Context Variables</h4>
                                <ul className="space-y-3">
                                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <code className="text-blue-400 text-xs">auth.uid</code>
                                        <span className="text-[10px] text-dim">Subject Identifier</span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <code className="text-blue-400 text-xs">data</code>
                                        <span className="text-[10px] text-dim">Object Payload</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <code className="text-blue-400 text-xs">root</code>
                                        <span className="text-[10px] text-dim">Global State</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="reference-section bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-dim mb-3">Schema Example</h4>
                                <pre className="text-[10px] font-mono text-dim leading-relaxed whitespace-pre-wrap">
                                    {`"devices": {
  "$id": {
    ".read": "auth.uid == data.user_id",
    ".write": "auth.uid == data.user_id"
  }
}`}
                                </pre>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                                <p className="text-[10px] text-blue-300 leading-relaxed italic">
                                    Identity Guard rules are evaluated for every platform request. Optimized rules improve platform latency by up to 15%.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
