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

// Custom hospital icon (our location)
const hospitalIcon = new L.DivIcon({
  html: `<div style="font-size:32px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">🏥</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Signal junction icon
const signalIcon = new L.DivIcon({
  html: `<div style="font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚦</div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Demo route in Bangalore (same as ambulance app)
const DEMO_ROUTE: [number, number][] = [
  [12.9716, 77.5946],
  [12.9720, 77.5990],
  [12.9725, 77.6040],
  [12.9730, 77.6080],
  [12.9735, 77.6120],
  [12.9740, 77.6160],
  [12.9750, 77.6200],
  [12.9760, 77.6230],
  [12.9770, 77.6260],
  [12.9780, 77.6300],
  [12.9790, 77.6340],
  [12.9800, 77.6370],
  [12.9810, 77.6400],
  [12.9815, 77.6420],
];

const HOSPITAL_POS: [number, number] = [12.9815, 77.6420];

const SIGNAL_JUNCTIONS = [
  { name: 'S1: MG Road', pos: [12.9716, 77.5946] as [number, number], cleared: true },
  { name: 'S2: Brigade Rd', pos: [12.9735, 77.6120] as [number, number], cleared: true },
  { name: 'S3: Trinity', pos: [12.9760, 77.6230] as [number, number], cleared: false },
  { name: 'S4: Indiranagar', pos: [12.9800, 77.6370] as [number, number], cleared: false },
];

interface TrackingMapProps {
  ambulanceLat?: number;
  ambulanceLng?: number;
}

function MapAutoCenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([pos, HOSPITAL_POS], { padding: [50, 50], animate: true });
  }, [pos, map]);
  return null;
}

export default function TrackingMap({ ambulanceLat, ambulanceLng }: TrackingMapProps) {
  const ambPos: [number, number] = ambulanceLat && ambulanceLng
    ? [ambulanceLat, ambulanceLng]
    : DEMO_ROUTE[4]; // Default demo position

  return (
    <MapContainer
      center={[12.9760, 77.6180]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
      />

      <MapAutoCenter pos={ambPos} />

      {/* Route polyline */}
      <Polyline
        positions={DEMO_ROUTE}
        pathOptions={{
          color: '#00e676',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 6',
        }}
      />

      {/* Ambulance (moving) */}
      <Marker position={ambPos} icon={ambulanceIcon}>
        <Popup>
          <strong>🚑 Incoming Ambulance</strong>
          <br />
          KA-01-AB-1234 | Driver: Ravi Kumar
          <br />
          ETA: ~4 min
        </Popup>
      </Marker>

      {/* Hospital (us) */}
      <Marker position={HOSPITAL_POS} icon={hospitalIcon}>
        <Popup>
          <strong>🏥 City General Hospital</strong>
          <br />
          Emergency Dept — STANDBY
        </Popup>
      </Marker>

      {/* Signals */}
      {SIGNAL_JUNCTIONS.map((sig) => (
        <Marker key={sig.name} position={sig.pos} icon={signalIcon}>
          <Popup>
            <strong>{sig.name}</strong>
            <br />
            {sig.cleared ? '🟢 GREEN OVERRIDE' : '🔴 Normal cycle'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
