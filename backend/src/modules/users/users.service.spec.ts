import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    userAddress: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('returns a safe user profile', async () => {
    const profile = {
      id: 'user-1',
      email: 'customer@example.com',
      firstName: 'An',
      lastName: 'Nguyen',
    };
    prisma.user.findUnique.mockResolvedValue(profile);

    await expect(service.getProfile('user-1')).resolves.toEqual(profile);
    const query = prisma.user.findUnique.mock.calls[0][0];
    expect(query.where).toEqual({ id: 'user-1' });
    expect(query.select).toEqual(
      expect.objectContaining({
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }),
    );
    expect(query.select).not.toHaveProperty('password');
    expect(query.select).not.toHaveProperty('refreshToken');
  });

  it('throws when the requested user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getProfile('missing-user')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updates only the supplied profile fields', async () => {
    const changes = { firstName: 'Binh', phone: '0900000000' };
    prisma.user.update.mockResolvedValue({ id: 'user-1', ...changes });

    await service.updateProfile('user-1', changes);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: changes,
        select: expect.objectContaining({ id: true, email: true, role: true }),
      }),
    );
  });

  it('changes the password after validating the current password', async () => {
    const currentPassword = 'CurrentPass1';
    const newPassword = 'NewSecurePass2';
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'user-1',
      password: await bcrypt.hash(currentPassword, 4),
    });
    prisma.user.update.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.changePassword('user-1', currentPassword, newPassword),
    ).resolves.toEqual({ message: 'Password changed successfully' });

    const update = prisma.user.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: 'user-1' });
    expect(update.data.password).not.toBe(newPassword);
    await expect(
      bcrypt.compare(newPassword, update.data.password as string),
    ).resolves.toBe(true);
  });

  it('does not change the password when the current password is wrong', async () => {
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'user-1',
      password: await bcrypt.hash('CurrentPass1', 4),
    });

    await expect(
      service.changePassword('user-1', 'WrongPass1', 'NewSecurePass2'),
    ).rejects.toThrow('Current password is incorrect');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('lists users with search and pagination', async () => {
    prisma.user.count.mockResolvedValue(21);
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);

    const result = await service.findAll(2, 10, 'an');

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { email: { contains: 'an', mode: 'insensitive' } },
            { firstName: { contains: 'an', mode: 'insensitive' } },
            { lastName: { contains: 'an', mode: 'insensitive' } },
          ],
        },
        skip: 10,
        take: 10,
      }),
    );
    expect(result.meta).toEqual({
      total: 21,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });

  it('lists all users without adding a search predicate', async () => {
    prisma.user.count.mockResolvedValue(1);
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);

    const result = await service.findAll();

    expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 0, take: 20 }),
    );
    expect(result).toEqual({
      data: [{ id: 'user-1' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
  });

  it('returns addresses with the default address first', async () => {
    const addresses = [{ id: 'address-1', isDefault: true }];
    prisma.userAddress.findMany.mockResolvedValue(addresses);

    await expect(service.getAddresses('user-1')).resolves.toEqual(addresses);
    expect(prisma.userAddress.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('creates a default address after clearing the previous default', async () => {
    const address = {
      fullName: 'An Nguyen',
      phone: '0900000000',
      addressLine1: '1 Nguyen Hue',
      district: 'District 1',
      province: 'Ho Chi Minh City',
      isDefault: true,
    };
    prisma.userAddress.updateMany.mockResolvedValue({ count: 1 });
    prisma.userAddress.create.mockResolvedValue({
      id: 'address-1',
      userId: 'user-1',
      ...address,
    });

    await service.createAddress('user-1', address);

    expect(prisma.userAddress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { isDefault: false },
    });
    expect(prisma.userAddress.create).toHaveBeenCalledWith({
      data: { ...address, userId: 'user-1' },
    });
  });

  it('creates a non-default address without changing existing defaults', async () => {
    const address = {
      fullName: 'An Nguyen',
      phone: '0900000000',
      addressLine1: '1 Nguyen Hue',
      district: 'District 1',
      province: 'Ho Chi Minh City',
    };
    prisma.userAddress.create.mockResolvedValue({
      id: 'address-2',
      userId: 'user-1',
      ...address,
    });

    await service.createAddress('user-1', address);

    expect(prisma.userAddress.updateMany).not.toHaveBeenCalled();
    expect(prisma.userAddress.create).toHaveBeenCalledWith({
      data: { ...address, userId: 'user-1' },
    });
  });

  it('updates an owned address and replaces the previous default', async () => {
    prisma.userAddress.updateMany.mockResolvedValue({ count: 1 });
    prisma.userAddress.update.mockResolvedValue({
      id: 'address-2',
      isDefault: true,
    });

    await service.updateAddress('user-1', 'address-2', {
      isDefault: true,
      district: 'District 3',
    });

    expect(prisma.userAddress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { isDefault: false },
    });
    expect(prisma.userAddress.update).toHaveBeenCalledWith({
      where: { id: 'address-2', userId: 'user-1' },
      data: { isDefault: true, district: 'District 3' },
    });
  });

  it('deletes an address owned by the user', async () => {
    prisma.userAddress.delete.mockResolvedValue({ id: 'address-1' });

    await expect(service.deleteAddress('user-1', 'address-1')).resolves.toEqual(
      { message: 'Address deleted' },
    );
    expect(prisma.userAddress.delete).toHaveBeenCalledWith({
      where: { id: 'address-1', userId: 'user-1' },
    });
  });
});
