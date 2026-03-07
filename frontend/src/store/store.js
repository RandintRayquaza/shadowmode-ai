import { configureStore } from '@reduxjs/toolkit';
import analysisReducer from '../features/ai-analysis/state/analysisSlice';
import dashboardReducer from '../features/dashboard/state/dashboardSlice';

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    dashboard: dashboardReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
