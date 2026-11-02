import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { colors } from '../theme/colors';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data.notifications);
    setUnread(data.unread);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((prev) => prev.map((n) => (
        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
      )));
      setUnread((count) => Math.max(0, count - 1));
    }

    if (notification.data?.reportId) {
      navigation.navigate('ReportDetail', { reportId: notification.data.reportId });
    }
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnread(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{unread} unread</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAll}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary600]} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openNotification(item)}
            style={[styles.card, !item.read_at && styles.unreadCard]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              {!item.read_at && <View style={styles.dot} />}
            </View>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.borderSubtle,
  },
  headerText: { fontSize: 13, color: colors.textMuted },
  markAll: { fontSize: 13, color: colors.primary600, fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  unreadCard: { borderWidth: 1, borderColor: colors.primary400 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary600, marginLeft: 8 },
  body: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 8 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
