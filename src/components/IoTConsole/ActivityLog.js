import React from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { 
    Search, RefreshCw, Calendar, Clock, BarChart3, AlertTriangle, Shield, Activity as ActivityIcon, AlertCircle, Mail, User, Trash2, Plus 
} from 'lucide-react';

export default function ActivityLog({ 
    logs, 
    loading, 
    error, 
    searchTerm, 
    onSearchChange, 
    filterAction, 
    onFilterChange, 
    dateRange, 
    onDateRangeChange, 
    onRefresh 
}) {
    // Icons for actions
    const getActionIcon = (action) => {
        switch (action) {
            case 'broadcast_email': return <Mail size={16} className="text-blue-400" />;
            case 'update_security_rules': return <Shield size={16} className="text-purple-400" />;
            case 'delete_user': return <Trash2 size={16} className="text-red-400" />;
            case 'create_device': return <Plus size={16} className="text-green-400" />;
            case 'delete_device': return <Trash2 size={16} className="text-orange-400" />;
            case 'transfer_device': return <RefreshCw size={16} className="text-blue-400" />;
            case 'login': return <User size={16} className="text-blue-400" />;
            default: return <ActivityIcon size={16} className="text-dim" />;
        }
    };

    const stats = {
        total: logs.length,
        critical: logs.filter(l => ['delete_user', 'update_security_rules', 'ban_user'].includes(l.action)).length,
        admins: new Set(logs.map(l => l.admin_id)).size
    };

    const uniqueActions = ['all', ...new Set(logs.map(l => l.action))];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-white/5 bg-blue-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Total Recorded Events</p>
                        <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                    </div>
                </Card>
                <Card className="border-white/5 bg-red-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Critical Interventions</p>
                        <h3 className="text-2xl font-bold text-white">{stats.critical}</h3>
                    </div>
                </Card>
                <Card className="border-white/5 bg-purple-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Active Operators</p>
                        <h3 className="text-2xl font-bold text-white">{stats.admins}</h3>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-white/5 bg-white/[0.01]">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full text-left">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">Record Pattern Matching</label>
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl h-12 px-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-all">
                            <Search size={18} className="text-dim" />
                            <input
                                type="text"
                                placeholder="Search by operation, operator, or target..."
                                value={searchTerm}
                                onChange={e => onSearchChange(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-dim"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48 text-left">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">Action Scope</label>
                        <select
                            className="h-12 bg-slate-900/50 border border-white/5 rounded-xl px-4 text-sm w-full focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer text-white"
                            value={filterAction}
                            onChange={e => onFilterChange(e.target.value)}
                        >
                            {uniqueActions.map(action => (
                                <option key={action} value={action} className="bg-slate-900">
                                    {action === 'all' ? 'Universal Stream' : action.replace(/_/g, ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-auto text-left">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">Chronological Bounds</label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                                <input 
                                    type="date" 
                                    className="bg-slate-900/50 border border-white/5 rounded-xl h-12 pl-10 pr-2 text-sm text-white outline-none focus:border-blue-500/50 transition-all w-36"
                                    value={dateRange.start}
                                    onChange={e => onDateRangeChange('start', e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                                <input 
                                    type="date" 
                                    className="bg-slate-900/50 border border-white/5 rounded-xl h-12 pl-10 pr-2 text-sm text-white outline-none focus:border-blue-500/50 transition-all w-36"
                                    value={dateRange.end}
                                    onChange={e => onDateRangeChange('end', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-12 w-12 p-0 flex items-center justify-center rounded-xl"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </Card>

            {/* Timeline */}
            <div className="timeline-container relative mx-auto px-4">
                <div className="timeline-line"></div>
                {loading && logs.length === 0 ? (
                    <div className="py-20 text-center shimmer-effect">
                        <ActivityIcon className="mx-auto mb-4 text-blue-400 animate-pulse icon-glow" size={48} />
                        <p className="text-dim italic">Synchronizing event chronology...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <AlertCircle size={48} className="mx-auto mb-4 text-dim opacity-10" />
                        <p className="text-dim italic">No matching event logs found in the selected temporal range.</p>
                    </div>
                ) : (
                    <div className="space-y-8 pb-20">
                        {logs.map((log, index) => (
                            <div key={log.id || index} className="timeline-item animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="timeline-marker group">
                                    <div className={`timeline-marker-inner transition-all ${['delete_user', 'update_security_rules'].includes(log.action) ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}>
                                        <div className="group-hover:icon-glow">{getActionIcon(log.action)}</div>
                                    </div>
                                </div>
                                <div className="timeline-content">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-1.5 text-dim text-[10px] font-mono tracking-tighter">
                                            <Clock size={10} />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-white/5 bg-white/5 text-dim">
                                            {log.action?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <Card className="hover:bg-white/[0.03] border-white/5 transition-all cursor-default">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-white tracking-wide">{log.subject || log.action?.replace(/_/g, ' ')}</h4>
                                                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px] font-bold">A</div>
                                                    <span className="text-[10px] text-dim font-mono">{log.admin_id?.slice(-4) || 'SYST'}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-dim leading-relaxed">{log.message || `System operation executed on immutable record.`}</p>
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
