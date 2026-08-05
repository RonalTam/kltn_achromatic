import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/lib/types';

const mockPost = jest.fn();

jest.mock('@/lib/api', () => ({
  api: {
    defaults: { headers: { common: {} } },
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

const user: User = {
  id: 'user-1',
  email: 'test@achromatic.vn',
  firstName: 'An',
  lastName: 'Nguyễn',
  role: 'CUSTOMER',
};

describe('auth-store', () => {
  beforeEach(() => {
    mockPost.mockReset();
    window.localStorage.clear();
    document.cookie = 'auth_status=; Max-Age=0; path=/;';
    document.cookie = 'auth_role=; Max-Age=0; path=/;';
    delete api.defaults.headers.common.Authorization;
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('sets authenticated state on login and clears it on logout', async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: { user, accessToken: 'access-token' } },
    });

    await useAuthStore.getState().login(user.email, 'valid-password');

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: user.email,
      password: 'valid-password',
    });
    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: 'access-token',
      isAuthenticated: true,
      isLoading: false,
    });
    expect(api.defaults.headers.common.Authorization).toBe(
      'Bearer access-token',
    );
    expect(document.cookie).toContain('auth_status=1');

    mockPost.mockResolvedValueOnce({ data: { success: true } });
    await useAuthStore.getState().logout();

    expect(mockPost).toHaveBeenLastCalledWith('/auth/logout');
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
  });
});
