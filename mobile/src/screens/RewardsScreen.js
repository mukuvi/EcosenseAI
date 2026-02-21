import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function RewardsScreen() {
  const [rewards, setRewards] = useState([]);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get('/rewards').then(({ data }) => setRewards(data.rewards)).catch(console.error);
  }, []);

  const handleRedeem = async (reward) => {
    if ((user?.points_balance || 0) < reward.points_cost) {
      return Alert.alert('Insufficient Points', `You need ${reward.points_cost} points but have ${user?.points_balance || 0}.`);
    }

    Alert.alert('Redeem Reward', `Spend ${reward.points_cost} points on "${reward.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem',
        onPress: async () => {
          try {
            await api.post(`/rewards/${reward.id}/redeem`);
            Alert.alert('Success! 🎉', `You've redeemed "${reward.title}"`);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Redemption failed');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceBar}>
        <Text style={styles.balanceLabel}>Your Points</Text>
        <Text style={styles.balanceValue}>⭐ {user?.points_balance || 0}</Text>
      </View>

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.rewardTitle}>{item.title}</Text>
              <Text style={styles.rewardDesc}>{item.description}</Text>
              {item.category && <Text style={styles.category}>{item.category}</Text>}
            </View>
            <TouchableOpacity style={styles.redeemButton} onPress={() => handleRedeem(item)}>
              <Text style={styles.redeemText}>{item.points_cost} pts</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No rewards available yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  balanceBar: {
    backgroundColor: '#16a34a', padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  balanceLabel: { color: '#bbf7d0', fontSize: 14 },
  balanceValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardContent: { flex: 1 },
  rewardTitle: { fontSize: 16, fontWeight: '600' },
  rewardDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  category: {
    marginTop: 6, fontSize: 11, color: '#16a34a', backgroundColor: '#f0fdf4',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start',
  },
  redeemButton: {
    backgroundColor: '#16a34a', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, marginLeft: 12,
  },
  redeemText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
