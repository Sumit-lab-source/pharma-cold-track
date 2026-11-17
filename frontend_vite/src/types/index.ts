// Pharma Cold Track - Type Definitions
// Core types for the pharmaceutical cold chain tracking application

// ============================================
// Enums & Constants
// ============================================

export enum SeverityLevel {
  S1_CRITICAL = 'S1_CRITICAL',
  S2_HIGH = 'S2_HIGH',
  S3_MODERATE = 'S3_MODERATE',
  COMPLIANT = 'COMPLIANT',
  WARNING = 'WARNING',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
  EXCURSION = 'EXCURSION',
}

export enum ShipmentStatus {
  SCHEDULED = 'SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  AT_FACILITY = 'AT_FACILITY',
  DELIVERED = 'DELIVERED',
  EXCURSION = 'EXCURSION',
  CANCELLED = 'CANCELLED',
}

export enum TemperatureRange {
  REFRIGERATED = 'REFRIGERATED',    // 2°C - 8°C
  FROZEN = 'FROZEN',                // -25°C to -15°C
  CONTROLLED_ROOM = 'CONTROLLED_ROOM', // 15°C - 25°C
}

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  DRIVER = 'DRIVER',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  COMPLIANCE_AUDITOR = 'COMPLIANCE_AUDITOR',
  VIEWER = 'VIEWER',
}

export enum ExcursionStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// ============================================
// Core Interfaces
// ============================================

export interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface TemperatureReading {
  value: number;
  unit: 'C' | 'F';
  sensor_id: string;
  location_in_unit: string; // e.g., 'top', 'middle', 'bottom', 'door'
  timestamp: number;
}

export interface TelemetryData {
  device_id: string;
  shipment_id?: string;
  gps: GPSLocation;
  temperature: TemperatureReading[];
  ambient_temperature?: number;
  humidity?: number;
  door_status: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  reefer_status: 'RUNNING' | 'STOPPED' | 'DEFROST' | 'ERROR';
  power_status: 'MAIN' | 'BATTERY' | 'NONE';
  signal_strength?: number;
  battery_level?: number;
  timestamp: number;
}

export interface Device {
  device_id: string;
  thing_name: string;
  thing_type: 'TRUCK' | 'TRAILER' | 'SENSOR';
  serial_number: string;
  model: string;
  firmware_version: string;
  calibration_date: number;
  calibration_due_date: number;
  status: DeviceStatus;
  assigned_shipment_id?: string;
  assigned_driver_id?: string;
  temperature_range: TemperatureRange;
  min_temp_threshold: number;
  max_temp_threshold: number;
  last_seen: number;
  created_at: number;
  updated_at: number;
  metadata: Record<string, any>;
}

export interface Shipment {
  shipment_id: string;
  reference_number: string;
  customer_id: string;
  customer_name: string;
  product_name: string;
  product_type: string;
  batch_numbers: string[];
  quantity: number;
  unit: string;
  temperature_range: TemperatureRange;
  min_temp: number;
  max_temp: number;
  origin_facility: Facility;
  destination_facility: Facility;
  planned_route: RoutePoint[];
  actual_route?: RoutePoint[];
  status: ShipmentStatus;
  assigned_device_ids: string[];
  assigned_driver_ids: string[];
  departure_time: number;
  estimated_arrival: number;
  actual_arrival?: number;
  created_at: number;
  updated_at: number;
  metadata: Record<string, any>;
  documents: ShipmentDocument[];
}

export interface Facility {
  facility_id: string;
  name: string;
  type: 'WAREHOUSE' | 'PHARMACY' | 'HOSPITAL' | 'MANUFACTURING' | 'DISTRIBUTION_CENTER';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  gps: GPSLocation;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  operating_hours: string;
  certifications: string[];
}

export interface RoutePoint {
  sequence: number;
  location: GPSLocation;
  facility_id?: string;
  facility_name?: string;
  estimated_arrival: number;
  actual_arrival?: number;
  estimated_departure: number;
  actual_departure?: number;
  status: 'PENDING' | 'ARRIVED' | 'DEPARTED' | 'SKIPPED';
  temperature_at_arrival?: number;
  temperature_at_departure?: number;
}

