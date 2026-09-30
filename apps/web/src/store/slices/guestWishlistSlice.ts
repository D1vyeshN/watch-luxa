import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'luxe_guest_wishlist';

interface GuestWishlistState {
  productIds: string[];
}

const getStoredWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (productIds: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  } catch {
    // Ignore storage errors
  }
};

const initialState: GuestWishlistState = {
  productIds: getStoredWishlist(),
};

export const guestWishlistSlice = createSlice({
  name: 'guestWishlist',
  initialState,
  reducers: {
    toggleGuestWishlist: (state, action: { payload: string }) => {
      const index = state.productIds.indexOf(action.payload);
      if (index >= 0) {
        state.productIds.splice(index, 1);
      } else {
        state.productIds.push(action.payload);
      }
      saveWishlist(state.productIds);
    },

    removeFromGuestWishlist: (state, action: { payload: string }) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
      saveWishlist(state.productIds);
    },

    clearGuestWishlist: (state) => {
      state.productIds = [];
      saveWishlist([]);
    },

    setGuestWishlist: (state, action: { payload: string[] }) => {
      state.productIds = action.payload;
      saveWishlist(state.productIds);
    },
  },
});

export const {
  toggleGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
  setGuestWishlist,
} = guestWishlistSlice.actions;

export default guestWishlistSlice.reducer;
