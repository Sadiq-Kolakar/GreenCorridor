import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { ref, update } from 'firebase/database';

export function useGPSBroadcast(sessionId: string | null) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        
        // Broadcast to Firebase
        update(ref(db, `emergency_sessions/${sessionId}`), {
          currentLat: coords.lat,
          currentLng: coords.lng
        });
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [sessionId]);

  return position;
}
