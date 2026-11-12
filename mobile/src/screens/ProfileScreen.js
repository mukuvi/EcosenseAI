import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';
import { Card, Divider, Screen, fonts } from '../components/ui';

const menu = [
  { label: 'Notifications', icon: 'bell', target: 'Notifications' },
  { label: 'My reports', icon: 'file-text', target: 'Home' },
  { label: 'Rewards', icon: 'gift', target: 'Rewards' },
  { label: 'Report a site', icon: 'camera', target: 'Report' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'End this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = (user?.full_name || 'EC')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.role}>
          <Text style={styles.roleText}>{(user?.role || 'citizen').replace('_', ' ')}</Text>
        </View>
      </View>

      <Card style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.points_balance || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.phone || 'Not set'}</Text>
          <Text style={styles.statLabel}>Phone</Text>
        </View>
      </Card>

      <View style={styles.menu}>
        {menu.map((item, index) => (
          <View key={item.label}>
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: colors.primary50 }]}
              onPress={() => navigation?.navigate(item.target)}
            >
              <Feather name={item.icon} size={16} color={colors.ink} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.muted} />
            </Pressable>
            {index < menu.length - 1 && <Divider />}
          </View>
        ))}
      </View>

      <Pressable style={styles.signOut} onPress={handleLogout}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Text style={styles.footer}>EcoSense AI. Waste reporting and cleanup operations.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  name: {
    marginTop: 14,
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
  },
  email: {
    marginTop: 3,
    fontSize: 13,
    color: colors.muted,
  },
  role: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.line,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  statLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  signOut: {
    marginTop: 22,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  footer: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 11,
    color: colors.muted,
  },
});
