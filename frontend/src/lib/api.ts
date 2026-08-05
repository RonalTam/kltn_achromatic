import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
];

type TokenRefreshDecisionInput = {
  status?: number;
  url?: string;
  alreadyRetried?: boolean;
  hasAuthorizationHeader?: boolean;
  hasAuthStatusCookie?: boolean;
};

export function shouldAttemptTokenRefresh({
  status,
  url = '',
  alreadyRetried = false,
  hasAuthorizationHeader = false,
  hasAuthStatusCookie = false,
}: TokenRefreshDecisionInput): boolean {
  if (status !== 401 || alreadyRetried) {
    return false;
  }

  const requestPath = url.split('?')[0].replace(/\/$/, '');
  if (
    AUTH_ENDPOINTS_WITHOUT_REFRESH.some((endpoint) =>
      requestPath.endsWith(endpoint),
    )
  ) {
    return false;
  }

  return hasAuthorizationHeader || hasAuthStatusCookie;
}

function hasAuthorizationHeader(headers: unknown): boolean {
  if (!headers || typeof headers !== 'object') {
    return false;
  }

  if (
    'get' in headers &&
    typeof (headers as { get?: unknown }).get === 'function'
  ) {
    const value = (
      headers as { get: (name: string) => string | null | undefined }
    ).get('Authorization');
    if (value) {
      return true;
    }
  }

  const record = headers as Record<string, unknown>;
  return Boolean(record.Authorization ?? record.authorization);
}

function hasAuthStatusCookie(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.cookie
      .split(';')
      .some((cookie) => cookie.trim() === 'auth_status=1')
  );
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies (refreshToken, auth_status) with all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Clear the client-side auth_status cookie so the middleware
 * immediately sees the user as unauthenticated (no page reload needed).
 * The httpOnly refreshToken cookie is cleared by the backend on logout.
 */
function clearAuthStatusCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_status=; Max-Age=0; path=/;';
  }
}

// Response interceptor — handles 401 with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      shouldAttemptTokenRefresh({
        status: error.response?.status,
        url: originalRequest.url,
        alreadyRetried: originalRequest._retry,
        hasAuthorizationHeader:
          hasAuthorizationHeader(originalRequest.headers) ||
          hasAuthorizationHeader(api.defaults.headers.common),
        hasAuthStatusCookie: hasAuthStatusCookie(),
      })
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token using the httpOnly refreshToken cookie
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const accessToken =
          res.data?.data?.accessToken ?? res.data?.accessToken;

        if (accessToken) {
          // Update the Authorization header for this and future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // Update the Zustand auth store token without full re-login
          // (lazy import to avoid circular deps)
          try {
            const { useAuthStore } = await import('../store/auth-store');
            const state = useAuthStore.getState();
            if (state.user) {
              useAuthStore.setState({ accessToken });
            }
          } catch {
            // Ignore — store update is best-effort
          }

          return api(originalRequest);
        }
      } catch {
        // Refresh failed — token is expired or invalid.
        // Clear auth state and redirect to login.
        clearAuthStatusCookie();
        delete api.defaults.headers.common['Authorization'];

        try {
          const { useAuthStore } = await import('../store/auth-store');
          useAuthStore.getState().clearAuth();
        } catch {
          // Ignore
        }

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isProtected =
            currentPath.startsWith('/checkout') ||
            currentPath.startsWith('/account/orders') ||
            currentPath.startsWith('/account/settings') ||
            currentPath.startsWith('/account/wishlist');

          if (isProtected) {
            window.location.href = `/account/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
