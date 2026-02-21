import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

// Default to Nairobi
const NAIROBI = { latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.1, longitudeDelta: 0.1 };

const SEVERITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function MapScreen() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get('/reports?limit=100')
      .then(({ data }) => setReports(data.reports))
      .catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={NAIROBI} showsUserLocation>
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
  calloutStatus: { fontSize: 11, color: '#16a34a', fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
});
