// components/Map.tsx
'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define a specific type for GeoJSON Point data
type GeoJSONPoint = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

type Report = {
  id: number;
  location: GeoJSONPoint; // Use the specific type
  symptom: string;
  created_at: string;
}

export default function Map({ reports }: { reports: Report[] }) {
  const position: [number, number] = [22.5726, 88.3639] // Default to Kolkata

  return (
    <MapContainer center={position} zoom={10} scrollWheelZoom={false} className="h-full w-full rounded-lg z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {reports
        .filter(report => report.location && report.location.coordinates)
        .map(report => (
          <Marker 
            key={report.id} 
            position={[report.location.coordinates[1], report.location.coordinates[0]]} 
          >
            <Popup>
              <b>Report ID: {report.id}</b><br/>
              Symptom: {report.symptom}<br/>
              Reported at: {new Date(report.created_at).toLocaleString()}
            </Popup>
          </Marker>
      ))}
    </MapContainer>
  )
}