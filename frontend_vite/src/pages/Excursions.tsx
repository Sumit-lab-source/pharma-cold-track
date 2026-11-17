// Pharma Cold Track - Excursions Page
// Temperature excursion management with regulatory workflow

import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Thermometer,
  Truck,
  Package,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  History,
  User,
  MessageSquare,
  ExternalLink,
  Flag,
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import type { Excursion, ExcursionStatus, SeverityLevel, RiskAssessment } from '../types';

const severityConfig: Record<SeverityLevel, { bg: string; text: string; border: string; label: string; icon: React.ReactNode }> = {
  S1_CRITICAL: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'S1 Critical', icon: <AlertTriangle className="w-3 h-3" /> },
  S2_HIGH: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'S2 High', icon: <AlertCircle className="w-3 h-3" /> },
  S3_MODERATE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'S3 Moderate', icon: <Thermometer className="w-3 h-3" /> },
  COMPLIANT: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Compliant', icon: <CheckCircle className="w-3 h-3" /> },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Warning', icon: <AlertCircle className="w-3 h-3" /> },
};

const statusConfig: Record<ExcursionStatus, { bg: string; text: string; border: string; label: string; icon: React.ReactNode }> = {
  OPEN: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Open', icon: <AlertCircle className="w-3 h-3" /> },
  INVESTIGATING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Investigating', icon: <Search className="w-3 h-3" /> },
  RESOLVED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Resolved', icon: <CheckCircle className="w-3 h-3" /> },
  CLOSED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Closed', icon: <CheckCircle className="w-3 h-3" /> },
};

const ResolutionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  excursion: Excursion | null;
  onResolve: (excursionId: string, data: any) => void;
  currentUser: string;
}> = ({ isOpen, onClose, excursion, onResolve, currentUser }) => {
  const [formData, setFormData] = useState({
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    disposition: 'RELEASE' as 'RELEASE' | 'QUARANTINE' | 'REPROCESS' | 'DESTROY',
    riskAssessmentNotes: '',
  });

  if (!isOpen || !excursion) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(excursion.excursion_id, { ...formData, userId: currentUser });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1419] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.08] animate-fade-in shadow-2xl">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Resolve Excursion: {excursion.excursion_id}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Severity</p>
                <span className={clsx('font-medium px-2 py-0.5 rounded-md text-[11px] border inline-block mt-1', severityConfig[excursion.severity].bg, severityConfig[excursion.severity].text, severityConfig[excursion.severity].border)}>
                  {severityConfig[excursion.severity].label}
                </span>
              </div>
              <div>
                <p className="text-slate-500">Temp at Breach</p>
                <p className="font-mono font-semibold text-rose-400 mt-1">{excursion.temperature_at_breach.toFixed(1)}°C</p>
              </div>
              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-medium text-slate-300 mt-1">{excursion.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-slate-500">Threshold Breached</p>
                <p className="font-medium text-slate-300 mt-1">{excursion.threshold_breached}°C</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Root Cause Analysis *</label>
              <textarea
                required
                value={formData.rootCause}
                onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-white/[0.08] rounded-xl bg-white/[0.03] text-white text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40"
                placeholder="Describe root cause of temperature deviation..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Corrective Action Taken *</label>
              <textarea
                required
                value={formData.correctiveAction}
                onChange={(e) => setFormData(prev => ({ ...prev, correctiveAction: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-white/[0.08] rounded-xl bg-white/[0.03] text-white text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40"
                placeholder="Describe immediate corrective actions..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Preventive Action *</label>
              <textarea
                required
                value={formData.preventiveAction}
                onChange={(e) => setFormData(prev => ({ ...prev, preventiveAction: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-white/[0.08] rounded-xl bg-white/[0.03] text-white text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40"
                placeholder="Describe preventive measures to avoid recurrence..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Product Disposition *</label>
              <select
                value={formData.disposition}
                onChange={(e) => setFormData(prev => ({ ...prev, disposition: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 border border-white/[0.08] rounded-xl bg-white/[0.03] text-white text-xs focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="RELEASE">Release — Product integrity confirmed</option>
                <option value="QUARANTINE">Quarantine — Further testing required</option>
                <option value="REPROCESS">Reprocess — Product can be reprocessed</option>
                <option value="DESTROY">Destroy — Product compromised</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Risk Assessment Notes</label>
              <textarea
                value={formData.riskAssessmentNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, riskAssessmentNotes: e.target.value }))}
                rows={2}
                className="w-full px-3.5 py-2.5 border border-white/[0.08] rounded-xl bg-white/[0.03] text-white text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40"
                placeholder="MKT calculations, regulatory notifications..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.06]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 gradient-brand text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/15 hover:opacity-90 transition-opacity">
              Resolve Excursion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Excursions() {
  const { excursions, acknowledgeExcursion, resolveExcursion, refreshExcursions } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'start_time', direction: 'desc' });
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const filteredExcursions = useMemo(() => {
    return excursions.filter(e => {
      const matchesSearch = e.excursion_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.shipment_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    }).sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Excursion];
      const bVal = b[sortConfig.key as keyof Excursion];
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [excursions, searchQuery, severityFilter, statusFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleAcknowledge = (excursionId: string) => {
    acknowledgeExcursion(excursionId, user?.user_id || 'unknown');
  };

  const handleResolve = (excursionId: string, data: any) => {
    resolveExcursion(excursionId, data);
    setShowResolutionModal(false);
    setSelectedExcursion(null);
  };

  const handleOpenResolution = (excursion: Excursion) => {
    setSelectedExcursion(excursion);
    setShowResolutionModal(true);
  };

  const stats = useMemo(() => ({
    total: excursions.length,
    open: excursions.filter(e => e.status === 'OPEN').length,
    investigating: excursions.filter(e => e.status === 'INVESTIGATING').length,
    resolved: excursions.filter(e => e.status === 'RESOLVED').length,
    s1: excursions.filter(e => e.severity === 'S1_CRITICAL').length,
    s2: excursions.filter(e => e.severity === 'S2_HIGH').length,
    s3: excursions.filter(e => e.severity === 'S3_MODERATE').length,
  }), [excursions]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Temperature Excursions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and resolve temperature deviations with full regulatory compliance</p>
        </div>
        <button onClick={refreshExcursions} className="px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.07] transition-colors flex items-center gap-2 self-start sm:self-auto">
          <Loader2 className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
        {[
          { label: 'Total', count: stats.total, border: 'border-l-slate-500', text: 'text-white' },
          { label: 'S1 Critical', count: stats.s1, border: 'border-l-rose-500', text: 'text-rose-400' },
          { label: 'S2 High', count: stats.s2, border: 'border-l-amber-500', text: 'text-amber-400' },
          { label: 'S3 Moderate', count: stats.s3, border: 'border-l-blue-500', text: 'text-blue-400' },
          { label: 'Open', count: stats.open, border: 'border-l-rose-500', text: 'text-rose-400' },
          { label: 'Investigating', count: stats.investigating, border: 'border-l-amber-500', text: 'text-amber-400' },
          { label: 'Resolved', count: stats.resolved, border: 'border-l-emerald-500', text: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className={clsx('bg-[#0f1419] rounded-xl border border-white/[0.06] p-4 border-l-2', s.border)}>
            <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
            <p className={clsx('text-2xl font-bold mt-1 tracking-tight', s.text)}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] p-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search excursions by ID, device, shipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40 transition-all"
            />
          </div>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-40">
            <option value="all">All Severities</option>
            <option value="S1_CRITICAL">S1 Critical</option>
            <option value="S2_HIGH">S2 High</option>
            <option value="S3_MODERATE">S3 Moderate</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-40">
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Excursions Table */}
      <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {[
                  { key: 'excursion_id', label: 'Excursion ID' },
                  { key: 'severity', label: 'Severity' },
                  { key: 'device_id', label: 'Device' },
                  { key: 'shipment_id', label: 'Shipment' },
                  { key: 'temperature_at_breach', label: 'Temp at Breach' },
                  { key: 'threshold_breached', label: 'Threshold' },
                  { key: 'duration_minutes', label: 'Duration' },
                  { key: 'status', label: 'Status' },
                  { key: 'start_time', label: 'Started' },
                  { key: 'actions', label: 'Actions' },
                ].map(col => (
                  <th key={col.key} className="px-4 py-3 cursor-pointer hover:text-slate-300 whitespace-nowrap" onClick={() => handleSort(col.key)}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortConfig.key === col.key && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredExcursions.map((excursion) => {
                const severity = severityConfig[excursion.severity];
                const status = statusConfig[excursion.status];
                const isActionable = excursion.status === 'OPEN' || excursion.status === 'INVESTIGATING';
                const severityBorder = excursion.severity === 'S1_CRITICAL' ? 'border-l-rose-500' : excursion.severity === 'S2_HIGH' ? 'border-l-amber-500' : 'border-l-blue-500';

                return (
                  <tr key={excursion.excursion_id} className={clsx('hover:bg-white/[0.02] transition-colors border-l-2', severityBorder)}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-white font-mono">{excursion.excursion_id}</p>
                      <p className="text-[10px] text-slate-600">
                        {excursion.risk_assessment?.disposition ? `Disp: ${excursion.risk_assessment.disposition}` : 'Pending disposition'}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border', severity.bg, severity.text, severity.border)}>
                        {severity.icon}
                        {severity.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-slate-400">
                        <Truck className="w-3.5 h-3.5 text-slate-600" />
                        <span>{excursion.device_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-400">
                      {excursion.shipment_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {excursion.temperature_at_breach.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono">
                      {excursion.threshold_breached}°C
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      <Clock className="w-3 h-3 inline mr-1 text-slate-600" /> {excursion.duration_minutes}m
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border', status.bg, status.text, status.border)}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {format(new Date(excursion.start_time), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setSelectedExcursion(excursion)} className="p-1.5 rounded-lg text-slate-600 hover:text-teal-400 hover:bg-teal-500/10 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {isActionable && excursion.status === 'OPEN' && (
                          <button onClick={() => handleAcknowledge(excursion.excursion_id)} className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Acknowledge">
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                        {isActionable && (
                          <button onClick={() => handleOpenResolution(excursion)} className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Resolve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setSelectedExcursion(excursion)} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors" title="History">
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredExcursions.length === 0 && (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-semibold text-white">No excursions found</h3>
            <p className="text-xs text-slate-600 mt-1">All systems operating within parameters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExcursion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1419] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.08] animate-fade-in shadow-2xl">
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Excursion: {selectedExcursion.excursion_id}</h2>
              <button onClick={() => setSelectedExcursion(null)} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={clsx('p-3.5 rounded-xl border', severityConfig[selectedExcursion.severity].bg, severityConfig[selectedExcursion.severity].border)}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Severity</p>
                  <p className={clsx('font-semibold text-xs mt-1', severityConfig[selectedExcursion.severity].text)}>
                    {severityConfig[selectedExcursion.severity].label}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border bg-white/[0.02] border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Status</p>
                  <p className="font-semibold text-xs text-white mt-1">{statusConfig[selectedExcursion.status].label}</p>
                </div>
                <div className="p-3.5 rounded-xl border bg-white/[0.02] border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Duration</p>
                  <p className="font-semibold text-xs text-white mt-1">{selectedExcursion.duration_minutes} minutes</p>
                </div>
                <div className="p-3.5 rounded-xl border bg-white/[0.02] border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Started</p>
                  <p className="font-semibold text-xs text-white mt-1">{format(new Date(selectedExcursion.start_time), 'MMM d, HH:mm')}</p>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                <h3 className="text-xs font-semibold text-white mb-3">Temperature Breach Details</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500">Breach Temp</p>
                    <p className="font-mono font-bold text-rose-400 text-lg mt-0.5">{selectedExcursion.temperature_at_breach.toFixed(1)}°C</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Threshold</p>
                    <p className="font-mono font-bold text-white text-lg mt-0.5">{selectedExcursion.threshold_breached}°C</p>
                  </div>
                  <div>
                    <p className="text-slate-500">MKT Calculated</p>
                    <p className="font-mono font-bold text-white text-lg mt-0.5">{selectedExcursion.mkt_calculated?.toFixed(1) || 'N/A'}°C</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Affected Products</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExcursion.affected_products.map((product, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/[0.04] text-slate-300 rounded-lg text-xs border border-white/[0.06]">
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              {selectedExcursion.root_cause && (
                <div className="space-y-3">
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <h3 className="text-xs font-semibold text-white mb-1">Root Cause</h3>
                    <p className="text-xs text-slate-400">{selectedExcursion.root_cause}</p>
                  </div>
                  {selectedExcursion.corrective_action && (
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                      <h3 className="text-xs font-semibold text-white mb-1">Corrective Action</h3>
                      <p className="text-xs text-slate-400">{selectedExcursion.corrective_action}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="border-t border-white/[0.06] pt-4">
                <h3 className="text-xs font-semibold text-white mb-3">Event Timeline</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Breach Detected</p>
                      <p className="text-[10px] text-slate-600">{format(new Date(selectedExcursion.start_time), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                  </div>
                  {selectedExcursion.acknowledged_at && (
                    <div className="flex items-start gap-2.5 ml-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Acknowledged by {selectedExcursion.acknowledged_by}</p>
                        <p className="text-[10px] text-slate-600">{format(new Date(selectedExcursion.acknowledged_at), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    </div>
                  )}
                  {selectedExcursion.resolved_at && (
                    <div className="flex items-start gap-2.5 ml-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Resolved by {selectedExcursion.resolved_by}</p>
                        <p className="text-[10px] text-slate-600">{format(new Date(selectedExcursion.resolved_at), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        excursion={selectedExcursion}
        onResolve={handleResolve}
        currentUser={user?.user_id || 'unknown'}
      />
    </div>
  );
}
