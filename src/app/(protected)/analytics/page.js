'use client';


import React, { useEffect, useState } from 'react';
import Card from '@/components/UI/Card';
import adminService from '@/services/adminService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Users, Server, Activity } from 'lucide-react';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899'
];

/* ===============================
   STAT TILE
================================ */
const StatTile = ({ icon: Icon, label, value, accent }) => (
  <Card className="analytics-stat">
    <div className={`analytics-stat-icon ${accent}`}>
      <Icon size={22} />
    </div>
    <div className="analytics-stat-content">
      <span className="analytics-stat-label">{label}</span>
      <span className="analytics-stat-value">{value}</span>
    </div>
  </Card>
);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await adminService.getAnalytics();
        setData(analytics);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        Loading analytics…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-error">
        Failed to load analytics.
      </div>
    );
  }

  const activityData = Object.entries(data.activity_by_type || {}).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="analytics-page animate-fadeInUp">
      {/* Header */}
      <div className="analytics-header">
        <h2 className="analytics-title">
          <TrendingUp />
          System Analytics
        </h2>
        <p className="analytics-subtitle">
          Last 30 days performance metrics
        </p>
      </div>

      {/* Stats */}
      <div className="analytics-stats-grid">
        <StatTile
          icon={Users}
          label="Total Users"
          value={data.current_stats.total_users}
          accent="blue"
        />
        <StatTile
          icon={Server}
          label="Total Devices"
          value={data.current_stats.total_devices}
          accent="purple"
        />
        <StatTile
          icon={Activity}
          label="Online Devices"
          value={data.current_stats.online_devices}
          accent="green"
        />
        <StatTile
          icon={Server}
          label="Offline Devices"
          value={data.current_stats.offline_devices}
          accent="red"
        />
      </div>

      {/* Charts */}
      <div className="analytics-charts-grid">
        {/* User Growth */}
        <Card>
          <h3 className="card-title">User Growth (30 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.user_growth}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: 8
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Device Activity */}
        <Card>
          <h3 className="card-title">Device Activity (30 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.device_growth}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: 8
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card>
        <h3 className="card-title">Activity Breakdown</h3>

        <div className="chart-container center">
          {activityData.length === 0 ? (
            <p className="analytics-empty">No activity data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {activityData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: 8
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
