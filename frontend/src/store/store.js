import { configureStore } from '@reduxjs/toolkit';
import analysisReducer from '../features/ai-analysis/state/analysisSlice';

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
