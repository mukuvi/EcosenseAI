import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

const NAIROBI = [-1.2921, 36.8219];

function hotspotColor(score) {
  if (score > 0.7) return '#2F5D50';
  if (score > 0.4) return '#3AA335';
  return '#9CAF88';
}

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

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="h-72 sm:h-96 rounded-lg overflow-hidden">
          <MapContainer center={NAIROBI} zoom={11} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hotspots.map((hotspot) => (
              <Circle
                key={hotspot.id}
                center={[hotspot.latitude, hotspot.longitude]}
                radius={hotspot.radius_meters}
                pathOptions={{
                  color: hotspotColor(hotspot.risk_score),
                  fillColor: hotspotColor(hotspot.risk_score),
                  fillOpacity: 0.2,
                }}
              >
                <Popup>
                  <strong>Risk {(hotspot.risk_score * 100).toFixed(0)}%</strong>
                  <br />
                  {hotspot.report_count} reports in this cluster
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
        {hotspots.length === 0 && (
          <p className="text-sm text-gray-400 mt-3">No hotspots predicted yet. Submit more reports in the same area.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
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
                        className={`h-2 rounded-full ${
                          h.risk_score > 0.7
                            ? 'bg-moss-600'
                            : h.risk_score > 0.4
                              ? 'bg-primary-600'
                              : 'bg-sage-400'
                        }`}
                        style={{
                          width: `${h.risk_score * 100}%`,
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
