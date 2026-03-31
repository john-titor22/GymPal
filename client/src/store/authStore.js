import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,  // kept in memory only — never persisted
      isLoading: true,

      setAuth:        (user, accessToken) => set({ user, accessToken, isLoading: false }),
      setAccessToken: (accessToken)       => set({ accessToken }),
      setUser:        (user)              => set({ user }),
      logout:         ()                  => set({ user: null, accessToken: null, isLoading: false }),
      setLoading:     (isLoading)         => set({ isLoading }),
    }),
    {
      name: 'gympal-auth',
      // Only persist the user profile — never the access token (security)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
