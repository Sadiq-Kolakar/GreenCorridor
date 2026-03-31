import { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { ref, onValue } from 'firebase/database';
import type { IEmergencySession, IHospitalPrep } from './types/index';
import TrackingMap from './components/TrackingMap';

function App() {
  const [activeSession, setActiveSession] = useState<IEmergencySession | null>(null);
  const [prepData, setPrepData] = useState<IHospitalPrep | null>(null);
  
  useEffect(() => {
    const sessionsRef = ref(db, 'emergency_sessions');
    const unsub = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setActiveSession(null); return; }
      const active = Object.values(data).find(
        (s: any) => s.hospitalId === 'hosp-001' && s.status === 'active'
      ) as IEmergencySession;
      setActiveSession(active || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeSession) { setPrepData(null); return; }
    const prepRef = ref(db, `hospital_prep/${activeSession.id}`);
    const unsub = onValue(prepRef, (snapshot) => {
      setPrepData(snapshot.val());
    });
    return () => unsub();
  }, [activeSession]);

  // ===== STANDBY VIEW =====
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gv-base text-gv-text flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-5 bg-gv-surface">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <h1 className="text-xl font-bold tracking-tight">City General Hospital</h1>
            <span className="text-xs uppercase tracking-widest text-gv-text-muted ml-2 bg-gv-card-high px-2 py-0.5 rounded">ER COMMAND</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gv-green text-sm">
              <span className="w-2 h-2 rounded-full bg-gv-green animate-pulse-glow" style={{ color: '#00e676' }}></span>
              System Online
            </div>
            <button className="glass-bright px-4 py-2 text-sm text-gv-text-muted hover:text-gv-text transition-colors">Logout</button>
          </div>
        </header>

        {/* Standby Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="dashboard-glass max-w-2xl w-full p-16 text-center">
            {/* Pulsing green orb */}
            <div className="w-6 h-6 rounded-full bg-gv-green mx-auto mb-8 animate-pulse-glow" style={{ color: '#00e676' }}></div>
            
            <h2 className="text-4xl font-light mb-3 tracking-tight">STANDBY</h2>
            <p className="text-gv-text-muted text-lg mb-8">No Active Emergencies</p>
            
            <div className="flex justify-center gap-8 text-sm text-gv-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gv-green"></span>
                ER Bay: Ready
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gv-green"></span>
                Staff: On Duty
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gv-green"></span>
                Equipment: Checked
              </div>
            </div>
          </div>

          <p className="text-xs text-gv-text-muted mt-8 tracking-widest uppercase">Green Corridor AI • Live Monitoring Active</p>
        </main>
      </div>
    );
  }

  // ===== ACTIVE EMERGENCY VIEW =====
  return (
    <div className="min-h-screen bg-gv-base text-gv-text flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Emergency Alert Banner */}
      <div className="w-full animate-emergency text-white py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🚨</span>
          <div>
            <h2 className="font-bold text-xl uppercase tracking-widest">EMERGENCY INCOMING</h2>
            <p className="text-sm opacity-90">Vehicle: {activeSession.vehicleId} • Driver: {activeSession.driverName}</p>
          </div>
        </div>
        <button className="bg-white text-gv-red font-bold py-2 px-6 rounded-lg shadow hover:bg-white/90 active:scale-95 transition-transform">
          ACKNOWLEDGE
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: ETA + Map */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* ETA Card */}
          <div className="dashboard-glass p-8 text-center glow-amber">
            <h3 className="text-gv-text-muted uppercase tracking-widest text-xs mb-3">Estimated Time to Arrival</h3>
            <div className="eta-display text-gv-amber">
              {Math.floor(activeSession.etaSeconds / 60).toString().padStart(2, '0')}:{(activeSession.etaSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex justify-center gap-8 text-sm text-gv-text-muted mt-4">
              <div>Distance: <span className="text-gv-text font-medium">1.8 km</span></div>
              <div>Time Saved: <span className="text-gv-green font-medium">+3 min</span></div>
            </div>
          </div>

          {/* Map */}
          <div className="dashboard-glass flex-1 min-h-[400px] overflow-hidden flex flex-col">
            <div className="bg-gv-card-high p-4 flex justify-between items-center">
              <h3 className="font-bold tracking-wide text-sm uppercase">Live Ambulance Tracking</h3>
              <span className="text-gv-green text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gv-green animate-pulse"></span>
                GPS ({activeSession.currentLat.toFixed(4)}, {activeSession.currentLng.toFixed(4)})
              </span>
            </div>
            <div className="flex-1">
              <TrackingMap ambulanceLat={activeSession.currentLat} ambulanceLng={activeSession.currentLng} />
            </div>
          </div>
        </div>

        {/* Right: Severity + Checklist */}
        <div className="space-y-6">
          {/* Severity */}
          <div className="dashboard-glass p-6">
            <h3 className="text-gv-text-muted uppercase tracking-widest text-xs mb-4">Patient Severity</h3>
            <div className={`w-full py-4 text-center rounded-lg text-xl uppercase font-bold tracking-wider ${
              activeSession.severity === 'critical' ? 'bg-gv-red glow-red text-white' : 
              activeSession.severity === 'moderate' ? 'bg-gv-amber glow-amber text-black' : 
              'bg-gv-green glow-green text-black'
            }`}>
              {activeSession.severity}
            </div>
          </div>

          {/* Checklist */}
          <div className="dashboard-glass p-6 flex-1">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-gv-text-muted uppercase tracking-widest text-xs">Preparation Checklist</h3>
              <span className="text-lg font-bold font-mono">{prepData?.readinessScore || 0}%</span>
            </div>
            
            <div className="space-y-2">
              {prepData?.checklist && Object.entries(prepData.checklist).map(([item, isReady]) => (
                <div key={item} className={`checklist-item flex items-center gap-4 ${isReady ? 'checked' : ''}`}>
                  <input type="checkbox" className="w-5 h-5 rounded accent-gv-green" checked={isReady} onChange={() => {}} />
                  <span className={`text-sm transition-colors ${isReady ? 'text-gv-green font-medium' : 'text-gv-text'}`}>{item}</span>
                </div>
              ))}
              
              {!prepData?.checklist && (
                <div className="space-y-2">
                  {['ER Bay Cleared', 'Trauma Team Alerted', 'Blood Bank Standby', 'Ventilator Ready', 'OR Prep Started'].map(item => (
                    <div key={item} className="checklist-item flex items-center gap-4">
                      <input type="checkbox" className="w-5 h-5 rounded accent-gv-green" checked={false} onChange={() => {}} />
                      <span className="text-sm text-gv-text">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
