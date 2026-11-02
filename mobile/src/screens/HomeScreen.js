import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import ListenButton from '../components/ListenButton';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const path = user?.role === 'citizen' ? '/reports/mine?limit=10' : '/reports?limit=10';
      const { data } = await api.get(path);
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    await refreshProfile();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
      refreshProfile();
    }, [refreshProfile, user?.role])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Habari, {user?.full_name?.split(' ')[0]}! 👋</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.bellText}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>⭐ {user?.points_balance || 0} pts</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Reports</Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary600]} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
          >
            <View style={styles.reportHeader}>
              <Text style={styles.wasteType}>{item.waste_type}</Text>
              <Text style={[styles.status, statusStyle(item.status)]}>{item.status}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description || 'No description'}</Text>
            <View style={styles.reportFooter}>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
              {item.reporter_id === user?.id && <ListenButton reportId={item.id} />}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reports yet. Start reporting waste!</Text>}
      />
    </View>
  );
}

function statusStyle(status) {
  const statusColors = {
    pending: colors.warning,
    verified: colors.info,
    resolved: colors.primary500,
    rejected: colors.danger,
  };
  return { color: statusColors[status] || '#6b7280' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: colors.primary600,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bell: { padding: 4 },
  bellText: { fontSize: 18 },
  pointsBadge: { backgroundColor: colors.primary500, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  reportCard: {
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12,
    borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wasteType: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  description: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  date: { fontSize: 11, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
