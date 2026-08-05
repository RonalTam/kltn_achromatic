import { shouldAttemptTokenRefresh } from '@/lib/api';

describe('API token refresh decision', () => {
  it('refreshes an expired authenticated request', () => {
    expect(
      shouldAttemptTokenRefresh({
        status: 401,
        url: '/orders',
        hasAuthorizationHeader: true,
      }),
    ).toBe(true);
  });

  it('refreshes when the browser has an authenticated-session cookie', () => {
    expect(
      shouldAttemptTokenRefresh({
        status: 401,
        url: '/auth/me',
        hasAuthStatusCookie: true,
      }),
    ).toBe(true);
  });

  it('does not refresh an anonymous request', () => {
    expect(
      shouldAttemptTokenRefresh({
        status: 401,
        url: '/reviews',
      }),
    ).toBe(false);
  });

  it.each([
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password?token=reset-token',
    'http://localhost:3001/api/auth/refresh',
  ])('does not refresh a public auth request: %s', (url) => {
    expect(
      shouldAttemptTokenRefresh({
        status: 401,
        url,
        hasAuthStatusCookie: true,
      }),
    ).toBe(false);
  });

  it('does not retry the same request more than once', () => {
    expect(
      shouldAttemptTokenRefresh({
        status: 401,
        url: '/orders',
        alreadyRetried: true,
        hasAuthorizationHeader: true,
      }),
    ).toBe(false);
  });
});
