import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardData } from './dashboardThunks';

const initialState = {
  recentAnalyses: [],
  isLoading: false,
  error: null,
  // Track which user's data is currently loaded — prevents cross-user cache leakage
  ownerUid: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard(state) {
      state.recentAnalyses = [];
      state.isLoading = false;
      state.error = null;
      state.ownerUid = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      state.recentAnalyses = action.payload.results;
      state.ownerUid = action.payload.uid;
      state.isLoading = false;
    });
    builder.addCase(fetchDashboardData.rejected, (state, action) => {
      state.error = action.payload || 'Failed to load dashboard';
      state.isLoading = false;
    });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
