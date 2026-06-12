import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
}));

/**
 * Shared user profile route. It lives in the array-syntax folder, so it is cloned
 * into every tab group and can be opened from any tab while keeping that tab's
 * stack. Use {@link useTabContext} here to branch on the active tab when needed.
 */
export default function UserProfileScreen() {
  return <View style={styles.screen} />;
}
