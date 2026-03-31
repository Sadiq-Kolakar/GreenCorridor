import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom ambulance icon
const ambulanceIcon = new L.DivIcon({
  html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚑</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom hospital icon
const hospitalIcon = new L.DivIcon({
  html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🏥</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Signal junction icon (traffic light)
const signalIcon = new L.DivIcon({
  html: `<div style="font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚦</div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Demo route points in Bangalore (MG Road → Indiranagar → Hospital)
const DEMO_ROUTE: [number, number][] = [
  [12.9716, 77.5946],  // MG Road (start)
  [12.9720, 77.5990],
  [12.9725, 77.6040],
  [12.9730, 77.6080],
  [12.9735, 77.6120],  // Brigade Road junction
  [12.9740, 77.6160],
  [12.9750, 77.6200],
  [12.9760, 77.6230],  // Trinity junction
  [12.9770, 77.6260],
  [12.9780, 77.6300],
  [12.9790, 77.6340],
  [12.9800, 77.6370],  // Indiranagar junction
  [12.9810, 77.6400],
  [12.9815, 77.6420],  // Hospital (end)
];

const HOSPITAL_POS: [number, number] = [12.9815, 77.6420];

const SIGNAL_JUNCTIONS = [
  { name: 'S1: MG Road', pos: [12.9716, 77.5946] as [number, number], cleared: true },
  { name: 'S2: Brigade Rd', pos: [12.9735, 77.6120] as [number, number], cleared: true },
  { name: 'S3: Trinity', pos: [12.9760, 77.6230] as [number, number], cleared: false },
  { name: 'S4: Indiranagar', pos: [12.9800, 77.6370] as [number, number], cleared: false },
];

interface LiveMapProps {
  ambulancePos?: { lat: number; lng: number } | null;
  isActive: boolean;
}

// Auto-center the map on the ambulance position
function MapAutoCenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, map.getZoom(), { animate: true });
  }, [pos, map]);
  return null;
}

export default function LiveMap({ ambulancePos, isActive }: LiveMapProps) {
  // Use ambulance position or default to start of route
  const currentPos: [number, number] = ambulancePos
    ? [ambulancePos.lat, ambulancePos.lng]
    : DEMO_ROUTE[4]; // Default to mid-route for demo

  // Center map between ambulance and hospital
  const center: [number, number] = isActive ? currentPos : [12.9760, 77.6180];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%', borderRadius: '0 0 1rem 1rem' }}
      zoomControl={false}
      attributionControl={false}
    >
      {/* Dark-themed map tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
      />

      {isActive && <MapAutoCenter pos={currentPos} />}

      {/* Route polyline — green corridor path */}
      <Polyline
        positions={DEMO_ROUTE}
        pathOptions={{
          color: '#00e676',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 6',
        }}
      />

      {/* Ambulance marker */}
      <Marker position={currentPos} icon={ambulanceIcon}>
        <Popup>
          <strong>🚑 Ambulance KA-01-AB-1234</strong>
          <br />
          Driver: Ravi Kumar
          <br />
          Speed: 45 km/h
        </Popup>
      </Marker>

      {/* Hospital marker */}
      <Marker position={HOSPITAL_POS} icon={hospitalIcon}>
        <Popup>
          <strong>🏥 City General Hospital</strong>
          <br />
          Emergency Dept Ready
        </Popup>
      </Marker>

      {/* Signal junction markers */}
      {SIGNAL_JUNCTIONS.map((sig) => (
        <Marker key={sig.name} position={sig.pos} icon={signalIcon}>
          <Popup>
            <strong>{sig.name}</strong>
            <br />
            Status: {sig.cleared ? '🟢 CLEARED' : '🔴 WAITING'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
