# Green Corridor AI 🚦🚑🏥

**Green Corridor AI** is a mission-critical emergency traffic management and hospital preparation system. It orchestrates a synchronized "Green Corridor" (a path of consecutive green traffic lights) for ambulances carrying critical patients, while simultaneously alerting the receiving hospital with live ETA and patient vitals to prepare the Emergency Room before arrival.

---

## 🏗️ System Architecture

The project is structured as a monorepo consisting of four primary domains:

### 1. 🚑 Ambulance App (React + Vite + Leaflet)
A mobile-first Progressive Web App (PWA) designed for paramedics and ambulance drivers.
- **Standby Mode**: Shows current location and vehicle status.
- **Severity Classification**: Paramedics declare the emergency level (Critical, Moderate, Stable). This determines priority logic for the traffic signal dispatcher and hospital readiness checklist.
- **Active Emergency Mode**: Once activated, it broadcasts 1Hz high-frequency GPS telemetry to the backend, tracking the route to the hospital and calculating dynamic ETAs.

### 2. 🏥 Hospital Command Dashboard (React + Vite + Leaflet)
A high-fidelity desktop command center for emergency department coordinators.
- **Live Fleet Tracking**: Real-time tracking of the incoming ambulance on a dark-themed tactical map.
- **HUD Overlays**: Displays live distance remaining and current ambulance speed.
- **Preparation Checklist**: An interactive readiness checklist (ICU Bed, Ventilator, Surgical Team, Defibrillator, O2) tailored to the incoming patient's severity.
- **Emergency Override**: Allows the hospital to intervene or request manual signal control if AI routing fails.

### 3. ⚙️ AI Backend (Express + Node.js + Firebase Admin)
The central nervous system of the platform.
- **Session Manager**: Creates, tracks, and terminates emergency sessions.
- **Geofence Monitor (Concepts)**: Calculates proximity of the ambulance to upcoming traffic signal nodes.
- **Signal Dispatcher**: In a full production environment, this module pushes preemptive signal override commands to IoT controllers ahead of the ambulance's path and releases them once the ambulance passes.

### 4. 🛜 IoT Hardware Integration (ESP32/Arduino)
- Custom firmware designed for ESP32 microcontrollers attached to traffic lights.
- Listens to the backend Signal Dispatcher securely over MQTT or HTTP polling.
- Turns traffic lights green before the ambulance arrives and restores normal sequence afterward.

---

## 🛠️ Technology Stack

- **Frontend Frameworks:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS v4, Material Symbols
- **Design System:** Custom "Kinetic Pulse" UI (Dark Mode, Tonal Surfaces, Glassmorphism, Neon Glow FX)
- **Maps:** Leaflet & React-Leaflet (CartoDB Dark Matter tiles)
- **Backend Server:** Node.js, Express.js
- **Database / Realtime Sync:** Firebase Realtime Database (RTDB)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project with Realtime Database enabled

### 1. Environment Setup
You must configure Firebase credentials for real-time syncing.
1. Create a Firebase project and obtain your web config.
2. In both `ambulance-app` and `hospital-dashboard`, copy the `.env.local.example` (or create a `.env.local` file) and fill in your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DB_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project
   ```

### 2. Running Locally

The project contains three separate servers. Open three terminal windows:

**Backend Server (Port 3000)**
```bash
cd backend
npm install
npm run dev
```

**Ambulance App (Port 5175)**
```bash
cd ambulance-app
npm install
npm run dev -- --port 5175
```

**Hospital Dashboard (Port 5177)**
```bash
cd hospital-dashboard
npm install
npm run dev -- --port 5177
```

---

## 🔄 Emergency Flow (How It Works)

1. **Activation:** The paramedic opens the Ambulance App, hits **ACTIVATE**, and selects "CRITICAL".
2. **Session Creation:** The backend `POST /api/emergency/activate` generates a unique UUID session, assigning an ETA, Hospital ID, and Driver ID.
3. **Hospital Alert:** The Firebase Realtime Database instantly propagates the session to the Hospital Dashboard, triggering alarms, popping up the preparation checklist, and focusing the live map.
4. **Live Tracking:** The Ambulance App broadcasts `(lat, lng)` via `POST /api/emergency/location` and Firebase RTDB. The hospital sees a buttery-smooth marker moving on the map.
5. **Traffic Clearance:** Simultaneously, backend logic evaluates geofenced signal nodes along the route, triggering green lights sequentially.
6. **Arrival:** Upon reaching the destination coordinates, the App posts `POST /api/emergency/arrived`, closing the session and releasing the city traffic grids back to normal operations.

---

## 🎨 UI/UX Design ("Kinetic Pulse")
The interface treats emergency management software not as sterile medical spreadsheets, but as high-performance tactical radar systems. It prioritizes dark-mode contrast to reduce eye strain in low-light ambulance cabs, uses bold typography for critical numbers (ETA, Speed), and heavily utilizes interactive states (e.g. `active:scale-95`) to ensure tactile feedback under high adrenaline pressure.
