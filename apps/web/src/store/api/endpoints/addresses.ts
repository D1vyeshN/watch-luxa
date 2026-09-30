import { api } from '../api';
import type { ApiResponse } from '@/types/api';

export interface SavedAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export const addressesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<ApiResponse<SavedAddress[]>, void>({
      query: () => '/addresses',
      providesTags: ['User'],
    }),

    addAddress: builder.mutation<ApiResponse<SavedAddress[]>, AddressInput>({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    updateAddress: builder.mutation<
      ApiResponse<SavedAddress[]>,
      { addressId: string; data: Partial<AddressInput> }
    >({
      query: ({ addressId, data }) => ({
        url: `/addresses/${addressId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    removeAddress: builder.mutation<ApiResponse<SavedAddress[]>, string>({
      query: (addressId) => ({
        url: `/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    setDefaultAddress: builder.mutation<ApiResponse<SavedAddress[]>, string>({
      query: (addressId) => ({
        url: `/addresses/${addressId}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useRemoveAddressMutation,
  useSetDefaultAddressMutation,
} = addressesApi;
