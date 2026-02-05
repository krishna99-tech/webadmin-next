import React, { useEffect, useState, useMemo } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import adminService from '@/services/adminService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Users,
  Server,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const GRADIENT_COLORS = {
  blue: ['#3b82f6', '#1d4ed8'],
  green: ['#10b981', '#059669'],
  purple: ['#8b5cf6', '#7c3aed'],
  red: ['#ef4444', '#dc2626'],
};

/* ===============================
   ENHANCED STAT TILE
================================ */
const StatTile = ({ icon: Icon, label, value, accent, trend, trendValue, loading }) => {
  const isPositive = trendValue >= 0;
  
  return (
    <Card className={`analytics-stat group hover:neon-border transition-all cursor-default ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`analytics-stat-icon ${accent} !bg-content2/5 shadow-inner`}>
          <Icon size={22} className="icon-glow" />
        </div>
        {trend && trendValue !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
            isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      <div className="analytics-stat-content mt-4">
        <span className="analytics-stat-label">{label}</span>
        <span className="analytics-stat-value">{loading ? '...' : value?.toLocaleString() || 0}</span>
      </div>
    </Card>
  );
};

/* ===============================
   CUSTOM TOOLTIP
================================ */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-divider/10 rounded-xl p-4 shadow-2xl">
        <p className="text-foreground font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-dim">{entry.name}:</span>
            <span className="font-bold text-foreground">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ===============================
   CHART CONTAINER WRAPPER
================================ */
const ChartContainer = ({ title, icon: Icon, children, actions, loading }) => (
  <Card className="!bg-black/40 !backdrop-blur-2xl border-divider/5 hover:border-divider/10 transition-all">
    <div className="flex items-center justify-between mb-6">
      <h3 className="card-title flex items-center gap-2">
        {Icon && <Icon size={16} className="text-blue-400" />}
        {title}
      </h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    {loading ? (
      <div className="chart-container flex items-center justify-center">
        <div className="text-center">
          <ActivityIcon className="mx-auto mb-4 text-blue-400 animate-pulse icon-glow" size={48} />
          <p className="text-dim italic text-sm">Loading chart data...</p>
        </div>
      </div>
    ) : (
      <div className="chart-container">{children}</div>
    )}
  </Card>
);

/* ===============================
   MAIN ANALYTICS COMPONENT
================================ */
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [chartType, setChartType] = useState('line'); // line or area
  const [showLegend, setShowLegend] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await adminService.getAnalytics();
      setData(analytics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Export analytics data
  const handleExport = () => {
    try {
      const exportData = {
        exported_at: new Date().toISOString(),
        time_range: `${timeRange} days`,
        ...data
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  // Computed metrics
  const metrics = useMemo(() => {
    if (!data) return null;

    const totalUsers = data.current_stats?.total_users || 0;
    const totalDevices = data.current_stats?.total_devices || 0;
    const onlineDevices = data.current_stats?.online_devices || 0;
    const offlineDevices = data.current_stats?.offline_devices || 0;

    // Calculate trends (comparing last value to first value in growth data)
    const userGrowthTrend = data.user_growth?.length >= 2
      ? (((data.user_growth[data.user_growth.length - 1]?.count - data.user_growth[0]?.count) / (data.user_growth[0]?.count || 1)) * 100).toFixed(1)
      : 0;

    const deviceGrowthTrend = data.device_growth?.length >= 2
      ? (((data.device_growth[data.device_growth.length - 1]?.count - data.device_growth[0]?.count) / (data.device_growth[0]?.count || 1)) * 100).toFixed(1)
      : 0;

    const uptime = totalDevices > 0 ? ((onlineDevices / totalDevices) * 100).toFixed(1) : 0;

    return {
      totalUsers,
      totalDevices,
      onlineDevices,
      offlineDevices,
      uptime,
      userGrowthTrend,
      deviceGrowthTrend,
      avgDevicesPerUser: totalUsers > 0 ? (totalDevices / totalUsers).toFixed(1) : 0
    };
  }, [data]);

  const activityData = useMemo(() => {
    if (!data?.activity_by_type) return [];
    return Object.entries(data.activity_by_type).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toUpperCase(),
      value
    }));
  }, [data]);

  // Enhanced growth data with additional calculations
  const enhancedUserGrowth = useMemo(() => {
    if (!data?.user_growth) return [];
    return data.user_growth.map((item, index, arr) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      change: index > 0 ? item.count - arr[index - 1].count : 0
    }));
  }, [data]);

  const enhancedDeviceGrowth = useMemo(() => {
    if (!data?.device_growth) return [];
    return data.device_growth.map((item, index, arr) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      change: index > 0 ? item.count - arr[index - 1].count : 0
    }));
  }, [data]);

  if (loading && !data) {
    return (
      <div className="analytics-loading flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="mx-auto mb-4 text-blue-400 animate-pulse icon-glow" size={64} />
          <p className="text-foreground text-lg font-semibold">Loading analytics...</p>
          <p className="text-dim text-sm mt-2">Gathering system metrics</p>
        </div>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="analytics-error flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center border-red-500/20 bg-red-500/5">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-foreground font-bold text-lg mb-2">Failed to Load Analytics</h3>
          <p className="text-dim text-sm mb-4">Unable to retrieve analytics data. Please try again.</p>
          <Button variant="secondary" onClick={fetchAnalytics}>
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="analytics-page animate-fadeInUp">
      {/* Header */}
      <div className="analytics-header mb-8">
        <div>
          <h2 className="analytics-title flex items-center gap-3">
            <TrendingUp className="icon-glow text-primary" size={28} />
            System Analytics
            {autoRefresh && (
              <span className="flex items-center gap-2 text-xs font-normal text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Auto-Refresh
              </span>
            )}
          </h2>
          <p className="analytics-subtitle">
            Last {timeRange} days performance metrics
            {lastUpdated && (
              <span className="text-dim text-xs ml-3">
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2 items-center bg-content2/5 border border-divider/5 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-dim" />
            <select
              className="bg-transparent border-none outline-none text-sm text-foreground cursor-pointer"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>

          <Button
            variant={autoRefresh ? "secondary" : "outline"}
            className={autoRefresh ? "border-green-500/30 text-green-400 bg-green-500/5" : ""}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap size={16} className={autoRefresh ? "animate-pulse" : ""} />
          </Button>

          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="analytics-stats-grid mb-8">
        <StatTile
          icon={Users}
          label="Total Users"
          value={metrics?.totalUsers}
          accent="blue"
          trend
          trendValue={parseFloat(metrics?.userGrowthTrend)}
          loading={loading}
        />
        <StatTile
          icon={Server}
          label="Total Devices"
          value={metrics?.totalDevices}
          accent="purple"
          trend
          trendValue={parseFloat(metrics?.deviceGrowthTrend)}
          loading={loading}
        />
        <StatTile
          icon={Activity}
          label="Online Devices"
          value={metrics?.onlineDevices}
          accent="green"
          loading={loading}
        />
        <StatTile
          icon={Server}
          label="Offline Devices"
          value={metrics?.offlineDevices}
          accent="red"
          loading={loading}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-divider/5 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim text-xs uppercase font-bold tracking-wider mb-1">System Uptime</p>
              <p className="text-3xl font-bold text-foreground">{metrics?.uptime}%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="border-divider/5 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim text-xs uppercase font-bold tracking-wider mb-1">Avg Devices/User</p>
              <p className="text-3xl font-bold text-foreground">{metrics?.avgDevicesPerUser}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Server size={32} className="text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="border-divider/5 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim text-xs uppercase font-bold tracking-wider mb-1">Activity Events</p>
              <p className="text-3xl font-bold text-foreground">
                {activityData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
              <ActivityIcon size={32} className="text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <Filter size={16} className="text-dim" />
            Chart Options
          </h3>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'secondary' : 'outline'}
              onClick={() => setChartType('line')}
              className="px-3 py-1 text-xs"
            >
              Line
            </Button>
            <Button
              variant={chartType === 'area' ? 'secondary' : 'outline'}
              onClick={() => setChartType('area')}
              className="px-3 py-1 text-xs"
            >
              Area
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setShowLegend(!showLegend)}
          className="px-3 py-1 text-xs"
        >
          {showLegend ? <Eye size={14} /> : <EyeOff size={14} />}
          <span className="ml-2">Legend</span>
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid mb-8">
        {/* User Growth Chart */}
        <ChartContainer
          title={`User Growth (${timeRange} Days)`}
          icon={Users}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={enhancedUserGrowth}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickMargin={10}
                />
                <YAxis stroke="#64748b" fontSize={11} tickMargin={10} />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={enhancedUserGrowth}>
                <defs>
                  <linearGradient id="userAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={11} tickMargin={10} />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#userAreaGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>

        {/* Device Activity Chart */}
        <ChartContainer
          title={`Device Activity (${timeRange} Days)`}
          icon={Server}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enhancedDeviceGrowth}>
              <defs>
                <linearGradient id="deviceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickMargin={10}
              />
              <YAxis stroke="#64748b" fontSize={11} tickMargin={10} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar
                dataKey="count"
                name="Devices"
                fill="url(#deviceGradient)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Activity Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <ChartContainer
          title="Activity Breakdown"
          icon={PieChartIcon}
          loading={loading}
        >
          {activityData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-dim opacity-20" />
                <p className="text-dim italic text-sm">No activity data available</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                >
                  {activityData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      stroke="rgba(0,0,0,0.5)"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Activity List */}
        <Card className="!bg-black/40 !backdrop-blur-2xl border-divider/5">
          <h3 className="card-title flex items-center gap-2 mb-6">
            <ActivityIcon size={16} className="text-blue-400" />
            Activity Summary
          </h3>
          <div className="space-y-3">
            {activityData.length === 0 ? (
              <p className="text-dim italic text-sm text-center py-8">No activity data</p>
            ) : (
              activityData.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-content2/5 rounded-lg border border-divider/5 hover:bg-content2/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground text-sm font-medium">{activity.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground text-lg font-bold">{activity.value.toLocaleString()}</span>
                    <span className="text-dim text-xs">
                      {((activity.value / activityData.reduce((sum, a) => sum + a.value, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* System Health Indicator */}
      <Card className="mt-6 border-divider/5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-green-400" />
            </div>
            <div>
              <h4 className="text-foreground font-semibold">System Status</h4>
              <p className="text-dim text-sm">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm font-bold">HEALTHY</span>
          </div>
        </div>
      </Card>
    </div>
  );
}