import { create } from 'zustand';

const useHistoryStore = create((set) => ({
  history: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setHistory: (history) => set({ history, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false }),
}));

export default useHistoryStore;
