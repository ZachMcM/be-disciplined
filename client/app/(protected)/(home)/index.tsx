import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import { getMe } from '@/lib/endpoints';
import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

export default function HomeScreen() {
  const { data: me, isPending } = useQuery({ queryKey: ['me'], queryFn: getMe });

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-8">
      <Text variant="h2" className="border-0">
        Welcome to Be Disciplined
      </Text>
      <Text className="text-center text-muted-foreground">
        {isPending ? 'Loading…' : me ? `Signed in as ${me.email}` : 'Could not load your profile'}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        Edit{' '}
        <Text className="text-sm font-mono">app/(protected)/(home)/index.tsx</Text> to get started.
      </Text>
      <Button variant="outline" onPress={() => authClient.signOut()}>
        <Text>Sign out</Text>
      </Button>
    </View>
  );
}
