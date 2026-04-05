import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import MapScreen from '../screens/MapScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: colors.primary600 },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: () => <Text>🏠</Text>, title: 'Home' }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{ tabBarIcon: () => <Text>📸</Text>, title: 'Report Waste' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarIcon: () => <Text>🗺️</Text>, title: 'Map' }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ tabBarIcon: () => <Text>🎁</Text>, title: 'Rewards' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Text>👤</Text>, title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { token, isLoading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
