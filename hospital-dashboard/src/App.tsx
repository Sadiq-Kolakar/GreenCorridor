import { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { ref, onValue } from 'firebase/database';
import type { IEmergencySession, IHospitalPrep } from './types/index';
import TrackingMap from './components/TrackingMap';

function App() {
  const [activeSession, setActiveSession] = useState<IEmergencySession | null>(null);
  const [prepData, setPrepData] = useState<IHospitalPrep | null>(null);
  const [checklist, setChecklist] = useState([
    { label: 'Prepare stretcher', done: true },
    { label: 'Alert emergency doctor', done: false },
    { label: 'Keep ICU ready', done: false },
    { label: 'Wheelchair standby', done: false },
  ]);

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
    const unsub = onValue(prepRef, (snapshot) => setPrepData(snapshot.val()));
    return () => unsub();
  }, [activeSession]);

  const toggleCheck = (idx: number) => {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, done: !c.done } : c));
  };

  // For demo: always show the active view with mocked data
  const session = activeSession || {
    id: 'demo-001',
    vehicleId: 'KA-01-AB-1234',
    driverName: 'Ravi Kumar',
    severity: 'critical' as const,
    hospitalId: 'hosp-001',
    status: 'active' as const,
    currentLat: 12.9735,
    currentLng: 77.6120,
    etaSeconds: 310,
    routeSignals: [],
    startedAt: Date.now(),
  };

  return (
    <div className="font-[Inter] selection:bg-primary-container selection:text-on-primary-container">
      {/* ===== TopAppBar ===== */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#131313]/60 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-tighter text-primary uppercase">Green Corridor AI</span>
          <div className="h-6 w-px bg-outline-variant/30 hidden md:block"></div>
          <h1 className="hidden md:block font-medium tracking-tight text-on-surface">Emergency Incoming Ambulance Monitor</h1>
        </div>
        <nav className="hidden md:flex gap-8 items-center h-full">
          <a className="text-primary border-b-2 border-primary h-full flex items-center px-2 font-medium" href="#">Command</a>
          <a className="text-on-surface/60 hover:bg-surface-variant transition-colors h-full flex items-center px-2" href="#">Fleet</a>
          <a className="text-on-surface/60 hover:bg-surface-variant transition-colors h-full flex items-center px-2" href="#">Traffic</a>
          <a className="text-on-surface/60 hover:bg-surface-variant transition-colors h-full flex items-center px-2" href="#">Analytics</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-secondary">
            <span className="material-symbols-outlined">sensors</span>
            <span className="material-symbols-outlined">wifi</span>
            <span className="material-symbols-outlined">notifications_active</span>
          </div>
          <button className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg font-bold text-sm tracking-widest active:scale-95 duration-200">
            ACTIVATE
          </button>
        </div>
      </header>

      {/* ===== SideNavBar (XL only) ===== */}
      <aside className="fixed left-0 top-0 h-full flex-col pt-20 pb-8 bg-[#131313] w-64 hidden xl:flex">
        <div className="px-6 mb-8">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">Tactical Intel</p>
          <p className="text-on-surface/40 text-[10px] font-semibold uppercase tracking-widest">Sector 7 Monitor</p>
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-secondary bg-secondary-container/10 border-r-4 border-secondary-container py-3 px-6 flex items-center gap-4 cursor-pointer">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-semibold text-sm uppercase tracking-widest">Command</span>
          </div>
          {['ambulance', 'traffic', 'analytics'].map((item) => (
            <div key={item} className="text-on-surface/40 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300 py-3 px-6 flex items-center gap-4 cursor-pointer">
              <span className="material-symbols-outlined">{item}</span>
              <span className="font-semibold text-sm uppercase tracking-widest">{item === 'ambulance' ? 'Fleet' : item}</span>
            </div>
          ))}
        </div>
        <div className="px-6 space-y-4">
          <button className="w-full py-3 bg-error-container text-on-error-container font-bold text-xs tracking-tighter rounded-lg border border-primary/20">
            EMERGENCY OVERRIDE
          </button>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-on-surface/40 hover:text-on-surface cursor-pointer text-xs font-semibold uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">settings</span><span>Settings</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface/40 hover:text-on-surface cursor-pointer text-xs font-semibold uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">help</span><span>Support</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main Canvas ===== */}
      <main className="pt-16 pb-20 xl:pb-0 xl:pl-64 h-screen w-full flex flex-col">
        {/* Header Strip */}
        <div className="px-6 py-4 flex flex-wrap justify-between items-center bg-surface-container-low/40 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full border border-tertiary/30">
              <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(83,225,111,0.6)]"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Hospital Status: READY</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">location_on</span>
              METRO GENERAL UNIT 4
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-on-surface/40 uppercase tracking-[0.15em]">Last Sync</span>
              <span className="text-xs font-mono font-bold">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-on-surface/40 uppercase tracking-[0.15em]">Active Units</span>
              <span className="text-xs font-mono font-bold text-secondary">03</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Left: Map + Feed */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
            {/* Live Tracking Map */}
            <div className="flex-1 rounded-xl bg-surface-container-lowest relative overflow-hidden shadow-inner">
              <TrackingMap ambulanceLat={session.currentLat} ambulanceLng={session.currentLng} />
              {/* HUD Overlays */}
              <div className="absolute bottom-4 left-4 flex gap-4 z-[1000]">
                <div className="glass-panel px-4 py-3 rounded-lg border border-outline-variant/10">
                  <p className="text-[9px] text-on-surface/40 uppercase tracking-widest mb-1">Distance Remaining</p>
                  <p className="text-xl font-bold font-mono">3.2 <span className="text-xs font-normal">KM</span></p>
                </div>
                <div className="glass-panel px-4 py-3 rounded-lg border border-outline-variant/10">
                  <p className="text-[9px] text-on-surface/40 uppercase tracking-widest mb-1">Current Speed</p>
                  <p className="text-xl font-bold font-mono">88 <span className="text-xs font-normal">KM/H</span></p>
                </div>
              </div>
            </div>

            {/* Status Feed */}
            <div className="h-32 bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 overflow-y-auto border border-outline-variant/5">
              <div className="flex items-center gap-3 animate-pulse">
                <span className="material-symbols-outlined text-primary text-sm">broadcast_on_home</span>
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Ambulance approaching final junction - ETA 2m</span>
                <span className="ml-auto text-[9px] text-on-surface/40 font-mono">14:28:10</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                <span className="text-[11px] font-bold text-tertiary/80 uppercase tracking-wider">Signals cleared ahead - Sector 7 Green Zone active</span>
                <span className="ml-auto text-[9px] text-on-surface/40 font-mono">14:26:45</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-sm">navigation</span>
                <span className="text-[11px] font-bold text-on-surface/60 uppercase tracking-wider">Green corridor activated by AI-Commander</span>
                <span className="ml-auto text-[9px] text-on-surface/40 font-mono">14:25:20</span>
              </div>
            </div>
          </div>

          {/* Right: Patient + Checklist */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
            {/* Patient Status Card */}
            <div className="bg-surface-container-high rounded-xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-bold mb-1">Case #8821-Alpha</p>
                  <h2 className="text-xl font-bold text-on-surface tracking-tight">TRAUMA RESPOND</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border glow-emergency ${
                  session.severity === 'critical' ? 'bg-error-container text-on-error-container border-primary/20' :
                  session.severity === 'moderate' ? 'bg-[#ffb300] text-black border-[#ffb300]/20' :
                  'bg-tertiary text-on-tertiary border-tertiary/20'
                }`}>
                  {session.severity?.toUpperCase() || 'CRITICAL'}
                </span>
              </div>
              <div className="bg-black/20 rounded-lg p-5 flex flex-col items-center border border-outline-variant/10">
                <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-bold mb-2">ETA COUNTDOWN</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black font-mono tracking-tighter text-primary">
                    {Math.floor(session.etaSeconds / 60).toString().padStart(2, '0')}:{(session.etaSeconds % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">MIN</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface/60 font-semibold uppercase tracking-wider">Blood Type</span>
                  <span className="font-bold text-on-surface">O Negative</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface/60 font-semibold uppercase tracking-wider">Pulse Rate</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">favorite</span> 112 BPM
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface/60 font-semibold uppercase tracking-wider">SpO2 Level</span>
                  <span className="font-bold text-tertiary">94%</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="flex-1 bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 border border-outline-variant/5 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary">assignment_turned_in</span>
                <h3 className="text-sm font-bold uppercase tracking-widest">Action Checklist</h3>
              </div>
              <div className="flex-1 space-y-3">
                {checklist.map((item, idx) => (
                  <div key={idx} onClick={() => toggleCheck(idx)}
                    className="group flex items-center gap-4 p-3 rounded-lg bg-surface-container/50 hover:bg-surface-container transition-all cursor-pointer">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      item.done ? 'border-tertiary bg-tertiary/10' : 'border-outline-variant'
                    }`}>
                      {item.done && <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'wght' 700" }}>check</span>}
                    </div>
                    <span className={`text-xs font-semibold text-on-surface uppercase tracking-wider ${item.done ? 'line-through opacity-40' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-secondary-container text-on-secondary-container font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg active:scale-95 transition-transform">
                CONFIRM ALL PREPARATIONS
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===== BottomNav (Mobile) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-2xl border-t border-surface-variant/30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-2xl">
        <div className="flex flex-col items-center justify-center bg-primary-container text-background rounded-xl px-6 py-2 shadow-[0_0_15px_#ff5545] scale-110 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Critical</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface/50 px-4 py-2 hover:text-primary">
          <span className="material-symbols-outlined">route</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Telemetry</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface/50 px-4 py-2 hover:text-primary">
          <span className="material-symbols-outlined">settings_input_component</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Signals</span>
        </div>
      </nav>
    </div>
  );
}

export default App;
