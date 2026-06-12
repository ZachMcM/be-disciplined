import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
}));

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.screen}>
        <Text variant="h3">This screen doesn't exist.</Text>
        <Link href="/">
          <Text style={styles.link}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
