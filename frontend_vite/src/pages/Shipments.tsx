// Pharma Cold Track - Shipments Page (Premium Dark UI)
// Real-time shipment tracking, temperature telemetry, and regulatory log monitoring

import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Eye,
  Edit2,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Map,
  List,
  LayoutGrid,
  ArrowRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import type { Shipment, ShipmentStatus, TemperatureRange } from '../types';

const statusConfig: Record<ShipmentStatus, { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; label: string }> = {
  IN_TRANSIT: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400', icon: <Truck className="w-3.5 h-3.5" />, label: 'In Transit' },
  DELIVERED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Delivered' },
  SCHEDULED: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400', icon: <Clock className="w-3.5 h-3.5" />, label: 'Scheduled' },
  AT_FACILITY: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-400', icon: <MapPin className="w-3.5 h-3.5" />, label: 'At Facility' },
  EXCURSION: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Excursion' },
  CANCELLED: { bg: 'bg-white/5', text: 'text-slate-400', border: 'border-white/10', dot: 'bg-slate-500', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelled' },
};

const tempRangeColors: Record<TemperatureRange, { bg: string; text: string; border: string; label: string }> = {
  REFRIGERATED: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', label: 'Refrigerated (2–8°C)' },
  FROZEN: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Frozen (-25– -15°C)' },
  CONTROLLED_ROOM: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'CRT (15–25°C)' },
};

