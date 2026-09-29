import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },

    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isHydrated = true;
    },

    markHydrated: (state) => {
      state.isHydrated = true;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
    },
  },
});

export const { setCredentials, setUser, markHydrated, logout } =
  authSlice.actions;

export default authSlice.reducer;
