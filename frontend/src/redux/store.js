import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import assignmentSlice from './slices/assignmentSlice';
import submissionSlice from './slices/submissionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    assignments: assignmentSlice,
    submissions: submissionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
