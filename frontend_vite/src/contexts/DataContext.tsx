// Pharma Cold Track - Data Context
// Manages real-time data state, WebSocket connections, and API interactions

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SeverityLevel,
  DeviceStatus,
  ShipmentStatus,
  TemperatureRange,
  ExcursionStatus,
} from '../types';
import type {
  TelemetryData,
  Device,
  Shipment,
  Excursion,
  Alert,
  DashboardMetrics,
  FleetOverview,
  VehicleSummary,
  TemperatureChartData,
  ComplianceChartData,
  WSMessage,
  WSTelemetryPayload,
  WSExcursionPayload,
  WSAlertPayload,
} from '../types';

// Mock data generators for development
const generateMockTelemetry = (deviceId: string): TelemetryData => ({
  device_id: deviceId,
  shipment_id: `SHP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  gps: {
    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
    speed: Math.random() * 80,
    heading: Math.random() * 360,
    timestamp: Date.now(),
  },
  temperature: [
    {
      value: 2 + Math.random() * 6, // 2-8°C range
      unit: 'C',
      sensor_id: `${deviceId}-sensor-1`,
      location_in_unit: 'top',
      timestamp: Date.now(),
    },
    {
      value: 3 + Math.random() * 5,
      unit: 'C',
      sensor_id: `${deviceId}-sensor-2`,
      location_in_unit: 'middle',
      timestamp: Date.now(),
    },
  ],
  ambient_temperature: 20 + Math.random() * 10,
  humidity: 40 + Math.random() * 30,
  door_status: Math.random() > 0.95 ? 'OPEN' : 'CLOSED',
  reefer_status: 'RUNNING',
  power_status: 'MAIN',
  signal_strength: -50 - Math.random() * 50,
  battery_level: 80 + Math.random() * 20,
  timestamp: Date.now(),
});

const generateMockDevices = (): Device[] => {
  const types = ['TRUCK', 'TRAILER', 'SENSOR'] as const;
  return Array.from({ length: 24 }, (_, i) => {
    const id = `VEH-${String(i + 1).padStart(3, '0')}`;
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      device_id: id,
      thing_name: `pharma-${id.toLowerCase()}`,
      thing_type: type,
      serial_number: `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      model: type === 'TRUCK' ? 'Thermo King T-1200' : type === 'TRAILER' ? 'Carrier Vector 8500' : 'Sensitech TempTale GEO',
      firmware_version: '2.4.1',
      calibration_date: Date.now() - 86400000 * 30,
      calibration_due_date: Date.now() + 86400000 * 335,
      status: Math.random() > 0.1 ? DeviceStatus.ACTIVE : DeviceStatus.OFFLINE,
      assigned_shipment_id: Math.random() > 0.3 ? `SHP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}` : undefined,
      temperature_range: TemperatureRange.REFRIGERATED,
      min_temp_threshold: 2,
      max_temp_threshold: 8,
      last_seen: Date.now() - Math.random() * 300000,
      created_at: Date.now() - 86400000 * 180,
      updated_at: Date.now(),
      metadata: {},
    };
  });
};

