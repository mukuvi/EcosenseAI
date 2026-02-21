import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import useAuthStore from '../store/authStore';
import api from '../services/api';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports?limit=10');
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Habari, {user?.full_name?.split(' ')[0]}! 👋</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {user?.points_balance || 0} pts</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Reports</Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.wasteType}>{item.waste_type}</Text>
              <Text style={[styles.status, statusStyle(item.status)]}>{item.status}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description || 'No description'}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reports yet. Start reporting waste!</Text>}
      />
    </View>
  );
}

function statusStyle(status) {
  const colors = {
    pending: '#f59e0b',
    verified: '#3b82f6',
    resolved: '#22c55e',
    rejected: '#ef4444',
  };
  return { color: colors[status] || '#6b7280' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#16a34a',
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  pointsBadge: { backgroundColor: '#15803d', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  reportCard: {
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12,
    borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  wasteType: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  description: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  date: { fontSize: 11, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
