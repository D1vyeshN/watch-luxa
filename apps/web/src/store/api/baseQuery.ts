import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { getSessionId, clearSessionId } from '@/lib/storage/sessionStorage';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = tokenStorage.getAccess();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const sessionId = getSessionId();
    if (sessionId) headers.set('X-Session-Id', sessionId);

    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any in-flight refresh to complete
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = tokenStorage.getRefresh();

        if (!refreshToken) {
          // No refresh token — full logout
          tokenStorage.clear();
          clearSessionId();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return result;
        }

        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as {
            data: { accessToken: string; refreshToken: string };
          };

          tokenStorage.setTokens(
            data.data.accessToken,
            data.data.refreshToken
          );

          // Retry the original request with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed — force logout
          tokenStorage.clear();
          clearSessionId();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } finally {
        release();
      }
    } else {
      // Another refresh is in flight — wait for it and retry
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
