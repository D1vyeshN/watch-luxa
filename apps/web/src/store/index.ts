import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/api';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      ui: uiReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // RTK Query stores some non-serializable values in meta
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
          ],
        },
      }).concat(api.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
