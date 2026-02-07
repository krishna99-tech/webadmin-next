import React from 'react';
import { 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell, 
    Chip, 
    Tooltip, 
    Button,
    Progress
} from '@heroui/react';
import { Power, Edit, Trash2, Wifi, WifiOff, RefreshCw, Cpu } from 'lucide-react';

export default function DeviceManager({ 
    devices, 
    onAction, 
    onEditRequest, 
    onTransferRequest, 
    showTransferButton = false 
}) {
    const columns = [
        { name: "NODE IDENTITY", uid: "name" },
        { name: "SPECIFICATION", uid: "type" },
        { name: "STATUS", uid: "status" },
        { name: "SIGNAL STRENGTH", uid: "battery" },
        { name: "LAST PULSE", uid: "last_pulse" },
        { name: "OPERATIONS", uid: "actions" },
    ];

    const renderCell = React.useCallback((device, columnKey) => {
        const cellValue = device[columnKey];

        switch (columnKey) {
            case "name":
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '2.5rem', 
                            height: '2.5rem', 
                            borderRadius: '0.75rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: device.status === 'online' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: device.status === 'online' ? 'var(--primary)' : 'var(--danger)'
                        }}>
                            <Cpu size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{device.name}</span>
                            <span className="text-tactical" style={{ fontSize: '8px', opacity: 0.4 }}>{device.id?.substring(0, 12).toUpperCase()}</span>
                        </div>
                    </div>
                );
            case "type":
                return <span className="text-tactical" style={{ fontSize: '10px' }}>{device.type || 'Undefined'}</span>;
            case "status":
                const isOnline = device.status === 'online';
                return (
                    <Chip
                        variant="flat"
                        size="sm"
                        style={{ 
                            fontWeight: 700, 
                            height: '1.5rem', 
                            background: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isOnline ? 'var(--success)' : 'var(--danger)',
                            border: 'none'
                        }}
                        startContent={isOnline ? <Wifi size={12} style={{ marginRight: '4px' }} /> : <WifiOff size={12} style={{ marginRight: '4px' }} />}
                    >
                        {isOnline ? 'Active' : 'Offline'}
                    </Chip>
                );
            case "battery":
                const val = device.battery || 0;
                const statusColor = val > 60 ? 'success' : val > 20 ? 'warning' : 'danger';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '100px' }}>
                        <div style={{ flex: 1 }}>
                             <Progress 
                                size="sm" 
                                radius="full" 
                                classNames={{
                                    track: "bg-white/[0.03]",
                                    indicator: `bg-${statusColor}`,
                                }}
                                value={val}
                            />
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 800, width: '24px', color: `var(--${statusColor})` }}>{val}%</span>
                    </div>
                );
            case "last_pulse":
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>
                            {device.last_active ? new Date(device.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                        </p>
                        <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.5, margin: 0 }}>
                            {device.last_active ? new Date(device.last_active).toLocaleDateString() : 'No Pulse'}
                        </p>
                    </div>
                );
            case "actions":
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', padding: '0 0.5rem' }}>
                        <Tooltip content="Quick Power Cycle">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }}
                                className="text-dim"
                                onPress={() => onAction(device, 'toggle')}
                            >
                                <Power size={14} />
                            </Button>
                        </Tooltip>
                        {showTransferButton && (
                            <Tooltip content="Reassign Principal">
                                <Button 
                                    isIconOnly 
                                    size="sm" 
                                    variant="light" 
                                    style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }}
                                    className="text-dim"
                                    onPress={() => onTransferRequest(device)}
                                >
                                    <RefreshCw size={14} />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip content="Modify Identity">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }}
                                className="text-dim"
                                onPress={() => onEditRequest(device)}
                            >
                                <Edit size={14} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Revoke Access" color="danger">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }}
                                className="text-dim hover:text-danger"
                                onPress={() => onAction(device, 'delete')}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [onAction, onEditRequest, onTransferRequest, showTransferButton]);

    return (
        <Table 
            aria-label="Hardware fleet data grid"
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
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn 
                        key={column.uid} 
                        align={column.uid === "actions" ? "end" : "start"}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={devices} emptyContent={<div className="text-tactical" style={{ padding: '4rem', opacity: 0.3 }}>Node registry is currently clear. Deployment awaited.</div>}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
