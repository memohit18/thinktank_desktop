import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './services/apiSlice';
import './services/authApi';
import './services/codeApi';
import './services/problemsApi';
import './services/profileApi';
import './services/userProgressApi';
import './services/roadmapsApi';
import './services/fitforgeApi';
import './services/fitnessProfileApi';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
