import { THEME } from "@/lib/theme";
import { router } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? "light"];

  return (
    <NativeTabs tintColor={theme.primary}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(leaderboard)">
        <NativeTabs.Trigger.Label hidden>Leaderboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="trophy.fill" md="trophy" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="add"
        // Native tabs can't use a custom tab button. `disabled` keeps the tab
        // from ever being selected (so `add` never renders) while still emitting
        // `tabPress`, which we use to present the `/create` modal instead.
        disabled
        listeners={{
          tabPress: () => router.push("/create"),
        }}
      >
        <NativeTabs.Trigger.Label hidden>Create</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(profile)">
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="person" />
        <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(groups)">
        <NativeTabs.Trigger.Label hidden>Groups</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="groups" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
