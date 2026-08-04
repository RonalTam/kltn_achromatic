import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.password) throw new NotFoundException('Social login accounts cannot change password here. Please use the provider settings.');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new NotFoundException('Current password is incorrect');
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Password changed successfully' };
  }

  // ── Addresses ──
  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(
    userId: string,
    data: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      ward?: string;
      district: string;
      province: string;
      country?: string;
      postalCode?: string;
      isDefault?: boolean;
    },
  ) {
    if (data.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.userAddress.create({ data: { ...data, userId } });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<{
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string;
      ward: string;
      district: string;
      province: string;
      isDefault: boolean;
    }>,
  ) {
    if (data.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.userAddress.update({
      where: { id: addressId, userId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.prisma.userAddress.delete({ where: { id: addressId, userId } });
    return { message: 'Address deleted' };
  }

  // ── Admin: list all users ──
  async findAll(page = 1, limit = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
