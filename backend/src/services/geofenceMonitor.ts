import * as admin from 'firebase-admin';
import { sendSignalOverride, sendSignalRestore } from './signalDispatcher';
import { IEmergencySession, ISignalState, SessionStatus, SignalState } from '../../types/index';

// Haversine formula to compute distance between points in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function startGeofenceMonitor() {
  const db = admin.database();
  
  // Every 2 seconds, check active sessions against signals
  setInterval(async () => {
    try {
      const sessionsSnap = await db.ref('emergency_sessions').orderByChild('status').equalTo(SessionStatus.ACTIVE).once('value');
      const sessions = sessionsSnap.val();
      if (!sessions) return;

      const signalsSnap = await db.ref('signal_states').once('value');
      const signals = signalsSnap.val() as Record<string, ISignalState>;
      if (!signals) return;

      for (const [sessionId, session] of Object.entries<IEmergencySession>(sessions)) {
        for (const [signalId, signal] of Object.entries(signals)) {
          const distance = getDistanceMeters(session.currentLat, session.currentLng, signal.lat, signal.lng);
          
          if (distance < 200 && signal.state !== SignalState.GREEN_OVERRIDE) {
            // Ambulance is within 200m -> Override
            await sendSignalOverride(signalId, signal.esp32Ip, sessionId);
          } else if (distance > 400 && signal.state === SignalState.GREEN_OVERRIDE && signal.sessionId === sessionId) {
            // Ambulance has passed -> Restore
            await sendSignalRestore(signalId, signal.esp32Ip);
          }
        }
      }
    } catch (err) {
      console.error("[Geofence] Error:", err);
    }
  }, 2000);
}
