import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    api.get('/hotspots').then(({ data }) => setHotspots(data.hotspots)).catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Waste Hotspots</h2>
      <p className="text-gray-500 mb-6">
        AI-predicted areas with high likelihood of waste accumulation, based on historical report data.
      </p>

      {/* Hotspot map */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer
            center={[-1.2921, 36.8219]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hotspots.map((h) => (
              <Circle
                key={h.id}
                center={[h.latitude, h.longitude]}
                radius={h.radius_meters}
                pathOptions={{
                  color: h.risk_score > 0.7 ? '#ef4444' : h.risk_score > 0.4 ? '#f59e0b' : '#22c55e',
                  fillOpacity: 0.3,
                }}
              >
                <Popup>
                  <strong>Risk: {(h.risk_score * 100).toFixed(0)}%</strong>
                  <br />
                  Reports: {h.report_count}
                  <br />
                  Radius: {h.radius_meters}m
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Hotspot table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Risk Score</th>
              <th className="px-6 py-3">Nearby Reports</th>
              <th className="px-6 py-3">Radius (m)</th>
              <th className="px-6 py-3">Last Predicted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hotspots.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-mono">{h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${h.risk_score * 100}%`,
                          backgroundColor: h.risk_score > 0.7 ? '#ef4444' : h.risk_score > 0.4 ? '#f59e0b' : '#22c55e',
                        }}
                      ></div>
                    </div>
                    <span className="text-sm">{(h.risk_score * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{h.report_count}</td>
                <td className="px-6 py-4 text-sm">{h.radius_meters}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(h.last_predicted_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {hotspots.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No hotspots predicted yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
