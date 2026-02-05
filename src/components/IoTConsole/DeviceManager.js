import React from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { Plus, Power, Edit, Trash2, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export default function DeviceManager({ devices, onAction, onAddRequest, onEditRequest, onTransferRequest, showTransferButton = false }) {
    const getStatusBadge = (status) => {
        const classes = {
            online: 'status-badge-online',
            offline: 'status-badge-offline',
            warning: 'status-badge-warning'
        };
        return <span className={`status-badge ${classes[status] || 'status-badge-offline'}`}>{status}</span>;
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'online': return <Wifi className="w-4 h-4 text-green-500" />;
            case 'offline': return <WifiOff className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Wifi className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
                <div>
                   <h2 className="text-xl font-bold text-foreground tracking-tight">Device Fleet Management</h2>
                   <p className="text-xs text-dim mt-1">Orchestrate your hardware assets across the edge network.</p>
                </div>
                <Button onClick={onAddRequest} className="btn-glow px-6">
                    <Plus size={18} />
                    Register New Device
                </Button>
            </div>

            <Card className="border-divider/5 bg-content2/[0.02] backdrop-blur-md overflow-hidden rounded-2xl card-hover-glow table-wrapper">
                <div className="overflow-x-auto">
                    <table className="iot-table table-hover">
                        <thead>
                            <tr>
                                <th>Device Name</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Battery</th>
                                <th>Last Pulse</th>
                                <th className="text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map(device => (
                                <tr key={device.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(device.status)}
                                            <span className="font-medium text-foreground">{device.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-dim capitalize">{device.type}</td>
                                    <td>{getStatusBadge(device.status)}</td>
                                    <td className="text-sm text-dim">{device.location}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="battery-bar-container">
                                                <div 
                                                    className={`battery-bar-fill ${device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${device.battery}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] text-dim">{device.battery}%</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-dim font-mono">
                                        {device.last_active ? new Date(device.last_active).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => onAction(device, 'toggle')} 
                                                title="Toggle Power"
                                                className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400 transition-colors btn-press focus-ring"
                                            >
                                                <Power size={16} />
                                            </button>
                                            {showTransferButton && onTransferRequest && (
                                                <button 
                                                    onClick={() => onTransferRequest(device)} 
                                                    title="Transfer Ownership"
                                                    className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400 transition-colors btn-press focus-ring"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onEditRequest(device)} 
                                                title="Edit"
                                                className="p-2 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors btn-press focus-ring"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onAction(device, 'delete')} 
                                                title="Remove"
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors btn-press focus-ring"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {devices.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-dim italic">
                                        No devices registered in your fleet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
