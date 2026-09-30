import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/api';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import { errorMiddleware } from './middleware/errorMiddleware';

// Force-inject all endpoint slices at import time.
// Do NOT remove these — they register the endpoints with the root API.
import './api/endpoints/home';
import './api/endpoints/products';
import './api/endpoints/brands';
import './api/endpoints/categories';
import './api/endpoints/collections';
import './api/endpoints/search';
import './api/endpoints/cart';
import './api/endpoints/auth';
import './api/endpoints/wishlist';

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
      })
        .concat(api.middleware)
        .concat(errorMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
