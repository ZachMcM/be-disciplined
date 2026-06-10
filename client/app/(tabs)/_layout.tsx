import { ProfileTabIcon } from "@/components/tabs/ProfileTabIcon";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { THEME } from "@/lib/theme";
import { Link, Tabs } from "expo-router";
import { HomeIcon, PlusIcon, TrophyIcon, UsersIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? "light"];

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
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon as={HomeIcon} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(leaderboard)"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => (
            <Icon as={TrophyIcon} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Create",
          tabBarLabel: () => null,
          tabBarButton: () => (
            <View className="flex flex-1 justify-center items-center">
              <Link href="/create" asChild>
                <Button className="rounded-2xl" size="icon">
                  <Icon
                    as={PlusIcon}
                    size={26}
                    className="text-primary-foreground"
                  />
                </Button>
              </Link>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(groups)"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => (
            <Icon as={UsersIcon} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
