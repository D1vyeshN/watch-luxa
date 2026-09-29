import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  recentlyViewed: string[]; // product IDs
}

const initialState: UIState = {
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  recentlyViewed: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },

    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },

    openSearch: (state) => {
      state.isSearchOpen = true;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },

    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.recentlyViewed = [
        productId,
        ...state.recentlyViewed.filter((id) => id !== productId),
      ].slice(0, 10);
    },

    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
  },
});

export const {
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  openMobileMenu,
  closeMobileMenu,
  openSearch,
  closeSearch,
  addRecentlyViewed,
  clearRecentlyViewed,
} = uiSlice.actions;

export default uiSlice.reducer;
