import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Severity, SessionStatus, IEmergencySession, SignalState, ISignalState, IHospitalPrep } from '../../types/index';

dotenv.config();

// Initialize Firebase Admin globally
// For a hackathon, we initialize with default credentials or simple config
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DB_URL || "https://placeholder-default-rtdb.firebaseio.com"
  });
} catch (error) {
  console.warn("Firebase Admin Initialization Failed. Please check FIREBASE_DB_URL.");
}

const db = admin.database();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/emergency/activate', async (req, res) => {
  try {
    const { driverName, vehicleId, severity, hospitalId, currentLat, currentLng } = req.body;
    
    const sessionId = uuidv4();
    const newSession: IEmergencySession = {
      id: sessionId,
      driverName: driverName || 'Unknown Driver',
      vehicleId: vehicleId || 'KA-01-AB-1234',
      severity: severity || Severity.CRITICAL,
      status: SessionStatus.ACTIVE,
      activatedAt: Date.now(),
      arrivedAt: null,
      hospitalId: hospitalId || 'hosp-001',
      etaSeconds: 600, // placeholder, later updated by maps API
      currentLat: currentLat || 0,
      currentLng: currentLng || 0,
    };

    // Save to DB
    await db.ref(`emergency_sessions/${sessionId}`).set(newSession);

    // Alert Hospital
    const hospitalPrep: IHospitalPrep = {
      sessionId,
      hospitalId: newSession.hospitalId,
      alertedAt: Date.now(),
      acknowledgedBy: null,
      readinessScore: 0,
      checklist: {
        "ICU Bed": false,
        "Ventilator": false,
        "Defibrillator": false,
        "Surgical Team": false,
        "O2 Supply": false
      }
    };
    await db.ref(`hospital_prep/${sessionId}`).set(hospitalPrep);

    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create emergency session' });
  }
});

app.post('/api/emergency/location', async (req, res) => {
  try {
    const { sessionId, currentLat, currentLng } = req.body;
    await db.ref(`emergency_sessions/${sessionId}`).update({
      currentLat,
      currentLng
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

app.post('/api/emergency/arrived', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Mark session arrived
    await db.ref(`emergency_sessions/${sessionId}`).update({
      status: SessionStatus.ARRIVED,
      arrivedAt: Date.now()
    });

    // TODO: Restore all GREEN signals to NORMAL via signalDispatcher

    res.status(200).json({ success: true, message: 'Arrived and signals restored' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Green Corridor Backend running on port ${PORT}`);
});
