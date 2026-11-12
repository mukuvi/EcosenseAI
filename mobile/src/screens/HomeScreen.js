import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import ListenButton from '../components/ListenButton';
import { colors } from '../theme/colors';
import { Badge, Card, Divider, Header, Screen, fonts } from '../components/ui';

export default function HomeScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const path = user?.role === 'citizen' ? '/reports/mine?limit=10' : '/reports?limit=10';
      const { data } = await api.get(path);
      setReports(data.reports);
    } catch (err) {
      setReports([]);
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

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <Screen>
      <Header
        title={`Hello, ${firstName}`}
        subtitle="Your reports and their current stage"
        right={
          <View style={styles.headerActions}>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsValue}>{user?.points_balance || 0}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconButton}
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={17} color={colors.ink} />
            </Pressable>
          </View>
        }
      />

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} colors={[colors.ink]} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Recent reports</Text>
            <Text style={styles.sectionCount}>{reports.length}</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View>
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primary50 }]}
              onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
            >
              <View style={styles.rowTop}>
                <Text style={styles.wasteType}>{item.waste_type} waste</Text>
                <Badge status={item.status} />
              </View>
              <Text style={styles.description} numberOfLines={1}>
                {item.description || item.address || 'No description'}
              </Text>
              <View style={styles.rowBottom}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                {item.reporter_id === user?.id && <ListenButton reportId={item.id} />}
              </View>
            </Pressable>
            {index < reports.length - 1 && <Divider />}
          </View>
        )}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Feather name="camera" size={20} color={colors.muted} />
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyBody}>
              Report a site in your neighbourhood and follow it through to cleanup.
            </Text>
          </Card>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: colors.bone,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.muted,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.muted,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  wasteType: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.ink,
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  rowBottom: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
    color: colors.muted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
  },
  emptyTitle: {
    marginTop: 10,
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
  },
  emptyBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
