import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardRecent } from '../api/dashboardApi';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (uid, { rejectWithValue }) => {
    try {
      const data = await fetchDashboardRecent();
      return {
        results: data.results || [],
        uid,   // tag results with who owns them
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to load dashboard'
      );
    }
  }
);
