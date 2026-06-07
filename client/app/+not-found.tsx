import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex flex-1 items-center justify-center gap-4 bg-background p-5">
        <Text variant="h3">This screen doesn't exist.</Text>
        <Link href="/">
          <Text className="text-primary underline">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