export interface ShipmentDocument {
  document_id: string;
  type: 'COA' | 'CTD' | 'TEMPERATURE_LOG' | 'DEVIATION_REPORT' | 'PROOF_OF_DELIVERY' | 'OTHER';
  name: string;
  s3_key: string;
  uploaded_at: number;
  uploaded_by: string;
  verified: boolean;
}

export interface Excursion {
  excursion_id: string;
  device_id: string;
  shipment_id: string;
  severity: SeverityLevel;
  status: ExcursionStatus;
  temperature_at_breach: number;
  threshold_breached: number;
  duration_minutes: number;
  start_time: number;
  end_time?: number;
  acknowledged_at?: number;
  acknowledged_by?: string;
  resolved_at?: number;
  resolved_by?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  mkt_calculated?: number; // Mean Kinetic Temperature
  affected_products: string[];
  risk_assessment: RiskAssessment;
  notifications: ExcursionNotification[];
  created_at: number;
  updated_at: number;
}

export interface RiskAssessment {
  assessment_id: string;
  performed_by: string;
  performed_at: number;
  product_impact: 'NONE' | 'POTENTIAL' | 'CONFIRMED_DAMAGE';
  quality_impact: string;
  regulatory_notification_required: boolean;
  regulatory_notification_sent: boolean;
  regulatory_notification_at?: number;
  disposition: 'RELEASE' | 'QUARANTINE' | 'REPROCESS' | 'DESTROY' | 'PENDING';
  reviewer?: string;
  reviewed_at?: number;
}

export interface ExcursionNotification {
  notification_id: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK' | 'SYSTEM';
  recipient: string;
  sent_at: number;
  delivered: boolean;
  acknowledged: boolean;
  acknowledged_at?: number;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  facility_ids: string[];
  phone?: string;
  avatar_url?: string;
  mfa_enabled: boolean,
  last_login?: number;
  created_at: number;
  updated_at: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  temperature_unit: 'C' | 'F';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    excursion_alerts: boolean;
    daily_summary: boolean;
    weekly_report: boolean;
  };
  map_style: 'standard' | 'satellite' | 'dark';
  auto_refresh_interval: number; // seconds
}

export interface AuditLog {
  log_id: string;
  timestamp: number;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  correlation_id?: string;
}

export interface ComplianceReport {
  report_id: string;
  report_type: 'DAILY_SUMMARY' | 'WEEKLY_SUMMARY' | 'MONTHLY_SUMMARY' | 'EXCURSION_REPORT' | 'REGULATORY_SUBMISSION' | 'CUSTOM';
  title: string;
  description: string;
  generated_by: string;
  generated_at: number;
  period_start: number;
  period_end: number;
  status: 'DRAFT' | 'GENERATED' | 'SIGNED' | 'SUBMITTED' | 'ARCHIVED';
  shipment_ids: string[];
  excursion_ids: string[];
  s3_key: string;
  file_size: number;
  checksum: string;
  digital_signature?: string;
  signed_by?: string;
  signed_at?: number;
}

export interface Alert {
  alert_id: string;
  type: 'EXCURSION' | 'DEVICE_OFFLINE' | 'CALIBRATION_DUE' | 'MAINTENANCE_DUE' | 'ROUTE_DEVIATION' | 'DOOR_OPEN' | 'POWER_LOSS' | 'LOW_BATTERY';
  severity: SeverityLevel;
  title: string;
  message: string;
  device_id?: string;
  shipment_id?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: number;
  resolved: boolean;
  resolved_at?: number;
  created_at: number;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  next_token?: string;
  total_count: number;
  has_more: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  request_id: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  services: {
    dynamodb: 'up' | 'down';
    appsync: 'up' | 'down';
    iot_core: 'up' | 'down';
    cognito: 'up' | 'down';
  };
}

