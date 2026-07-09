import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './services/apiSlice';
import './services/authApi';
import './services/codeApi';
import './services/problemsApi';
import './services/profileApi';
import './services/userProgressApi';
import './services/roadmapsApi';
import './services/fitnessApi';
import './services/transformationApi';
import './services/foodApi';
import './services/nutritionPreferencesApi';

export function makeStore() {
  const store = configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

  setupListeners(store.dispatch);

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
