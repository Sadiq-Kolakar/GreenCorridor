import { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { ref, onValue } from 'firebase/database';
import type { IEmergencySession, IHospitalPrep } from './types/index';

function App() {
  const [activeSession, setActiveSession] = useState<IEmergencySession | null>(null);
  const [prepData, setPrepData] = useState<IHospitalPrep | null>(null);
  
  // Realtime listener for incoming emergencies for 'hosp-001'
  useEffect(() => {
    const sessionsRef = ref(db, 'emergency_sessions');
    const unsub = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setActiveSession(null); return; }
      
      // Find the first active session for this hospital
      const active = Object.values(data).find(
        (s: any) => s.hospitalId === 'hosp-001' && s.status === 'active'
      ) as IEmergencySession;
      
      setActiveSession(active || null);
    });
    return () => unsub();
  }, []);

  // Listen to checklist for the active session
  useEffect(() => {
    if (!activeSession) { setPrepData(null); return; }
    const prepRef = ref(db, `hospital_prep/${activeSession.id}`);
    const unsub = onValue(prepRef, (snapshot) => {
      setPrepData(snapshot.val());
    });
    return () => unsub();
  }, [activeSession]);


  if (!activeSession) {
    return (
      <div className="min-h-screen p-8 text-white flex flex-col">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold tracking-tight">🏥 City General Hospital</h1>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded">Logout</button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center dashboard-glass max-w-3xl mx-auto w-full p-12 text-center opacity-80">
          <div className="w-4 h-4 rounded-full bg-gv-green mb-6 shadow-[0_0_20px_#00e676]"></div>
          <h2 className="text-3xl font-light mb-2">Status: STANDBY</h2>
          <p className="text-white/50 text-lg">No Active Emergencies</p>
        </div>
      </div>
    );
  }

  // Active Emergency View
  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Alert Banner */}
      <div className="w-full bg-gv-red text-white py-4 px-8 flex justify-between items-center animate-pulse shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🚨</span>
          <div>
            <h2 className="font-bold text-xl uppercase tracking-widest">EMERGENCY INCOMING</h2>
            <p className="text-sm opacity-90">Vehicle: {activeSession.vehicleId} | Driver: {activeSession.driverName}</p>
          </div>
        </div>
        <button className="bg-white text-gv-red font-bold py-2 px-6 rounded shadow hover:bg-white/90 active:scale-95 transition-transform">
          ACKNOWLEDGE
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Map & ETA */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          <div className="dashboard-glass p-6 text-center shadow-[0_0_40px_rgba(255,179,0,0.1)]">
            <h3 className="text-white/50 uppercase tracking-widest text-sm mb-2">Estimated Time to Arrival</h3>
            {/* Format seconds to MM:SS */}
            <div className="text-7xl font-mono font-bold text-gv-amber tabular-nums tracking-tighter shadow-sm mb-4">
               {Math.floor(activeSession.etaSeconds / 60).toString().padStart(2, '0')}:{(activeSession.etaSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex justify-center gap-8 text-sm opacity-70">
              <div>Distance: <span className="text-white font-medium">1.8 km</span></div>
              <div>ETA Saved: <span className="text-gv-green font-medium">+3 min</span></div>
            </div>
          </div>

          <div className="dashboard-glass flex-1 min-h-[400px] relative overflow-hidden flex flex-col">
             <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
               <h3 className="font-bold tracking-wide">LIVE AMBULANCE TRACKING</h3>
               <span className="text-gv-green text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gv-green animate-pulse"></span> GPS Live ({activeSession.currentLat.toFixed(4)}, {activeSession.currentLng.toFixed(4)})</span>
             </div>
             <div className="flex-1 bg-black/40 relative">
                {/* Mock Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Bangalore&zoom=14&size=800x600&maptype=roadmap&key=DUMMY')] bg-cover bg-center"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white/30 tracking-[0.5em] font-light text-xl">
                  [ GOOGLE MAPS RENDERING ]
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Severity & Checklist */}
        <div className="space-y-8">
          <div className="dashboard-glass p-6">
            <h3 className="text-white/50 uppercase tracking-widest text-sm mb-4">Patient Severity</h3>
            <div className={`w-full py-4 text-center rounded text-xl uppercase font-bold tracking-wider ${activeSession.severity === 'critical' ? 'bg-gv-red' : activeSession.severity === 'moderate' ? 'bg-gv-amber' : 'bg-gv-green text-black'}`}>
              {activeSession.severity}
            </div>
          </div>

          <div className="dashboard-glass p-6 flex-1">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-white/50 uppercase tracking-widest text-sm">Preparation Checklist</h3>
              <span className="text-lg font-bold">{prepData?.readinessScore || 0}% Ready</span>
            </div>
            
            <div className="space-y-3">
              {prepData?.checklist && Object.entries(prepData.checklist).map(([item, isReady]) => (
                <label key={item} className={`flex items-center gap-4 p-4 rounded cursor-pointer transition-colors border ${isReady ? 'bg-gv-green/20 border-gv-green/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  <input type="checkbox" className="w-6 h-6 rounded accent-gv-green" checked={isReady} onChange={() => {}} />
                  <span className={`text-lg transition-colors ${isReady ? 'text-gv-green font-medium' : 'text-white'}`}>{item}</span>
                </label>
              ))}
              
              {!prepData?.checklist && (
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="h-16 bg-white/10 rounded"></div>
                  <div className="h-16 bg-white/10 rounded"></div>
                  <div className="h-16 bg-white/10 rounded"></div>
                  <div className="h-16 bg-white/10 rounded"></div>
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
