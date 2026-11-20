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

import { faker } from '@faker-js/faker';

const generateMockDevices = (): Device[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    device_id: `VEH-${String(i + 1).padStart(3, '0')}`,
    thing_name: faker.vehicle.model(),
    thing_type: faker.helpers.arrayElement(['TRUCK', 'TRAILER', 'SENSOR']),
    serial_number: faker.string.uuid(),
    model: faker.vehicle.model(),
    firmware_version: 'v2.4.1',
    calibration_date: faker.date.past().getTime(),
    calibration_due_date: faker.date.future().getTime(),
    status: faker.helpers.arrayElement([DeviceStatus.ACTIVE, DeviceStatus.OFFLINE, DeviceStatus.MAINTENANCE]),
    assigned_shipment_id: Math.random() > 0.3 ? `SHP-${faker.string.numeric(3)}` : undefined,
    temperature_range: faker.helpers.arrayElement([TemperatureRange.REFRIGERATED, TemperatureRange.FROZEN, TemperatureRange.CONTROLLED_ROOM]),
    min_temp_threshold: 2,
    max_temp_threshold: 8,
    last_seen: Date.now() - Math.random() * 300000,
    created_at: Date.now() - 86400000 * 180,
    updated_at: Date.now(),
    metadata: {},
  }));
};

const generateMockShipments = (): Shipment[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    shipment_id: `SHP-${String(i + 1).padStart(3, '0')}`,
    reference_number: faker.string.alphanumeric(8).toUpperCase(),
    customer_id: `CUST-${faker.string.numeric(3)}`,
    customer_name: faker.company.name(),
    product_name: faker.helpers.arrayElement(['mRNA Vaccine', 'Insulin', 'Monoclonal Antibodies', 'Gene Therapy', 'Specialty Biologics']),
    product_type: 'Biologics',
    batch_numbers: [faker.string.alphanumeric(6).toUpperCase()],
    quantity: faker.number.int({ min: 500, max: 10000 }),
    unit: 'vials',
    temperature_range: TemperatureRange.REFRIGERATED,
    min_temp: 2,
    max_temp: 8,
    origin_facility: {
      facility_id: 'FAC-001',
      name: faker.company.name() + ' Hub',
      type: 'DISTRIBUTION_CENTER',
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'USA',
      postal_code: faker.location.zipCode(),
      gps: { latitude: faker.location.latitude(), longitude: faker.location.longitude(), timestamp: Date.now() },
      contact_person: faker.person.fullName(),
      contact_phone: faker.phone.number(),
      operating_hours: '24/7',
      certifications: ['GDP', 'ISO 9001'],
    },
    destination_facility: {
      facility_id: `FAC-${faker.string.numeric(3)}`,
      name: faker.company.name() + ' Medical Center',
      type: 'HOSPITAL',
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'USA',
      postal_code: faker.location.zipCode(),
      gps: { latitude: faker.location.latitude(), longitude: faker.location.longitude(), timestamp: Date.now() },
      contact_person: faker.person.fullName(),
      contact_phone: faker.phone.number(),
      operating_hours: '24/7',
      certifications: ['GDP'],
    },
    planned_route: [],
    status: faker.helpers.arrayElement([ShipmentStatus.IN_TRANSIT, ShipmentStatus.SCHEDULED, ShipmentStatus.AT_FACILITY, ShipmentStatus.DELIVERED]),
    assigned_device_ids: [`VEH-${String(Math.floor(Math.random() * 24) + 1).padStart(3, '0')}`],
    assigned_driver_ids: [`DRV-${faker.string.numeric(3)}`],
    departure_time: faker.date.past().getTime(),
    estimated_arrival: faker.date.future().getTime(),
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