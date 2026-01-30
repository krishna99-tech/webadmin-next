'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import {
    Smartphone, Plus, Trash2, Edit2, Activity, Layout,
    Settings, Globe, Shield, Zap, Info, Clock, RefreshCw, Code, ArrowLeft, User
} from 'lucide-react';

/* ===============================
   DEVICE DETAIL PAGE (ADMIN)
================================ */
export default function DeviceDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [device, setDevice] = useState(null);
    const [dashboards, setDashboards] = useState([]);
    const [activeDashboard, setActiveDashboard] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('interface');

    useEffect(() => {
        if (!id) return;
        loadAllData();
    }, [id]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // 1. Get Device Details
            const deviceData = await adminService.getDeviceDetail(id);
            setDevice(deviceData);

            // 2. Get Dashboards for this device
            const dashboardsData = await adminService.getDashboards(id);
            setDashboards(dashboardsData);

            // 3. Get Telemetry
            const telemetryData = await adminService.getDeviceTelemetry(id);
            setTelemetry(telemetryData);

            // 4. If dashboards exist, load widgets for the first one
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

    if (loading) return <div className="p-10 text-center text-dim animate-pulse">Establishing secure link to device...</div>;
    if (!device) return <div className="p-10 text-center text-red-400">Device offline or not found in registry.</div>;

    return (
        <div className="device-detail-page animate-fadeInUp">
            {/* Header */}
            <div className="dashboard-header mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="user-back-btn">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="dashboard-title flex items-center gap-3">
                            <Smartphone size={24} className="text-blue-400" />
                            {device.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono py-0.5 px-1.5 bg-white/5 rounded text-dim">UUID: {device.id || device._id}</span>
                            <span className="text-[10px] font-mono py-0.5 px-1.5 bg-blue-500/10 rounded text-blue-400">USER: {device.user_id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    {device.owner_name && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <User size={14} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tight">{device.owner_name}</span>
                        </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${device.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        {device.status}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 mb-6 border-b border-white/5 px-2">
                {['interface', 'system', 'logs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium capitalize transition-all relative ${activeTab === tab ? 'text-blue-400' : 'text-dim hover:text-white'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    {activeTab === 'interface' && (
                        <Card>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="section-title mb-1">
                                        Interface Builder
                                        {activeDashboard && <span className="text-blue-400 ml-2 text-xs font-mono">[{activeDashboard.name}]</span>}
                                    </h3>
                                    <p className="text-xs text-dim">Manage the physical components of the user interface.</p>
                                </div>
                                <Button variant="primary" className="btn-sm">
                                    <Plus size={14} />
                                    Add Widget
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {widgets.length === 0 ? (
                                    <div className="p-10 text-center border border-dashed border-white/10 rounded-lg text-dim text-xs">
                                        No widgets configured for this device interface.
                                    </div>
                                ) : (
                                    widgets.map((w, idx) => (
                                        <div key={w._id || w.id || idx} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded bg-black/40 ${w.type === 'led' ? 'text-purple-400' : 'text-blue-400'}`}>
                                                    {w.type === 'led' ? <Layout size={18} /> : <Activity size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold">{w.label || w.type}</h4>
                                                    <p className="text-[10px] text-dim font-mono">
                                                        TYPE: {w.type.toUpperCase()} |
                                                        PIN: {w.config?.virtual_pin?.toUpperCase() || 'N/A'} |
                                                        VALUE: {w.value ?? 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-white/10 rounded text-dim transition-colors"><Edit2 size={14} /></button>
                                                <button className="p-1.5 hover:bg-white/10 rounded text-red-400 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <Card>
                                <h3 className="section-title">Device Configuration</h3>
                                <div className="space-y-4">
                                    <pre className="p-4 bg-black/40 rounded text-[11px] font-mono text-blue-300 leading-relaxed overflow-x-auto border border-white/5 shadow-inner">
                                        {`{
  "network": {
    "ip": "192.168.1.104",
    "gateway": "192.168.1.1",
    "ssid": "Tnxt_Lab_2G"
  },
  "firmware": {
    "version": "1.2.4-stable",
    "build_date": "2024-01-15",
    "hash": "b4f2c8d1"
  },
  "provisioning": {
    "status": "active",
    "token_expires": null
  }
}`}
                                    </pre>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" className="btn-sm"><Settings size={14} /> Edit JSON</Button>
                                        <Button variant="primary" className="btn-sm">Push Config</Button>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="section-title">Security & Tokens</h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Device Token (Sensitive)</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-black/30 p-2 rounded text-[10px] font-mono truncate">{device.device_token || 'TOKEN_NOT_ASSIGNED'}</code>
                                            <Button variant="outline" className="btn-sm px-2"><RefreshCw size={12} /></Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <Card className="h-[600px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="section-title mb-0">Device Event Stream</h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">CONNECTED</span>
                                    <Button variant="outline" className="btn-sm px-2" onClick={handleRefreshTelemetry}><RefreshCw size={12} /></Button>
                                    <Button variant="outline" className="btn-sm px-2"><Trash2 size={12} /></Button>
                                </div>
                            </div>
                            <div className="flex-1 bg-black/60 rounded-lg p-4 font-mono text-[10px] text-gray-400 overflow-y-auto space-y-1 shadow-inner border border-white/5">
                                <p><span className="text-gray-600">[{device.last_active ? new Date(device.last_active).toLocaleTimeString() : 'N/A'}]</span> <span className="text-green-500">SYSTEM</span>: Device sync complete.</p>
                                <p><span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-blue-400">ADMIN</span>: Accessing telemetry stream...</p>
                                {telemetry?.timestamp && (
                                    <p><span className="text-gray-600">[{new Date(telemetry.timestamp).toLocaleTimeString()}]</span> <span className="text-purple-400">DATA</span>: Received telemetry: {JSON.stringify(telemetry.data)}</p>
                                )}
                                {!telemetry?.timestamp && (
                                    <p className="text-yellow-500/50 italic py-2">No telemetry events recorded recently.</p>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="section-title">Administrative Context</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] text-dim uppercase tracking-widest font-bold mb-3">Assigned Owner</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                                        {device.owner_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{device.owner_name || 'System / Unassigned'}</p>
                                        <p className="text-[10px] text-dim font-mono">{device.owner_email || 'No email associated'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-dim uppercase font-bold tracking-tighter">Owner UUID</span>
                                <span className="text-[10px] text-dim font-mono bg-white/5 px-2 py-0.5 rounded">{device.user_id}</span>
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-dim uppercase font-bold tracking-tighter">Registration</span>
                                <span className="text-[10px] text-dim font-mono italic">Jan 30 2026</span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="section-title">Telemetry Snapshot</h3>
                        <div className="space-y-4">
                            {telemetry?.data && Object.keys(telemetry.data).length > 0 ? Object.entries(telemetry.data).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-xs text-dim capitalize">{key}</span>
                                    <span className="text-sm font-bold font-mono">{typeof val === 'number' ? val.toFixed(2) : String(val)}</span>
                                </div>
                            )) : (
                                <p className="text-[10px] text-dim italic text-center py-4">Wait for data...</p>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="section-title">Administrator Tools</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start text-xs h-9" onClick={handleRefreshTelemetry}>
                                <RefreshCw size={14} /> Force Sync
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs h-9">
                                <Code size={14} /> View RAW Schema
                            </Button>
                            <div className="pt-4 mt-2 border-t border-white/5">
                                <Button variant="danger" className="w-full justify-start text-xs h-9 bg-red-500/5 hover:bg-red-500/20 text-red-400 border-red-500/20">
                                    <Trash2 size={14} /> Wipe Remote Data
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5">
                        <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                            Remember: Administrative actions are logged for security.
                            Ensure you have owner permission before modifying live device payloads.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="mt-8">
                <h3 className="section-title">Raw Telemetry Dump</h3>
                <pre className="p-4 bg-black/40 rounded text-[10px] font-mono text-green-500 overflow-x-auto">
                    {JSON.stringify(telemetry || { message: "No data" }, null, 2)}
                </pre>
            </Card>
        </div>
    );
}
