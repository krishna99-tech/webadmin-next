import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Select from '../components/UI/Select';
import { Card as HeroCard, CardHeader, CardBody, CardFooter, Divider, Link, Image } from '@heroui/react';
import adminService from '../services/adminService';
import useWebSocket from '../hooks/useWebSocket';
import {
    History,
    Download,
    Search,
    RefreshCw,
    Calendar,
    Clock,
    BarChart3,
    AlertTriangle,
    Shield,
    Activity as ActivityIcon,
    AlertCircle,
    Mail,
    User,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    Filter,
    TrendingUp,
    Eye,
    Database,
    Zap,
    CheckCircle2,
    XCircle,
    ArrowUpDown,
    FileText,
    Settings
} from 'lucide-react';

export default function ActivityPage() {
    // State
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [logFilterAction, setLogFilterAction] = useState('all');
    const [logDateRange, setLogDateRange] = useState({ start: '', end: '' });
    const [isStreaming, setIsStreaming] = useState(true);
    const [logError, setLogError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [selectedLog, setSelectedLog] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'
    
    const autoRefreshInterval = useRef(null);

    // WebSocket
    const { lastMessage, connected } = useWebSocket();

    // Fetch logs on mount and date range change
    useEffect(() => {
        fetchLogs();
        setCurrentPage(1);
    }, [logDateRange]);

    // Auto-refresh functionality
    useEffect(() => {
        if (autoRefresh) {
            autoRefreshInterval.current = setInterval(() => {
                fetchLogs();
            }, 30000); // Refresh every 30 seconds
        } else {
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        }
        
        return () => {
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        };
    }, [autoRefresh]);

    const fetchLogs = useCallback(async () => {
        setLoadingLogs(true);
        setLogError(null);
        try {
            const filters = {};
            if (logDateRange.start) filters.start_date = logDateRange.start;
            if (logDateRange.end) filters.end_date = logDateRange.end;
            
            const data = await adminService.getActivity(filters);
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
            setLogError('Failed to retrieve event chronology. Please try again.');
        } finally {
            setLoadingLogs(false);
        }
    }, [logDateRange]);

    // WebSocket real-time updates
    useEffect(() => {
        if (connected && lastMessage && isStreaming) {
            if (lastMessage.type === 'admin_log' || lastMessage.type === 'activity') {
                setLogs(prev => {
                    // Prevent duplicates
                    const exists = prev.some(log => 
                        (log.id || log._id) === (lastMessage.data.id || lastMessage.data._id)
                    );
                    if (exists) return prev;
                    return [lastMessage.data, ...prev].slice(0, 5000);
                });
            }
        }
    }, [lastMessage, connected, isStreaming]);

    // Filtered and sorted logs
    const filteredLogs = useMemo(() => {
        let filtered = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            const start = logDateRange.start ? new Date(logDateRange.start) : null;
            const end = logDateRange.end ? new Date(logDateRange.end) : null;
            if (end) end.setHours(23, 59, 59, 999);

            const matchesSearch =
                log.action?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                log.subject?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                log.recipient?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                log.target_email?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                log.message?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                log.admin_id?.toLowerCase().includes(logSearchTerm.toLowerCase());

            const matchesFilter = logFilterAction === 'all' || log.action === logFilterAction;
            const matchesDate = (!start || logDate >= start) && (!end || logDate <= end);

            return matchesSearch && matchesFilter && matchesDate;
        });

        // Sort by timestamp
        filtered.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [logs, logSearchTerm, logFilterAction, logDateRange, sortOrder]);

    const handleExportLogs = useCallback(() => {
        try {
            const data = filteredLogs;
            const headers = ['ID', 'Admin ID', 'Action', 'Recipient', 'Subject', 'Message', 'Timestamp'];
            const rows = data.map(l => [
                l.id || l._id, 
                l.admin_id, 
                l.action, 
                l.recipient || '', 
                l.subject || '', 
                l.message || '',
                l.timestamp
            ]);
            const csv = [
                headers.join(','), 
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = logDateRange.start 
                ? `${logDateRange.start}_${logDateRange.end || 'ongoing'}` 
                : new Date().toISOString().slice(0, 10);
            a.download = `audit_logs_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to generate export file.');
        }
    }, [filteredLogs, logDateRange]);

    // Enhanced action icons with more types
    const getActionIcon = useCallback((action) => {
        const iconMap = {
            'broadcast_email': { icon: Mail, color: 'text-blue-400' },
            'update_security_rules': { icon: Shield, color: 'text-purple-400' },
            'delete_user': { icon: Trash2, color: 'text-red-400' },
            'create_device': { icon: Plus, color: 'text-green-400' },
            'delete_device': { icon: Trash2, color: 'text-orange-400' },
            'transfer_device': { icon: RefreshCw, color: 'text-blue-400' },
            'login': { icon: User, color: 'text-blue-400' },
            'ban_user': { icon: XCircle, color: 'text-red-500' },
            'approve_user': { icon: CheckCircle2, color: 'text-green-500' },
            'update_settings': { icon: Settings, color: 'text-yellow-400' },
        };
        
        const actionData = iconMap[action] || { icon: ActivityIcon, color: 'text-dim' };
        const Icon = actionData.icon;
        return <Icon size={16} className={actionData.color} />;
    }, []);

    // Determine action severity
    const getActionSeverity = useCallback((action) => {
        const critical = ['delete_user', 'update_security_rules', 'ban_user'];
        const warning = ['delete_device', 'transfer_device', 'broadcast_email'];
        
        if (critical.includes(action)) return 'critical';
        if (warning.includes(action)) return 'warning';
        return 'normal';
    }, []);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    // Enhanced stats
    const stats = useMemo(() => {
        const uniqueAdmins = new Set(filteredLogs.map(l => l.admin_id));
        const last24Hours = filteredLogs.filter(l => 
            new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;
        
        return {
            total: filteredLogs.length,
            critical: filteredLogs.filter(l => getActionSeverity(l.action) === 'critical').length,
            admins: uniqueAdmins.size,
            last24h: last24Hours,
            successRate: filteredLogs.length > 0 
                ? ((filteredLogs.filter(l => !['error', 'failed'].includes(l.status?.toLowerCase())).length / filteredLogs.length) * 100).toFixed(1)
                : 100
        };
    }, [filteredLogs, getActionSeverity]);

    const uniqueActions = useMemo(() => 
        ['all', ...new Set(logs.map(l => l.action).filter(Boolean))], 
        [logs]
    );

    const clearFilters = useCallback(() => {
        setLogSearchTerm('');
        setLogFilterAction('all');
        setLogDateRange({ start: '', end: '' });
        setCurrentPage(1);
    }, []);

    const hasActiveFilters = logSearchTerm || logFilterAction !== 'all' || logDateRange.start || logDateRange.end;

    return (
        <div className="activity-page animate-fadeInUp">
            {/* Header */}
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <History className="icon-glow text-primary" size={28} />
                        Activity Logs
                        {connected && isStreaming && (
                            <span className="flex items-center gap-2 text-xs font-normal text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Live
                            </span>
                        )}
                    </h2>
                    <p className="dashboard-subtitle mt-1">
                        Immutable audit trail and real-time event monitoring
                    </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <Button
                        variant={isStreaming ? "secondary" : "outline"}
                        className={`${isStreaming ? "border-green-500/30 text-green-400 bg-green-500/5" : ""} px-6`}
                        onClick={() => setIsStreaming(!isStreaming)}
                    >
                        <Zap size={18} className={isStreaming ? "fill-green-400 animate-pulse" : ""} />
                        {isStreaming ? 'Live Stream' : 'Stream Paused'}
                    </Button>
                    <Button 
                        variant={autoRefresh ? "secondary" : "outline"}
                        className={`${autoRefresh ? "border-blue-500/30 text-blue-400 bg-blue-500/5" : ""} px-6`}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        <RefreshCw size={18} className={autoRefresh ? "animate-spin" : ""} />
                        Auto-Refresh
                    </Button>
                    <Button variant="outline" className="px-6" onClick={handleExportLogs} disabled={filteredLogs.length === 0}>
                        <Download size={18} />
                        Export ({filteredLogs.length})
                    </Button>
                </div>
            </div>

            {logError && (
                <div className="status-message status-error border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3 mb-8">
                    <AlertCircle size={20} className="text-red-400" />
                    <span className="text-xs font-medium text-red-200">{logError}</span>
                    <Button 
                        variant="ghost" 
                        className="ml-auto text-red-400 hover:text-red-300"
                        onClick={() => setLogError(null)}
                    >
                        <X size={16} />
                    </Button>
                </div>
            )}

            {/* Enhanced KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="border-divider/5 bg-blue-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Total Events</p>
                        <h3 className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</h3>
                    </div>
                </Card>
                
                <Card className="border-divider/5 bg-red-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Critical</p>
                        <h3 className="text-2xl font-bold text-foreground">{stats.critical}</h3>
                    </div>
                </Card>
                
                <Card className="border-divider/5 bg-purple-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Operators</p>
                        <h3 className="text-2xl font-bold text-foreground">{stats.admins}</h3>
                    </div>
                </Card>

                <Card className="border-divider/5 bg-green-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Last 24h</p>
                        <h3 className="text-2xl font-bold text-foreground">{stats.last24h}</h3>
                    </div>
                </Card>

                <Card className="border-divider/5 bg-yellow-500/5 flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-dim text-xs uppercase font-bold tracking-wider">Success Rate</p>
                        <h3 className="text-2xl font-bold text-foreground">{stats.successRate}%</h3>
                    </div>
                </Card>
            </div>

            {/* Enhanced Filters */}
            <Card className="border-divider/5 bg-content2/[0.01] mb-6">
                <div className="flex flex-col gap-6">
                    {/* Top Row: Search and View Controls */}
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1 w-full text-left">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">
                                <Search size={10} className="inline mr-1" />
                                Search Events
                            </label>
                            <div className="bg-slate-900/50 border border-divider/5 rounded-xl h-12 px-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-all">
                                <Search size={18} className="text-dim" />
                                <input
                                    type="text"
                                    placeholder="Search by action, admin, recipient, message..."
                                    value={logSearchTerm}
                                    onChange={e => { setLogSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder-dim"
                                />
                                {logSearchTerm && (
                                    <button 
                                        onClick={() => { setLogSearchTerm(''); setCurrentPage(1); }}
                                        className="text-dim hover:text-foreground transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'timeline' ? 'secondary' : 'outline'}
                                onClick={() => setViewMode('timeline')}
                                className="px-4"
                            >
                                <History size={16} />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'outline'}
                                onClick={() => setViewMode('table')}
                                className="px-4"
                            >
                                <Database size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Row: Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="w-full lg:w-56 text-left">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">
                                <Filter size={10} className="inline mr-1" />
                                Action Type
                            </label>
                            <Select
                                className="h-12 bg-slate-900/50 border border-divider/5 rounded-xl px-4 text-sm w-full focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer text-foreground"
                                value={logFilterAction}
                                onChange={e => { setLogFilterAction(e.target.value); setCurrentPage(1); }}
                                options={uniqueActions.map(action => ({
                                    value: action,
                                    label: action === 'all' ? '📊 All Actions' : `🔹 ${action.replace(/_/g, ' ').toUpperCase()}`
                                }))}
                            />
                        </div>

                        <div className="w-full lg:flex-1 text-left">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">
                                <Calendar size={10} className="inline mr-1" />
                                Date Range
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                                    <input 
                                        type="date" 
                                        className="bg-slate-900/50 border border-divider/5 rounded-xl h-12 pl-10 pr-3 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all w-full"
                                        value={logDateRange.start}
                                        onChange={e => setLogDateRange(prev => ({...prev, start: e.target.value}))}
                                    />
                                </div>
                                <span className="text-dim">—</span>
                                <div className="relative flex-1">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                                    <input 
                                        type="date" 
                                        className="bg-slate-900/50 border border-divider/5 rounded-xl h-12 pl-10 pr-3 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all w-full"
                                        value={logDateRange.end}
                                        onChange={e => setLogDateRange(prev => ({...prev, end: e.target.value}))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-44 text-left">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3 block">
                                Per Page
                            </label>
                            <Select
                                className="h-12 bg-slate-900/50 border border-divider/5 rounded-xl px-4 text-sm w-full focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer text-foreground"
                                value={String(itemsPerPage)}
                                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                options={[
                                    { value: '10', label: '10 items' },
                                    { value: '15', label: '15 items' },
                                    { value: '25', label: '25 items' },
                                    { value: '50', label: '50 items' },
                                    { value: '100', label: '100 items' },
                                ]}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="h-12 px-4 rounded-xl"
                                title={`Sort ${sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}`}
                            >
                                <ArrowUpDown size={18} />
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={fetchLogs}
                                disabled={loadingLogs}
                                className="h-12 px-4 rounded-xl"
                                title="Refresh Data"
                            >
                                <RefreshCw size={18} className={loadingLogs ? 'animate-spin' : ''} />
                            </Button>
                            {hasActiveFilters && (
                                <Button 
                                    variant="outline" 
                                    onClick={clearFilters} 
                                    className="h-12 px-4 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10"
                                >
                                    <X size={18} className="mr-2" /> Clear All
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Content */}
            {viewMode === 'timeline' ? (
                <TimelineView
                    logs={paginatedLogs}
                    loading={loadingLogs && logs.length === 0}
                    empty={filteredLogs.length === 0}
                    getActionIcon={getActionIcon}
                    getActionSeverity={getActionSeverity}
                    onLogClick={setSelectedLog}
                />
            ) : (
                <TableView
                    logs={paginatedLogs}
                    loading={loadingLogs && logs.length === 0}
                    empty={filteredLogs.length === 0}
                    getActionIcon={getActionIcon}
                    getActionSeverity={getActionSeverity}
                    onLogClick={setSelectedLog}
                />
            )}

            {/* Pagination Controls */}
            {filteredLogs.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-divider/5 mt-8">
                    <div className="text-dim text-sm">
                        Showing <span className="text-foreground font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                        <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of{' '}
                        <span className="text-foreground font-bold">{filteredLogs.length.toLocaleString()}</span> events
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2"
                        >
                            First
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2"
                        >
                            <ChevronLeft size={16} className="mr-1" /> Prev
                        </Button>
                        
                        <span className="text-dim text-sm font-mono px-4">
                            Page <span className="text-foreground font-bold">{currentPage}</span> of <span className="text-foreground font-bold">{totalPages}</span>
                        </span>
                        
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2"
                        >
                            Next <ChevronRight size={16} className="ml-1" />
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2"
                        >
                            Last
                        </Button>
                    </div>
                </div>
            )}

            {/* Log Detail Modal */}
            {selectedLog && (
                <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} getActionIcon={getActionIcon} />
            )}
        </div>
    );
}

// Timeline View Component
function TimelineView({ logs, loading, empty, getActionIcon, getActionSeverity, onLogClick }) {
    if (loading) {
        return (
            <div className="py-20 text-center shimmer-effect">
                <ActivityIcon className="mx-auto mb-4 text-blue-400 animate-pulse icon-glow" size={48} />
                <p className="text-dim italic">Synchronizing event chronology...</p>
            </div>
        );
    }

    if (empty) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-divider/5 rounded-3xl bg-content2/[0.01]">
                <AlertCircle size={48} className="mx-auto mb-4 text-dim opacity-20" />
                <p className="text-dim italic">No matching event logs found in the selected range.</p>
            </div>
        );
    }

    return (
        <div className="timeline-container relative mx-auto px-4">
            <div className="timeline-line"></div>
            <div className="space-y-8 pb-8">
                {logs.map((log, index) => {
                    const severity = getActionSeverity(log.action);
                    const severityColors = {
                        critical: 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
                        warning: 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
                        normal: 'border-divider/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                    };

                    return (
                        <div 
                            key={log.id || log._id || index} 
                            className="timeline-item animate-fadeInUp cursor-pointer" 
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => onLogClick(log)}
                        >
                            <div className="timeline-marker group">
                                <div className={`timeline-marker-inner transition-all ${severityColors[severity]}`}>
                                    <div className="group-hover:icon-glow">{getActionIcon(log.action)}</div>
                                </div>
                            </div>
                            <div className="timeline-content">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-dim text-[10px] font-mono tracking-tighter">
                                        <Clock size={10} />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                                        severity === 'critical' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                                        severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
                                        'border-divider/5 bg-content2/5 text-dim'
                                    }`}>
                                        {log.action?.replace(/_/g, ' ')}
                                    </span>
                                    {severity === 'critical' && (
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 text-red-400 animate-pulse">
                                            ⚠ CRITICAL
                                        </span>
                                    )}
                                </div>
                                {log.action === 'broadcast_email' ? (
                                    <HeroCard className="max-w-[520px] border border-divider/10 bg-content2/[0.02]">
                                        <CardHeader className="flex gap-3">
                                            <Image
                                                alt="email"
                                                height={40}
                                                radius="sm"
                                                src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                                                width={40}
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-md text-foreground">{log.subject || 'Broadcast Email'}</p>
                                                <p className="text-small text-foreground/80">
                                                    {log.recipient || log.target_email || 'Global Audience'}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                            <p className="text-sm text-dim">
                                                {log.message || 'Broadcast message dispatched.'}
                                            </p>
                                        </CardBody>
                                        <Divider />
                                        <CardFooter className="flex justify-between">
                                            <span className="text-xs text-dim">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <Link
                                                isExternal
                                                showAnchorIcon
                                                href={log.recipient || log.target_email ? `mailto:${log.recipient || log.target_email}` : 'https://github.com/heroui-inc/heroui'}
                                            >
                                                Open
                                            </Link>
                                        </CardFooter>
                                    </HeroCard>
                                ) : (
                                    <Card className="hover:bg-content2/[0.05] hover:border-blue-500/20 border-divider/5 transition-all">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-foreground tracking-wide">
                                                    {log.subject || log.action?.replace(/_/g, ' ')}
                                                </h4>
                                                <div className="flex items-center gap-2 px-2 py-1 bg-content2/5 rounded-lg border border-divider/5">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px] font-bold">
                                                        A
                                                    </div>
                                                    <span className="text-[10px] text-dim font-mono">
                                                        {log.admin_id?.slice(-8) || 'SYSTEM'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-dim leading-relaxed line-clamp-2">
                                                {log.message || log.recipient || 'System operation executed on immutable record.'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Eye size={12} className="text-blue-400" />
                                                <span className="text-[10px] text-blue-400">Click to view details</span>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Table View Component
function TableView({ logs, loading, empty, getActionIcon, getActionSeverity, onLogClick }) {
    if (loading) {
        return (
            <div className="py-20 text-center shimmer-effect">
                <Database className="mx-auto mb-4 text-blue-400 animate-pulse icon-glow" size={48} />
                <p className="text-dim italic">Loading activity table...</p>
            </div>
        );
    }

    if (empty) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-divider/5 rounded-3xl bg-content2/[0.01]">
                <AlertCircle size={48} className="mx-auto mb-4 text-dim opacity-20" />
                <p className="text-dim italic">No matching event logs found.</p>
            </div>
        );
    }

    return (
        <Card className="border-divider/5 bg-content2/[0.01] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-content2/[0.02] border-b border-divider/5">
                        <tr>
                            <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-dim">Time</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-dim">Action</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-dim">Admin</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-dim">Subject</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-dim">Details</th>
                            <th className="text-right px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-dim">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => {
                            const severity = getActionSeverity(log.action);
                            return (
                                <tr 
                                    key={log.id || log._id || index}
                                    className="border-b border-divider/5 hover:bg-content2/[0.03] transition-colors cursor-pointer"
                                    onClick={() => onLogClick(log)}
                                >
                                    <td className="px-4 py-3 text-xs text-dim font-mono whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getActionIcon(log.action)}
                                            <span className="text-xs text-foreground">
                                                {log.action?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dim font-mono">
                                        {log.admin_id?.slice(-8) || 'SYSTEM'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-foreground">
                                        {log.subject || log.recipient || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dim max-w-xs truncate">
                                        {log.message || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                                            severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                            severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                            'bg-green-500/10 text-green-400 border border-green-500/30'
                                        }`}>
                                            {severity}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

// Log Detail Modal Component
function LogDetailModal({ log, onClose, getActionIcon }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <Card 
                className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-divider/10 bg-slate-900/95 animate-slideUp" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider/5">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                        {getActionIcon(log.action)}
                        Event Details
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-dim hover:text-foreground transition-colors p-2 hover:bg-content2/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <DetailRow label="Event ID" value={log.id || log._id || 'N/A'} mono />
                    <DetailRow label="Timestamp" value={new Date(log.timestamp).toLocaleString()} icon={<Clock size={14} />} />
                    <DetailRow label="Action Type" value={log.action?.replace(/_/g, ' ')} />
                    <DetailRow label="Admin ID" value={log.admin_id || 'SYSTEM'} mono />
                    <DetailRow label="Subject" value={log.subject || 'N/A'} />
                    <DetailRow label="Recipient" value={log.recipient || log.target_email || 'N/A'} />
                    <DetailRow label="Message" value={log.message || 'No additional details'} fullWidth />
                    
                    {log.metadata && (
                        <div className="mt-4 pt-4 border-t border-divider/5">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-dim mb-3">Metadata</p>
                            <pre className="bg-black/30 p-4 rounded-lg text-xs text-green-400 font-mono overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-divider/5 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    );
}

function DetailRow({ label, value, icon, mono, fullWidth }) {
    return (
        <div className={`${fullWidth ? 'col-span-2' : ''}`}>
            <p className="text-[10px] uppercase font-bold tracking-widest text-dim mb-2 flex items-center gap-2">
                {icon}
                {label}
            </p>
            <p className={`text-sm text-foreground ${mono ? 'font-mono bg-black/20 px-3 py-2 rounded-lg' : ''}`}>
                {value}
            </p>
        </div>
    );
}
