import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
}));

export default function LoadingPage() {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="small" />
    </View>
  );
}
