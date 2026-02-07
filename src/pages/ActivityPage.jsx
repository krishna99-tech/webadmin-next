import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Button, 
    Input, 
    Select, 
    SelectItem, 
    Chip, 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell,
    Pagination,
    Divider,
} from '@heroui/react';
import adminService from '../services/adminService';
import useWebSocket from '../hooks/useWebSocket';
import {
    History,
    Download,
    Search,
    RefreshCw,
    Clock,
    Filter,
    LayoutGrid,
    Table as TableIcon
} from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import PageShell from '../components/Layout/PageShell';

export default function ActivityPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isStreaming, setIsStreaming] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [viewMode, setViewMode] = useState('timeline');
    
    const { lastMessage, connected } = useWebSocket();

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getActivity(dateRange.start ? { start_date: dateRange.start, end_date: dateRange.end } : {});
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        if (connected && lastMessage && isStreaming && lastMessage.data) {
            if (lastMessage.type === 'admin_log' || lastMessage.type === 'activity') {
                setLogs(prev => {
                    const exists = prev.some(log => (log && (log.id || log._id)) === (lastMessage.data.id || lastMessage.data._id));
                    if (exists) return prev;
                    return [lastMessage.data, ...prev].slice(0, 2000);
                });
            }
        }
    }, [lastMessage, connected, isStreaming]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = !searchTerm || Object.values(log).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesAction = filterAction === 'all' || log.action === filterAction;
            return matchesSearch && matchesAction;
        });
    }, [logs, searchTerm, filterAction]);

    const items = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredLogs.slice(start, end);
    }, [currentPage, filteredLogs, rowsPerPage]);

    const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

    const uniqueActions = useMemo(() => ['all', ...new Set(logs.map(l => l.action).filter(Boolean))], [logs]);

    const handleExport = () => {
        const csv = [['ID', 'Admin', 'Action', 'Message', 'Timestamp'], ...filteredLogs.map(l => [l.id||l._id, l.admin_id, l.action, l.message||'', l.timestamp])].map(r => r.join(',').replace('\n', ' ')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
    };

    return (
        <PageShell gap="2rem" paddingBottom="5rem">
            <PageHeader
                icon={History}
                title="Audit Chronology"
                subtitle="Secure, chronological ledger of all administrative vectors and platform mutations."
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="flat" 
                            onPress={handleExport}
                            startContent={<Download size={16} />}
                            style={{ height: '2.75rem', borderRadius: 'var(--radius-lg)', fontWeight: 600, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}
                        >
                            Export Audit
                        </Button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)', borderRadius: '0.75rem' }}>
                            <div className="status-dot" style={{ background: connected ? 'var(--success)' : 'var(--danger)' }} />
                            <span className="text-tactical" style={{ fontSize: '9px', color: 'var(--text-main)' }}>{connected ? 'Live Sync' : 'Static'}</span>
                        </div>
                    </div>
                }
            />

            {/* Management Portal */}
            <div className="elite-card">
                <div className="elite-card-body" style={{ padding: 0 }}>
                    {/* Toolbar */}
                    <div className="p-4 border-b border-[var(--border-dim)] flex flex-wrap items-center gap-4 bg-white/[0.01]">
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <Input
                                placeholder="Search audit trails..."
                                startContent={<Search size={16} className="text-muted" />}
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                                variant="bordered"
                                classNames={{
                                    inputWrapper: "h-11 border-white/[0.08] focus-within:border-blue-500/50 bg-white/[0.02] rounded-xl",
                                    input: "text-sm",
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Select 
                                size="sm"
                                selectedKeys={[filterAction]}
                                onSelectionChange={(keys) => setFilterAction(Array.from(keys)[0])}
                                variant="bordered"
                                style={{ width: '11rem' }}
                                startContent={<Filter size={14} className="text-muted" />}
                                classNames={{
                                    trigger: "h-11 border-white/[0.08] bg-white/[0.02] rounded-xl px-3",
                                    value: "text-tactical"
                                }}
                            >
                                {uniqueActions.map(action => (
                                    <SelectItem key={action}>{action.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                                ))}
                            </Select>

                            <div className="flex bg-white/[0.02] p-1 rounded-xl border border-[var(--border-dim)]">
                                <Button 
                                    isIconOnly 
                                    variant="light"
                                    size="sm"
                                    style={{ height: '2rem', width: '2rem', borderRadius: '0.5rem', background: viewMode === 'timeline' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: viewMode === 'timeline' ? 'var(--primary)' : 'var(--text-dim)' }}
                                    onPress={() => setViewMode('timeline')}
                                >
                                    <LayoutGrid size={16} />
                                </Button>
                                <Button 
                                    isIconOnly 
                                    variant="light"
                                    size="sm"
                                    style={{ height: '2rem', width: '2rem', borderRadius: '0.5rem', background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-dim)' }}
                                    onPress={() => setViewMode('table')}
                                >
                                    <TableIcon size={16} />
                                </Button>
                            </div>
                        </div>

                        <div style={{ flex: 1 }} />

                        <Button 
                            isIconOnly 
                            variant="flat" 
                            onPress={fetchLogs}
                            isLoading={loading}
                            style={{ height: '2.75rem', width: '2.75rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)' }}
                        >
                            <RefreshCw size={16} />
                        </Button>
                    </div>

                    {/* View Container */}
                    <div style={{ minHeight: '500px' }}>
                        {viewMode === 'timeline' ? (
                            <div className="p-6 flex flex-col gap-3">
                                {items.length === 0 ? (
                                    <div className="text-tactical" style={{ padding: '8rem', textAlign: 'center', opacity: 0.3 }}>No records identified in this segment.</div>
                                ) : (
                                    items.map((log, i) => (
                                        <div key={log.id||i} className="p-4 px-6 bg-white/[0.01] border border-[var(--border-dim)] rounded-2xl flex items-center justify-between transition-all duration-200 hover-lift">
                                            <div className="flex items-center gap-6">
                                                <div style={{ 
                                                    width: '2.75rem', 
                                                    height: '2.75rem', 
                                                    borderRadius: '0.75rem', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    border: '1px solid var(--border-dim)',
                                                    background: ['delete_user', 'update_security_rules'].includes(log.action) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: ['delete_user', 'update_security_rules'].includes(log.action) ? 'var(--danger)' : 'var(--primary)'
                                                }}>
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>{log.action?.replace(/_/g, ' ')}</span>
                                                        <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.4 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', margin: 0, maxWidth: '40rem' }}>{log.message || log.recipient || 'Administrative action logged successfully.'}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.4, marginBottom: '2px' }}>System Principal</p>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0 }}>{log.admin_id?.slice(-8) || 'SYSTEM'}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <Table 
                                aria-label="Audit Grid"
                                removeWrapper
                                classNames={{
                                    base: "elite-table-container",
                                    table: "min-h-[400px]",
                                    thead: "bg-white/[0.01]",
                                    th: "bg-transparent text-tactical text-[10px] h-14 px-6 border-b border-white/[0.03]",
                                    tbody: "divide-y divide-white/[0.02]",
                                    tr: "elite-table-row",
                                    td: "py-4 px-6"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>TIMESTAMP</TableColumn>
                                    <TableColumn>ACTION</TableColumn>
                                    <TableColumn>PRINCIPAL</TableColumn>
                                    <TableColumn style={{ width: '100%' }}>DETAILS</TableColumn>
                                    <TableColumn align="end">VECTOR_ID</TableColumn>
                                </TableHeader>
                                <TableBody items={items} emptyContent={<div className="text-tactical" style={{ padding: '4rem', opacity: 0.3 }}>No identity records found.</div>}>
                                    {(log, idx) => (
                                        <TableRow key={log.id || log._id || idx}>
                                            <TableCell><span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dim)' }}>{new Date(log.timestamp).toLocaleDateString()}</span></TableCell>
                                            <TableCell>
                                                <Chip size="sm" variant="flat" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '9px', fontWeight: 800, height: '1.25rem', border: 'none' }}>
                                                    {log.action?.replace(/_/g, ' ')}
                                                </Chip>
                                            </TableCell>
                                            <TableCell><span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{log.admin_id?.slice(-6) || 'ROOOT'}</span></TableCell>
                                            <TableCell><span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>{log.message || log.recipient || "—"}</span></TableCell>
                                            <TableCell style={{ textAlign: 'right' }}>
                                                <span className="text-tactical" style={{ fontSize: '9px', opacity: 0.2 }}>0x{Math.floor(Math.random()*100000).toString(16)}</span>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    <div className="p-4 px-6 border-t border-[var(--border-dim)] flex items-center justify-between bg-white/[0.01]">
                        <p className="text-tactical" style={{ fontSize: '9px', opacity: 0.3 }}>
                             Page Cluster {currentPage} of {totalPages || 1}
                        </p>
                        <Pagination
                            total={totalPages || 1}
                            initialPage={1}
                            page={currentPage}
                            onChange={setCurrentPage}
                            variant="flat"
                            size="sm"
                            classNames={{
                                cursor: "bg-blue-600 text-white font-bold h-8 w-8 min-w-8",
                                item: "bg-white/[0.03] text-dim h-8 w-8 min-w-8 text-[11px]"
                            }}
                        />
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
