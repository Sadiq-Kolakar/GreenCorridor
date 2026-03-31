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

  const handleActivate = () => {
    setStep('severity');
  };

  const handleSeveritySelect = async (level: Severity) => {
    setSeverity(level);
    try {
      const res = await fetch('http://localhost:3000/api/emergency/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverName: 'Ravi Kumar', severity: level, hospitalId: 'hosp-001' })
      });
      const data = await res.json();
      if (data.session) {
        setSessionId(data.session.id);
        setStep('active');
      }
    } catch {
      // For demo: skip backend and go directly to active state
      setSessionId('demo-session-' + Date.now());
      setStep('active');
    }
  };

  const handleArrived = async () => {
    if (!sessionId) return;
    try {
      await fetch('http://localhost:3000/api/emergency/arrived', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch { /* ignore */ }
    setSessionId(null);
    setStep('standby');
  };

  return (
    <div className="min-h-screen bg-gv-base text-gv-text flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-gv-surface">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚑</span>
          <h1 className="text-lg font-bold tracking-tight">Green Corridor AI</h1>
        </div>
        <div className="flex items-center gap-2 text-gv-green text-sm">
          <span className="w-2 h-2 rounded-full bg-gv-green animate-pulse-glow" style={{ color: '#00e676' }}></span>
          GPS Lock
        </div>
      </header>

      {/* ===== STANDBY ===== */}
      {step === 'standby' && (
        <main className="flex-1 flex flex-col justify-center px-6 pb-8">
          <div className="glass p-6 mb-8">
            <span className="text-xs uppercase tracking-widest text-gv-text-muted">Vehicle</span>
            <h2 className="text-lg font-semibold mt-1">KA-01-AB-1234</h2>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full bg-gv-green"></span>
              <span className="text-gv-green font-semibold text-xl">STANDBY</span>
            </div>
            <p className="text-sm text-gv-text-muted mt-2">Driver: Ravi Kumar</p>
          </div>
          
          <button 
            onClick={handleActivate}
            className="w-full bg-gv-red text-white text-2xl font-bold py-14 rounded-2xl glow-red hover:scale-[1.02] transition-transform active:scale-95"
          >
            ACTIVATE EMERGENCY
            <span className="block text-sm font-normal opacity-80 mt-2">tap to start corridor</span>
          </button>
        </main>
      )}

      {/* ===== SEVERITY ===== */}
      {step === 'severity' && (
        <main className="flex-1 flex flex-col justify-center px-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Patient Severity</h2>
          <div className="space-y-4">
            <button onClick={() => handleSeveritySelect('critical')} className="w-full bg-gv-red text-white text-xl font-bold py-10 rounded-2xl flex flex-col items-center glow-red active:scale-95 transition-transform">
              <span>🔴 CRITICAL</span>
              <span className="text-sm font-normal opacity-80 mt-1">Life-threatening condition</span>
            </button>
            <button onClick={() => handleSeveritySelect('moderate')} className="w-full bg-gv-amber text-black text-xl font-bold py-10 rounded-2xl flex flex-col items-center shadow-lg active:scale-95 transition-transform">
              <span>🟡 MODERATE</span>
              <span className="text-sm font-normal opacity-80 mt-1">Serious but stable vitals</span>
            </button>
            <button onClick={() => handleSeveritySelect('stable')} className="w-full bg-gv-green text-black text-xl font-bold py-10 rounded-2xl flex flex-col items-center glow-green active:scale-95 transition-transform">
              <span>🟢 STABLE</span>
              <span className="text-sm font-normal opacity-80 mt-1">Conscious, talking</span>
            </button>
          </div>
        </main>
      )}

      {/* ===== ACTIVE EMERGENCY ===== */}
      {step === 'active' && (
        <main className="flex-1 flex flex-col">
          {/* Emergency Status Bar */}
          <div className="animate-emergency text-white p-4 flex justify-between items-center shadow-lg">
            <span className="font-bold flex items-center gap-2">🔴 EMERGENCY ACTIVE</span>
            <span className="font-mono text-xl font-bold tracking-wider">ETA 04:32</span>
          </div>
          
          {/* Live Map */}
          <div className="h-64 w-full">
            <LiveMap ambulancePos={null} isActive={true} />
          </div>

          {/* Signal Chain */}
          <div className="bg-gv-card p-4 mx-4 rounded-xl mt-4">
            <h3 className="text-xs text-gv-text-muted uppercase tracking-widest mb-3">Signal Chain Status</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="glass-bright px-3 py-2 text-sm whitespace-nowrap opacity-50 line-through">✅ S1: MG Road</div>
              <div className="bg-gv-green/15 border border-gv-green/40 text-gv-green px-3 py-2 rounded-lg text-sm whitespace-nowrap animate-pulse font-bold">🟢 S2: Brigade Rd</div>
              <div className="glass-bright px-3 py-2 text-sm whitespace-nowrap text-gv-text-muted">🔴 S3: Trinity</div>
              <div className="glass-bright px-3 py-2 text-sm whitespace-nowrap text-gv-text-muted">🔴 S4: Indiranagar</div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gv-text-muted">Severity:</span> <span className="font-bold capitalize text-gv-red">{severity}</span></div>
              <div><span className="text-gv-text-muted">Hospital:</span> <span className="font-medium">City General</span></div>
            </div>
          </div>

          {/* Arrived Button */}
          <div className="mt-auto p-4">
            <button 
              onClick={handleArrived}
              className="w-full bg-gv-green text-black text-xl font-bold py-6 rounded-2xl glow-green hover:scale-[1.02] transition-transform active:scale-95"
            >
              ✅ ARRIVED AT HOSPITAL
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
