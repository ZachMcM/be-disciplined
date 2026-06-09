import '@/global.css';

import { InvalidationProvider } from '@/components/providers/InvalidationProvider';
import { useNotificationObserver, usePushTokenRegistration } from '@/hooks/usePushNotifications';
import { authClient } from '@/lib/auth-client';
import { NAV_THEME, THEME } from '@/lib/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import type { AppStateStatus } from 'react-native';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';

export { ErrorBoundary } from 'expo-router';

const queryClient = new QueryClient();

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('system');
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  const scheme = colorScheme ?? 'light';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={NAV_THEME[scheme]}>
          <BottomSheetModalProvider>
            <InvalidationProvider>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <RootNavigator />
            </InvalidationProvider>
            <Toaster
              toastOptions={{
                style: {
                  backgroundColor: THEME[scheme].card,
                  borderColor: THEME[scheme].border,
                  borderWidth: 1,
                },
              }}
            />
            <PortalHost />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();

  usePushTokenRegistration();
  useNotificationObserver(!!session);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isPending}>
        <Stack.Screen name="loading" />
      </Stack.Protected>

      <Stack.Protected guard={!isPending && session !== null}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      <Stack.Protected guard={!isPending && session === null}>
        <Stack.Screen name="auth" options={{ headerShown: true, title: 'Be Disciplined' }} />
      </Stack.Protected>
    </Stack>
  );
}
