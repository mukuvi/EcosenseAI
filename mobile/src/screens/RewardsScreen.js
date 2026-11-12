import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';
import { Card, Divider, Header, Screen, fonts } from '../components/ui';

export default function RewardsScreen() {
  const [rewards, setRewards] = useState([]);
  const user = useAuthStore((state) => state.user);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const fetchRewards = async () => {
    const { data } = await api.get('/rewards');
    setRewards(data.rewards);
  };

  useEffect(() => {
    fetchRewards().catch(() => setRewards([]));
  }, []);

  const handleRedeem = (reward) => {
    if ((user?.points_balance || 0) < reward.points_cost) {
      return Alert.alert(
        'Not enough points',
        `You need ${reward.points_cost - (user?.points_balance || 0)} more points for this reward.`
      );
    }

    Alert.alert('Redeem reward', `Use ${reward.points_cost} points on "${reward.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem',
        onPress: async () => {
          try {
            await api.post(`/rewards/${reward.id}/redeem`);
            await refreshProfile();
            await fetchRewards();
            Alert.alert('Redeemed', `"${reward.title}" is yours. Check notifications for collection details.`);
          } catch (err) {
            Alert.alert('Could not redeem', err.response?.data?.error || 'Try again later.');
          }
        },
      },
    ]);
  };

  const balance = user?.points_balance || 0;

  return (
    <Screen>
      <Header title="Rewards" subtitle="Spend points from verified reports" />

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Card style={styles.balanceCard}>
            <View>
              <Text style={styles.balanceLabel}>Your balance</Text>
              <Text style={styles.balanceValue}>{balance} pts</Text>
            </View>
            <Feather name="award" size={22} color={colors.muted} />
          </Card>
        }
        renderItem={({ item, index }) => {
          const affordable = balance >= item.points_cost;
          const inStock = item.quantity_available > 0;

          return (
            <View>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description || 'No description provided.'}
                  </Text>
                  <Text style={styles.quantity}>{item.quantity_available} available</Text>
                </View>
                <Pressable
                  onPress={() => handleRedeem(item)}
                  disabled={!affordable || !inStock}
                  style={({ pressed }) => [
                    styles.redeem,
                    (!affordable || !inStock) && styles.redeemDisabled,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.redeemText, (!affordable || !inStock) && styles.redeemTextDisabled]}>
                    {inStock ? `${item.points_cost} pts` : 'Out'}
                  </Text>
                </Pressable>
              </View>
              {index < rewards.length - 1 && <Divider />}
            </View>
          );
        }}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Feather name="gift" size={20} color={colors.muted} />
            <Text style={styles.emptyTitle}>No rewards yet</Text>
            <Text style={styles.emptyBody}>Published rewards will appear here with their point cost.</Text>
          </Card>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bone,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  balanceValue: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: '600',
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  rowText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  description: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  quantity: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
  },
  redeem: {
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  redeemDisabled: {
    backgroundColor: 'transparent',
    borderColor: colors.line,
  },
  redeemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redeemTextDisabled: {
    color: colors.muted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 8,
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
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 240,
  },
});
