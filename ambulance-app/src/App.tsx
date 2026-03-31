import { useState } from 'react';
import { useGPSBroadcast } from './hooks/useGPSBroadcast';
import { Severity } from './types/index';
import LiveMap from './components/LiveMap';

type AppStep = 'standby' | 'severity' | 'active';

function App() {
  const [step, setStep] = useState<AppStep>('standby');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity>('critical');

  useGPSBroadcast(sessionId);

  const handleActivate = () => setStep('severity');

  const handleSeveritySelect = async (level: Severity) => {
    setSeverity(level);
    try {
      const res = await fetch('http://localhost:3000/api/emergency/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverName: 'Ravi Kumar', severity: level, hospitalId: 'hosp-001' })
      });
      const data = await res.json();
      if (data.session) { setSessionId(data.session.id); setStep('active'); }
    } catch {
      setSessionId('demo-session-' + Date.now());
      setStep('active');
    }
  };

  const handleArrived = async () => {
    if (!sessionId) return;
    try {
      await fetch('http://localhost:3000/api/emergency/arrived', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch { /* ignore */ }
    setSessionId(null);
    setStep('standby');
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
          {step !== 'active' && (
            <button onClick={handleActivate}
              className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg font-bold text-sm tracking-widest active:scale-95 duration-200">
              ACTIVATE
            </button>
          )}
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
          {[{ icon: 'ambulance', label: 'Fleet' }, { icon: 'traffic', label: 'Traffic' }, { icon: 'analytics', label: 'Analytics' }].map(({ icon, label }) => (
            <div key={icon} className="text-on-surface/40 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300 py-3 px-6 flex items-center gap-4 cursor-pointer">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-semibold text-sm uppercase tracking-widest">{label}</span>
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
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              step === 'active' 
                ? 'bg-primary-container/20 text-primary border-primary/30' 
                : 'bg-tertiary-container/20 text-tertiary border-tertiary/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${step === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(255,85,69,0.6)] animate-pulse' : 'bg-tertiary shadow-[0_0_8px_rgba(83,225,111,0.6)]'}`}></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {step === 'active' ? 'Emergency Active' : step === 'severity' ? 'Selecting Severity' : 'Ambulance: STANDBY'}
              </span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">directions_car</span>
              KA-01-AB-1234
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-on-surface/40 uppercase tracking-[0.15em]">Driver</span>
              <span className="text-xs font-bold">Ravi Kumar</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-on-surface/40 uppercase tracking-[0.15em]">GPS</span>
              <span className="text-xs font-bold text-tertiary">Locked</span>
            </div>
          </div>
        </div>

        {/* ===== STANDBY VIEW ===== */}
        {step === 'standby' && (
          <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
              {/* Map Preview */}
              <div className="flex-1 rounded-xl bg-surface-container-lowest overflow-hidden shadow-inner relative">
                <LiveMap ambulancePos={null} isActive={false} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-[1000]">
                  <div className="glass-panel px-8 py-6 rounded-xl text-center border border-outline-variant/10">
                    <span className="material-symbols-outlined text-tertiary text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>gps_fixed</span>
                    <p className="text-lg font-bold text-on-surface uppercase tracking-widest">GPS READY</p>
                    <p className="text-on-surface/40 text-xs mt-1">Waiting for emergency activation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              {/* Vehicle Card */}
              <div className="bg-surface-container-high rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-bold mb-1">Vehicle Unit</p>
                <h2 className="text-xl font-bold text-on-surface tracking-tight mb-4">KA-01-AB-1234</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs"><span className="text-on-surface/60 uppercase tracking-wider">Status</span><span className="font-bold text-tertiary">STANDBY</span></div>
                  <div className="flex justify-between text-xs"><span className="text-on-surface/60 uppercase tracking-wider">Driver</span><span className="font-bold">Ravi Kumar</span></div>
                  <div className="flex justify-between text-xs"><span className="text-on-surface/60 uppercase tracking-wider">Fuel</span><span className="font-bold text-tertiary">92%</span></div>
                </div>
              </div>

              {/* Big Activate Button */}
              <button onClick={handleActivate}
                className="w-full py-12 bg-primary-container text-on-primary-container rounded-xl font-black text-2xl uppercase tracking-widest shadow-[0_0_40px_rgba(255,85,69,0.3)] active:scale-95 transition-transform glow-emergency">
                <span className="material-symbols-outlined text-4xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                ACTIVATE<br />
                <span className="text-sm font-bold opacity-80 tracking-[0.3em]">EMERGENCY CORRIDOR</span>
              </button>
            </div>
          </div>
        )}

        {/* ===== SEVERITY VIEW ===== */}
        {step === 'severity' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-on-surface mb-2 uppercase tracking-widest">Select Patient Severity</h2>
            <p className="text-on-surface/40 text-sm mb-8">Classification determines corridor priority level</p>
            <div className="w-full max-w-lg space-y-4">
              <button onClick={() => handleSeveritySelect('critical')}
                className="w-full bg-error-container text-on-error-container p-8 rounded-xl flex items-center gap-6 glow-emergency active:scale-95 transition-transform shadow-2xl border border-primary/20 hover:bg-error-container/80">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                <div className="text-left">
                  <span className="text-xl font-black uppercase tracking-widest">CRITICAL</span>
                  <br /><span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Life-threatening condition</span>
                </div>
              </button>
              <button onClick={() => handleSeveritySelect('moderate')}
                className="w-full bg-[#ffb300] text-black p-8 rounded-xl flex items-center gap-6 active:scale-95 transition-transform shadow-2xl border border-[#ffb300]/20 hover:bg-[#ffb300]/80">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <div className="text-left">
                  <span className="text-xl font-black uppercase tracking-widest">MODERATE</span>
                  <br /><span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Serious but stable vitals</span>
                </div>
              </button>
              <button onClick={() => handleSeveritySelect('stable')}
                className="w-full bg-tertiary-container text-on-tertiary-container p-8 rounded-xl flex items-center gap-6 active:scale-95 transition-transform shadow-2xl border border-tertiary/20 hover:bg-tertiary-container/80">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div className="text-left">
                  <span className="text-xl font-black uppercase tracking-widest">STABLE</span>
                  <br /><span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Conscious, talking</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ===== ACTIVE EMERGENCY VIEW ===== */}
        {step === 'active' && (
          <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
              {/* Live Map */}
              <div className="flex-1 rounded-xl bg-surface-container-lowest relative overflow-hidden shadow-inner">
                <LiveMap ambulancePos={null} isActive={true} />
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

              {/* Feed */}
              <div className="h-32 bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 overflow-y-auto border border-outline-variant/5">
                <div className="flex items-center gap-3 animate-pulse">
                  <span className="material-symbols-outlined text-primary text-sm">broadcast_on_home</span>
                  <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Approaching final junction - ETA 2m</span>
                  <span className="ml-auto text-[9px] text-on-surface/40 font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                  <span className="text-[11px] font-bold text-tertiary/80 uppercase tracking-wider">Signals cleared - Green Zone active</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-sm">navigation</span>
                  <span className="text-[11px] font-bold text-on-surface/60 uppercase tracking-wider">Green corridor activated by AI-Commander</span>
                </div>
              </div>
            </div>

            {/* Right: Signal + Arrival */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
              {/* ETA Card */}
              <div className="bg-surface-container-high rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-bold mb-1">Active Session</p>
                    <h2 className="text-xl font-bold text-on-surface tracking-tight">CORRIDOR ACTIVE</h2>
                  </div>
                  <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 glow-emergency">
                    {severity.toUpperCase()}
                  </span>
                </div>
                <div className="bg-black/20 rounded-lg p-5 flex flex-col items-center border border-outline-variant/10 mb-4">
                  <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-bold mb-2">ETA COUNTDOWN</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-mono tracking-tighter text-primary">04:32</span>
                    <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">MIN</span>
                  </div>
                </div>
                {/* Signal Chain */}
                <div className="space-y-2">
                  <p className="text-[10px] text-on-surface/40 uppercase tracking-widest font-bold mb-2">Signal Chain</p>
                  <div className="flex items-center gap-3 p-2 rounded bg-surface-container/50 text-on-surface/40 line-through">
                    <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">S1: MG Road</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded bg-tertiary/10 border border-tertiary/30 text-tertiary animate-pulse">
                    <span className="material-symbols-outlined text-sm">radio_button_checked</span>
                    <span className="text-xs font-bold uppercase tracking-wider">S2: Brigade Rd (CLEARED)</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded bg-surface-container/50 text-on-surface/60">
                    <span className="material-symbols-outlined text-primary text-sm">radio_button_unchecked</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">S3: Trinity</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded bg-surface-container/50 text-on-surface/60">
                    <span className="material-symbols-outlined text-primary text-sm">radio_button_unchecked</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">S4: Indiranagar</span>
                  </div>
                </div>
              </div>

              {/* Arrived Button */}
              <button onClick={handleArrived}
                className="w-full py-8 bg-tertiary-container text-on-tertiary-container rounded-xl font-black text-lg uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-3xl mb-1 block" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
                ARRIVED AT HOSPITAL
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ===== BottomNav (Mobile) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-2xl border-t border-surface-variant/30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-2xl">
        <div className={`flex flex-col items-center justify-center rounded-xl px-6 py-2 transition-transform ${
          step === 'active' ? 'bg-primary-container text-background shadow-[0_0_15px_#ff5545] scale-110' : 'text-on-surface/50'
        }`}>
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
