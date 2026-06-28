import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  FloatingTabBar,
  useFloatingTabBarInset,
} from '@/components/ui/FloatingTabBar';
import { useTheme } from '@/hooks/useTheme';

export default function SeekerTabLayout() {
  const { colors } = useTheme();
  const tabBarInset = useFloatingTabBarInset();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          sceneStyle: { paddingBottom: tabBarInset, backgroundColor: colors.background },
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
