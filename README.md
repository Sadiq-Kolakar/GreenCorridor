<div align="center">
  
# 🚦🟢 Green Corridor AI 🚑🏥

**Mission-Critical Emergency Traffic & Hospital Pre-Arrival System**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-404D59?style=for-the-badge)](https://expressjs.com/)

*Orchestrating seamless emergency routes by synchronizing city traffic grids with live hospital ER preparation.*

---
</div>

## ✨ The Vision

**Green Corridor AI** is designed to save lives when every second counts. By integrating a mobile-first Progressive Web App (PWA) for paramedics, a high-fidelity desktop command center for hospitals, and deep IoT integration for traffic lights, the system guarantees a zero-stop journey for critical patients.

When an emergency session is activated, the core AI Engine clears the path ahead of the ambulance (the "Green Corridor") while simultaneously transmitting high-frequency patient vitals and dynamic ETAs to the receiving hospital, allowing medical teams to prepare *before* the ambulance even arrives.

---

## 🏗️ System Architecture 

The ecosystem is built as a highly decoupled, real-time monorepo with 4 distinct pillars:

### 1. 🚑 Ambulance Telemetry App `[Frontend / Mobile]`
A tactical, dark-themed PWA designed for high-stress environments.
- **Severity Triage**: Instantly classify the emergency (Critical, Moderate, Stable).
- **1Hz GPS Broadcasting**: Streams high-fidelity telemetry to the centralized cloud.
- **Dynamic ETA**: Live route tracking with auto-updating arrival estimates.

### 2. 🏥 Hospital Command Center `[Frontend / Desktop]`
A state-of-the-art ER dashboard functioning as a medical air-traffic control tower.
- **Live Fleet Radar**: Tracks the incoming ambulance on a deeply customized dark-mode CartoDB map.
- **Tactical HUD**: Displays raw telemetry including speed (KM/H) and distance remaining (KM).
- **Proactive ER Checklist**: Generates an automated preparation checklist (Ventilators, Surgical Teams, Defibrillators) based on the patient's severity level.

### 3. 🧠 AI Control Node `[Backend / API]`
The brain of the operation routing all WebSocket and HTTP traffic.
- **Session orchestration**: Manages the lifecycle of emergencies.
- **Geofence Engine**: Continuously calculates ambulance proximity to upcoming traffic signal nodes.

### 4. 🛜 Traffic Grid Integration `[IoT / Firmware]`
- Embedded C++ firmware for ESP32 microcontrollers.
- Interfaces with traffic light controllers to preemptively trigger Green sequences upon emergency approach.

---

## 🚀 Quick Start Guide

Ready to deploy the corridor? Follow these steps to spin up the local grid.

### 🔑 1. Environment Configuration
The system relies on Firebase Realtime Database for sub-millisecond data synchronization.
Create a `.env.local` file in both `ambulance-app` and `hospital-dashboard`:

```env
VITE_FIREBASE_API_KEY="your_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_FIREBASE_DB_URL="https://your_db_url.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
```

### ⚡ 2. Booting the Nodes

You will need three separate terminal instances to boot the entire ecosystem.

**Terminal 1: The Brain (Backend)**
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:3000
```

**Terminal 2: The Fleet (Ambulance App)**
```bash
cd ambulance-app
npm install
npm run dev -- --port 5175
# Running on http://localhost:5175
```

**Terminal 3: The Base (Hospital Dashboard)**
```bash
cd hospital-dashboard
npm install
npm run dev -- --port 5177
# Running on http://localhost:5177
```

---

## 🎯 The Emergency Lifecycle

1. 🔥 **Initiation**: Paramedics launch the Ambulance App, hit **ACTIVATE**, and define triage severity.
2. 📡 **Handshake**: The backend immediately generates a secure UUID session and syncs it to the cloud.
3. 🚨 **Red Alert**: The Hospital Dashboard receives the ping, triggering visual alarms and deploying the customized ER preparation checklist.
4. 📍 **Live Vectoring**: The ambulance begins transmitting GPS coordinates. The hospital watches the blip traverse the map in real-time.
5. 🟢 **Grid Clearance**: The backend evaluates geofences and overrides traffic signals ahead of the ambulance to ensure zero stops.
6. 🏁 **Arrival**: The ambulance reaches the ER. The session terminates, and the city traffic grids return to normal operation.

---

<div align="center">
  <b>Built for speed. Built for reliability. Built to save lives.</b>
</div>
