import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { AuthService, JwtPayload } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    wishlist: { create: jest.fn() },
    cart: { create: jest.fn() },
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configValues: Record<string, string> = {
    JWT_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  };

  const configService = {
    getOrThrow: jest.fn((key: string) => configValues[key]),
    get: jest.fn((key: string, fallback?: string) => {
      return configValues[key] ?? fallback;
    }),
  };

  let service: AuthService;

  const makeUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'customer@example.com',
      password: 'hashed-password',
      firstName: 'An',
      lastName: 'Nguyen',
      phone: null,
      avatarUrl: null,
      role: Role.CUSTOMER,
      isActive: true,
      isVerified: false,
      emailVerifiedAt: null,
      refreshToken: null,
      resetToken: null,
      resetTokenExp: null,
      verifyToken: null,
      lastLoginAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      ...overrides,
    }) as User;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  describe('register', () => {
    it('creates the customer, companion records, and tokens', async () => {
      const createdUser = makeUser();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(createdUser);
      prisma.wishlist.create.mockResolvedValue({ id: 'wishlist-1' });
      prisma.cart.create.mockResolvedValue({ id: 'cart-1' });
      prisma.user.update.mockResolvedValue(createdUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register({
        email: createdUser.email,
        password: 'SecurePass1',
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        phone: '0900000000',
      });

      const create = prisma.user.create.mock.calls[0][0];
      expect(create.data).toEqual({
        email: createdUser.email,
        password: expect.any(String),
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        phone: '0900000000',
        role: Role.CUSTOMER,
      });
      expect(create.data.password).not.toBe('SecurePass1');
      await expect(
        bcrypt.compare('SecurePass1', create.data.password as string),
      ).resolves.toBe(true);
      expect(prisma.wishlist.create).toHaveBeenCalledWith({
        data: { userId: createdUser.id },
      });
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: createdUser.id },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: createdUser.id },
        data: { refreshToken: expect.any(String) },
      });
      const storedRefreshToken = prisma.user.update.mock.calls[0][0].data
        .refreshToken as string;
      expect(storedRefreshToken).not.toBe('refresh-token');
      await expect(
        bcrypt.compare('refresh-token', storedRefreshToken),
      ).resolves.toBe(true);
      const payload = {
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      };
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
        secret: 'access-secret',
        expiresIn: '15m',
      });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, payload, {
        secret: 'refresh-secret',
        expiresIn: '7d',
      });
      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: createdUser.id, email: createdUser.email },
      });
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('resetToken');
      expect(result.user).not.toHaveProperty('verifyToken');
    });

    it('rejects an email that is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.register({
          email: 'customer@example.com',
          password: 'SecurePass1',
          firstName: 'An',
          lastName: 'Nguyen',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.wishlist.create).not.toHaveBeenCalled();
      expect(prisma.cart.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('validates credentials, rotates the refresh token, and records login time', async () => {
      const password = 'SecurePass1';
      const user = makeUser({ password: await bcrypt.hash(password, 4) });
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({ email: user.email, password });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).not.toHaveProperty('password');
      expect(prisma.user.update).toHaveBeenNthCalledWith(1, {
        where: { id: user.id },
        data: { refreshToken: expect.any(String) },
      });
      expect(prisma.user.update).toHaveBeenNthCalledWith(2, {
        where: { id: user.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('rejects an invalid password', async () => {
      const user = makeUser({
        password: await bcrypt.hash('SecurePass1', 4),
      });
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password: 'WrongPassword1' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an unknown email without attempting token generation', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'SecurePass1',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects a disabled account even when the password is correct', async () => {
      const password = 'SecurePass1';
      prisma.user.findUnique.mockResolvedValue(
        makeUser({
          isActive: false,
          password: await bcrypt.hash(password, 4),
        }),
      );

      await expect(
        service.login({ email: 'customer@example.com', password }),
      ).rejects.toThrow('Account is disabled');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('verifies and rotates a valid refresh token', async () => {
      const oldToken = 'old-refresh-token';
      const payload: JwtPayload = {
        sub: 'user-1',
        email: 'customer@example.com',
        role: Role.CUSTOMER,
      };
      const user = makeUser({
        refreshToken: await bcrypt.hash(oldToken, 4),
      });
      jwtService.verifyAsync.mockResolvedValue(payload);
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      await expect(service.refresh(oldToken)).resolves.toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(oldToken, {
        secret: 'refresh-secret',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { refreshToken: expect.any(String) },
      });
      const rotatedHash = prisma.user.update.mock.calls[0][0].data
        .refreshToken as string;
      expect(rotatedHash).not.toBe('new-refresh-token');
      await expect(
        bcrypt.compare('new-refresh-token', rotatedHash),
      ).resolves.toBe(true);
    });

    it('rejects an invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejects a valid token whose account no longer exists', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'missing-user',
        email: 'missing@example.com',
        role: Role.CUSTOMER,
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('old-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects a refresh token that does not match the stored hash', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        email: 'customer@example.com',
        role: Role.CUSTOMER,
      });
      prisma.user.findUnique.mockResolvedValue(
        makeUser({
          refreshToken: await bcrypt.hash('different-refresh-token', 4),
        }),
      );

      await expect(service.refresh('old-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
