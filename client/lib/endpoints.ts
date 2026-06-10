import { authClient } from './auth-client';

export type ServerRequestParams = {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string;
  formData?: FormData;
};

/**
 * Thin fetch wrapper that forwards the Better Auth session cookie and throws on
 * non-2xx responses. Use this for all calls to your server.
 */
export async function serverRequest<T = any>({
  endpoint,
  method = 'GET',
  body,
  formData,
}: ServerRequestParams): Promise<T> {
  const cookies = authClient.getCookie();

  const headers: Record<string, string> = {
    Cookie: cookies,
  };

  if (body !== undefined && !formData) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = { method, headers };
  if (formData !== undefined) {
    fetchOptions.body = formData;
  } else if (body !== undefined) {
    fetchOptions.body = body;
  }

  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}${endpoint}`, fetchOptions);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Request failed');
  }

  return data as T;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export type Category = 'Fitness' | 'Health' | 'Learning';

export type ScoringBucket =
  | 'strength_training'
  | 'cardio'
  | 'sports'
  | 'nutrition'
  | 'study'
  | 'career';

export type Tag = {
  tag: string;
  category: Category;
  scoringBucket: ScoringBucket;
  basePoints: number;
};

export function getTags(): Promise<Tag[]> {
  return serverRequest({ endpoint: '/tags' });
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export type FriendUser = {
  id: string;
  name: string;
  image: string | null;
};

export type FriendRecord = {
  id: number;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: string;
  updatedAt: string;
  friendUser: FriendUser;
  weeklyPoints: number;
  weeklyRank: number | null;
  mutualFriendCount: number;
};

export type FriendsData = {
  friends: FriendRecord[];
  requestsReceived: FriendRecord[];
  requestsSent: FriendRecord[];
};

export function getFriends(): Promise<FriendsData> {
  return serverRequest({ endpoint: '/friends' });
}

export function sendFriendRequest(addresseeId: string): Promise<FriendRecord> {
  return serverRequest({
    endpoint: '/friends/request',
    method: 'POST',
    body: JSON.stringify({ addresseeId }),
  });
}

export function acceptFriendRequest(friendId: number): Promise<FriendRecord> {
  return serverRequest({ endpoint: `/friends/${friendId}/accept`, method: 'PATCH' });
}

export function declineFriendRequest(friendId: number): Promise<{ success: boolean }> {
  return serverRequest({ endpoint: `/friends/${friendId}/decline`, method: 'PATCH' });
}

export function deleteFriend(friendId: number): Promise<{ success: boolean }> {
  return serverRequest({ endpoint: `/friends/${friendId}`, method: 'DELETE' });
}

export function searchUsers(query: string): Promise<FriendUser[]> {
  return serverRequest({ endpoint: `/users/search?query=${encodeURIComponent(query)}` });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function patchExpoPushToken(expoPushToken: string) {
  return serverRequest({
    endpoint: '/users/expo-push-token',
    method: 'PATCH',
    body: JSON.stringify({ expoPushToken }),
  });
}

export async function patchUserName(name: string) {
  return serverRequest({
    endpoint: '/users/name',
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