export default function Shipments() {
  const { shipments, excursions, refreshShipments } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'departure_time', direction: 'desc' });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showShipmentModal, setShowShipmentModal] = useState(false);

  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowShipmentModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshShipments();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = s.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shipment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.origin_facility.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.destination_facility.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesTemp = tempFilter === 'all' || s.temperature_range === tempFilter;
      return matchesSearch && matchesStatus && matchesTemp;
    }).sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Shipment];
      const bVal = b[sortConfig.key as keyof Shipment];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [shipments, searchQuery, statusFilter, tempFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getShipmentExcursions = (shipmentId: string) => {
    return excursions.filter(e => e.shipment_id === shipmentId);
  };

  const getCurrentTemp = (shipment: Shipment) => {
    const baseTemp = shipment.min_temp + (shipment.max_temp - shipment.min_temp) / 2;
    return baseTemp + (Math.sin(shipment.shipment_id.charCodeAt(4) || 1) * 0.8);
  };

  const getTempStatusStyle = (currentTemp: number, minTemp: number, maxTemp: number) => {
    if (currentTemp < minTemp || currentTemp > maxTemp) {
      return { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400 animate-pulse' };
    }
    if (currentTemp < minTemp + 0.5 || currentTemp > maxTemp - 0.5) {
      return { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' };
    }
    return { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' };
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f1419] p-5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Shipment Management</h1>
            <p className="text-xs text-slate-500">Real-time GxP cold chain monitor & tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={handleRefresh} className="px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.07] transition-colors flex items-center gap-2">
            <RefreshCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            Refresh
          </button>
          <button className="px-4 py-2 gradient-brand text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/15 hover:opacity-90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Shipment
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'Total', count: shipments.length, border: 'border-t-slate-500', text: 'text-white' },
          { key: 'IN_TRANSIT', label: 'In Transit', count: shipments.filter(s => s.status === 'IN_TRANSIT').length, border: 'border-t-blue-500', text: 'text-blue-400' },
          { key: 'AT_FACILITY', label: 'At Facility', count: shipments.filter(s => s.status === 'AT_FACILITY').length, border: 'border-t-indigo-500', text: 'text-indigo-400' },
          { key: 'DELIVERED', label: 'Delivered', count: shipments.filter(s => s.status === 'DELIVERED').length, border: 'border-t-emerald-500', text: 'text-emerald-400' },
          { key: 'EXCURSION', label: 'Excursions', count: shipments.filter(s => s.status === 'EXCURSION').length, border: 'border-t-rose-500', text: 'text-rose-400' },
          { key: 'SCHEDULED', label: 'Scheduled', count: shipments.filter(s => s.status === 'SCHEDULED').length, border: 'border-t-amber-500', text: 'text-amber-400' },
        ].map(stat => (
          <div
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={clsx(
              'bg-[#0f1419] rounded-xl border border-white/[0.06] p-4 border-t-2 cursor-pointer transition-all hover:bg-white/[0.02]',
              stat.border,
              statusFilter === stat.key && 'ring-1 ring-teal-500/30 bg-teal-500/5'
            )}
          >
            <p className="text-[11px] font-medium text-slate-500 truncate">{stat.label}</p>
            <p className={clsx('text-2xl font-bold mt-1 tracking-tight', stat.text)}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] p-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search by ref, product, customer, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40 transition-all"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-40">
              <option value="all">All Statuses</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={tempFilter} onChange={(e) => setTempFilter(e.target.value)} className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-xs font-medium text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-48">
              <option value="all">All Temp Ranges</option>
              <option value="REFRIGERATED">Refrigerated (2–8°C)</option>
              <option value="FROZEN">Frozen (-25– -15°C)</option>
              <option value="CONTROLLED_ROOM">Controlled Room (15–25°C)</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg self-end sm:self-auto">
            <button onClick={() => setViewMode('table')} className={clsx('p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5', viewMode === 'table' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-white')}>
              <List className="w-4 h-4" /><span className="hidden md:inline">Table</span>
            </button>
            <button onClick={() => setViewMode('cards')} className={clsx('p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5', viewMode === 'cards' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-white')}>
              <LayoutGrid className="w-4 h-4" /><span className="hidden md:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shipments Data */}
      <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-slate-300" onClick={() => handleSort('reference_number')}>
                    <div className="flex items-center gap-1.5"><span>Reference</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-slate-300" onClick={() => handleSort('product_name')}>
                    <div className="flex items-center gap-1.5"><span>Product</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Route</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Temp Range</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Current Temp</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-slate-300" onClick={() => handleSort('departure_time')}>
                    <div className="flex items-center gap-1.5"><span>Departure</span><ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap">ETA</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filteredShipments.map((shipment) => {
                  const shipmentExcursions = getShipmentExcursions(shipment.shipment_id);
                  const activeExcursions = shipmentExcursions.filter(e => e.status === 'OPEN' || e.status === 'INVESTIGATING');
                  const currentTemp = getCurrentTemp(shipment);
                  const config = statusConfig[shipment.status];
                  const tempRangeConfig = tempRangeColors[shipment.temperature_range];
                  const tempStyle = getTempStatusStyle(currentTemp, shipment.min_temp, shipment.max_temp);

                  return (
                    <tr key={shipment.shipment_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-white">{shipment.reference_number}</p>
                        <span className="font-mono text-[10px] text-slate-600">{shipment.shipment_id}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-slate-300">{shipment.product_name}</p>
                        <span className="text-[10px] font-mono text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04] inline-block mt-0.5">
                          Batch: {shipment.batch_numbers[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">{shipment.customer_name}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                          <span className="font-medium">{shipment.origin_facility.city}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="font-medium">{shipment.destination_facility.city}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border', tempRangeConfig.bg, tempRangeConfig.text, tempRangeConfig.border)}>
                          {shipment.temperature_range.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs', tempStyle.badge)}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', tempStyle.dot)} />
                          <span>{currentTemp.toFixed(1)}°C</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border', config.bg, config.text, config.border)}>
                            <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
                            {config.label}
                          </span>
                          {activeExcursions.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
                              <ShieldAlert className="w-3 h-3" />
                              {activeExcursions.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">{format(new Date(shipment.departure_time), 'MMM d, HH:mm')}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">{format(new Date(shipment.estimated_arrival), 'MMM d, HH:mm')}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleViewShipment(shipment)} className="p-1.5 rounded-lg text-slate-600 hover:text-teal-400 hover:bg-teal-500/10 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleViewShipment(shipment)} className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleViewShipment(shipment)} className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Track"><Map className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShipments.map((shipment) => {
                const shipmentExcursions = getShipmentExcursions(shipment.shipment_id);
                const activeExcursions = shipmentExcursions.filter(e => e.status === 'OPEN' || e.status === 'INVESTIGATING');
                const currentTemp = getCurrentTemp(shipment);
                const config = statusConfig[shipment.status];
                const tempRangeConfig = tempRangeColors[shipment.temperature_range];
                const tempStyle = getTempStatusStyle(currentTemp, shipment.min_temp, shipment.max_temp);

                return (
                  <div key={shipment.shipment_id} className="bg-[#0a0e17] border border-white/[0.06] rounded-xl p-5 hover:border-teal-500/30 card-hover transition-all">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-white text-sm">{shipment.reference_number}</h3>
                        <p className="text-[10px] font-mono text-slate-600">{shipment.shipment_id}</p>
                      </div>
                      <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border', config.bg, config.text, config.border)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
                        {config.label}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'Product', value: shipment.product_name },
                        { label: 'Customer', value: shipment.customer_name },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                          <span className="text-slate-500">{row.label}</span>
                          <span className="font-medium text-slate-300">{row.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                        <span className="text-slate-500">Route</span>
                        <div className="flex items-center gap-1 text-slate-300 font-medium">
                          <span>{shipment.origin_facility.city}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span>{shipment.destination_facility.city}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                        <span className="text-slate-500">Temp</span>
                        <div className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-mono font-bold text-xs', tempStyle.badge)}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', tempStyle.dot)} />
                          <span>{currentTemp.toFixed(1)}°C</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-slate-500">Departure / ETA</span>
                        <span className="font-medium text-slate-400">
                          {format(new Date(shipment.departure_time), 'MMM d')} → {format(new Date(shipment.estimated_arrival), 'MMM d')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                      <button onClick={() => handleViewShipment(shipment)} className="flex-1 py-1.5 px-3 text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg transition-colors text-center">
                        View Details
                      </button>
                      <button onClick={() => handleViewShipment(shipment)} className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-400 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-lg transition-colors text-center">
                        Route Map
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredShipments.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-semibold text-white">No matching shipments</h3>
            <p className="text-xs text-slate-600 mt-1">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>

      {/* Shipment Details Modal */}
      {showShipmentModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1419] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white">Shipment Details: {selectedShipment.reference_number}</h3>
              <button onClick={() => setShowShipmentModal(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-[#0a0e17] rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="text-white font-mono">{selectedShipment.shipment_id}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="text-white">{selectedShipment.product_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-emerald-400">{selectedShipment.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Origin</span><span className="text-white">{selectedShipment.origin_facility.city}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Destination</span><span className="text-white">{selectedShipment.destination_facility.city}</span></div>
              </div>
            </div>
            <div className="p-4 bg-[#0a0e17] border-t border-white/[0.06] flex justify-end gap-3">
              <button onClick={() => setShowShipmentModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
