import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  FloatingTabBar,
  useFloatingTabBarInset,
} from '@/components/ui/FloatingTabBar';
import { useTheme } from '@/hooks/useTheme';

export default function ListenerTabLayout() {
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
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cash' : 'cash-outline'} size={size} color={color} />
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
