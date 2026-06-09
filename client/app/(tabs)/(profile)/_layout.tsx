import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Profile' }} />
      <Stack.Screen name="user/[id]" options={{ headerTitle: 'Profile' }} />
    </Stack>
  );
}
