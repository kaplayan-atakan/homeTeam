import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession, AuthTokens } from '@/types';

interface AuthState {
  // State
  user: UserSession | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: UserSession, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<UserSession>) => void;
  setLoading: (loading: boolean) => void;
  refreshTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user: UserSession, tokens: AuthTokens) => {
        // Store tokens in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('refresh_token', tokens.refreshToken);
          }
        }

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<UserSession>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshTokens: (tokens: AuthTokens) => {
        // Update tokens in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('refresh_token', tokens.refreshToken);
          }
        }

        set({ tokens });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      // Hydration tamamlandığında localStorage'dan token'ları restore et
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');
          
          // Eğer localStorage'da token varsa ama state'de yoksa restore et
          if (accessToken && (!state.tokens || !state.tokens.accessToken)) {
            state.tokens = {
              accessToken,
              refreshToken: refreshToken || '',
              expiresIn: 86400,
            };
          }
        }
      },
    }
  )
);
