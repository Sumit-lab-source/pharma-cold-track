// Pharma Cold Track - Fleet Page
// Dark-themed fleet tracking with map and vehicle details

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Truck,
  MapPin,
  Thermometer,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download,
  RefreshCw,
  Map,
  List,
  Settings,
  Eye,
  Circle,
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { DeviceStatus } from '../types';
import type { Device, GPSLocation } from '../types';
import L from 'leaflet';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const statusColors: Record<DeviceStatus, string> = {
  ACTIVE: '#10b981',
  INACTIVE: '#94a3b8',
  MAINTENANCE: '#8b5cf6',
  OFFLINE: '#ef4444',
  EXCURSION: '#ef4444',
};

const statusIcons: Record<DeviceStatus, React.ReactNode> = {
  ACTIVE: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  INACTIVE: <Circle className="w-4 h-4 text-slate-500" />,
  MAINTENANCE: <Settings className="w-4 h-4 text-violet-400" />,
  OFFLINE: <XCircle className="w-4 h-4 text-rose-400" />,
  EXCURSION: <AlertTriangle className="w-4 h-4 text-rose-400" />,
};

interface FleetMapProps {
  vehicles: any[];
  selectedVehicle: any | null;
  onVehicleClick: (vehicle: any) => void;
}

const FleetMap: React.FC<FleetMapProps> = ({ vehicles, selectedVehicle, onVehicleClick }) => {
  const center: [number, number] = [39.8283, -98.5795];

  return (
    <MapContainer
      center={center}
      zoom={4}
      className="h-[600px] rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => {
        const position: [number, number] = vehicle.current_location
          ? [vehicle.current_location.latitude, vehicle.current_location.longitude]
          : [39.8283, -98.5795];

        const vehicleStatus = vehicle.status as keyof typeof statusColors;

        return (
          <Marker
            key={vehicle.device_id}
            position={position}
            icon={L.divIcon({
              className: clsx('custom-marker', selectedVehicle?.device_id === vehicle.device_id && 'selected'),
              html: `
                <div style="background: ${statusColors[vehicleStatus]}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #0a0e17; box-shadow: 0 2px 12px rgba(0,0,0,0.5);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20L12 16L16 20L24 12"/><circle cx="24" cy="12" r="3"/></svg>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 36],
            })}
            eventHandlers={{
              click: () => onVehicleClick(vehicle),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-semibold text-white">{vehicle.vehicle_id}</h4>
                <p className="text-sm text-slate-400">{vehicle.current_shipment_id || 'No active shipment'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={clsx('px-2 py-0.5 rounded text-xs font-medium',
                    vehicle.temperature_status === 'COMPLIANT' ? 'bg-emerald-500/20 text-emerald-400' :
                    vehicle.temperature_status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                  )}>
                    {vehicle.current_temperature.toFixed(1)}°C
                  </span>
                  <span className="text-xs text-slate-500">{vehicle.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default function Fleet() {
  const { fleetOverview, devices, refreshDevices, connectionStatus, lastUpdated } = useData();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredVehicles = useMemo(() => {
    return fleetOverview?.vehicles.filter(v => {
      const matchesSearch = v.vehicle_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.current_shipment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];
  }, [fleetOverview?.vehicles, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    if (!fleetOverview) return { total: 0, active: 0, offline: 0, excursion: 0, maintenance: 0 };
    return {
      total: fleetOverview.total,
      active: fleetOverview.by_status.ACTIVE || 0,
      offline: fleetOverview.by_status.OFFLINE || 0,
      excursion: fleetOverview.by_status.EXCURSION || 0,
      maintenance: fleetOverview.by_status.MAINTENANCE || 0,
    };
  }, [fleetOverview]);

  const handleVehicleClick = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setViewMode('list');
  };

  const statCards = [
    { label: 'Total', value: stats.total, color: 'border-l-slate-500', textColor: 'text-white' },
    { label: 'Active', value: stats.active, color: 'border-l-emerald-500', textColor: 'text-emerald-400' },
    { label: 'Excursions', value: stats.excursion, color: 'border-l-rose-500', textColor: 'text-rose-400' },
    { label: 'Maintenance', value: stats.maintenance, color: 'border-l-violet-500', textColor: 'text-violet-400' },
    { label: 'Offline', value: stats.offline, color: 'border-l-slate-600', textColor: 'text-slate-400' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Fleet Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time vehicle monitoring & telemetry</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshDevices}
            className="px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.07] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={clsx('bg-[#0f1419] rounded-xl border border-white/[0.06] p-4 border-l-2', s.color)}>
            <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
            <p className={clsx('text-2xl font-bold mt-1 tracking-tight', s.textColor)}>{s.value}</p>
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
              placeholder="Search vehicles, shipments, drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-sm text-slate-300 focus:ring-2 focus:ring-teal-500/40 w-full sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXCURSION">Excursion</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OFFLINE">Offline</option>
          </select>
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('map')}
              className={clsx('p-2 rounded-md transition-colors', viewMode === 'map' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300')}
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {viewMode === 'map' ? (
            <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] overflow-hidden">
              <FleetMap
                vehicles={filteredVehicles}
                selectedVehicle={selectedVehicle}
                onVehicleClick={handleVehicleClick}
              />
            </div>
          ) : (
            <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Shipment</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Temp</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Battery</th>
                      <th className="px-4 py-3">Signal</th>
                      <th className="px-4 py-3">Last Update</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredVehicles.map((vehicle) => (
                      <tr
                        key={vehicle.device_id}
                        className={clsx('hover:bg-white/[0.02] cursor-pointer transition-colors',
                          selectedVehicle?.device_id === vehicle.device_id && 'bg-teal-500/5'
                        )}
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center',
                              vehicle.type === 'TRUCK' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-violet-500/10 border border-violet-500/20'
                            )}>
                              <Truck className={clsx('w-4 h-4',
                                vehicle.type === 'TRUCK' ? 'text-blue-400' : 'text-violet-400'
                              )} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{vehicle.vehicle_id}</p>
                              <p className="text-[10px] text-slate-600">{vehicle.driver_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx('px-2 py-0.5 text-[10px] font-medium rounded-md border',
                            vehicle.type === 'TRUCK' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                          )}>
                            {vehicle.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-slate-400">
                            {vehicle.current_shipment_id || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {vehicle.current_location
                            ? `${vehicle.current_location.latitude.toFixed(4)}, ${vehicle.current_location.longitude.toFixed(4)}`
                            : 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx('font-mono font-semibold px-2 py-0.5 rounded-md border text-[11px]',
                            vehicle.temperature_status === 'COMPLIANT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            vehicle.temperature_status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}>
                            {vehicle.current_temperature.toFixed(1)}°C
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {statusIcons[vehicle.status as DeviceStatus]}
                            <span className="text-slate-400 capitalize">
                              {vehicle.status.toLowerCase().replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={clsx('h-full rounded-full',
                                (vehicle.battery_level || 0) > 50 ? 'bg-emerald-500' :
                                (vehicle.battery_level || 0) > 20 ? 'bg-amber-500' : 'bg-rose-500'
                              )} style={{ width: `${vehicle.battery_level || 0}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500">{vehicle.battery_level?.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Wifi className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-[10px] text-slate-500">{vehicle.signal_strength} dBm</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-600">
                          {formatDistanceToNow(new Date(vehicle.last_update), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 text-slate-600 hover:text-teal-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Detail Panel */}
        <div className="space-y-5">
          {selectedVehicle ? (
            <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] p-5 animate-slide-in">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedVehicle.vehicle_id}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedVehicle.type} • {selectedVehicle.driver_name}</p>
                </div>
                <button onClick={() => setSelectedVehicle(null)} className="p-1.5 text-slate-600 hover:text-white rounded-lg hover:bg-white/5 transition-colors">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Temperature</p>
                  <p className="text-2xl font-bold text-white mt-1 font-mono">
                    {selectedVehicle.current_temperature.toFixed(1)}°C
                  </p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Status</p>
                  <span className={clsx('inline-block mt-2 px-3 py-1 rounded-lg text-xs font-semibold border',
                    selectedVehicle.temperature_status === 'COMPLIANT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    selectedVehicle.temperature_status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  )}>
                    {selectedVehicle.temperature_status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Shipment', value: selectedVehicle.current_shipment_id || 'None' },
                  { label: 'Location', value: selectedVehicle.current_location ? `${selectedVehicle.current_location.latitude.toFixed(4)}, ${selectedVehicle.current_location.longitude.toFixed(4)}` : 'Unknown' },
                  { label: 'Battery', value: `${selectedVehicle.battery_level?.toFixed(0)}%` },
                  { label: 'Signal', value: `${selectedVehicle.signal_strength} dBm` },
                  { label: 'Last Update', value: formatDistanceToNow(new Date(selectedVehicle.last_update), { addSuffix: true }) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-300">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <button className="w-full py-2.5 px-4 gradient-brand text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-teal-600/15">
                  View Full Telemetry
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] p-8 text-center">
              <Truck className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <h3 className="text-sm font-medium text-white">Select a Vehicle</h3>
              <p className="text-xs text-slate-600 mt-1">Click on a vehicle to view telemetry</p>
            </div>
          )}

          {/* Fleet Status Summary */}
          <div className="bg-[#0f1419] rounded-xl border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {[
                { key: 'ACTIVE', label: 'Active', color: 'bg-emerald-500', count: stats.active },
                { key: 'OFFLINE', label: 'Offline', color: 'bg-slate-500', count: stats.offline },
                { key: 'MAINTENANCE', label: 'Maintenance', color: 'bg-violet-500', count: stats.maintenance },
                { key: 'EXCURSION', label: 'Excursion', color: 'bg-rose-500', count: stats.excursion },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx('w-2.5 h-2.5 rounded-full', item.color)} />
                    <span className="text-xs text-slate-400">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
