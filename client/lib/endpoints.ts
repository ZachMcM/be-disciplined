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
