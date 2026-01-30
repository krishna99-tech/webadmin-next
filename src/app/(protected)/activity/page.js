'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import adminService from '@/services/adminService';
import useWebSocket from '@/hooks/useWebSocket';
import {
    History,
    Search,
    Download,
    RefreshCw,
    Filter,
    User,
    Activity,
    AlertCircle,
    Clock,
    Zap,
    Mail,
    Shield,
    Trash2,
    Plus,
    CheckCircle
} from 'lucide-react';

/* ===============================
   AUDIT LOGS PAGE (TIMELINE)
================================ */
export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [isStreaming, setIsStreaming] = useState(true);
    const [error, setError] = useState(null);

    // WebSocket Integration for Live Streaming
    const { lastMessage, connected } = useWebSocket();

    useEffect(() => {
        fetchLogs();
    }, []);

    // Handle incoming live logs
    useEffect(() => {
        if (connected && lastMessage && isStreaming) {
            // Check if it's a log-type message
            if (lastMessage.type === 'admin_log' || lastMessage.type === 'activity') {
                const newLog = lastMessage.data;
                setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100
            }
        }
    }, [lastMessage, connected, isStreaming]);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.getActivity();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
            setError('Failed to retrieve event chronology. System may be under maintenance.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const result = await adminService.exportActivity();
            const data = result.data;

            // Convert to CSV
            const headers = ['ID', 'Admin ID', 'Action', 'Recipient', 'Subject', 'Timestamp'];
            const rows = data.map(l => [
                l.id,
                l.admin_id,
                l.action,
                l.recipient || '',
                l.subject || '',
                l.timestamp
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export activity logs');
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'broadcast_email': return <Mail size={16} className="text-blue-400" />;
            case 'update_security_rules': return <Shield size={16} className="text-purple-400" />;
            case 'delete_user': return <Trash2 size={16} className="text-red-400" />;
            case 'create_device': return <Plus size={16} className="text-green-400" />;
            case 'login': return <User size={16} className="text-blue-400" />;
            default: return <Activity size={16} className="text-dim" />;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target_email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterAction === 'all' || log.action === filterAction;

        return matchesSearch && matchesFilter;
    });

    const uniqueActions = ['all', ...new Set(logs.map(l => l.action))];

    return (
        <div className="audit-logs-page animate-fadeInUp">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">
                        <History className="icon-glow mr-2" size={24} />
                        Event Chronology
                    </h2>
                    <p className="dashboard-subtitle">
                        Comprehensive immutable record of administrative maneuvers and system perturbations
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={isStreaming ? "secondary" : "outline"}
                        className={isStreaming ? "border-green-500/30 text-green-400" : ""}
                        onClick={() => setIsStreaming(!isStreaming)}
                    >
                        <Zap size={18} className={isStreaming ? "fill-green-400" : ""} />
                        {isStreaming ? 'Live Stream Active' : 'Enable Live Feed'}
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download size={18} />
                        Export Data
                    </Button>
                </div>
            </div>

            {error && (
                <div className="status-message status-error mb-6 border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-400" />
                    <span className="text-xs font-medium text-red-200">{error}</span>
                </div>
            )}

            {/* Interactive Filters */}
            <Card className="mb-8 border-white/5 bg-white/[0.01]">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full text-left">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">Pattern Search</label>
                        <div className="topbar-search w-full bg-slate-900/50 border border-white/5 rounded-xl h-12 px-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-all">
                            <Search size={18} className="text-dim" />
                            <input
                                type="text"
                                placeholder="Filter by action, admin, or target..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-dim"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-72 text-left">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">Logic Dimension</label>
                        <select
                            className="input-field h-12 bg-slate-900/50 border border-white/5 rounded-xl px-4 text-sm w-full focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                        >
                            {uniqueActions.map(action => (
                                <option key={action} value={action} className="bg-slate-900">
                                    {action === 'all' ? 'Universal Stream' : action.replace(/_/g, ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={fetchLogs}
                        disabled={loading}
                        className="h-12 w-12 p-0 flex items-center justify-center rounded-xl"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </Card>

            {/* Timeline Stream */}
            <div className="timeline-container relative max-w-4xl mx-auto px-4">
                {/* Vertical Line */}
                <div className="absolute left-[35px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/20 via-blue-500/5 to-transparent"></div>

                {loading && logs.length === 0 ? (
                    <div className="py-20 text-center shimmer-effect">
                        <Activity className="mx-auto mb-4 text-blue-400 animate-pulse icon-glow" size={48} />
                        <p className="text-dim italic">Polling immutable record...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <AlertCircle size={48} className="mx-auto mb-4 text-dim opacity-10" />
                        <p className="text-dim italic">No events found in this temporal dimension.</p>
                    </div>
                ) : (
                    <div className="space-y-8 pb-20">
                        {filteredLogs.map((log, index) => (
                            <div
                                key={log.id || index}
                                className="timeline-item flex gap-8 animate-fadeInUp"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Marker */}
                                <div className="timeline-marker z-10 shrink-0 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:neon-border transition-all">
                                        <div className="group-hover:icon-glow">
                                            {getActionIcon(log.action)}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="timeline-content flex-1 text-left pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-1.5 text-dim text-[10px] font-mono tracking-tighter">
                                            <Clock size={10} />
                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-white/5 bg-white/5 text-dim`}>
                                            {log.action?.replace(/_/g, ' ')}
                                        </span>
                                        {index === 0 && isStreaming && (
                                            <span className="flex items-center gap-1 text-[8px] font-bold text-green-400 uppercase tracking-widest animate-pulse">
                                                <div className="w-1 h-1 rounded-full bg-green-400"></div>
                                                Pulse
                                            </span>
                                        )}
                                    </div>

                                    <Card className="hover:bg-white/[0.03] border-white/5 transition-all cursor-default">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-white tracking-wide">
                                                    {log.subject || log.action?.replace(/_/g, ' ')}
                                                </h4>
                                                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px] font-bold">A</div>
                                                    <span className="text-[10px] text-dim font-mono">{log.admin_id?.slice(-4) || 'SYST'}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-dim leading-relaxed">
                                                {log.message || `Administrative action executed on target entity.`}
                                            </p>

                                            {(log.recipient || log.target_email || log.device_name) && (
                                                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5">
                                                    {log.recipient && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-blue-400/80">
                                                            <Mail size={10} />
                                                            {log.recipient}
                                                        </div>
                                                    )}
                                                    {log.target_email && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-orange-400/80">
                                                            <User size={10} />
                                                            {log.target_email}
                                                        </div>
                                                    )}
                                                    {log.device_name && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-green-400/80">
                                                            <Zap size={10} />
                                                            {log.device_name}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
