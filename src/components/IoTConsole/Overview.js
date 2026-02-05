import React from 'react';
import Card from '../UI/Card';
import { Settings, Wifi, Users, AlertTriangle, LineChart as ChartIcon } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function Overview({ devices, users, sensorData, deviceStats }) {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="iot-stat-card border-blue-500/20 bg-blue-500/5">
                    <div>
                        <p className="text-dim text-[10px] uppercase font-bold tracking-widest">Total Devices</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{devices.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10">
                        <Settings className="w-8 h-8 text-blue-400 icon-glow" />
                    </div>
                </Card>
                <Card className="iot-stat-card border-green-500/20 bg-green-500/5">
                    <div>
                        <p className="text-dim text-[10px] uppercase font-bold tracking-widest">Online Devices</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">{devices.filter(d => d.status === 'online').length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10">
                        <Wifi className="w-8 h-8 text-green-400 icon-glow" />
                    </div>
                </Card>
                <Card className="iot-stat-card border-purple-500/20 bg-purple-500/5">
                    <div>
                        <p className="text-dim text-[10px] uppercase font-bold tracking-widest">Total Users</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{users.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10">
                        <Users className="w-8 h-8 text-purple-400 icon-glow" />
                    </div>
                </Card>
                <Card className="iot-stat-card border-yellow-500/20 bg-yellow-500/5">
                    <div>
                        <p className="text-dim text-[10px] uppercase font-bold tracking-widest">Active Alerts</p>
                        <p className="text-3xl font-bold text-yellow-400 mt-1">{devices.filter(d => d.status === 'warning' || d.battery < 20).length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                        <AlertTriangle className="w-8 h-8 text-yellow-400 icon-glow" />
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-divider/5 bg-content2/[0.02] backdrop-blur-md p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <ChartIcon size={18} className="text-blue-400" />
                        Real-time Sensor Data
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="border-divider/5 bg-content2/[0.02] backdrop-blur-md p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Users size={18} className="text-purple-400" />
                        Device Status Distribution
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="border-divider/5 bg-content2/[0.02] backdrop-blur-md p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Critical System Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.filter(d => d.status === 'warning' || d.battery < 20).map(device => (
                        <div key={device.id} className="flex items-center justify-between p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 hover:bg-yellow-500/10 transition-all hover:scale-[1.02]">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-xl bg-yellow-500/10">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{device.name}</p>
                                    <p className="text-[11px] text-dim font-medium">
                                        {device.battery < 20 ? `Critical Battery: ${device.battery}%` : 'Connection Latency Detected'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] text-dim font-mono bg-content2/5 px-2 py-1 rounded-md">{device.last_active ? new Date(device.last_active).toLocaleTimeString() : 'Never'}</span>
                        </div>
                    ))}
                </div>
                {devices.filter(d => d.status === 'warning' || d.battery < 20).length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Wifi className="text-green-500" size={24} />
                        </div>
                        <p className="text-dim italic font-medium">All systems operational. No active alerts.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
