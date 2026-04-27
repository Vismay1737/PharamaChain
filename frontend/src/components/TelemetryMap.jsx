import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Truck Icon
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords]);
  return null;
};

const TelemetryMap = ({ currentData }) => {
  const [path, setPath] = useState([]);
  const position = currentData ? [currentData.latitude, currentData.longitude] : [19.0760, 72.8777]; // Default Mumbai

  useEffect(() => {
    if (currentData) {
      setPath(prev => [...prev, [currentData.latitude, currentData.longitude]]);
    }
  }, [currentData]);

  return (
    <MapContainer center={position} zoom={7} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {path.length > 0 && (
        <Polyline positions={path} color="#38BDF8" weight={4} opacity={0.6} dashArray="10, 10" />
      )}

      {currentData && (
        <>
          <Marker position={position} icon={truckIcon}>
            <Popup className="glass-card">
              <div className="p-2">
                <p className="font-bold text-sky-400">{currentData.batch_id}</p>
                <p className="text-xs">Temp: {currentData.temperature}°C</p>
                <p className="text-xs">Location: {currentData.latitude}, {currentData.longitude}</p>
              </div>
            </Popup>
          </Marker>
          <RecenterMap coords={position} />
        </>
      )}
    </MapContainer>
  );
};

export default TelemetryMap;
