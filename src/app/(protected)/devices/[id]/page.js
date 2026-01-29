'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/UI/Card';
import deviceService from '@/services/deviceService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Cpu, Activity } from 'lucide-react';

export default function DeviceDetail({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const router = useRouter();

    const [device, setDevice] = useState(null);
    const [telemetry, setTelemetry] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const devices = await deviceService.getDevices();
                const found = devices.find(d => d._id === id || d.id === id);
                setDevice(found);

                const history = await deviceService.getDeviceTelemetry(id);
                const chartData = history.map(item => {
                    const dataPoints = item.value || {};
                    const val = Object.values(dataPoints).find(v => typeof v === 'number');
                    return {
                        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        value: val || 0,
                        ...dataPoints
                    };
                }).reverse();

                setTelemetry(chartData);
            } catch (err) {
                console.error("Error loading device details", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading device data...</div>;
    if (!device) return <div className="p-10 text-center text-red-400">Device not found.</div>;

    return (
        <div className="animate-fadeInUp space-y-6">
            {/* Header */}
            <div className="detail-header">
                <button onClick={() => router.back()} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <div className="detail-header-content">
                    <h2 className="detail-title">
                        <Cpu className="text-blue-400" />
                        {device.name}
                    </h2>
                    <p className="detail-subtitle">ID: {id}</p>
                </div>
                <div className={`status-badge ${device.status}`}>
                    {device.status}
                </div>
            </div>

            {/* Chart Section */}
            <Card>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Activity className="text-purple-400" size={18} />
                    Telemetry History
                </h3>

                <div className="chart-wrapper">
                    {telemetry.length === 0 ? (
                        <div className="chart-empty">
                            No telemetry data available.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={telemetry}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#1e293b', stroke: '#6366f1', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#818cf8' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>

            {/* Raw Data Preview */}
            <Card>
                <h3 className="section-header">Latest Payload</h3>
                <pre className="code-block">
                    {telemetry.length > 0
                        ? JSON.stringify(telemetry[telemetry.length - 1], null, 2)
                        : '{}'}
                </pre>
            </Card>
        </div>
    );
}
