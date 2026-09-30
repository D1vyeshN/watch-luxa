import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type { AuthUser, AuthResponse } from '@/types/auth';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<AuthResponse>,
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['User', 'Cart', 'Wishlist'],
    }),

    register: builder.mutation<
      ApiResponse<AuthResponse>,
      { email: string; password: string; name: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['User', 'Cart'],
    }),

    logout: builder.mutation<ApiResponse<null>, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
      invalidatesTags: ['User', 'Cart', 'Wishlist'],
    }),

    getMe: builder.query<ApiResponse<AuthUser>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
