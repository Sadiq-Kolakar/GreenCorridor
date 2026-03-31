import axios from 'axios';
import * as admin from 'firebase-admin';
import { SignalState } from '../../types/index';

const db = admin.database();

export async function sendSignalOverride(signalId: string, esp32Ip: string, sessionId: string) {
  try {
    const response = await axios.post(`http://${esp32Ip}/override`, {}, { timeout: 1000 });
    if (response.status === 200 && response.data.status === 'GREEN') {
      await db.ref(`signal_states/${signalId}`).update({
        state: SignalState.GREEN_OVERRIDE,
        overriddenAt: Date.now(),
        sessionId: sessionId
      });
      console.log(`[Signal] OVERRIDE success for ${signalId}`);
    }
  } catch (err) {
    console.error(`[Signal] OVERRIDE failed for ${signalId}:`, err);
  }
}

export async function sendSignalRestore(signalId: string, esp32Ip: string) {
  try {
    const response = await axios.post(`http://${esp32Ip}/restore`, {}, { timeout: 1000 });
    if (response.status === 200 && response.data.status === 'RESTORED') {
      await db.ref(`signal_states/${signalId}`).update({
        state: SignalState.NORMAL,
        sessionId: null
      });
      console.log(`[Signal] RESTORE success for ${signalId}`);
    }
  } catch (err) {
    console.error(`[Signal] RESTORE failed for ${signalId}:`, err);
  }
}
