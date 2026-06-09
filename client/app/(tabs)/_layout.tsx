import { ProfileTabIcon } from '@/components/tabs/ProfileTabIcon';
import { Icon } from '@/components/ui/icon';
import { THEME } from '@/lib/theme';
import { Link, Tabs } from 'expo-router';
import { ChartSplineIcon, HomeIcon, PlusIcon, UsersIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable } from 'react-native';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon as={HomeIcon} size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(leaderboard)"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <Icon as={ChartSplineIcon} size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Create',
          tabBarLabel: () => null,
          tabBarButton: () => (
            <Link href="/create" asChild>
              <Pressable className="flex-1 items-center justify-center">
                <Icon as={PlusIcon} size={26} className='text-muted-foreground' />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(activity)"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <Icon as={UsersIcon} size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
