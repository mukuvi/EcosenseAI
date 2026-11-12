import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { colors } from '../theme/colors';
import { Badge, Card, Header, Screen, fonts } from '../components/ui';

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
    load().catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
      setUnread((count) => Math.max(0, count - 1));
    }

    if (notification.data?.reportId) {
      navigation.navigate('ReportDetail', { reportId: notification.data.reportId });
    }
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
    );
    setUnread(0);
  };

  return (
    <Screen>
      <Header
        title="Notifications"
        subtitle={`${unread} unread update${unread === 1 ? '' : 's'}`}
        right={
          unread > 0 ? (
            <Pressable onPress={markAll} style={styles.markAll}>
              <Text style={styles.markAllText}>Mark read</Text>
            </Pressable>
          ) : null
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} colors={[colors.ink]} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openNotification(item)}>
            <Card style={[styles.card, !item.read_at && styles.unread]}>
              <View style={styles.cardTop}>
                <Text style={styles.title}>{item.title}</Text>
                {!item.read_at && <View style={styles.dot} />}
              </View>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell" size={20} color={colors.muted} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyBody}>
              Status changes and verified cleanups will appear in this list.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAll: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  card: {
    marginBottom: 10,
  },
  unread: {
    borderColor: colors.ink,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ink,
  },
  body: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  date: {
    marginTop: 8,
    fontSize: 11,
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
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
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 250,
  },
});
