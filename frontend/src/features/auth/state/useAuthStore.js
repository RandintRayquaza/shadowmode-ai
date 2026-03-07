import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/shared/utils/firebase";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}));

// Initialize auth listener
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
