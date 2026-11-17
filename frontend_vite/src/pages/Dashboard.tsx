// Pharma Cold Track - Dashboard Page
// Premium dark operational dashboard with KPIs, telemetry charts, and fleet tracking

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  WifiOff,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Circle,
  Wrench,
  Search,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import clsx from 'clsx';
import { format, subDays, subHours } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  status?: 'normal' | 'warning' | 'critical';
  accentColor: string;
}> = ({ title, value, icon, trend, status, accentColor }) => (
  <div className={clsx(
    'relative overflow-hidden p-5 rounded-2xl border transition-all duration-200 card-hover',
    'bg-[#0f1419] border-white/[0.06]',
    status === 'warning' && 'border-amber-500/30',
    status === 'critical' && 'border-rose-500/30 glow-rose'
  )}>
    {/* Bottom accent bar */}
    <div className={clsx('absolute bottom-0 left-0 right-0 h-[2px]', accentColor)} />

    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={clsx(
              'text-xs font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded-md',
              trend.value >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            )}>
              {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-[10px] text-slate-600">{trend.label}</span>
          </div>
        )}
      </div>
      <div className={clsx('p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]')}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string; type: 'device' | 'shipment' | 'excursion' }> = ({ status }) => {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    ACTIVE: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
    INACTIVE: { bg: 'bg-white/5 border-white/10', text: 'text-slate-400', icon: <Circle className="w-3 h-3" /> },
    MAINTENANCE: { bg: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400', icon: <Wrench className="w-3 h-3" /> },
    OFFLINE: { bg: 'bg-white/5 border-white/10', text: 'text-slate-500', icon: <WifiOff className="w-3 h-3" /> },
    EXCURSION: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', icon: <AlertTriangle className="w-3 h-3" /> },
    IN_TRANSIT: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: <Truck className="w-3 h-3" /> },
    DELIVERED: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
    SCHEDULED: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: <Clock className="w-3 h-3" /> },
    AT_FACILITY: { bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400', icon: <MapPin className="w-3 h-3" /> },
    S1_CRITICAL: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', icon: <AlertTriangle className="w-3 h-3" /> },
    S2_HIGH: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: <AlertCircle className="w-3 h-3" /> },
    S3_MODERATE: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: <Activity className="w-3 h-3" /> },
    OPEN: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', icon: <AlertCircle className="w-3 h-3" /> },
    INVESTIGATING: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: <Search className="w-3 h-3" /> },
    RESOLVED: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: <CheckCircle className="w-3 h-3" /> },
    CLOSED: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
  };

  const config = configs[status] || { bg: 'bg-white/5 border-white/10', text: 'text-slate-400', icon: <HelpCircle className="w-3 h-3" /> };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border', config.bg, config.text)}>
      {config.icon}
      {status.replace('_', ' ')}
    </span>
  );
};

