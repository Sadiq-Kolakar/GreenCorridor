export enum Severity {
  CRITICAL = 'critical',
  MODERATE = 'moderate',
  STABLE = 'stable'
}

export enum SessionStatus {
  ACTIVE = 'active',
  ARRIVED = 'arrived',
  CANCELLED = 'cancelled'
}

export enum SignalState {
  NORMAL = 'normal',
  GREEN_OVERRIDE = 'green_override',
  RESTORING = 'restoring'
}

export interface IEmergencySession {
  id: string; // UUID
  driverName: string;
  vehicleId: string;
  severity: Severity;
  status: SessionStatus;
  activatedAt: number; // Unix timestamp
  arrivedAt: number | null; // Unix timestamp
  hospitalId: string;
  routePolyline?: string;
  etaSeconds: number;
  currentLat: number;
  currentLng: number;
}

export interface ISignalState {
  signalId: string;
  esp32Ip: string;
  lat: number;
  lng: number;
  state: SignalState;
  overriddenAt: number | null;
  sessionId: string | null;
}

export interface IHospitalPrep {
  sessionId: string;
  hospitalId: string;
  alertedAt: number;
  acknowledgedBy: string | null;
  readinessScore: number;
  checklist: Record<string, boolean>; // e.g. { "ICU Bed": true, "Ventilator": false }
}
