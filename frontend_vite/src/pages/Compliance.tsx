// Pharma Cold Track - Compliance Page
// Regulatory compliance reporting, audit logs, and documentation

import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Archive,
  PenTool,
  Key,
  Hash,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart2,
  TrendingUp,
  Award,
  BadgeCheck,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { UserRole } from '../types';
import type { ComplianceReport, AuditLog } from '../types';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const reportTypeConfig = {
  DAILY_SUMMARY: { label: 'Daily Summary', icon: <Calendar className="w-3.5 h-3.5" />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  WEEKLY_SUMMARY: { label: 'Weekly Summary', icon: <BarChart2 className="w-3.5 h-3.5" />, color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  MONTHLY_SUMMARY: { label: 'Monthly Summary', icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  EXCURSION_REPORT: { label: 'Excursion Report', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  REGULATORY_SUBMISSION: { label: 'Regulatory Submission', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  CUSTOM: { label: 'Custom Report', icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-white/5 text-slate-400 border-white/10' },
};

const statusConfig = {
  DRAFT: { bg: 'bg-white/5', text: 'text-slate-400', border: 'border-white/10', label: 'Draft' },
  GENERATED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Generated' },
  SIGNED: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', label: 'Signed' },
  SUBMITTED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Submitted' },
  ARCHIVED: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Archived' },
};

const auditActionTypes = [
  'LOGIN', 'LOGOUT', 'VIEW_SHIPMENT', 'EDIT_SHIPMENT', 'CREATE_SHIPMENT',
  'ACKNOWLEDGE_EXCURSION', 'RESOLVE_EXCURSION', 'GENERATE_REPORT', 'SIGN_REPORT',
  'SUBMIT_REPORT', 'EXPORT_DATA', 'CHANGE_SETTINGS', 'MANAGE_USERS', 'VIEW_AUDIT_LOG'
];

export default function Compliance() {
  const { excursions, shipments, devices, metrics } = useData();
  const { hasPermission, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'audit' | 'certifications' | 'settings'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: subDays(new Date(), 30), to: new Date() });
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleViewReport = (report: ComplianceReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDownloadReport = (report: ComplianceReport) => {
    // Mock download
    const blob = new Blob([`Report: ${report.report_id}\nTitle: ${report.title}\nStatus: ${report.status}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditLogs = () => {
    // Generate CSV content
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'IP Address', 'Outcome', 'Correlation ID'];
    const rows = filteredAuditLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.user_name,
      log.user_role,
      log.action,
      `${log.resource_type}:${log.resource_id}`,
      log.ip_address,
      log.outcome,
      log.correlation_id
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mock compliance reports
  const mockReports: ComplianceReport[] = useMemo(() => [
    {
      report_id: 'RPT-2024-001',
      report_type: 'MONTHLY_SUMMARY',
      title: 'Monthly Compliance Summary - January 2024',
      description: 'Complete overview of cold chain operations, excursions, and regulatory compliance metrics',
      generated_by: 'QA-Manager',
      generated_at: Date.now() - 86400000 * 2,
      period_start: Date.now() - 86400000 * 32,
      period_end: Date.now() - 86400000 * 1,
      status: 'SUBMITTED',
      shipment_ids: shipments.map(s => s.shipment_id),
      excursion_ids: excursions.map(e => e.excursion_id),
      s3_key: 'reports/monthly/2024-01-compliance-summary.pdf',
      file_size: 2457600,
      checksum: 'sha256:a1b2c3d4e5f6...',
      digital_signature: 'sig_abc123...',
      signed_by: 'Quality Director',
      signed_at: Date.now() - 86400000,
    },
    {
      report_id: 'RPT-2024-002',
      report_type: 'EXCURSION_REPORT',
      title: 'S1 Critical Excursion Report - VEH-003',
      description: 'Detailed investigation report for temperature excursion on shipment SHP-045',
      generated_by: 'QA-Manager',
      generated_at: Date.now() - 86400000 * 5,
      period_start: Date.now() - 86400000 * 7,
      period_end: Date.now() - 86400000 * 5,
      status: 'SIGNED',
      shipment_ids: ['SHP-045'],
      excursion_ids: ['EXC-0001'],
      s3_key: 'reports/excursions/EXC-0001-report.pdf',
      file_size: 1024000,
      checksum: 'sha256:f6e5d4c3b2a1...',
      digital_signature: 'sig_def456...',
      signed_by: 'Quality Director',
      signed_at: Date.now() - 86400000 * 3,
    },
    {
      report_id: 'RPT-2024-003',
      report_type: 'WEEKLY_SUMMARY',
      title: 'Weekly Operations Summary - Week 3',
      description: 'Weekly fleet performance, compliance metrics, and trend analysis',
      generated_by: 'Operations Manager',
      generated_at: Date.now() - 86400000,
      period_start: Date.now() - 86400000 * 7,
      period_end: Date.now() - 86400000 * 1,
      status: 'GENERATED',
      shipment_ids: shipments.slice(0, 5).map(s => s.shipment_id),
      excursion_ids: excursions.slice(0, 3).map(e => e.excursion_id),
      s3_key: 'reports/weekly/2024-week-03-summary.pdf',
      file_size: 1536000,
      checksum: 'sha256:998877665544...',
    },
    {
      report_id: 'RPT-2024-004',
      report_type: 'DAILY_SUMMARY',
      title: 'Daily Operations Report',
      description: 'End-of-day operational summary with real-time metrics',
      generated_by: 'System Auto-Generation',
      generated_at: Date.now() - 3600000,
      period_start: Date.now() - 86400000,
      period_end: Date.now(),
      status: 'DRAFT',
      shipment_ids: [],
      excursion_ids: [],
      s3_key: 'reports/daily/2024-01-15-daily-summary.pdf',
      file_size: 512000,
      checksum: 'sha256:112233445566...',
    },
  ], [shipments, excursions]);

  // Mock audit logs
  const mockAuditLogs: AuditLog[] = useMemo(() => {
    const actions = auditActionTypes;
    const users = ['QA-Manager', 'Operations Manager', 'Driver-001', 'Driver-002', 'System Auto-Generation', 'Compliance Auditor'];
    return Array.from({ length: 50 }, (_, i) => ({
      log_id: `AUD-${String(Date.now() - i * 3600000).slice(-8)}`,
      timestamp: Date.now() - i * 3600000 * Math.random(),
      user_id: `USR-${String(i % 6 + 1).padStart(3, '0')}`,
      user_name: users[i % users.length],
      user_role: Object.values(UserRole)[i % Object.values(UserRole).length],
      action: actions[i % actions.length],
      resource_type: ['SHIPMENT', 'EXCURSION', 'REPORT', 'DEVICE', 'USER', 'SETTINGS'][i % 6],
      resource_id: `RES-${String(i % 20 + 1).padStart(3, '0')}`,
      details: { description: `Action performed on resource RES-${String(i % 20 + 1).padStart(3, '0')}` },
      ip_address: `192.168.1.${i % 255}`,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      outcome: ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILURE'][i % 4] as any,
      correlation_id: `CORR-${String(i).padStart(6, '0')}`,
    }));
  }, []);

  const filteredReports = useMemo(() => {
    return mockReports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.report_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.generated_by.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = reportTypeFilter === 'all' || r.report_type === reportTypeFilter;
      const matchesStatus = reportStatusFilter === 'all' || r.status === reportStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [mockReports, searchQuery, reportTypeFilter, reportStatusFilter]);

  const filteredAuditLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      const matchesSearch = log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = auditActionFilter === 'all' || log.action === auditActionFilter;
      return matchesSearch && matchesAction;
    });
  }, [mockAuditLogs, searchQuery, auditActionFilter]);

  const complianceTrendData = {
    labels: Array.from({ length: 12 }, (_, i) => format(subDays(new Date(), 11 - i), 'MMM')),
    datasets: [{
      label: 'Compliance Rate (%)',
      data: [99.1, 99.3, 99.0, 99.5, 99.2, 99.6, 99.4, 99.7, 99.3, 99.5, 99.6, metrics?.compliance_rate || 99.5],
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20, 184, 166, 0.08)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
    }],
  };

  const excursionTrendData = {
    labels: Array.from({ length: 12 }, (_, i) => format(subDays(new Date(), 11 - i), 'MMM')),
    datasets: [
      {
        label: 'S1 Critical',
        data: [2, 1, 3, 0, 1, 2, 0, 1, 0, 1, 0, excursions.filter(e => e.severity === 'S1_CRITICAL').length],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        borderWidth: 2,
        pointRadius: 2,
      },
      {
        label: 'S2 High',
        data: [5, 4, 6, 3, 4, 5, 2, 3, 4, 3, 2, excursions.filter(e => e.severity === 'S2_HIGH').length],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: false,
        borderWidth: 2,
        pointRadius: 2,
      },
      {
        label: 'S3 Moderate',
        data: [8, 7, 9, 6, 8, 7, 5, 6, 7, 5, 6, excursions.filter(e => e.severity === 'S3_MODERATE').length],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        borderWidth: 2,
        pointRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#64748b', font: { size: 11 }, usePointStyle: true, padding: 14 } },
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
      y: { beginAtZero: false, grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#475569', font: { size: 10 } }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 10 } }, border: { display: false } },
    },
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f1419] p-5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Compliance Center</h1>
            <p className="text-xs text-slate-500">21 CFR Part 11, EU GDP & regulatory validation logs</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {hasPermission([UserRole.ADMIN, UserRole.QUALITY_ASSURANCE, UserRole.COMPLIANCE_AUDITOR]) && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 gradient-brand text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/15 hover:opacity-90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Generate Report
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="border-b border-white/[0.06] px-2">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Compliance tabs">
            {[
              { id: 'reports', label: 'Reports', icon: FileText, count: mockReports.length },
              { id: 'audit', label: 'Audit Logs', icon: Shield, count: mockAuditLogs.length },
              { id: 'certifications', label: 'Certifications', icon: Award, count: 6 },
              { id: 'settings', label: 'Settings', icon: Settings, count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && (
                  <span className={clsx(
                    'px-2 py-0.5 text-[10px] font-semibold rounded-full',
                    activeTab === tab.id ? 'bg-teal-500/20 text-teal-300' : 'bg-white/5 text-slate-500'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-5 space-y-5">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  Compliance Rate Trend (12 Months)
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">GxP target: &gt; 99.0% threshold</p>
                <div className="h-56"><Line data={complianceTrendData} options={chartOptions} /></div>
              </div>
              <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Excursions by Severity (12 Months)
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">Tracking monthly severity breaches</p>
                <div className="h-56"><Line data={excursionTrendData} options={chartOptions} /></div>
              </div>
            </div>

            {/* Reports Control Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search reports by title, ID, author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40 transition-all"
                />
              </div>
              <select value={reportTypeFilter} onChange={(e) => setReportTypeFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-44">
                <option value="all">All Report Types</option>
                {Object.entries(reportTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-40">
                <option value="all">All Statuses</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Reports Table */}
            <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Report ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Generated By</th>
                      <th className="px-4 py-3">Generated</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredReports.map((report) => {
                      const typeConfig = reportTypeConfig[report.report_type as keyof typeof reportTypeConfig];
                      const status = statusConfig[report.status as keyof typeof statusConfig];

                      return (
                        <tr key={report.report_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{report.report_id}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{report.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{report.description}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border', typeConfig.color)}>
                              {typeConfig.icon}
                              {typeConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                            {format(new Date(report.period_start), 'MMM d')} – {format(new Date(report.period_end), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-400">{report.generated_by}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">{format(new Date(report.generated_at), 'MMM d, HH:mm')}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={clsx('px-2.5 py-1 rounded-lg text-[11px] font-semibold border', status.bg, status.text, status.border)}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => handleViewReport(report)} className="p-1.5 rounded-lg text-slate-600 hover:text-teal-400 hover:bg-teal-500/10 transition-colors" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDownloadReport(report)} className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Download">
                                <Download className="w-4 h-4" />
                              </button>
                              {report.status === 'GENERATED' && hasPermission([UserRole.ADMIN, UserRole.QUALITY_ASSURANCE]) && (
                                <button onClick={() => { setSelectedReport(report); setShowSignModal(true); }} className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Sign">
                                  <PenTool className="w-4 h-4" />
                                </button>
                              )}
                              {report.status === 'SIGNED' && hasPermission([UserRole.ADMIN, UserRole.COMPLIANCE_AUDITOR]) && (
                                <button className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Submit">
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredReports.length === 0 && (
                <div className="p-10 text-center text-xs text-slate-600">No matching reports found</div>
              )}
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search audit trail by user, action, resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40 transition-all"
                />
              </div>
              <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-48">
                <option value="all">All Actions</option>
                {auditActionTypes.map(action => (
                  <option key={action} value={action}>{action.replace('_', ' ')}</option>
                ))}
              </select>
              <button
                onClick={handleExportAuditLogs}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/[0.07] flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" /> Export Trail
              </button>
            </div>

            <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Outcome</th>
                      <th className="px-4 py-3">Correlation ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredAuditLogs.slice(0, 50).map((log) => (
                      <tr key={log.log_id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">{format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}</td>
                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{log.user_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300 rounded-md">
                            {log.user_role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">{log.action.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.resource_type}: {log.resource_id}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.ip_address}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                            log.outcome === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}>
                            {log.outcome}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-[10px] whitespace-nowrap">{log.correlation_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'GDP Compliance', standard: 'EU GDP 2013/C 343/01', status: 'ACTIVE', expiry: '2025-06-15', issuer: 'EMA', scope: 'EU Distribution' },
                { name: 'FDA 21 CFR Part 11', standard: 'Electronic Records & Signatures', status: 'ACTIVE', expiry: '2025-12-31', issuer: 'FDA', scope: 'US Operations' },
                { name: 'ISO 9001:2015', standard: 'Quality Management Systems', status: 'ACTIVE', expiry: '2026-03-20', issuer: 'BSI', scope: 'Global' },
                { name: 'ISO 13485:2016', standard: 'Medical Devices QMS', status: 'ACTIVE', expiry: '2026-03-20', issuer: 'BSI', scope: 'Global' },
                { name: 'GxP Compliance', standard: 'Good Distribution Practice', status: 'ACTIVE', expiry: '2025-09-10', issuer: 'Internal Audit', scope: 'All Operations' },
                { name: 'SOC 2 Type II', standard: 'Security & Availability', status: 'PENDING', expiry: '2025-11-01', issuer: 'AICPA', scope: 'Cloud Infrastructure' },
              ].map(cert => (
                <div key={cert.name} className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-5 hover:border-teal-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{cert.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.standard}</p>
                    </div>
                    <span className={clsx('px-2.5 py-0.5 rounded-md text-[11px] font-semibold border',
                      cert.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}>
                      {cert.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400 py-1 border-b border-white/[0.04]"><span className="text-slate-500">Issuer</span><span className="font-medium text-slate-300">{cert.issuer}</span></div>
                    <div className="flex justify-between text-slate-400 py-1 border-b border-white/[0.04]"><span className="text-slate-500">Scope</span><span className="font-medium text-slate-300">{cert.scope}</span></div>
                    <div className="flex justify-between text-slate-400 py-1"><span className="text-slate-500">Expires</span><span className="font-medium text-slate-300">{cert.expiry}</span></div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.04] flex gap-2">
                    <button className="flex-1 py-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg transition-colors">Certificate</button>
                    <button className="flex-1 py-1.5 text-xs font-semibold text-slate-400 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-lg transition-colors">Audit Trail</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6 max-w-3xl">
            <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6 space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Automatic Reporting Schedule</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Auto-generate daily summaries', desc: 'Trigger compliance digest at end of business day' },
                    { label: 'Auto-generate weekly summaries', desc: 'Synthesize weekly operations report every Monday 00:00 UTC' },
                    { label: 'Auto-generate monthly regulatory pack', desc: 'Compile monthly compliance submission files' },
                  ].map(item => (
                    <label key={item.label} className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors">
                      <div>
                        <p className="text-xs font-medium text-white">{item.label}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-teal-500 rounded bg-white/5 border-white/10 focus:ring-teal-500" defaultChecked />
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data Retention Protocols</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1.5">Temperature Logs Retention</label>
                    <select className="w-full px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white">
                      <option value="7">7 Years (GDP Minimum)</option>
                      <option value="10" selected>10 Years (Recommended)</option>
                      <option value="15">15 Years (Extended)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5">Audit Log Retention</label>
                    <select className="w-full px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white">
                      <option value="7">7 Years</option>
                      <option value="10" selected>10 Years</option>
                      <option value="indefinite">Indefinite (WORM Compliant)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4 flex justify-end gap-2.5">
                <button className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg">Cancel</button>
                <button className="px-4 py-2 gradient-brand text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/15 hover:opacity-90">Save Settings</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1419] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedReport.title}</h3>
                  <p className="text-[11px] font-mono text-slate-500">{selectedReport.report_id}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-[#0a0e17] rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Report Type</span><span className="font-semibold text-white">{selectedReport.report_type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-teal-400">{selectedReport.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Generated By</span><span className="text-slate-300">{selectedReport.generated_by}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Generated At</span><span className="text-slate-300">{format(new Date(selectedReport.generated_at), 'PPpp')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Storage S3 Key</span><span className="font-mono text-teal-400">{selectedReport.s3_key}</span></div>
                {selectedReport.checksum && (
                  <div className="flex justify-between"><span className="text-slate-500">SHA-256 Checksum</span><span className="font-mono text-slate-400">{selectedReport.checksum}</span></div>
                )}
                {selectedReport.digital_signature && (
                  <div className="flex justify-between"><span className="text-slate-500">Digital Signature</span><span className="font-mono text-emerald-400">{selectedReport.digital_signature}</span></div>
                )}
              </div>
              <div>
                <p className="text-slate-400 mb-1 font-semibold">Description & Scope</p>
                <p className="text-slate-300 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">{selectedReport.description}</p>
              </div>
            </div>
            <div className="p-4 bg-[#0a0e17] border-t border-white/[0.06] flex justify-end gap-3">
              <button onClick={() => handleDownloadReport(selectedReport)} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
