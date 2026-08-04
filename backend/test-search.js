import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, isActive: true }
  });
  console.log('All Products in DB:', JSON.stringify(products, null, 2));

  const search1 = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: 'Polo Performance', mode: 'insensitive' } },
        { name: { contains: 'Polo', mode: 'insensitive' } },
        { name: { contains: 'Performance', mode: 'insensitive' } },
      ]
    },
    select: { name: true, slug: true }
  });
  console.log('Search result for Polo Performance:', search1);
}

check().finally(() => prisma.$disconnect());