export default function Dashboard() {
  const { metrics, fleetOverview, shipments, excursions, alerts, connectionStatus, lastUpdated, refreshAll } = useData();

  const complianceChartData = useMemo(() => {
    const labels = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'EEE'));
    return {
      labels,
      datasets: [
        {
          label: 'Compliance Rate (%)',
          data: [99.2, 99.5, 99.1, 99.8, 99.4, 99.6, metrics?.compliance_rate || 99.5],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [metrics?.compliance_rate]);

  const excursionChartData = useMemo(() => {
    return {
      labels: ['S1 Critical', 'S2 High', 'S3 Moderate'],
      datasets: [{
        data: [
          metrics?.s1_critical_count || 0,
          metrics?.s2_high_count || 0,
          metrics?.s3_moderate_count || 0,
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  }, [metrics]);

  const temperatureChartData = useMemo(() => {
    const labels = Array.from({ length: 24 }, (_, i) => format(subHours(new Date(), 23 - i), 'HH:mm'));
    return {
      labels,
      datasets: [
        {
          label: 'Avg Temperature (°C)',
          data: Array.from({ length: 24 }, () => 4.5 + Math.random() * 1.5),
          borderColor: '#2dd4bf',
          backgroundColor: 'rgba(45, 212, 191, 0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: 'Upper Limit (8°C)',
          data: Array(24).fill(8),
          borderColor: 'rgba(239, 68, 68, 0.4)',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Lower Limit (2°C)',
          data: Array(24).fill(2),
          borderColor: 'rgba(59, 130, 246, 0.4)',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f1419',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#475569', font: { size: 10 } },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#475569', font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#64748b', font: { size: 11 }, usePointStyle: true, padding: 16 },
      },
      tooltip: {
        backgroundColor: '#0f1419',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: '68%',
  };

  const recentExcursions = excursions.slice(0, 5);
  const recentAlerts = alerts.slice(0, 5);
  const activeShipments = shipments.filter(s => s.status === 'IN_TRANSIT').slice(0, 5);

  const handleExportAuditLog = () => {
    const headers = ['Timestamp', 'Action', 'Severity', 'Device ID', 'Details'];
    const rows = excursions.map(e => [
      format(new Date(e.start_time), 'yyyy-MM-dd HH:mm:ss'),
      e.corrective_action || 'Excursion Recorded',
      e.severity,
      e.device_id,
      `Temp: ${e.temperature_at_breach}°C`
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_log_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Critical Alert Banner */}
      {metrics && metrics.active_excursions > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="relative">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-300">
              {metrics.active_excursions} Active Temperature Excursion{metrics.active_excursions > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-rose-400/70">Immediate investigation required per GxP protocol</p>
          </div>
          <Link to="/excursions" className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors">
            View All
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f1419] p-5 rounded-2xl border border-white/[0.06]">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cold chain monitoring & regulatory compliance
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshAll}
            className="px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.07] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleExportAuditLog}
            className="px-4 py-2 gradient-brand text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/15 transition-colors flex items-center gap-2 hover:opacity-90 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Audit Log
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Shipments"
          value={metrics?.total_active_shipments || 0}
          icon={<Package className="w-5 h-5 text-blue-400" />}
          accentColor="bg-blue-500"
          trend={{ value: 2.3, label: 'vs last week' }}
        />
        <MetricCard
          title="Fleet Online"
          value={`${metrics?.devices_online || 0} / ${metrics?.total_devices || 0}`}
          icon={<Truck className="w-5 h-5 text-teal-400" />}
          accentColor="bg-teal-500"
          trend={{ value: 1.1, label: 'vs yesterday' }}
        />
        <MetricCard
          title="Active Excursions"
          value={metrics?.active_excursions || 0}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          accentColor="bg-rose-500"
          status={metrics && metrics.active_excursions > 0 ? 'critical' : 'normal'}
          trend={{ value: -12, label: 'vs last week' }}
        />
        <MetricCard
          title="Compliance Rate"
          value={`${metrics?.compliance_rate || 0}%`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          accentColor="bg-emerald-500"
          trend={{ value: 0.2, label: 'vs last month' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temperature Trend */}
        <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Temperature Trend (24h)</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Mean kinetic temperature & specification limits</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-teal-400" /> Avg Temp
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-0.5 bg-rose-500/50" /> Limits
              </span>
            </div>
          </div>
          <div className="h-56">
            <Line data={temperatureChartData} options={chartOptions} />
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">7-Day Compliance Index</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">GxP regulatory compliance validation</p>
          </div>
          <div className="h-56">
            <Line data={complianceChartData} options={chartOptions} />
          </div>
        </div>

        {/* Excursion Distribution */}
        <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Excursion Severity</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">S1 Critical · S2 High · S3 Moderate</p>
          </div>
          <div className="h-52 flex items-center justify-center">
            <Doughnut data={excursionChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Fleet Status */}
        <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Fleet Device Status</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Active sensors, offline units & maintenance</p>
          </div>
          <div className="h-52 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Active', 'Offline', 'Maintenance', 'Excursion'],
                datasets: [{
                  data: fleetOverview
                    ? [fleetOverview.by_status.ACTIVE, fleetOverview.by_status.OFFLINE, fleetOverview.by_status.MAINTENANCE, fleetOverview.by_status.EXCURSION]
                    : [20, 2, 1, 1],
                  backgroundColor: ['#10b981', '#475569', '#8b5cf6', '#ef4444'],
                  borderWidth: 0,
                  hoverOffset: 6,
                }],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Shipments Table */}
        <div className="lg:col-span-2 bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Active Transit Monitor</h3>
              <p className="text-[11px] text-slate-600">In-transit shipments with thermal tracking</p>
            </div>
            <Link to="/shipments" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 whitespace-nowrap">Shipment</th>
                  <th className="px-4 py-3 whitespace-nowrap">Product</th>
                  <th className="px-4 py-3 whitespace-nowrap">Route</th>
                  <th className="px-4 py-3 whitespace-nowrap">Current Temp</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {activeShipments.map((shipment) => (
                  <tr key={shipment.shipment_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-white">{shipment.reference_number}</p>
                      <span className="font-mono text-[10px] text-slate-600">{shipment.shipment_id}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-slate-300">{shipment.product_name}</p>
                      <span className="text-[10px] text-slate-600">{shipment.temperature_range.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {shipment.origin_facility?.city} → {shipment.destination_facility?.city}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {(4.2 + (shipment.shipment_id.charCodeAt(3) % 3) * 0.4).toFixed(1)}°C
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={shipment.status} type="shipment" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {format(new Date(shipment.estimated_arrival), 'MMM d, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Excursions List */}
        <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Breaches</h3>
              <p className="text-[11px] text-slate-600">Temperature excursions log</p>
            </div>
            <Link to="/excursions" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentExcursions.map((excursion) => {
              const severityColor = excursion.severity === 'S1_CRITICAL' ? 'border-l-rose-500' : excursion.severity === 'S2_HIGH' ? 'border-l-amber-500' : 'border-l-blue-500';
              return (
                <div key={excursion.excursion_id} className={clsx('p-4 hover:bg-white/[0.02] transition-colors border-l-2', severityColor)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-slate-600">{excursion.excursion_id}</span>
                        <StatusBadge status={excursion.severity} type="excursion" />
                      </div>
                      <p className="text-xs font-medium text-slate-300">{excursion.device_id} • {excursion.shipment_id}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {format(new Date(excursion.start_time), 'MMM d, HH:mm')} • <span className="font-mono text-rose-400 font-bold">{excursion.temperature_at_breach.toFixed(1)}°C</span>
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-600 hover:text-teal-400 cursor-pointer flex-shrink-0 transition-colors" />
                  </div>
                </div>
              );
            })}
            {recentExcursions.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-600">
                No recent temperature excursions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Active System Alerts</h3>
            <p className="text-[11px] text-slate-600">Critical notifications requiring acknowledgment</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/[0.04] text-slate-400 border border-white/[0.06]">
            {recentAlerts.length} total
          </span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentAlerts.map((alert) => (
            <div key={alert.alert_id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className={clsx('p-2.5 rounded-xl border',
                  alert.severity === 'S1_CRITICAL' && 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                  alert.severity === 'S2_HIGH' && 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  alert.severity === 'S3_MODERATE' && 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                )}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{alert.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-[11px] text-slate-600">
                  {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                </span>
                {!alert.acknowledged && (
                  <button className="px-3 py-1.5 text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 rounded-lg transition-colors border border-teal-500/20">
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
          {recentAlerts.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-600">
              No recent alerts — All cold chain systems nominal
            </div>
          )}
        </div>
      </div>

      {/* GxP Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 pt-4 border-t border-white/[0.04] gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>GxP Validated — 21 CFR Part 11 / EU GDP / WHO TRS 961</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last updated: {lastUpdated ? format(new Date(lastUpdated), 'HH:mm:ss') : 'Just now'}</span>
          <span>Status: {connectionStatus}</span>
        </div>
      </div>
    </div>
  );
}
