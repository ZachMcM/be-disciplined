import { authClient } from '@/lib/auth-client';
import { patchExpoPushToken } from '@/lib/endpoints';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
    shouldShowBanner: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.log('No EAS projectId found in app.json (extra.eas.projectId)');
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

/** Registers the device's Expo push token with the server after sign-in. */
export function usePushTokenRegistration() {
  const { data: session } = authClient.useSession();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!session?.user || hasRegistered.current) return;

    const registerToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await patchExpoPushToken(token);
          hasRegistered.current = true;
          console.log('Push token registered:', token);
        }
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    };

    registerToken();
  }, [session?.user]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }, []);
}

type NotificationHref = string | { pathname: string; params?: Record<string, any> };

/** Handles deep-linking when a user taps a notification (data.url). */
export function useNotificationObserver(isReady: boolean) {
  const router = useRouter();
  const pendingUrl = useRef<NotificationHref | null>(null);
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;

  function flush() {
    if (!isReadyRef.current || pendingUrl.current === null) return;
    const url = pendingUrl.current;
    pendingUrl.current = null;
    if (router.canDismiss()) {
      router.dismiss();
    }
    router.navigate(url as any);
  }

  useEffect(() => {
    function enqueue(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url as NotificationHref | undefined;
      if (typeof url === 'string' || (url && typeof url.pathname === 'string')) {
        pendingUrl.current = url;
        flush();
      }
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      enqueue(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      enqueue(response.notification);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isReady) flush();
  }, [isReady]);
}
