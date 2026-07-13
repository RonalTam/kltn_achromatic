import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getProductInventory(productId: string) {
    return this.prisma.inventory.findMany({
      where: { productId },
      include: {
        variant: { include: { color: true, size: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async getLowStock(threshold = 10) {
    return this.prisma.inventory.findMany({
      where: { quantity: { lte: threshold } },
      include: {
        product: { select: { name: true, sku: true } },
        variant: { include: { color: true, size: true } },
      },
      orderBy: { quantity: 'asc' },
    });
  }

  async adjust(
    inventoryId: string,
    quantity: number,
    reason: string,
    performedBy: string,
  ) {
    const inventory = await this.prisma.inventory.findUniqueOrThrow({
      where: { id: inventoryId },
    });
    const previousQty = inventory.quantity;
    const newQty = previousQty + quantity;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: { increment: quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          inventoryId,
          type: quantity > 0 ? TransactionType.IN : TransactionType.OUT,
          quantity: Math.abs(quantity),
          previousQty,
          newQty,
          reason,
          performedBy,
        },
      });
      return updated;
    });
  }
}
