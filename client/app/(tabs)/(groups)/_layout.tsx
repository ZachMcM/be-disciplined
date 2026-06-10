import { Stack } from 'expo-router';

export default function ActivityLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Friends' }} />
      <Stack.Screen name="user/[id]" options={{ headerTitle: 'Profile' }} />
    </Stack>
  );
}
