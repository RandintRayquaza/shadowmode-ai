import { create } from 'zustand';

const useDashboardStore = create((set) => ({
  recentAnalyses: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setRecentAnalyses: (recentAnalyses) => set({ recentAnalyses, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false }),
}));

export default useDashboardStore;
