import { ActivityIndicator, View } from 'react-native';

export default function LoadingPage() {
  return (
    <View className="flex flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="small" />
    </View>
  );
}
