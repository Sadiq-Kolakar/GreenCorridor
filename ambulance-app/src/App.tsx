import { useState } from 'react';
import { useGPSBroadcast } from './hooks/useGPSBroadcast';
import { Severity } from './types/index';

type AppStep = 'standby' | 'severity' | 'active';

function App() {
  const [step, setStep] = useState<AppStep>('standby');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity>('critical');
  
  // Custom hook that broadcasts location if sessionId is active
  useGPSBroadcast(sessionId);

  const handleActivate = () => {
    setStep('severity');
  };

  const handleSeveritySelect = async (level: Severity) => {
    setSeverity(level);
    
    // Call Backend API to create session
    try {
      const res = await fetch('http://localhost:3000/api/emergency/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: 'Ravi Kumar',
          severity: level,
          hospitalId: 'hosp-001'
        })
      });
      const data = await res.json();
      if (data.session) {
        setSessionId(data.session.id);
        setStep('active');
      }
    } catch (err) {
      alert("Failed to activate emergency");
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
      setSessionId(null);
      setStep('standby');
      alert("Arrived. Signals restored.");
    } catch (err) {
      alert("Error confirming arrival");
    }
  };

  return (
    <div className="min-h-screen bg-gv-dark text-white p-6 flex flex-col">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold">🚑 Green Corridor AI</h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gv-green animate-pulse"></span>
          <span className="text-sm font-medium text-white/70">GPS Lock</span>
        </div>
      </header>

      {step === 'standby' && (
        <main className="flex-1 flex flex-col justify-center">
          <div className="bg-gv-card p-6 rounded-2xl border border-white/5 mb-8">
            <h2 className="text-lg text-white/50 mb-1">VEHICLE: KA-01-AB-1234</h2>
            <p className="text-2xl font-semibold text-gv-green mb-4">STANDBY</p>
            <p className="text-sm text-white/50">Driver: Ravi Kumar</p>
          </div>
          
          <button 
            onClick={handleActivate}
            className="w-full bg-gv-red text-white text-2xl font-bold py-12 rounded-3xl shadow-[0_0_40px_rgba(255,51,102,0.4)] hover:scale-[1.02] transition-transform active:scale-95"
          >
            ACTIVATE EMERGENCY
            <span className="block text-sm font-normal opacity-80 mt-2">(tap to start)</span>
          </button>
        </main>
      )}

      {step === 'severity' && (
        <main className="flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-300">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Patient Severity</h2>
          <div className="space-y-4">
            <button onClick={() => handleSeveritySelect('critical')} className="w-full bg-[#ff3366] text-white text-xl font-bold py-8 rounded-2xl flex flex-col items-center shadow-lg active:scale-95 transition-transform">
              <span>🔴 CRITICAL</span>
              <span className="text-sm font-normal opacity-80 mt-1">Life-threatening condition</span>
            </button>
            <button onClick={() => handleSeveritySelect('moderate')} className="w-full bg-gv-amber text-white text-xl font-bold py-8 rounded-2xl flex flex-col items-center shadow-lg active:scale-95 transition-transform">
              <span>🟡 MODERATE</span>
              <span className="text-sm font-normal opacity-80 mt-1">Serious but stable vitals</span>
            </button>
            <button onClick={() => handleSeveritySelect('stable')} className="w-full bg-gv-green text-gray-900 text-xl font-bold py-8 rounded-2xl flex flex-col items-center shadow-lg active:scale-95 transition-transform">
              <span>🟢 STABLE</span>
              <span className="text-sm font-normal opacity-80 mt-1">Conscious, talking</span>
            </button>
          </div>
        </main>
      )}

      {step === 'active' && (
        <main className="flex-1 flex flex-col h-full animate-in slide-in-from-bottom-5">
          <div className="bg-gv-red text-white p-4 rounded-t-2xl flex justify-between items-center shadow-lg">
            <span className="font-bold flex items-center gap-2">🔴 EMERGENCY ACTIVE</span>
            <span className="font-mono text-xl font-bold tracking-wider">ETA: 04:32</span>
          </div>
          
          <div className="bg-white/10 h-64 w-full flex items-center justify-center relative overflow-hidden">
             {/* Map Placeholder */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Bangalore&zoom=13&size=600x300&maptype=roadmap&key=DUMMY')] bg-cover bg-center"></div>
             <div className="relative z-10 font-bold text-white/50 text-xl tracking-widest">[ LIVE ROUTE MAP ]</div>
          </div>

          <div className="bg-gv-card p-4 rounded-b-2xl border-x border-b border-white/10 mb-6">
            <h3 className="text-xs text-white/50 uppercase tracking-widest mb-2">Signal Chain</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="bg-white/5 px-3 py-1.5 rounded text-sm whitespace-nowrap"><span className="opacity-50 line-through">✅ S1: MG Road</span></div>
              <div className="bg-gv-green/20 border border-gv-green text-gv-green px-3 py-1.5 rounded text-sm whitespace-nowrap animate-pulse font-bold">🟢 S2: Brigade Rd (CLEARED)</div>
              <div className="bg-white/10 text-white/70 px-3 py-1.5 rounded text-sm whitespace-nowrap">🔴 S3: Trinity</div>
              <div className="bg-white/10 text-white/70 px-3 py-1.5 rounded text-sm whitespace-nowrap">🔴 S4: Indiranagar</div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1">
              <div className="flex justify-between"><span className="text-white/50">Severity:</span> <span className="font-bold capitalize text-gv-red">{severity}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Hospital:</span> <span>City General (1.8 km)</span></div>
            </div>
          </div>

          <div className="mt-auto">
            <button 
              onClick={handleArrived}
              className="w-full bg-gv-green text-gray-900 text-xl font-bold py-6 rounded-2xl shadow-[0_0_30px_rgba(0,230,118,0.3)] hover:scale-[1.02] transition-transform active:scale-95"
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
