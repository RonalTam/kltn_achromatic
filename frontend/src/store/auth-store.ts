import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart-store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Set a client-readable cookie that the Next.js Edge middleware uses
 * to detect auth state for server-side route protection.
 * The httpOnly refreshToken is set by the backend on the same request.
 */
function setAuthStatusCookie(role?: string) {
  if (typeof document !== 'undefined') {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    document.cookie = `auth_status=1; Max-Age=${maxAge}; path=/; SameSite=Strict`;
    if (role) {
      document.cookie = `auth_role=${encodeURIComponent(role)}; Max-Age=${maxAge}; path=/; SameSite=Strict`;
    }
  }
}

function clearAuthStatusCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_status=; Max-Age=0; path=/;';
    document.cookie = 'auth_role=; Max-Age=0; path=/;';
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken } = res.data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          setAuthStatusCookie(user.role); // Signal Proxy that user is logged in
          
          const prevUser = get().user;
          if (prevUser && prevUser.id !== user.id) {
            useCartStore.getState().clearCart(); // Reset cart only if switching accounts
          }
          
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          const { user, accessToken } = res.data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          setAuthStatusCookie(user.role); // Signal Proxy that user is logged in
          
          const prevUser = get().user;
          if (prevUser && prevUser.id !== user.id) {
            useCartStore.getState().clearCart(); // Reset cart only if switching accounts
          }
          
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignore errors — still clear local state
        }
        delete api.defaults.headers.common['Authorization'];
        clearAuthStatusCookie(); // Remove the middleware auth signal
        useCartStore.getState().clearCart(); // Reset cart on logout
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user: User, token: string) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthStatusCookie(user.role);
        
        const prevUser = get().user;
        if (prevUser && prevUser.id !== user.id) {
          useCartStore.getState().clearCart(); // Reset cart only if switching accounts
        }
        
        set({ user, accessToken: token, isAuthenticated: true });
      },

      clearAuth: () => {
        delete api.defaults.headers.common['Authorization'];
        clearAuthStatusCookie();
        useCartStore.getState().clearCart(); // Reset cart on auth clear
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'achromatic-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
          // Restore auth_status cookie if it's missing after page reload
          // (e.g., if user cleared cookies manually but localStorage persists)
          setAuthStatusCookie(state.user?.role);
        }
      },
    }
  )
);
