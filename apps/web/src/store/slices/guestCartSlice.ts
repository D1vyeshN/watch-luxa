import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartItem } from '@/types/cart';
import { CONFIG } from '@/constants/config';

const STORAGE_KEY = 'luxe_guest_cart';

interface GuestCartState {
  items: CartItem[];
}

const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

const initialState: GuestCartState = {
  items: getStoredCart(),
};

export const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    addToGuestCart: (state, action: { payload: CartItem }) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
      );

      if (existingIndex >= 0) {
        // Update quantity
        const newQuantity = state.items[existingIndex].quantity + action.payload.quantity;
        if (newQuantity <= CONFIG.maxItemQuantity) {
          state.items[existingIndex].quantity = newQuantity;
          state.items[existingIndex].lineTotal = state.items[existingIndex].price * newQuantity;
        }
      } else {
        // Add new item
        if (state.items.length < CONFIG.maxCartItems) {
          state.items.push(action.payload);
        }
      }

      saveCart(state.items);
    },

    updateGuestCartItem: (
      state,
      action: { payload: { itemId: string; quantity: number } }
    ) => {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (item && action.payload.quantity > 0 && action.payload.quantity <= CONFIG.maxItemQuantity) {
        item.quantity = action.payload.quantity;
        item.lineTotal = item.price * action.payload.quantity;
        saveCart(state.items);
      }
    },

    removeGuestCartItem: (state, action: { payload: string }) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCart(state.items);
    },

    clearGuestCart: (state) => {
      state.items = [];
      saveCart([]);
    },

    setGuestCart: (state, action: { payload: CartItem[] }) => {
      state.items = action.payload;
      saveCart(state.items);
    },
  },
});

export const {
  addToGuestCart,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
  setGuestCart,
} = guestCartSlice.actions;

export default guestCartSlice.reducer;