// ============================================
// Dashboard Metrics Types
// ============================================

export interface DashboardMetrics {
  total_active_shipments: number;
  total_devices: number;
  devices_online: number;
  devices_offline: number;
  active_excursions: number;
  s1_critical_count: number;
  s2_high_count: number;
  s3_moderate_count: number;
  compliance_rate: number; // percentage
  avg_temperature: number;
  on_time_delivery_rate: number;
  timestamp: number;
}

export interface FleetOverview {
  vehicles: VehicleSummary[];
  total: number;
  by_status: Record<DeviceStatus, number>;
  by_temperature_range: Record<TemperatureRange, number>;
}

export interface VehicleSummary {
  device_id: string;
  vehicle_id: string;
  type: 'TRUCK' | 'TRAILER';
  current_location: GPSLocation;
  current_temperature: number;
  temperature_status: 'COMPLIANT' | 'WARNING' | 'EXCURSION';
  current_shipment_id?: string;
  current_route?: string;
  driver_name?: string;
  last_update: number;
  status: DeviceStatus;
  battery_level?: number;
  signal_strength?: number;
}

// ============================================
// Chart Data Types
// ============================================

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface TemperatureChartData {
  device_id: string;
  shipment_id?: string;
  readings: TimeSeriesPoint[];
  min_threshold: number;
  max_threshold: number;
  excursions: {
    start: number;
    end: number;
    severity: SeverityLevel;
  }[];
}

export interface ComplianceChartData {
  period: string;
  compliant: number;
  excursions: number;
  s1_count: number;
  s2_count: number;
  s3_count: number;
}

export interface FleetUtilizationData {
  date: string;
  active_vehicles: number;
  total_vehicles: number;
  utilization_rate: number;
}

// ============================================
// Map Types
// ============================================

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  type: 'VEHICLE' | 'FACILITY' | 'EXCURSION' | 'ROUTE_POINT';
  data: any;
  icon?: string;
  color?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'markers' | 'polyline' | 'polygon' | 'heatmap';
  visible: boolean;
  data: any[];
  style?: Record<string, any>;
}

export interface RoutePolyline {
  coordinates: [number, number][];
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
}

// ============================================
// Form Types
// ============================================

export interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
  mfa_code?: string;
}

export interface ShipmentForm {
  reference_number: string;
  customer_id: string;
  product_name: string;
  product_type: string;
  batch_numbers: string[];
  quantity: number;
  unit: string;
  temperature_range: TemperatureRange;
  min_temp: number;
  max_temp: number;
  origin_facility_id: string;
  destination_facility_id: string;
  planned_departure: number;
  estimated_arrival: number;
  assigned_device_ids: string[];
  assigned_driver_ids: string[];
}

export interface DeviceForm {
  thing_name: string;
  thing_type: 'TRUCK' | 'TRAILER' | 'SENSOR';
  serial_number: string;
  model: string;
  temperature_range: TemperatureRange;
  min_temp_threshold: number;
  max_temp_threshold: number;
  assigned_driver_id?: string;
}

export interface ExcursionResolutionForm {
  excursion_id: string;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  disposition: 'RELEASE' | 'QUARANTINE' | 'REPROCESS' | 'DESTROY';
  risk_assessment_notes: string;
}

// ============================================
// WebSocket Message Types
// ============================================

export interface WSMessage<T = any> {
  type: 'TELEMETRY' | 'EXCURSION' | 'ALERT' | 'DEVICE_STATUS' | 'SHIPMENT_UPDATE' | 'HEARTBEAT';
  payload: T;
  timestamp: number;
  message_id: string;
}

export interface WSTelemetryPayload {
  device_id: string;
  temperature: number;
  location: GPSLocation;
  timestamp: number;
}

export interface WSExcursionPayload {
  excursion: Excursion;
  action: 'CREATED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'UPDATED';
}

export interface WSAlertPayload {
  alert: Alert;
  action: 'CREATED' | 'ACKNOWLEDGED' | 'RESOLVED';
}