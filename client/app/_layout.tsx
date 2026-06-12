import '@/unistyles';

import { InvalidationProvider } from '@/components/providers/InvalidationProvider';
import { useNotificationObserver, usePushTokenRegistration } from '@/hooks/usePushNotifications';
import { authClient } from '@/lib/auth-client';
import { NAV_THEME, THEME } from '@/lib/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={NAV_THEME.dark}>
          <BottomSheetModalProvider>
            <InvalidationProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </InvalidationProvider>
            <Toaster
              toastOptions={{
                style: {
                  backgroundColor: THEME.dark.card,
                  borderColor: THEME.dark.border,
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

  const isAuthenticated = !isPending && session !== null;
  const onboardingStep = isAuthenticated ? (session.user.onboardingStep ?? 'name') : null;
  const onboardingComplete = onboardingStep === 'complete';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isPending}>
        <Stack.Screen name="loading" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && onboardingComplete}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create"
          options={{ presentation: 'modal', headerShown: true, title: 'New post' }}
        />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && onboardingStep === 'name'}>
        <Stack.Screen
          name="(onboarding)/name"
          options={{ headerShown: true, title: 'Be Disciplined', headerBackVisible: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && onboardingStep === 'image'}>
        <Stack.Screen
          name="(onboarding)/image"
          options={{ headerShown: true, title: 'Be Disciplined', headerBackVisible: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isPending && session === null}>
        <Stack.Screen name="auth" options={{ headerShown: true, title: 'Be Disciplined' }} />
      </Stack.Protected>
    </Stack>
  );
}
