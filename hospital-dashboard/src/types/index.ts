// src/types/index.ts — use const objects instead of enums (erasableSyntaxOnly mode)

export const Severity = {
  CRITICAL: 'critical',
  MODERATE: 'moderate',
  STABLE: 'stable',
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export const SessionStatus = {
  ACTIVE: 'active',
  ARRIVED: 'arrived',
  CANCELLED: 'cancelled',
} as const;
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

export const SignalState = {
  NORMAL: 'normal',
  GREEN_OVERRIDE: 'green_override',
  RESTORING: 'restoring',
} as const;
export type SignalState = typeof SignalState[keyof typeof SignalState];

export interface IEmergencySession {
  id: string;
  driverName: string;
  vehicleId: string;
  severity: Severity;
  status: SessionStatus;
  activatedAt: number;
  arrivedAt: number | null;
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
  checklist: Record<string, boolean>;
}
