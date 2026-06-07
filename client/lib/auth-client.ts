import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
  plugins: [
    expoClient({
      scheme: 'be-disciplined',
      storagePrefix: 'be-disciplined',
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});
