import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';
import { fonts } from '../components/ui';
import { registerForPushNotifications } from '../services/push';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import MapScreen from '../screens/MapScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons = {
  Home: 'home',
  Report: 'camera',
  Map: 'map',
  Rewards: 'gift',
  Profile: 'user',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => (
          <Feather name={icons[route.name] || 'circle'} size={size - 2} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const init = useAuthStore((state) => state.init);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (token) registerForPushNotifications().catch(() => {});
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={colors.ink} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.sans, fontWeight: '600', fontSize: 16 },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {token ? (
        <>
          <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
