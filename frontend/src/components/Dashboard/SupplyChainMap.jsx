import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SupplyChainMap = ({ center = [19.0760, 72.8777], logs = [] }) => {
    const positions = logs.map(log => [log.latitude, log.longitude]);
    const currentPosition = positions.length > 0 ? positions[0] : center;

    return (
        <div className="glass-card overflow-hidden h-full min-h-[300px] relative border-none flex flex-col">
            <div className="flex-1 w-full relative min-h-[300px]">


            <div className="absolute top-4 left-4 z-[400] bg-navy-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-navy-700 shadow-xl">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Active Route Tracking</p>
                <p className="text-xs font-bold text-white leading-none mt-1">LHR-01 ➔ DXB-02</p>
            </div>

            <MapContainer 
                center={currentPosition} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {positions.length > 1 && (
                    <Polyline 
                        positions={positions} 
                        color="#00897B" 
                        weight={4} 
                        opacity={0.6}
                        dashArray="8, 12"
                    />
                )}

                {positions.length > 0 && (
                    <Marker position={currentPosition}>
                        <Popup>
                            <div className="p-2">
                                <p className="font-bold text-navy-900">Current Location</p>
                                <p className="text-[10px] text-slate-500">{currentPosition[0].toFixed(4)}, {currentPosition[1].toFixed(4)}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    </div>
);

};

export default SupplyChainMap;
