import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout, Circle } from 'react-native-maps';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const NAIROBI = { latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.1, longitudeDelta: 0.1 };

const SEVERITY_COLORS = { low: '#AEB5AE', medium: '#B54708', high: '#B42318', critical: '#0B0F0D' };

export default function MapScreen() {
  const user = useAuthStore((s) => s.user);
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const path = user?.role === 'citizen' ? '/reports/mine?limit=100' : '/reports?limit=100';
    api.get(path)
      .then(({ data }) => setReports(data.reports))
      .catch(console.error);
    api.get('/hotspots')
      .then(({ data }) => setHotspots(data.hotspots))
      .catch(console.error);
  }, [user?.role]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={NAIROBI} showsUserLocation>
        {hotspots.map((h) => (
          <Circle
            key={h.id}
            center={{ latitude: h.latitude, longitude: h.longitude }}
            radius={h.radius_meters || 500}
            strokeColor="rgba(11, 15, 13, 0.5)"
            fillColor="rgba(11, 15, 13, 0.10)"
          />
        ))}
        {reports.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            pinColor={SEVERITY_COLORS[r.severity] || '#6b7280'}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{r.waste_type}</Text>
                <Text style={styles.calloutText}>{r.description || 'No description'}</Text>
                <Text style={styles.calloutStatus}>{r.status}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
  callout: { width: 160, padding: 4 },
  calloutTitle: { fontWeight: '600', textTransform: 'capitalize', marginBottom: 2 },
  calloutText: { fontSize: 12, color: '#6b7280' },
  calloutStatus: { fontSize: 11, color: colors.primary600, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
});
