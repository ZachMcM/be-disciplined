import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { io, Socket } from 'socket.io-client';

const InvalidationContext = createContext<{ isConnected: boolean }>({
  isConnected: false,
});

/**
 * Connects to the server's `/invalidation` Socket.IO namespace and invalidates
 * TanStack Query keys when the server emits `data-invalidated`. Disconnects when
 * the app is backgrounded and reconnects on foreground.
 */
export function InvalidationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: currentUserData } = authClient.useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const isUnmountingRef = useRef(false);
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    queryClientRef.current = queryClient;
  });

  useEffect(() => {
    if (!currentUserData?.user?.id) {
      return;
    }

    isUnmountingRef.current = false;

    const socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/invalidation`, {
      transports: ['websocket'],
      auth: {
        userId: currentUserData.user.id,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (!isUnmountingRef.current) setIsConnected(true);
    });

    socket.on('disconnect', () => {
      if (!isUnmountingRef.current) setIsConnected(false);
    });

    socket.on('connect_error', () => {
      if (!isUnmountingRef.current) setIsConnected(false);
    });

    socket.on('data-invalidated', (queryKey: (string | number)[]) => {
      if (!isUnmountingRef.current && queryClientRef.current) {
        queryClientRef.current.invalidateQueries({ queryKey });
      }
    });

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && socket?.connected) {
        socket.disconnect();
      } else if (nextAppState === 'active' && !socket?.connected && !isUnmountingRef.current) {
        socket.connect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isUnmountingRef.current = true;
      subscription?.remove();

      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current.close();
        socketRef.current = null;
      }

      setIsConnected(false);
    };
  }, [currentUserData?.user.id]);

  return (
    <InvalidationContext.Provider value={{ isConnected }}>{children}</InvalidationContext.Provider>
  );
}