const generateMockShipments = (): Shipment[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    shipment_id: `SHP-${String(i + 1).padStart(3, '0')}`,
    reference_number: `REF-2024-${String(i + 1000).padStart(4, '0')}`,
    customer_id: `CUST-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
    customer_name: ['Pfizer', 'Moderna', 'AstraZeneca', 'Johnson & Johnson', 'Novartis'][Math.floor(Math.random() * 5)],
    product_name: ['mRNA Vaccine', 'Insulin', 'Monoclonal Antibodies', 'Blood Plasma', 'Gene Therapy'][Math.floor(Math.random() * 5)],
    product_type: 'Biologics',
    batch_numbers: [`BATCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`],
    quantity: Math.floor(Math.random() * 5000) + 500,
    unit: 'vials',
    temperature_range: TemperatureRange.REFRIGERATED,
    min_temp: 2,
    max_temp: 8,
    origin_facility: {
      facility_id: 'FAC-001',
      name: 'Central Distribution Hub - Newark',
      type: 'DISTRIBUTION_CENTER',
      address: '100 Port Street',
      city: 'Newark',
      state: 'NJ',
      country: 'USA',
      postal_code: '07114',
      gps: { latitude: 40.7357, longitude: -74.1724, timestamp: Date.now() },
      contact_person: 'John Smith',
      contact_phone: '+1-555-0100',
      contact_email: 'john.smith@distribution.com',
      operating_hours: 'Mon-Fri 6:00-22:00, Sat 8:00-16:00',
      certifications: ['GDP', 'ISO 9001', 'ISO 13485'],
    },
    destination_facility: {
      facility_id: `FAC-${String(Math.floor(Math.random() * 10) + 2).padStart(3, '0')}`,
      name: `${['Boston', 'Philadelphia', 'Washington', 'Baltimore', 'Albany'][Math.floor(Math.random() * 5)]} Medical Center`,
      type: 'HOSPITAL',
      address: '100 Medical Drive',
      city: ['Boston', 'Philadelphia', 'Washington', 'Baltimore', 'Albany'][Math.floor(Math.random() * 5)],
      state: ['MA', 'PA', 'DC', 'MD', 'NY'][Math.floor(Math.random() * 5)],
      country: 'USA',
      postal_code: '00000',
      gps: { latitude: 42.3601, longitude: -71.0589, timestamp: Date.now() },
      contact_person: 'Jane Doe',
      contact_phone: '+1-555-0200',
      contact_email: 'jane.doe@medical.com',
      operating_hours: '24/7',
      certifications: ['GDP'],
    },
    planned_route: [
      { sequence: 1, location: { latitude: 40.7357, longitude: -74.1724, timestamp: Date.now() }, facility_id: 'FAC-001', facility_name: 'Newark Hub', estimated_arrival: Date.now() - 3600000, estimated_departure: Date.now() - 3500000, status: 'DEPARTED' },
      { sequence: 2, location: { latitude: 41.7637, longitude: -72.6741, timestamp: Date.now() }, facility_id: 'FAC-002', facility_name: 'Hartford Waypoint', estimated_arrival: Date.now() + 7200000, estimated_departure: Date.now() + 7500000, status: 'PENDING' },
      { sequence: 3, location: { latitude: 42.3601, longitude: -71.0589, timestamp: Date.now() }, facility_id: 'FAC-003', facility_name: 'Boston Medical', estimated_arrival: Date.now() + 14400000, estimated_departure: Date.now() + 14700000, status: 'PENDING' },
    ],
    status: Math.random() > 0.2 ? ShipmentStatus.IN_TRANSIT : ShipmentStatus.SCHEDULED,
    assigned_device_ids: [`VEH-${String(Math.floor(Math.random() * 24) + 1).padStart(3, '0')}`],
    assigned_driver_ids: [`DRV-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`],
    departure_time: Date.now() - 3600000,
    estimated_arrival: Date.now() + 14400000,
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now(),
    metadata: {},
    documents: [],
  }));
};

const generateMockExcursions = (): Excursion[] => {
  const severities = [SeverityLevel.S1_CRITICAL, SeverityLevel.S2_HIGH, SeverityLevel.S3_MODERATE];
  const statuses = [ExcursionStatus.OPEN, ExcursionStatus.INVESTIGATING, ExcursionStatus.RESOLVED, ExcursionStatus.CLOSED];
  return Array.from({ length: 8 }, (_, i) => ({
    excursion_id: `EXC-${String(i + 1).padStart(4, '0')}`,
    device_id: `VEH-${String(Math.floor(Math.random() * 24) + 1).padStart(3, '0')}`,
    shipment_id: `SHP-${String(Math.floor(Math.random() * 12) + 1).padStart(3, '0')}`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    temperature_at_breach: 1.5 + Math.random() * 10,
    threshold_breached: Math.random() > 0.5 ? 2 : 8,
    duration_minutes: Math.floor(Math.random() * 120) + 5,
    start_time: Date.now() - Math.random() * 86400000 * 7,
    end_time: Math.random() > 0.3 ? Date.now() - Math.random() * 3600000 : undefined,
    acknowledged_at: Math.random() > 0.4 ? Date.now() - Math.random() * 3600000 : undefined,
    acknowledged_by: 'QA-Manager',
    root_cause: 'Reefer unit door seal failure',
    corrective_action: 'Replaced door gasket, re-validated unit',
    preventive_action: 'Added daily door seal inspection to pre-trip checklist',
    affected_products: ['mRNA Vaccine Lot #VX-2024-001'],
    risk_assessment: {
      assessment_id: `RA-${String(i + 1).padStart(4, '0')}`,
      performed_by: 'QA-Manager',
      performed_at: Date.now() - 3600000,
      product_impact: 'POTENTIAL',
      quality_impact: 'Temperature excursion within validated packaging tolerance. Product integrity likely maintained.',
      regulatory_notification_required: true,
      regulatory_notification_sent: true,
      regulatory_notification_at: Date.now() - 1800000,
      disposition: 'RELEASE',
      reviewer: 'Quality Director',
      reviewed_at: Date.now() - 900000,
    },
    notifications: [],
    created_at: Date.now() - Math.random() * 86400000 * 7,
    updated_at: Date.now(),
  }));
};

interface DataContextType {
  // State
  devices: Device[];
  shipments: Shipment[];
  excursions: Excursion[];
  alerts: Alert[];
  metrics: DashboardMetrics | null;
  fleetOverview: FleetOverview | null;
  temperatureHistory: Map<string, TemperatureChartData>;
  complianceHistory: ComplianceChartData[];
  isLoading: boolean;
  lastUpdated: number | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';

  // Actions
  refreshAll: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  refreshShipments: () => Promise<void>;
  refreshExcursions: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  acknowledgeExcursion: (excursionId: string, userId: string) => Promise<void>;
  resolveExcursion: (excursionId: string, resolution: any) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;

  // WebSocket
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [fleetOverview, setFleetOverview] = useState<FleetOverview | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<Map<string, TemperatureChartData>>(new Map());
  const [complianceHistory, setComplianceHistory] = useState<ComplianceChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize with mock data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockDevices = generateMockDevices();
        const mockShipments = generateMockShipments();
        const mockExcursions = generateMockExcursions();

        setDevices(mockDevices);
        setShipments(mockShipments);
        setExcursions(mockExcursions);

        // Generate metrics
        const activeDevices = mockDevices.filter(d => d.status === DeviceStatus.ACTIVE).length;
        const activeExcursions = mockExcursions.filter(e => e.status === 'OPEN' || e.status === 'INVESTIGATING');

        setMetrics({
          total_active_shipments: mockShipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length,
          total_devices: mockDevices.length,
          devices_online: activeDevices,
          devices_offline: mockDevices.length - activeDevices,
          active_excursions: activeExcursions.length,
          s1_critical_count: activeExcursions.filter(e => e.severity === SeverityLevel.S1_CRITICAL).length,
          s2_high_count: activeExcursions.filter(e => e.severity === SeverityLevel.S2_HIGH).length,
          s3_moderate_count: activeExcursions.filter(e => e.severity === SeverityLevel.S3_MODERATE).length,
          compliance_rate: 99.5,
          avg_temperature: 4.8,
          on_time_delivery_rate: 97.2,
          timestamp: Date.now(),
        });

        setFleetOverview({
          vehicles: mockDevices.map(d => ({
            device_id: d.device_id,
            vehicle_id: d.device_id,
            type: d.thing_type === 'TRUCK' ? 'TRUCK' : 'TRAILER',
            current_location: { latitude: 40.7128, longitude: -74.0060, timestamp: Date.now() },
            current_temperature: 2 + Math.random() * 6,
            temperature_status: Math.random() > 0.8 ? 'EXCURSION' : 'COMPLIANT',
            current_shipment_id: d.assigned_shipment_id,
            driver_name: `Driver ${Math.floor(Math.random() * 100)}`,
            last_update: d.last_seen,
            status: d.status,
            battery_level: 80 + Math.random() * 20,
            signal_strength: -50 - Math.random() * 50,
          })),
          total: mockDevices.length,
          by_status: {
            [DeviceStatus.ACTIVE]: mockDevices.filter(d => d.status === DeviceStatus.ACTIVE).length,
            [DeviceStatus.INACTIVE]: mockDevices.filter(d => d.status === DeviceStatus.INACTIVE).length,
            [DeviceStatus.MAINTENANCE]: mockDevices.filter(d => d.status === DeviceStatus.MAINTENANCE).length,
            [DeviceStatus.OFFLINE]: mockDevices.filter(d => d.status === DeviceStatus.OFFLINE).length,
            [DeviceStatus.EXCURSION]: mockDevices.filter(d => d.status === DeviceStatus.EXCURSION).length,
          },
          by_temperature_range: {
            [TemperatureRange.REFRIGERATED]: mockDevices.filter(d => d.temperature_range === TemperatureRange.REFRIGERATED).length,
            [TemperatureRange.FROZEN]: mockDevices.filter(d => d.temperature_range === TemperatureRange.FROZEN).length,
            [TemperatureRange.CONTROLLED_ROOM]: mockDevices.filter(d => d.temperature_range === TemperatureRange.CONTROLLED_ROOM).length,
          },
        });

        setLastUpdated(Date.now());
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');

    try {
      // In production: connect to AppSync/WebSocket endpoint
      // wsRef.current = new WebSocket(`wss://${apiId}.appsync-realtime-api.${region}.amazonaws.com/graphql`);

      // Mock WebSocket for development
      console.log('WebSocket connection simulated');
      setConnectionStatus('connected');

      // Simulate real-time updates
      const interval = setInterval(() => {
        // Simulate telemetry update
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        if (randomDevice) {
          const telemetry = generateMockTelemetry(randomDevice.device_id);

          // Update device last_seen
          setDevices(prev => prev.map(d =>
            d.device_id === randomDevice.device_id
              ? { ...d, last_seen: Date.now(), status: DeviceStatus.ACTIVE }
              : d
          ));
        }

        // Occasionally trigger excursion
        if (Math.random() < 0.02) {
          const newExcursion = generateMockExcursions()[0];
          newExcursion.excursion_id = `EXC-${Date.now()}`;
          newExcursion.start_time = Date.now();
          newExcursion.status = ExcursionStatus.OPEN;

          setExcursions(prev => [newExcursion, ...prev.slice(0, 49)]);

          // Add alert
          const newAlert: Alert = {
            alert_id: `ALT-${Date.now()}`,
            type: 'EXCURSION',
            severity: newExcursion.severity,
            title: `${newExcursion.severity} Temperature Excursion`,
            message: `Device ${newExcursion.device_id} reported ${newExcursion.temperature_at_breach.toFixed(1)}°C`,
            device_id: newExcursion.device_id,
            shipment_id: newExcursion.shipment_id,
            acknowledged: false,
            resolved: false,
            created_at: Date.now(),
          };

          setAlerts(prev => [newAlert, ...prev.slice(0, 99)]);
        }

        setLastUpdated(Date.now());
      }, 5000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('error');

      // Reconnect after 10 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 10000);
    }
  }, [devices]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnectionStatus('disconnected');
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      // Refresh mock data
      setDevices(generateMockDevices());
      setShipments(generateMockShipments());
      setExcursions(generateMockExcursions());
      setLastUpdated(Date.now());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    // In production: fetch from API
    setDevices(prev => prev.map(d => ({ ...d, last_seen: Date.now() })));
    setLastUpdated(Date.now());
  }, []);

  const refreshShipments = useCallback(async () => {
    // In production: fetch from API
    setLastUpdated(Date.now());
  }, []);

  const refreshExcursions = useCallback(async () => {
    // In production: fetch from API
    setLastUpdated(Date.now());
  }, []);

  const refreshMetrics = useCallback(async () => {
    // In production: fetch from API
    setLastUpdated(Date.now());
  }, []);

  const acknowledgeExcursion = useCallback(async (excursionId: string, userId: string) => {
    setExcursions(prev => prev.map(e =>
      e.excursion_id === excursionId
        ? { ...e, status: ExcursionStatus.INVESTIGATING, acknowledged_at: Date.now(), acknowledged_by: userId }
        : e
    ));
    setAlerts(prev => prev.map(a =>
      a.device_id === excursionId && !a.acknowledged
        ? { ...a, acknowledged: true, acknowledged_by: userId, acknowledged_at: Date.now() }
        : a
    ));
  }, []);

  const resolveExcursion = useCallback(async (excursionId: string, resolution: any) => {
    setExcursions(prev => prev.map(e =>
      e.excursion_id === excursionId
        ? {
            ...e,
            status: ExcursionStatus.RESOLVED,
            resolved_at: Date.now(),
            resolved_by: resolution.userId,
            root_cause: resolution.rootCause,
            corrective_action: resolution.correctiveAction,
            preventive_action: resolution.preventiveAction,
          }
        : e
    ));
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.alert_id === alertId
        ? { ...a, acknowledged: true, acknowledged_at: Date.now() }
        : a
    ));
  }, []);

  return (
    <DataContext.Provider value={{
      devices,
      shipments,
      excursions,
      alerts,
      metrics,
      fleetOverview,
      temperatureHistory,
      complianceHistory,
      isLoading,
      lastUpdated,
      connectionStatus,
      refreshAll,
      refreshDevices,
      refreshShipments,
      refreshExcursions,
      refreshMetrics,
      acknowledgeExcursion,
      resolveExcursion,
      acknowledgeAlert,
      connectWebSocket,
      disconnectWebSocket,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};