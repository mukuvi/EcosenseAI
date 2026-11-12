import { useEffect, useState } from 'react';
import { Circle, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Radar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { cn } from '../lib/utils';

const NAIROBI = [-1.2921, 36.8219];

function hotspotColor(score) {
  if (score > 0.7) return '#0B0F0D';
  if (score > 0.4) return '#55605A';
  return '#AEB5AE';
}

function riskLabel(score) {
  if (score > 0.7) return 'High';
  if (score > 0.4) return 'Moderate';
  return 'Low';
}

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/hotspots')
      .then(({ data }) => setHotspots(data.hotspots))
      .catch(() => toast.error('Could not load hotspots'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Waste hotspots"
        description="Areas where reports keep clustering. Risk scores come from reporting density, not guesswork."
      />

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Map</CardTitle>
            <p className="mt-1 text-sm text-ink-muted">Circle size shows the cluster radius.</p>
          </div>
          <Badge variant="soft">{hotspots.length} clusters</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[360px] w-full" />
          ) : (
            <div className="h-[320px] overflow-hidden rounded-xl border border-ink/10 sm:h-[420px]">
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
                      fillOpacity: 0.22,
                      weight: 1.5,
                    }}
                  >
                    <Popup>
                      <strong>Risk {Math.round(hotspot.risk_score * 100)}%</strong>
                      <br />
                      {hotspot.report_count} reports in this cluster
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-5 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : hotspots.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No hotspots predicted yet"
            description="Clusters appear once several reports land in the same area."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Location</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Nearby reports</TableHead>
                <TableHead>Radius</TableHead>
                <TableHead>Last predicted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotspots.map((hotspot) => (
                <TableRow key={hotspot.id}>
                  <TableCell className="font-mono text-[13px]">
                    {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-ink/10">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            hotspot.risk_score > 0.7
                              ? 'bg-ink'
                              : hotspot.risk_score > 0.4
                                ? 'bg-primary-500'
                                : 'bg-primary-300'
                          )}
                          style={{ width: `${hotspot.risk_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(hotspot.risk_score * 100)}%</span>
                      <Badge
                        variant={hotspot.risk_score > 0.7 ? 'danger' : hotspot.risk_score > 0.4 ? 'warning' : 'success'}
                      >
                        {riskLabel(hotspot.risk_score)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{hotspot.report_count}</TableCell>
                  <TableCell className="text-ink-muted">{Math.round(hotspot.radius_meters)} m</TableCell>
                  <TableCell className="text-ink-muted">
                    {new Date(hotspot.last_predicted_at).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
